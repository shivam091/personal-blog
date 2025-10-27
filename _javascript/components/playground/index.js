import { ConsolePanel } from "./console-panel";
import { Controls } from "./controls";
import { Editor } from "./editor";
import { Export } from "./export";
import { Preview } from "./preview";
import { Core } from "./core";
import { KeyEvents } from "./key-events";
import { CaretMetadata } from "./caret-metadata";
import { ConsoleMetadata } from "./console-metadata";
import { RenderMetadata } from "./render-metadata";

import Tabs from "./../tab";
import SplitPane from "./../split-pane";
import { debounce } from "./../../utils/debounce";

export default class Playground {
  constructor(container) {
    this.container = container;

    this.orderedFiles = [];
    this.editors = {}; // keyed by `${type}-${index}`

    this.container.querySelectorAll("[data-editor-panel]").forEach(panel => {
      const fileKey = panel.getAttribute("data-editor-panel"); // e.g. "css-1"
      const fileType = panel.getAttribute("data-file-type"); // e.g. "css"
      const fileIndex = Number(panel.getAttribute("data-file-index")); // e.g. 1

      this.orderedFiles.push({ key: fileKey, type: fileType, index: fileIndex });

      this.editors[fileKey] = new Editor(this.container, fileKey, {
        fileType,
        fileIndex
      });
    });

    this.editorTabs = new Tabs(this.container, {
      tabSelector: "[data-editor]",
      panelSelector: "[data-editor-panel]",
      tabAttr: "editor",
      panelAttr: "editorPanel"
    });
    this.previewTabs = new Tabs(this.container, {
      tabSelector: "[data-preview]",
      panelSelector: "[data-preview-panel]",
      tabAttr: "preview",
      panelAttr: "previewPanel"
    });

    this.consolePanel = new ConsolePanel(container.querySelector("[data-console-panel]"));
    this.preview = new Preview(container, this.consolePanel);

    this.core = new Core(this.container, this.editors, this.preview, this.consolePanel, this.orderedFiles);

    this.exporter = new Export(this.container, this.editors, this.preview, this.orderedFiles);

    this.resizer = new SplitPane(this.container.querySelector("[data-split-pane]"));

    this.controls = new Controls(this.container, {
      run: () => this.core.run(),
      reset: () => this.core.reset(),
      beautify: () => this.core.prettifyCode(),
      clearConsole: () => this.consolePanel.clear(),
      export: () => this.exporter.toHTMLDownload(),
      autorun: (checked) => this.core.setState("autorun", checked),
    });

    this.keyEvents = new KeyEvents(this.container, this.core, this.exporter, this.consolePanel);

    this.caretMetadata = new CaretMetadata(this.container, this.editorTabs);
    this.consoleMetadata = new ConsoleMetadata(this.container, this.consolePanel, this.previewTabs);
    this.renderMetadata = new RenderMetadata(this.container, this.preview);

    this.#initPlugins();
    this.#initDebounce();
    this.core.initAutorun(() => this.core.run());
  }

  #initPlugins() {
    if (!Array.isArray(Playground.plugins)) return;

    for (const plugin of Playground.plugins) {
      if (typeof plugin === "function") {
        try {
          plugin(this);
        } catch (err) {
          console.warn("[Playground Plugin Error]", err);
        }
      }
    }
  }

  #initDebounce() {
    const wait = this.core.getState("autorunDebounce");

    Object.values(this.editors).forEach(editor => {
      const debouncedRun = debounce(() => {
        if (this.core.getState("autorun")) this.core.run();
      }, wait);

      editor.editable.addEventListener("input", debouncedRun);
      editor.editable.addEventListener("editor:manual-update", debouncedRun);
    });
  }

  static registerPlugin(fn) {
    if (typeof fn === "function") Playground.plugins.push(fn);
  }

  // Allows runtime update of debounce duration
  setDebounceDuration = (ms) => {
    this.core?.setState("autorunDebounce", ms);
  };

  static initializeAll() {
    document.querySelectorAll("[data-playground]").forEach((el) => new Playground(el));
  }
}

Playground.plugins = [];
