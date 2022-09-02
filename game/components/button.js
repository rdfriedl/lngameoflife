import { LitElement, css, html } from "lit";

export class Button extends LitElement {
  static properties = {
    disabled: false,
  };
  // copied from https://copy-paste-css.com/
  static styles = css`
    button {
      display: inline-block;
      outline: 0;
      border: none;
      cursor: pointer;
      font-weight: 600;
      border-radius: 4px;
      font-size: 13px;
      height: 30px;
      background-color: #eee;
      border: 1px solid #aaa;
      color: #000;
      padding: 0 10px;
    }
    button[disabled] {
      cursor: not-allowed;
      background-color: #ccc;
    }
    button:hover {
      background-color: #fff;
    }
  `;
  render() {
    return html`<button ?disabled=${this.disabled}><slot></slot></button>`;
  }
}
customElements.define("lngol-button", Button);
