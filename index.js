import express from "express";
import { WebSocketServer } from "ws";
import { evolve, setCell, getCurrentGen } from "./game-of-life.js";
import { createInvoice, invoicePaid } from "./lnbits.js";

const port = process.env.PORT || 3000;
const app = express();

app.use("/lnbits-webhook/:id", (req, res) => {
  invoicePaid(req.params.id);
  res.status(200);
  res.end("done");
});
app.use("/", express.static("./game/"));

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  const sendMessage = (type, data) =>
    ws.send(JSON.stringify({ type, ...data }));
  const onGeneration = () => {
    sendMessage("generation", { cells: getCurrentGen() });
  };
  const handleMessage = async (message) => {
    switch (message.type) {
      case "add-cells":
        const invoice = await createInvoice(message.cells.length * 2, () => {
          console.log("Adding Cells");
          for (const [col, row] of message.cells) {
            setCell(col, row, 1);
          }

          sendMessage("invoice-paid");
        });

        sendMessage("invoice", { invoice: invoice.payment_request });
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
setInterval(() => {
  evolve();

  listeners.forEach((fn) => fn());
}, 500);
