import { readIntoMap } from "../../common/rle.js";
import { getMap, getPending } from "../services/world.js";

function domCordsToCtx(canvas, event) {
  const boundingRect = canvas.getBoundingClientRect();
  return {
    x: (event.x - boundingRect.x) * (canvas.width / boundingRect.width),
    y: (event.y - boundingRect.y) * (canvas.height / boundingRect.height),
  };
}

function resizeCanvas(canvas, map) {
  if (canvas.width !== map.width) {
    canvas.width = map.width;
  }
  if (canvas.height !== map.height) {
    canvas.height = map.height;
  }
}

export class CanvasDisplay {
  constructor() {
    this.enabled = false;
    this.mapTexture = new OffscreenCanvas(0, 0);
    this.mapTexture.ctx = this.mapTexture.getContext("2d");
    this.pendingTexture = new OffscreenCanvas(0, 0);
    this.pendingTexture.ctx = this.pendingTexture.getContext("2d");
    this.canvas = document.createElement("canvas");
    this.canvas.ctx = this.canvas.getContext("2d");
    this.canvas.ctx.imageSmoothingEnabled = false;

    this.pattern = null;

    const paint = (event) => {
      const v = domCordsToCtx(this.canvas, event);

      getPending().setCell(Math.floor(v.x), Math.floor(v.y), 1);
    };
    this.canvas.addEventListener("mousedown", (event) => {
      if (this.pattern) {
        const v = domCordsToCtx(this.canvas, event);

        readIntoMap(
          Math.floor(v.x),
          Math.floor(v.y),
          this.pattern,
          getPending()
        );
      } else paint(event);
    });
    this.canvas.addEventListener("mousemove", (event) => {
      if (event.buttons === 1) {
        paint(event);
      }
    });
  }

  start() {
    this.enabled = true;
    this.animate();
  }
  stop() {
    this.enabled = false;
  }

  animate() {
    this.render();
    if (this.enabled) requestAnimationFrame(this.animate.bind(this));
  }

  drawMapTexture() {
    const map = getMap();
    const ctx = this.mapTexture.ctx;
    // ctx.globalAlpha = 1/200;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, map.width, map.height);
    // ctx.globalAlpha = 1;
    ctx.fillStyle = "skyblue";
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (map.getCell(x, y)) {
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  drawPendingTexture() {
    const map = getPending();
    const ctx = this.pendingTexture.ctx;
    ctx.clearRect(0, 0, map.width, map.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "lightgreen";
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (map.getCell(x, y)) {
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  render() {
    const map = getMap();

    if (!map) return;
    resizeCanvas(this.canvas, map);
    resizeCanvas(this.mapTexture, map);
    resizeCanvas(this.pendingTexture, map);

    this.drawMapTexture();
    this.drawPendingTexture();

    this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.ctx.drawImage(this.mapTexture, 0, 0);
    this.canvas.ctx.drawImage(this.pendingTexture, 0, 0);
  }
}
