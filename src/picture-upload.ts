import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";

/**
 * An interactive reusable component to upload pictures (.jpg, .png)
 * Features: Preview, Drag & Drop
 */
@customElement("picture-upload")
export class PictureUpload extends LitElement {
  /* MIME types */
  _acceptedTypes: string = "image/png,image/jpeg";

  /* Internal list of selected files */
  @state()
  private _files: File[] = [];

  firstUpdated(): void {
    const zone = this.shadowRoot!.querySelector(".upload-zone") as HTMLElement;
    zone.addEventListener("click", () =>
      this.shadowRoot!.getElementById("fileInput")!.click()
    );
  }

  private onDrop(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) this.processFiles(Array.from(e.dataTransfer.files));
  }

  private onFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files));
      input.value = "";
    }
  }

  private processFiles(newFiles: File[]) {
    const accepted = this._acceptedTypes.split(",");
    const filtered = newFiles.filter((file) => accepted.includes(file.type));
    this._files = [...this._files, ...filtered];
  }

  private removeFile(fileToRemove: File) {
    this._files = this._files.filter((file) => file.name !== fileToRemove.name);
  }

  // Append to FormData
  public appendToFormData(): FormData {
    const formData = new FormData();
    this._files.forEach((file) => formData.append("files", file, file.name));
    console.dir(formData);
    return formData;
  }

  render() {
    return html`
      <div class="upload-zone" @drop="${this.onDrop}">
        <p>Bilder hierher ziehen oder zum Auswählen anklicken</p>
        <input
          type="file"
          id="fileInput"
          multiple
          accept="${this._acceptedTypes}"
          @change="${this.onFileSelect}"
          hidden
        />
      </div>

      <div class="preview-container">
        ${this._files.map(
          (file) => html`
            <div class="preview">
              <img
                src="${URL.createObjectURL(file)}"
                alt="Preview of ${file.name}"
              />
              <div class="file-name">${file.name}</div>
              <div
                class="remove-file-button"
                @click=${() => this.removeFile(file)}
              >
                x
              </div>
            </div>
          `
        )}
      </div>
    `;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .upload-zone {
      border: 2px dashed #bbb;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      cursor: pointer;
    }
    .preview-container {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .preview {
      display: flex;
      position: relative;
      flex-direction: column;
      align-items: center;
      width: 100px;
    }
    .preview img {
      max-width: 100%;
      max-height: 100px;
      border-radius: 4px;
    }
    .file-name {
      margin-top: 4px;
      font-size: 0.875rem;
      word-break: break-all;
    }
    .remove-file-button {
      position: absolute;
      top: 6px;
      right: 14px;
      z-index: 10;
      cursor: pointer;
      color: red;
      font-size: 20px;
      font-weight: 500;
      padding: 4px;
      line-height: 0;
    }
    .remove-file-button:hover {
      color: darkred;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "picture-upload": PictureUpload;
  }
}
