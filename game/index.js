import { CellMap } from "/common/cell-map.js";
import pako from "./pako.js";

let serverInfo = null;

const svgns = "http://www.w3.org/2000/svg";
const world = document.createElementNS(svgns, "svg");
world.setAttribute("viewBox", "0 0 100 100");
document.body.appendChild(world);

const qrCodeContainer = document.createElement("a");
const qrCode = new QRCode(qrCodeContainer, {
  text: location.href,
});
// NOTE: find a better way to show the qrcode
qrCode._el.style.display = "none";

function updateWorld(map) {
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const id = [x, y].join("_");
      let cell = document.getElementById(id);
      if (!cell) {
        cell = document.createElementNS(svgns, "rect");
        cell.setAttribute("id", id);
        cell.setAttribute("x", x);
        cell.setAttribute("y", y);
        cell.setAttribute("width", 1);
        cell.setAttribute("height", 1);
        cell.classList.add("dead");
        world.appendChild(cell);
      }

      if (map.getCell(x, y) == 0) {
        cell.classList.replace("alive", "dead");
      } else {
        cell.classList.replace("dead", "alive");
      }
    }
  }
}

world.addEventListener("click", (event) => {
  if (event.target instanceof SVGRectElement) {
    if (event.target.getAttribute("pending") !== "live") {
      event.target.setAttribute("pending", "live");
    } else {
      event.target.removeAttribute("pending");
    }
  }
});

const socket = new WebSocket(
  (location.protocol.includes("https") ? "wss" : "ws") + "://" + location.host
);

function sendMessage(type, data) {
  socket.send(JSON.stringify({ type, data }));
}
function handleMessage(message) {
  switch (message.type) {
    case "info":
      serverInfo = message.data;
      break;
    case "invoice":
      qrCode._el.style.display = "block";
      qrCode.makeCode(message.data);
      qrCodeContainer.href = "lightning:" + message.data;
      break;
    case "invoice-paid":
      qrCode._el.style.display = "none";
      break;
  }
}
async function handleBlobMessage(blob) {
  if (!serverInfo) return;
  const buffer = await blob.arrayBuffer();
  const map = new CellMap(serverInfo.width, serverInfo.height, pako.inflate(buffer).buffer);

  updateWorld(map);
}

// socket.addEventListener("open", () => {
// });

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

function getPendingCells() {
  const cells = document.querySelectorAll("rect[pending]");

  const aliveCells = Array.from(cells).map((cell) => {
    return [...cell.id.split("_").map((v) => parseInt(v)), 1];
  });

  return aliveCells;
}
function clearPendingCells() {
  const cells = document.querySelectorAll("rect[pending]");
  cells.forEach((cell) => cell.removeAttribute("pending"));
}

const submitButton = document.createElement("button");
submitButton.textContent = "Add Cells";
submitButton.addEventListener("click", async () => {
  submitButton.disabled = true;
  const cells = getPendingCells();
  sendMessage("add-cells", cells);
  clearPendingCells();
  submitButton.disabled = false;
});
document.body.appendChild(submitButton);
document.body.appendChild(qrCodeContainer);
