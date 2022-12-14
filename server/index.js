import express from "express";
import { WebSocketServer } from "ws";
import fs from "fs";
import pako from "pako";
import { DISABLE_LN_PAYMENTS } from "./env.js";

import { GameOfLife } from "../common/game-of-life.js";
import { createInvoice, getWalletInfo, invoicePaid } from "./lnbits.js";
import { encode, decode, readIntoMap } from "../common/rle.js";
import { getPatterns } from "./patters.js";
import { MAP_SIZE } from "../common/size.js";

import crypto from "crypto";
function hashDataview(data) {
  const hash = crypto.createHash("md5");
  hash.update(data);
  return hash.digest("hex");
}

// setup game
const game = new GameOfLife(MAP_SIZE.WIDTH, MAP_SIZE.HEIGHT);

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
app.use("/", express.static("./dist"));

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  const sendMessage = (type, data) => ws.send(JSON.stringify({ type, data }));
  const requestPayment = async (amount = 10) => {
    if (DISABLE_LN_PAYMENTS) return;

    return new Promise(async (res) => {
      const invoice = await createInvoice(amount, () => {
        res();
        sendMessage("invoice-paid");
      });
      sendMessage("invoice", invoice.payment_request);
    });
  };
  let needFullUpdate = true;
  const onGeneration = ({ chunks, hash }) => {
    if (needFullUpdate) {
      ws.send(pako.deflate(game.buffer));
      needFullUpdate = false;
    } else {
      sendMessage("changes", { chunks, hash });
    }
  };
  const handleMessage = async (message) => {
    switch (message.type) {
      case "add-cells":
        await requestPayment(20);

        console.log("Adding cells");
        readIntoMap(0, 0, message.data, game, true);
        game.requestFullMapUpdate();
        break;
      case "add-pattern":
        const { pattern, x, y } = message.data;
        readIntoMap(x, y, pattern, game, true);
        game.requestFullMapUpdate();
        break;
      case "request-full-update":
        needFullUpdate = true;
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

  listeners.add(onGeneration);
});

const listeners = new Set();
const stats = [];
setInterval(() => {
  const { stats: newStats, changedChunks } = game.evolve();
  stats.push(newStats);

  const changedChunksWithData = changedChunks.map(({ cx, cy }) => [
    cx,
    cy,
    game.getChunk(cx, cy),
  ]);
  const hash = hashDataview(game.dataview);

  listeners.forEach((fn) => fn({ chunks: changedChunksWithData, hash }));
}, 100);

// print stats
setInterval(() => {
  const averageChunks = Math.round(
    stats.reduce((v, s) => v + s.chunks, 0) / stats.length
  );
  const averageCells = Math.round(
    stats.reduce((v, s) => v + s.cells, 0) / stats.length
  );
  console.log(
    `processed an average of ${averageChunks} chunks and ${averageCells} cells`.trim()
  );
}, 1000 * 10);

if (!DISABLE_LN_PAYMENTS) {
  getWalletInfo().then(() => {
    console.log("Connected to LNBits");
  });
} else {
  console.log("LN Payments are disabled");
}

// load state
try {
  const map = decode(fs.readFileSync("./state", { encoding: "utf-8" }));
  game.replaceBuffer(map.buffer);
  game.requestFullMapUpdate();
  console.log("loaded saved state");
} catch (e) {
  console.log("failed to load saved state", e.message);
}

// save state
setInterval(() => {
  fs.writeFileSync("./state", encode(game));
}, 1000 * 10);

process.on("SIGINT", () => {
  console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
  server.close();
  wss.close();
  process.exit();
});
