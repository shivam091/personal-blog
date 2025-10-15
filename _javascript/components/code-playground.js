import Editor from "./code-playground/editor";
import Tabs from "./code-playground/tabs";
import Preview from "./code-playground/preview";
import ConsolePanel from "./code-playground/console-panel";
import Share from "./code-playground/share";

export default class CodePlayground {
  constructor(root) {
    this.root = root;
    // toolbar lives outside the [data-code-playground] element — use the wrapper container
    this.container = root.closest('.playground') || root;

    // Editors
    this.editors = {
      html: new Editor(root, "html"),
      css: new Editor(root, "css"),
      js: new Editor(root, "js"),
    };

    // Tabs
    this.editorTabs = new Tabs(root, "[data-tab]", ".editor", "tab", "editor");
    this.previewTabs = new Tabs(root, "[data-preview]", ".preview-panel", "preview", "panel");

    // Console & preview
    this.consolePanel = new ConsolePanel(root.querySelector("#cp-console"));
    this.preview = new Preview(root, this.consolePanel);

    // Share tools
    this.share = new Share(root, this.editors, this.preview, this.editorTabs);

    // Controls — query from container so toolbar buttons (outside cp-pen) are found
    this.btnRun = this.container.querySelector("[data-cp-run]");
    this.chkAuto = this.container.querySelector("[data-cp-autorun]");
    this.btnReset = this.container.querySelector("[data-cp-reset]");
    this.btnClearConsole = this.container.querySelector("[data-cp-clear-console]");

    this._bindControls();

    // autorun: use attribute on the cp-pen element as source of truth
    this._wantAuto = root.getAttribute("data-autorun") !== "false";
    if (this.chkAuto) this.chkAuto.checked = this._wantAuto;
    if (this._wantAuto) this.run();
  }

  _bindControls() {
    if (this.btnRun) {
      this.btnRun.addEventListener("click", () => this.run());
    }

    if (this.btnClearConsole) {
      this.btnClearConsole.addEventListener("click", () => this.consolePanel.clear());
    }

    // autorun (debounced). If checkbox exists use it, otherwise fall back to _wantAuto
    const debounced = this._debounce(() => {
      const doAuto = this.chkAuto ? this.chkAuto.checked : this._wantAuto;
      if (doAuto) this.run();
    }, 400);
    Object.values(this.editors).forEach(ed => ed.textarea.addEventListener("input", debounced));

    if (this.btnReset) this.btnReset.addEventListener("click", () => this.reset());

    // Beautify
    this.container.querySelectorAll("[data-beautify]").forEach(btn => {
      const type = btn.getAttribute("data-beautify");
      btn.addEventListener("click", () => {
        const editor = this.editors[type];
        if (editor) {
          editor.format();

          // re-run preview if autorun is enabled
          const doAuto = this.chkAuto ? this.chkAuto.checked : this._wantAuto;
          if (doAuto) this.run();
        }
      });
    });
  }

  run() {
    this.preview.run(
      this.editors.html.value,
      this.editors.css.value,
      this.editors.js.value
    );
  }

  reset() {
    Object.values(this.editors).forEach(ed => ed.reset());
    // use checkbox if present otherwise fall back to the original autorun flag
    const doAuto = this.chkAuto ? this.chkAuto.checked : this._wantAuto;
    if (doAuto) this.run();
  }

  _debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  static initAll() {
    document.querySelectorAll("[data-code-playground]").forEach(el => new CodePlayground(el));
  }
}
