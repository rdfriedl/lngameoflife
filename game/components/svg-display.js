import { LitElement, css, html } from "../lib/lit.js";
import * as world from "../services/world.js";

const svgns = "http://www.w3.org/2000/svg";

export class SvgDisplay extends LitElement {
  static properties = {};
  static styles = css`
    svg {
      aspect-ratio: 1;
      width: auto;
      height: 100vh;
      margin: auto;
    }
    rect.dead {
      fill: white;
    }
    rect.alive {
      fill: black;
    }
    rect.pending {
      fill: skyblue;
    }
  `;

  constructor(...args) {
    super(...args);
    this.cleanup = [];
  }

  connectedCallback() {
    super.connectedCallback();

    this.cleanup.push(world.onUpdate.add(this.onWorldUpdate.bind(this)));
  }
  disconnectedCallback() {
    this.cleanup.forEach((fn) => fn());
  }

  onWorldUpdate() {
    const svg = this.renderRoot.querySelector("svg");
    const map = world.getMap();
    const pending = world.getPending();
    if (!svg || !map) return;

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const id = [x, y].join("_");
        let cell = this.renderRoot.getElementById(id);
        if (!cell) {
          cell = document.createElementNS(svgns, "rect");
          cell.setAttribute("id", id);
          cell.setAttribute("x", x);
          cell.setAttribute("y", y);
          cell.setAttribute("width", 1);
          cell.setAttribute("height", 1);
          cell.classList.add("dead");
          svg.appendChild(cell);
        }

        if (map.getCell(x, y) === 0) {
          cell.classList.replace("alive", "dead");
        } else {
          cell.classList.replace("dead", "alive");
        }
        if (pending.getCell(x, y) === 0) {
          cell.classList.remove("pending");
        } else {
          cell.classList.add("pending");
        }
      }
    }

    this.requestUpdate();
  }

  handleClick(event) {
    if (event.target instanceof SVGRectElement) {
      const [x, y] = event.target.id.split("_").map((v) => parseInt(v));

      world.getPending().setCell(x, y, world.getPending().getCell(x, y) ^ 1);
      this.requestUpdate();
    }
  }

  render() {
    const map = world.getMap();
    const viewBox = map ? `0 0 ${map.width} ${map.height}` : "0 0 10 10";

    return html`<svg viewBox="${viewBox}" @click="${this.handleClick}"></svg>`;
  }
}
customElements.define("lngol-svg-display", SvgDisplay);
