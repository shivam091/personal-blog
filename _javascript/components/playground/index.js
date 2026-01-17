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

/*
 * Main application class that orchestrates the entire coding playground environment.
 * It initializes all major components (Editors, Preview, Console, Controls) and manages
 * the intercommunication and lifecycle (autorun, reset) between them.
 */
export default class Playground {
  // List of files/editors in the order they should be bundled.
  orderedFiles = [];

  // Map of Editor instances keyed by their unique identifier (e.g., "css-1").
  editors = {};

  // Store the debounced function for external control (cancellation).
  debouncedRun = null;

  // Tracks whether debounce listeners have been initialized to safely recreate them later
  debounceInitialized = false;

  /*
   * Initializes the Playground, setting up the file structure and components.
   */
  constructor(container) {
    this.container = container;

    // Initialize Editors and File Structure
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

    // Initialize Tabs and Panel Managers
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

    // Initialize Core Execution Components
    this.consolePanel = new ConsolePanel(container.querySelector("[data-console-panel]"));
    this.preview = new Preview(container, this.consolePanel);

    // Core logic and state management
    this.core = new Core(this.container, this.editors, this.preview, this.consolePanel, this.orderedFiles);

    this.exporter = new Export(this.container, this.editors, this.preview, this.orderedFiles);

    this.resizer = new SplitPane(this.container.querySelector("[data-split-pane]"));

    // Bind UI controls
    this.controls = new Controls(this.container, {
      run: () => this.core.run(),
      reset: () => this.core.reset(),
      beautify: () => this.core.prettifyCode(),
      clearConsole: () => this.consolePanel.clear(),
      export: () => this.exporter.toHTMLDownload(),
      autorun: (checked) => this.core.setState("autorun", checked),
      toggleLineNumbers: () => this.core.toggleLineNumbers()
    });

    // Initialize events
    this.keyEvents = new KeyEvents(this.container, this.core, this.exporter, this.consolePanel);

    // Initialize metadata
    this.caretMetadata = new CaretMetadata(this.container, this.editorTabs);
    this.consoleMetadata = new ConsoleMetadata(this.container, this.consolePanel, this.previewTabs);
    this.renderMetadata = new RenderMetadata(this.container, this.preview);

    // Final Setup
    this.#initializePlugins();
    this.#initializeDebounce();

    // Pass the debounced instance to Core so it can control/cancel runs
    this.core.setDebounceInstance(this.debouncedRun);

    // Use the final setup method for initial render control (from previous step)
    this.#finalizeSetup();
  }

  /*
   * Attaches the debounced autorun handler to all editor input-related events
   */
  #bindDebounceListeners(debouncedFn) {
    Object.values(this.editors).forEach(editor => {
      editor.editable.addEventListener("input", debouncedFn);
      editor.editable.addEventListener("playground:editor:value-changed", debouncedFn);
    });
  }

  /*
   * Detaches the debounced autorun handler from all editor events to prevent duplicate triggers
   */
  #unbindDebounceListeners(debouncedFn) {
    if (!debouncedFn) return;

    Object.values(this.editors).forEach(editor => {
      editor.editable.removeEventListener("input", debouncedFn);
      editor.editable.removeEventListener("playground:editor:value-changed", debouncedFn);
    });
  }

  /*
   * Initializes and executes registered plugins stored in `Playground.plugins`.
   */
  #initializePlugins() {
    if (!Array.isArray(Playground.plugins)) return;

    for (const plugin of Playground.plugins) {
      if (typeof plugin === "function") {
        try {
          plugin(this); // Pass the Playground instance to the plugin function
        } catch (err) {
          console.warn("[Playground]", err);
        }
      }
    }
  }

  /*
   * Sets up debounced event listeners on all editors to trigger autorun.
   * The debounce time is retrieved from the Core state.
   */
  #initializeDebounce() {
    const wait = this.core.getState("autorunDebounceDuration");

    if (this.debouncedRun && typeof this.debouncedRun.cancel === "function") {
      this.debouncedRun.cancel();
    }

    this.debouncedRun = debounce(() => {
      if (this.core.getState("autorun")) this.core.run();
    }, wait);

    this.#bindDebounceListeners(this.debouncedRun);
    this.debounceInitialized = true;
  }

  /*
   * Finalizes setup by initializing Core state and forcing a single, controlled
   * initial render, eliminating implicit debounce race conditions.
   */
  #finalizeSetup() {
    this.core.initAutorun(() => {});

    if (this.debouncedRun && typeof this.debouncedRun.cancel === "function") {
      this.debouncedRun.cancel();
    }

    this.core.run();
  }

  /*
   * Allows external components to update the autorun debounce duration dynamically.
   * Updates the Core state.
   */
  setDebounceDuration = (ms) => {
    const duration = Number(ms);
    if (isNaN(duration) || duration < 0) {
      console.warn("[Playground] Invalid debounce duration:", ms);
      return;
    }

    // Update Core state (single source of truth)
    this.core?.setState("autorunDebounceDuration", duration);

    // If debounce already exists, fully recreate it
    if (this.debounceInitialized) {
      // 1. Remove old listeners
      this.#unbindDebounceListeners(this.debouncedRun);

      // 2. Cancel pending execution
      if (typeof this.debouncedRun?.cancel === "function") {
        this.debouncedRun.cancel();
      }

      // 3. Recreate debounce with new delay
      this.#initializeDebounce();

      // 4. Update Core reference
      this.core.setDebounceInstance(this.debouncedRun);
    }
  };

  /*
   * Registers a global plugin function to be executed during the initialization of new Playground instances.
   * Plugins are executed in the order they are registered.
   */
  static registerPlugin(fn) {
    if (typeof fn === "function") Playground.plugins.push(fn);
  }

  /*
   * Finds all elements in the document with the `data-playground` attribute and initializes a
   * new Playground instance for each one.
   */
  static initializeAll() {
    document.querySelectorAll("[data-playground]").forEach((el) => new Playground(el));
  }
}

/*
 * Storage for globally registered plugin functions.
 */
Playground.plugins = [];
