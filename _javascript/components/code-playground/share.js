export default class Share {
  constructor(root, editors, preview, tabs) {
    this.root = root;
    this.container = root.closest('.playground') || root;
    this.editors = editors;
    this.preview = preview;
    this.tabs = tabs;
    this.btnExport = this.container.querySelector("[data-cp-export]");
    this._bind();
  }

  _bind() {
    if (this.btnExport) {
      this.btnExport.addEventListener("click", () => this.exportHTML());
    }
  }

  exportHTML() {
    const html = this.editors.html.value;
    const css = this.editors.css.value;
    const js = this.editors.js.value;
    const doc = this.preview._composeDocument(html, css, js);
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "playground.html";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}
