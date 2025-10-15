import Prism from "prismjs";
import "prismjs/components/prism-markup.js";
import "prismjs/components/prism-css.js";
import "prismjs/components/prism-javascript.js";

import Editor from "./code-playground/editor";
import Tabs from "./code-playground/tabs";
import Preview from "./code-playground/preview";
import ConsolePanel from "./code-playground/console-panel";
import Share from "./code-playground/share";

export default class CodePlayground {
  constructor(root) {
    this.root = root;
    this.container = root.closest('.playground') || root;

    this.editors = {
      html: new Editor(root, "html"),
      css: new Editor(root, "css"),
      js: new Editor(root, "js"),
    };

    // Tabs
    this.editorTabs = new Tabs(root, "[data-tab]", ".editor", "tab", "editor");
    this.previewTabs = new Tabs(root, "[data-preview]", ".preview-panel", "preview", "panel");

    this.consolePanel = new ConsolePanel(root.querySelector("#cp-console"));
    this.preview = new Preview(root, this.consolePanel);
    this.share = new Share(root, this.editors, this.preview, this.editorTabs);

    this.btnRun = this.container.querySelector("[data-cp-run]");
    this.chkAuto = this.container.querySelector("[data-cp-autorun]");
    this.btnReset = this.container.querySelector("[data-cp-reset]");
    this.btnClearConsole = this.container.querySelector("[data-cp-clear-console]");

    this._bindControls();

    this._wantAuto = root.getAttribute("data-autorun") !== "false";
    if (this.chkAuto) this.chkAuto.checked = this._wantAuto;
    if (this._wantAuto) this.run();
  }

  _bindControls() {
    if (this.btnRun) this.btnRun.addEventListener("click", () => this.run());
    if (this.btnClearConsole) this.btnClearConsole.addEventListener("click", () => this.consolePanel.clear());
    if (this.btnReset) this.btnReset.addEventListener("click", () => this.reset());

    const debounced = this._debounce(() => {
      const doAuto = this.chkAuto ? this.chkAuto.checked : this._wantAuto;
      if (doAuto) this.run();
    }, 300);

    Object.values(this.editors).forEach(ed => {
      ed.textarea.addEventListener("input", () => {
        ed.highlight();
        debounced();
      });
    });

    // Beautify
    this.container.querySelectorAll("[data-beautify]").forEach(btn => {
      const type = btn.getAttribute("data-beautify");
      btn.addEventListener("click", async () => {
        const editor = this.editors[type];
        if (editor) {
          await editor.format();
          editor.highlight();
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
    Object.values(this.editors).forEach(ed => {
      ed.reset();
      ed.highlight();
    });
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
