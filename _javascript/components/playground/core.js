export class Core {
  #store = new Map();
  #runCb = null;

  constructor(container, editors, preview, consolePanel, orderedFiles) {
    this.container = container;
    this.editors = editors;
    this.preview = preview;
    this.consolePanel = consolePanel;
    this.orderedFiles = orderedFiles;

    // Defaults
    const autorunAttr = container.getAttribute("data-autorun");
    const autorun = autorunAttr === null ? true : autorunAttr !== "false" && autorunAttr !== "0";

    this.#store.set("autorun", autorun);
    this.#store.set("autorunDebounce", 400);
  }

  getState(key) {
    return this.#store.get(key);
  }

  setState(key, val) {
    this.#store.set(key, val);
    this.#syncAttr(key, val);
  }

  initAutorun(runCb) {
    const autoCheckbox = this.container.querySelector("[data-action='autorun']");
    if (autoCheckbox) autoCheckbox.checked = this.getState("autorun");

    if (this.getState("autorun")) runCb();

    this.#runCb = runCb;
  }

  requestRun() {
    if (this.#runCb) this.#runCb();
  }

  run() {
    const grouped = {};

    // Ensure groups exist for known types encountered
    for (const file of this.orderedFiles) {
      if (!grouped[file.type]) grouped[file.type] = "";
    }

    // Append file contents in original order
    for (const file of this.orderedFiles) {
      const editor = this.editors[file.key];
      if (!editor) continue;
      grouped[file.type] += "\n" + editor.value;
    }

    // Send grouped bundle to preview
    this.preview.run({
      html: grouped.html || "",
      css: grouped.css || "",
      js: grouped.js || "",
      // pass other groups as needed in future
    });
  }

  async prettifyCode() {
    for (const editor of Object.values(this.editors)) {
      await editor.prettify();
    }
    if (this.getState("autorun")) this.run();
  }

  reset() {
    Object.values(this.editors).forEach((e) => e.reset());
    this.consolePanel.clear()

    if (this.getState("autorun")) this.run();
  }

  #syncAttr(key, val) {
    if (!this.container) return;
    this.container.setAttribute(`data-${key}`, typeof val === "boolean" ? String(val) : val);
  }
}
