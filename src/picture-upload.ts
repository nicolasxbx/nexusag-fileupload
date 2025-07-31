import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

/**
 * An interactive reusable component to upload pictures (.jpg, .png)
 * Features: Preview, Drag & Drop
 * @required The minimum amount of files that have to be uploaded
 */
@customElement("picture-upload")
export class PictureUpload extends LitElement {
  // The minimum amount of files that have to be uploaded
  @property({ type: Number })
  required: number = 0;

  // Internal list of selected files
  @state()
  private _files: File[] = [];

  // Reference to the file input element
  @query("#fileInput")
  private _fileInputElement!: HTMLInputElement;

  // MIME types
  private _acceptedTypes: string = "image/png,image/jpeg";

  // Redirect click of container to "fileInput"-component
  private onUploadZoneClick() {
    this._fileInputElement.click();
  }

  // Prevent default drag behaviors for Drag&Drop to work.
  private onDragOver(e: DragEvent) {
    e.preventDefault();
  }
  private onDragEnter(e: DragEvent) {
    e.preventDefault();
  }

  // Input event 1: user drops file
  private onDrop(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) this.onFileInput(Array.from(e.dataTransfer.files));
  }

  // Input event 2: user selects file
  private onFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      this.onFileInput(Array.from(input.files));
      input.value = "";
    }
  }

  private onFileInput(newFiles: File[]) {
    // Add files that have correct type.
    const accepted = this._acceptedTypes.split(",");
    const filtered = newFiles.filter((file) => accepted.includes(file.type));
    this._files = [...this._files, ...filtered];

    //Dispatch custom event when files change for form integration
    this.dispatchEvent(
      new CustomEvent("files-changed", {
        detail: { files: this._files },
        bubbles: true,
      })
    );
  }

  private removeFile(fileToRemove: File) {
    this._files = this._files.filter((file) => file.name !== fileToRemove.name);

    // Dispatch event when files are removed
    this.dispatchEvent(
      new CustomEvent("files-changed", {
        detail: { files: this._files },
        bubbles: true,
      })
    );
  }

  // Access #1: External property access
  public getFiles(): File[] {
    return this._files;
  }

  // Acceess #2: As FormData (JSON Serializable)
  public getFormData(): FormData {
    const formData = new FormData();
    this._files.forEach((file, index) => {
      formData.append(`file${index}`, file, file.name);
    });
    return formData;
  }

  // Access #3: Append to FormData (JSON Serializable)
  public appendToFormData(
    formData: FormData,
    fieldName: string = "files"
  ): void {
    this._files.forEach((file) => formData.append(fieldName, file, file.name));
  }

  // Acceess #4: Hook into events of parent form, if exists.
  connectedCallback() {
    super.connectedCallback();

    // Get parent form
    const form = this.closest("form");
    if (form) {
      // Listen for form submit events
      form.addEventListener("submit", (e: Event) => {
        if (this._files.length < this.required) {
          e.preventDefault();
          alert("Please select at least one file");
        }
      });

      // Add form data when form is submitted
      form.addEventListener("formdata", (e: Event) => {
        const formDataEvent = e as FormDataEvent;
        this.appendToFormData(formDataEvent.formData);
      });
    }
  }

  protected render() {
    return html`
      <div
        class="upload-zone"
        @drop="${this.onDrop}"
        @dragover="${this.onDragOver}"
        @dragenter="${this.onDragEnter}"
        @click="${this.onUploadZoneClick}"
      >
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
    .upload-zone:hover {
      border-color: #666;
      background-color: #f9f9f9;
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
      width: 150px;
    }
    .preview img {
      width: 150px;
      height: 100px;
      object-fit: cover;
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
      right: 8px;
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

// For TypeScript
declare global {
  interface HTMLElementTagNameMap {
    "picture-upload": PictureUpload;
  }
}
