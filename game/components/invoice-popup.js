import { LitElement, css, html } from "../lib/lit.js";

import "./button.js";

export class InvoicePopup extends LitElement {
  static properties = {
    invoice: {},
  };
  static styles = css`
    .backdrop {
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.2);

      display: flex;
      justify-content: center;
      align-items: center;
    }

    .modal {
      border-radius: 4px;
      background: white;

      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
    }
  `;

  handleCloseClick(event) {
    this.dispatchEvent(new Event("close-click"));
  }

  render() {
    return html`<div class="backdrop">
      <div class="modal">
        <a href="lightning:${this.invoice}">
          <img
            src="https://chart.googleapis.com/chart?cht=qr&chs=512x512&chld=M|0&chl=${this
              .invoice}"
          />
        </a>

        <lngol-button @click="${this.handleCloseClick}">Close</lngol-button>
      </div>
    </div>`;
  }
}
customElements.define("lngol-invoice-popup", InvoicePopup);
