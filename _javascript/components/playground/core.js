/**
 * @class Core
 * @description Manages the application state, coordinates between major components (editors, preview, console),
 * executes code logic (run, prettify, reset), and handles inter-component commands.
 */
export class Core {
  /** @private {Map<string, *>} Internal state storage (e.g., autorun status, debounce time). */
  #store = new Map();
  /** @private {function|null} Callback function used to trigger a code run (set by initAutorun). */
  #runCb = null;

  /** @public {HTMLElement} The root container of the playground application. */
  container;
  /** @public {Object<string, Editor>} Map of editor instances keyed by their unique identifier. */
  editors;
  /** @public {Preview} The preview component instance (iframe manager). */
  preview;
  /** @public {ConsolePanel} The console panel component instance. */
  consolePanel;
  /** @public {Array<Object>} An array describing the order and type of files/editors. */
  orderedFiles;

  /**
   * Initializes Core with references to all major components and sets up initial state
   * based on root container attributes (e.g., data-autorun).
   * @constructor
   * @param {HTMLElement} container - The root application container.
   * @param {Object<string, Editor>} editors - Map of editor instances.
   * @param {Preview} preview - The preview component instance.
   * @param {ConsolePanel} consolePanel - The console panel component instance.
   * @param {Array<Object>} orderedFiles - List of files defining the bundling order.
   */
  constructor(container, editors, preview, consolePanel, orderedFiles) {
    this.container = container;
    this.editors = editors;
    this.preview = preview;
    this.consolePanel = consolePanel;
    this.orderedFiles = orderedFiles;

    const autorunAttr = container.getAttribute("data-autorun");
    // Determine initial autorun state: true by default, unless explicitly "false" or "0".
    const autorun = autorunAttr === null ? true : autorunAttr !== "false" && autorunAttr !== "0";

    this.#store.set("autorun", autorun);
    this.#store.set("autorunDebounce", 400); // Default debounce time for autorun
  }

  /**
   * Retrieves a value from the internal state map.
   * @public
   * @param {string} key - The state key.
   * @returns {*} The state value, or undefined if not set.
   */
  getState(key) {
    return this.#store.get(key);
  }

  /**
   * Updates a state key in the internal map and synchronizes the change with the container's data attribute.
   * @public
   * @param {string} key - The state key to update.
   * @param {*} val - The new value.
   */
  setState(key, val) {
    this.#store.set(key, val);
    this.#syncAttr(key, val);
  }

  /**
   * Sets the initial state of the autorun checkbox based on internal state,
   * stores the provided run callback, and performs an initial run if autorun is enabled.
   * @public
   * @param {function} runCb - The function to execute the debounced code run logic.
   */
  initAutorun(runCb) {
    const autoCheckbox = this.container.querySelector("[data-action='autorun']");
    if (autoCheckbox) autoCheckbox.checked = this.getState("autorun");

    if (this.getState("autorun")) runCb();

    this.#runCb = runCb;
  }

  /**
   * Requests an immediate, non-debounced code run via the stored callback.
   * Used primarily by manual "Run" buttons.
   * @public
   */
  requestRun() {
    if (this.#runCb) this.#runCb();
  }

  /**
   * Aggregates content from all editors by file type (HTML, CSS, JS) and sends the
   * bundled code to the preview component for execution.
   * @public
   */
  run() {
    const groupedContent = this.#getGroupedContent();

    // Send grouped bundle to preview
    this.preview.run({
      html: groupedContent.html || "",
      css: groupedContent.css || "",
      js: groupedContent.js || "",
    });
  }

  /**
   * Runs the prettify utility on the content of all active editors, updating their values.
   * Triggers a code run if the `autorun` state is true.
   * @public
   * @async
   */
  async prettifyCode() {
    for (const editor of Object.values(this.editors)) {
      await editor.prettify();
    }
    if (this.getState("autorun")) this.run();
  }

  /**
   * Resets all editors to their initial content, clears the console panel,
   * and triggers a run if the `autorun` state is true.
   * @public
   */
  reset() {
    Object.values(this.editors).forEach((e) => e.reset());
    this.consolePanel.clear()

    if (this.getState("autorun")) this.run();
  }

  /**
   * Synchronizes a state key/value to a `data-{key}` attribute on the root container.
   * This is used for CSS styling or external scripting based on app state.
   * @private
   * @param {string} key - The state key.
   * @param {*} val - The value.
   */
  #syncAttr(key, val) {
    if (!this.container) return;
    this.container.setAttribute(`data-${key}`, typeof val === "boolean" ? String(val) : val);
  }

  /**
   * Collects content from all editors based on the `orderedFiles` list, concatenating
   * content from files of the same type (e.g., all 'js' files combined).
   * @private
   * @returns {{html: string, css: string, js: string}} The bundled content keyed by file type.
   */
  #getGroupedContent() {
    return this.orderedFiles.reduce((grouped, file) => {
      const editor = this.editors[file.key];
      const content = editor ? editor.value : "";

      // Initialize if missing, then append content with a newline separator
      grouped[file.type] = (grouped[file.type] || "") + "\n" + content;

      return grouped;
    }, { html: "", css: "", js: "" }); // Pre-seed with known file types for cleanliness
  }
}