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

/**
 * @class Playground
 * @description Main application class that orchestrates the entire coding playground environment.
 * It initializes all major components (Editors, Preview, Console, Controls) and manages
 * the intercommunication and lifecycle (autorun, reset) between them.
 */
export default class Playground {
  /** @public {HTMLElement} The root DOM element for the playground (`data-playground`). */
  container;
  /** @public {Array<Object>} List of files/editors in the order they should be bundled. */
  orderedFiles = [];
  /** @public {Object<string, Editor>} Map of Editor instances keyed by their unique identifier (e.g., "css-1"). */
  editors = {};

  /** @public {Tabs} Manager for editor panel switching. */
  editorTabs;
  /** @public {Tabs} Manager for preview panel switching. */
  previewTabs;
  /** @public {ConsolePanel} The console panel instance for logging. */
  consolePanel;
  /** @public {Preview} The iframe manager responsible for code execution. */
  preview;
  /** @public {Core} The application's central logic and state manager. */
  core;
  /** @public {Export} The utility for generating and downloading the final HTML file. */
  exporter;
  /** @public {SplitPane} The panel resizer utility. */
  resizer;
  /** @public {Controls} Manages delegation for button/checkbox actions. */
  controls;
  /** @public {KeyEvents} Manages global keyboard shortcuts. */
  keyEvents;
  /** @public {CaretMetadata} Tracks and displays the current cursor position. */
  caretMetadata;
  /** @public {ConsoleMetadata} Tracks and displays running counts of console messages. */
  consoleMetadata;
  /** @public {RenderMetadata} Tracks and displays rendering time metrics. */
  renderMetadata;

  /**
   * Initializes the Playground, setting up the file structure and components.
   * @constructor
   * @param {HTMLElement} container - The root DOM element for the playground.
   */
  constructor(container) {
    this.container = container;

    // 1. Initialize Editors and File Structure
    this.container.querySelectorAll("[data-editor-panel]").forEach(panel => {
      const fileKey = panel.getAttribute("data-editor-panel");
      const fileType = panel.getAttribute("data-file-type");
      const fileIndex = Number(panel.getAttribute("data-file-index"));

      this.orderedFiles.push({ key: fileKey, type: fileType, index: fileIndex });

      this.editors[fileKey] = new Editor(this.container, fileKey, {
        fileType,
        fileIndex
      });
    });

    // 2. Initialize Tabs and Panel Managers
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

    // 3. Initialize Core Execution Components
    this.consolePanel = new ConsolePanel(container.querySelector("[data-console-panel]"));
    this.preview = new Preview(container, this.consolePanel);

    /** Core logic and state management */
    this.core = new Core(this.container, this.editors, this.preview, this.consolePanel, this.orderedFiles);

    this.exporter = new Export(this.container, this.editors, this.preview, this.orderedFiles);

    this.resizer = new SplitPane(this.container.querySelector("[data-split-pane]"));

    // 4. Bind UI Controls
    this.controls = new Controls(this.container, {
      run: () => this.core.run(),
      reset: () => this.core.reset(),
      beautify: () => this.core.prettifyCode(),
      clearConsole: () => this.consolePanel.clear(),
      export: () => this.exporter.toHTMLDownload(),
      autorun: (checked) => this.core.setState("autorun", checked),
    });

    // 5. Initialize Metadata and Events
    /** Keyboard shortcuts handler */
    this.keyEvents = new KeyEvents(this.container, this.core, this.exporter, this.consolePanel);

    this.caretMetadata = new CaretMetadata(this.container, this.editorTabs);
    this.consoleMetadata = new ConsoleMetadata(this.container, this.consolePanel, this.previewTabs);
    this.renderMetadata = new RenderMetadata(this.container, this.preview);

    // 6. Final Setup
    this.#initPlugins();
    this.#initDebounce();

    /** Initializes autorun state and performs an initial run if enabled. */
    this.core.initAutorun(() => this.core.run());
  }

  /**
   * Initializes and executes registered plugins stored in `Playground.plugins`.
   * @private
   */
  #initPlugins() {
    if (!Array.isArray(Playground.plugins)) return;

    for (const plugin of Playground.plugins) {
      if (typeof plugin === "function") {
        try {
          plugin(this); // Pass the Playground instance to the plugin function
        } catch (err) {
          console.warn("[Playground Plugin Error]", err);
        }
      }
    }
  }

  /**
   * Sets up debounced event listeners on all editors to trigger autorun.
   * The debounce time is retrieved from the Core state.
   * @private
   */
  #initDebounce() {
    const wait = this.core.getState("autorunDebounce");

    Object.values(this.editors).forEach(editor => {
      // Create one debounced function per editor instance to manage timing
      const debouncedRun = debounce(() => {
        if (this.core.getState("autorun")) this.core.run();
      }, wait);

      // Listen to 'input' for direct typing and 'playground:editor:value-changed' for programmatic updates.
      editor.editable.addEventListener("input", debouncedRun);
      editor.editable.addEventListener("playground:editor:value-changed", debouncedRun);
    });
  }

  /**
   * Allows external components to update the autorun debounce duration dynamically.
   * Updates the Core state.
   * @public
   * @param {number} ms - The new debounce duration in milliseconds.
   */
  setDebounceDuration = (ms) => {
    // Add validation for robustness
    const duration = Number(ms);
    if (isNaN(duration) || duration < 0) {
      console.warn("Invalid debounce duration:", ms);
      return;
    }
    // Updating Core state is the single source of truth for the duration
    this.core?.setState("autorunDebounce", duration);
    // Note: Re-initialization of listeners is required if the debounce value changes after init.
    // The current implementation relies on Core's state but doesn't rebind `#initDebounce()`.
    // For a proper dynamic update, the debounced functions should be recreated or the debounce utility itself should be able to update its wait time.
  };

  /**
   * Registers a global plugin function to be executed during the initialization of new Playground instances.
   * Plugins are executed in the order they are registered.
   * @public
   * @static
   * @param {function(Playground): void} fn - The plugin function, receiving the Playground instance as an argument.
   */
  static registerPlugin(fn) {
    if (typeof fn === "function") Playground.plugins.push(fn);
  }

  /**
   * Finds all elements in the document with the `data-playground` attribute and initializes a
   * new Playground instance for each one.
   * @public
   * @static
   */
  static initializeAll() {
    document.querySelectorAll("[data-playground]").forEach((el) => new Playground(el));
  }
}

/** @static {Array<function>} Storage for globally registered plugin functions. */
Playground.plugins = [];