import express from "express";
import { WebSocketServer } from "ws";
import fs from "fs";
import pako from "pako";
import { IS_PROD } from "./env.js";

import { GameOfLife } from "./common/game-of-life.js";
import { createInvoice, getWalletInfo, invoicePaid } from "./lnbits.js";
import { encode, decode, readIntoMap } from "./common/rle.js";
import { getPatterns } from "./patters.js";

// setup game
const game = new GameOfLife(500, 500);

// setup http server
const port = process.env.PORT || 3000;
const app = express();

app.use("/lnbits-webhook/:id", (req, res) => {
  invoicePaid(req.params.id);
  res.status(200);
  res.end("done");
});
app.use("/patterns", async (req, res, next) => {
  try {
    res.json(await getPatterns());
  } catch (e) {
    next(e);
  }
});
app.use("/common", express.static("./common"));
app.use("/", express.static("./game/"));

const server = app.listen(port, () => {
  if (!IS_PROD) {
    console.log("Running in dev mode");
  }
  console.log(`Server listening on port ${port}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  const sendMessage = (type, data) => ws.send(JSON.stringify({ type, data }));
  const requestPayment = async (amount = 10) => {
    if (!IS_PROD) return;

    return new Promise(async (res) => {
      const invoice = await createInvoice(amount, () => {
        res();
        sendMessage("invoice-paid");
      });
      sendMessage("invoice", invoice.payment_request);
    });
  };
  const onGeneration = () => {
    ws.send(pako.deflate(game.buffer));
  };
  const handleMessage = async (message) => {
    switch (message.type) {
      case "add-cells":
        await requestPayment(20);

        console.log("Adding cells");
        readIntoMap(0, 0, message.data, game, true);
        break;
      case "add-pattern":
        const { pattern, x, y } = message.data;
        readIntoMap(x, y, pattern, game, true);
        break;
    }
  };

  ws.on("message", (data) => {
    try {
      const json = JSON.parse(data);
      handleMessage(json);
    } catch (e) {
      console.log("failed to handle message: ", data.toString());
      console.log(e);
    }
  });

  ws.on("close", () => {
    listeners.delete(onGeneration);
  });

  sendMessage("info", {
    width: game.width,
    height: game.height,
  });

  listeners.add(onGeneration);
});

const listeners = new Set();
setInterval(() => {
  game.evolve();

  listeners.forEach((fn) => fn());
}, 100);

if (IS_PROD) {
  getWalletInfo().then(() => {
    console.log("Connected to LNBits");
  });
}

// load state
try {
  const map = decode(fs.readFileSync("./state", { encoding: "utf-8" }));
  game.replaceBuffer(map.buffer);
  console.log("loaded saved state");
} catch (e) {
  console.log("failed to load saved state", e.message);
}

// save state
setInterval(() => {
  fs.writeFileSync("./state", encode(game));
}, 1000 * 10);
