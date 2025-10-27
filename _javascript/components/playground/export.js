import { DocumentComposer } from "./document-composer";

export class Export {
  constructor(container, editors, preview, orderedFiles) {
    this.container = container;
    this.editors = editors;
    this.preview = preview;
    this.orderedFiles = orderedFiles;
    this.btnExport = this.container.querySelector("[data-cp-export]");

    this.playgroundId = String(container.dataset.id);
    this.playgroundName = container.querySelector(".playground-name")?.textContent.trim();
  }

  #collectSources() {
    // We still need a single html/css/js bundle for running standalone.
    // Compose by concatenating in order to maintain intended sequence.
    let html = "", css = "", js = "";
    for (const file of this.orderedFiles) {
      const editor = this.editors[file.key];
      if (!editor) continue;
      if (file.type === "html") html += `\n${editor.value}`;
      if (file.type === "css") css += `\n${editor.value}`;
      if (file.type === "js") js += `\n${editor.value}`;
      // else ignore or append to custom handlers
    }
    return { html, css, js };
  }

  toHTMLBlob() {
    const { html, css, js } = this.#collectSources();
    const doc = DocumentComposer.compose({html, css, js, title: this.playgroundName, safe: false });
    return new Blob([doc], { type: "text/html" });
  }

  toHTMLDownload(name = `${this.playgroundId}-playground.html`) {
    const blob = this.toHTMLBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  toJSON() {
    // preserve order and types
    const payload = { files: [] };
    for (const file of this.orderedFiles) {
      const editor = this.editors[file.key];
      payload.files.push({
        key: file.key,
        type: file.type,
        index: file.index,
        code: editor ? editor.value : ""
      });
    }
    return JSON.stringify(payload);
  }
}
