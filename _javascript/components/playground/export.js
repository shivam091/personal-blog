import { DocumentComposer } from "./document-composer";

/**
 * @class Export
 * @description Generates the final, self-contained HTML document structure containing
 * the collected code (HTML, CSS, JS) from all editors, ready for download or external use.
 */
export class Export {
  /** @public {HTMLElement} The root container of the playground. */
  container;
  /** @public {Object<string, Editor>} Map of editor instances. */
  editors;
  /** @public {Preview} The preview component instance (not directly used for export, but passed in). */
  preview;
  /** @public {Array<Object>} An array describing the order and type of files/editors. */
  orderedFiles;
  /** @public {string} The ID attribute of the playground container. */
  playgroundId;
  /** @public {string} The name/title of the playground, retrieved from the DOM. */
  playgroundName;

  /**
   * @constructor
   * @param {HTMLElement} container The root DOM element for the playground.
   * @param {Object<string, Editor>} editors Map of editor instances.
   * @param {Preview} preview The preview component instance.
   * @param {Array<Object>} orderedFiles List of files defining the bundling order.
   */
  constructor(container, editors, preview, orderedFiles) {
    this.container = container;
    this.editors = editors;
    this.preview = preview;
    this.orderedFiles = orderedFiles;

    this.playgroundId = String(container.dataset.id);
    this.playgroundName = container.querySelector(".playground-name")?.textContent.trim();
  }

  /**
   * Concatenates the content from the corresponding editor instances, organized by type (html, css, js).
   * @private
   * @returns {{html: string, css: string, js: string}} The bundled source code.
   */
  #collectSources() {
    const htmlParts = [];
    const cssParts = [];
    const jsParts = [];

    for (const file of this.orderedFiles) {
      const editor = this.editors[file.key];
      if (!editor) continue;

      const content = editor.value;

      if (file.type === "html") htmlParts.push(content);
      if (file.type === "css") cssParts.push(content);
      if (file.type === "js") jsParts.push(content);
    }

    return {
      html: htmlParts.join("\n"),
      css: cssParts.join("\n"),
      js: jsParts.join("\n")
    };
  }

  /**
   * Composes the final document string using DocumentComposer, and wraps it in a Blob object
   * ready for saving or further processing. The `safe` option is set to false for export.
   * @public
   * @returns {Blob} A Blob containing the complete HTML document.
   */
  toHTMLBlob() {
    const { html, css, js } = this.#collectSources();
    const doc = DocumentComposer.compose({html, css, js, title: this.playgroundName, safe: false });

    return new Blob([doc], { type: "text/html" });
  }

  /**
   * Generates the HTML document, converts it to a Blob, and triggers the browser download dialog.
   * @public
   * @param {string} [name] - The filename for the downloaded file. Defaults to `[id]-playground.html`.
   */
  toHTMLDownload(name = `${this.playgroundId}-playground.html`) {
    const blob = this.toHTMLBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = name;
    document.body.appendChild(a);

    a.click();
    a.remove();
    URL.revokeObjectURL(url); // Clean up the URL object
  }
}