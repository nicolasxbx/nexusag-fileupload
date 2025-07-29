import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * A form component to upload pictures.
 * @slot - This element has a slot
 */
@customElement("picture-upload")
export class PictureUpload extends LitElement {
  render() {
    return html``;
  }

  static styles = css`
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "picture-upload": PictureUpload;
  }
}
