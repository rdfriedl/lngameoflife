import { Emitter } from "../helpers/emitter.js";
import pako from "../lib/pako.js";

export const onInfo = new Emitter();
export const onFullUpdate = new Emitter();
export const onInvoice = new Emitter();
export const onInvoicePaid = new Emitter();
export const onTick = new Emitter();

let socket = null;

export function sendMessage(type, data) {
  socket && socket.send(JSON.stringify({ type, data }));
}

function handleMessage(message) {
  switch (message.type) {
    case "info":
      onInfo.emit(message.data);
      break;
    case "invoice":
      onInvoice.emit(message.data);
      break;
    case "invoice-paid":
      onInvoicePaid.emit();
      break;
    case "tick":
      onTick.emit(message.data.hash);
      break;
  }
}
async function handleBlobMessage(blob) {
  const buffer = await blob.arrayBuffer();
  onFullUpdate.emit(pako.inflate(buffer).buffer);
}

function connect() {
  socket = new WebSocket(
    (location.protocol.includes("https") ? "wss" : "ws") + "://" + location.host
  );

  socket.addEventListener("message", (event) => {
    if (typeof event.data === "string") {
      try {
        const json = JSON.parse(event.data);
        handleMessage(json);
      } catch (e) {
        console.log("failed to handle message", event);
        console.log(e);
      }
    } else if (event.data instanceof Blob) {
      handleBlobMessage(event.data);
    }
  });

  socket.addEventListener("close", () => {
    socket = null;
    setTimeout(() => {
      connect();
    }, 5000);
  });
}

connect();
