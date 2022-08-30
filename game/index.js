const svgns = "http://www.w3.org/2000/svg";
const world = document.createElementNS(svgns, "svg");
world.setAttribute("viewBox", "0 0 100 100");
document.body.appendChild(world);

const qrCodeContainer = document.createElement("div");
const qrCode = new QRCode(qrCodeContainer, {
  text: location.href,
});
// NOTE: find a better way to show the qrcode
qrCode._el.style.display = "none";

function updateWorld(cells) {
  for (let row in cells) {
    for (let col in cells[row]) {
      let cell = document.getElementById(row + "_" + col);
      if (!cell) {
        cell = document.createElementNS(svgns, "rect");
        cell.setAttribute("id", row + "_" + col);
        cell.setAttribute("x", col);
        cell.setAttribute("y", row);
        cell.setAttribute("width", 1);
        cell.setAttribute("height", 1);
        cell.classList.add("dead");
        world.appendChild(cell);
      }

      if (cells[row][col] == 0) {
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
  socket.send(JSON.stringify({ type, ...data }));
}
function handleMessage(message) {
  switch (message.type) {
    case "generation":
      updateWorld(message.cells);
      break;
    case "invoice":
      qrCode._el.style.display = "block";
      qrCode.makeCode(message.invoice);
      break;
    case "invoice-paid":
      qrCode._el.style.display = "none";
      break;
  }
}

socket.addEventListener("open", () => {
  sendMessage("full-map");
});

socket.addEventListener("message", (event) => {
  try {
    const json = JSON.parse(event.data);
    handleMessage(json);
  } catch (e) {
    console.log("failed to handle message", event);
    console.log(e);
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
  sendMessage("add-cells", { cells });
  clearPendingCells();
  submitButton.disabled = false;
});
document.body.appendChild(submitButton);
document.body.appendChild(qrCodeContainer);
