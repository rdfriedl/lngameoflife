import { LitElement, css, html } from "../lib/lit.js";

export class WeblnConnect extends LitElement {
  static properties = {};
  // copied from https://copy-paste-css.com/
  static styles = css``;

  async requestConnect() {
    await window.webln.enable();
    this.requestUpdate();
  }

  render() {
    if (typeof window.webln === "undefined") {
      return html`<span
        >WebLN not detected, get started
        <a href="https://getalby.com/" target="_blank">here</a></span
      >`;
    } else if (webln.enabled === false) {
      return html`<lngol-button @click="${this.requestConnect}"
        >⚡ Connect Wallet</lngol-button
      >`;
    }

    return html`<span>✅ Connected</span>`;
  }
}
customElements.define("lngol-webln-connect", WeblnConnect);
