import { LitElement, css, html } from "../lib/lit.js";
import "./toolbar.js";
import "./svg-display.js";
import "./canvas-display.js";
import "./invoice-popup.js";

import { onInvoice, onInvoicePaid } from "../services/ws.js";
import { CanvasDisplay } from "./canvas-display.js";

export class App extends LitElement {
  static properties = {
    pendingInvoice: {},
    showInvoicePopup: {},
  };

  static styles = css`
    #canvas-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    canvas {
      image-rendering: pixelated;
      height: 100vh;
    }
  `;

  constructor(...args) {
    super(...args);

    this.pendingInvoice = null;
    this.showInvoicePopup = false;
    this.cleanup = [];

    this.display = new CanvasDisplay();
  }

  connectedCallback() {
    super.connectedCallback();

    this.cleanup.push(
      onInvoice.add(async (invoice) => {
        this.pendingInvoice = invoice;
        this.showInvoicePopup = true;

        if (window.webln && window.webln.enabled) {
          try {
            await webln.sendPayment(invoice);
            this.pendingInvoice = null;
            this.showInvoicePopup = false;
          } catch (e) {}
        }
      })
    );

    this.cleanup.push(
      onInvoicePaid.add(() => {
        this.pendingInvoice = null;
        this.showInvoicePopup = false;
      })
    );

    this.display.start();
  }
  disconnectedCallback() {
    this.cleanup.forEach((fn) => fn());

    this.display.stop();
  }

  handleCloseInvoiceModal() {
    this.showInvoicePopup = false;
    this.pendingInvoice = null;
  }

  render() {
    return html`
      <lngol-toolbar
        @pattern-selected="${(e) => (this.display.pattern = e.detail)}"
      ></lngol-toolbar>
      <div id="canvas-container">${this.display.canvas}</div>
      ${this.showInvoicePopup
        ? html`
            <lngol-invoice-popup
              @close-click="${this.handleCloseInvoiceModal}"
              invoice="${this.pendingInvoice}"
            ></lngol-invoice-popup>
          `
        : html``}
    `;
  }
}
customElements.define("lngol-app", App);
