import { LitElement, css, html } from "../lib/lit.js";
import "./toolbar.js";
import "./svg-display.js";
import "./invoice-popup.js";

import { onInvoice, onInvoicePaid } from "../services/ws.js";

export class App extends LitElement {
  static properties = {
    pendingInvoice: {},
    showInvoicePopup: {},
  };

  constructor(...args) {
    super(...args);

    this.pendingInvoice = null;
    this.showInvoicePopup = false;
    this.cleanup = [];
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
  }
  disconnectedCallback() {
    this.cleanup.forEach((fn) => fn());
  }

  handleCloseInvoiceModal() {
    this.showInvoicePopup = false;
    this.pendingInvoice = null;
  }

  render() {
    return html`
      <lngol-toolbar></lngol-toolbar>
      <lngol-svg-display></lngol-svg-display>
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
