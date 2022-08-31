import { encode } from "../../common/rle.js";
import { LitElement, css, html } from "../lib/lit.js";
import { getPending } from "../services/world.js";
import { sendMessage } from "../services/ws.js";

import "./button.js";
import "./webln-connect.js";

export class Toolbar extends LitElement {
  static properties = {
    disabled: false,
  };
  static styles = css`
    h1 {
      margin: 0;
    }
    .layout {
      display: flex;
      gap: 1rem;
      align-items: center;

      padding: 1rem 0.5rem;
      background: lightgray;
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
    }

    .right {
      margin-left: auto;
    }
  `;

  handleAddCells() {
    const pending = getPending();
    sendMessage("add-cells", encode(pending));
    pending.reset();
  }
  handleClear() {
    getPending().reset();
  }

  render() {
    return html`
      <div class="layout">
        <h1>LN Game of life</h1>
        <lngol-button title="add cells" @click="${this.handleAddCells}"
          >➕ Add Cells</lngol-button
        >
        <lngol-button title="clear" @click="${this.handleClear}"
          >🗑️</lngol-button
        >
        <div class="right">
          <lngol-webln-connect />
        </div>
      </div>
    `;
  }
}
customElements.define("lngol-toolbar", Toolbar);
