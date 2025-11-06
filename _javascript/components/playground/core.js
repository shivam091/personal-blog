/*
 * Manages the application state, coordinates between major components (editors, preview, console),
 * executes code logic (run, prettify, reset), and handles inter-component commands.
 */
export class Core {
  // Internal state storage (e.g., autorun status, debounce time).
  #store = new Map();

  // Callback function used to trigger a code run (set by initAutorun).
  #runCb = null;

  // Store the shared debounced function instance
  #debouncedRunInstance = null;

  /*
   * Initializes Core with references to all major components and sets up initial state
   * based on root container attributes (e.g., data-autorun).
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
    this.#store.set("autorunDebounceDuration", 400); // Default debounce time for autorun
  }

  /*
   * Retrieves a value from the internal state map.
   */
  getState(key) {
    return this.#store.get(key);
  }

  /*
   * Updates a state key in the internal map and synchronizes the change with the container's data attribute.
   */
  setState(key, val) {
    this.#store.set(key, val);
    this.#syncAttr(key, val);
  }

  // Setter method to receive the debounced function instance from Playground
  setDebounceInstance(debouncedRun) {
    this.#debouncedRunInstance = debouncedRun;
  }

  /*
   * Sets the initial state of the autorun checkbox based on internal state,
   * stores the provided run callback, and performs an initial run if autorun is enabled.
   */
  initAutorun(runCb) {
    const autoCheckbox = this.container.querySelector("[data-action='autorun']");
    if (autoCheckbox) autoCheckbox.checked = this.getState("autorun");

    if (this.getState("autorun")) runCb();

    this.#runCb = runCb;
  }

  /*
    * Toggles the line numbers attribute on the main playground container and
    * dispatches an event for all Editors to handle the DOM manipulation.
    */
  toggleLineNumbers() {
    // Use "on"/"off" strings for the DOM attribute
    const currentAttr = this.container.getAttribute("data-line-numbers") || "on";
    const nextAttr = currentAttr === "on" ? "off" : "on";

    this.container.setAttribute("data-line-numbers", nextAttr);

    // Dispatch a custom event with the clean boolean state
    this.container.dispatchEvent(new CustomEvent("playground:editor:toggle-line-numbers", {
        detail: { visible: nextAttr === "on" }
    }));
  }

  /*
   * Requests an immediate, non-debounced code run via the stored callback.
   * Used primarily by manual "Run" buttons.
   */
  requestRun() {
    if (this.#runCb) this.#runCb();
  }

  /*
   * Aggregates content from all editors by file type (HTML, CSS, JS) and sends the
   * bundled code to the preview component for execution.
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

  /*
   * Asynchronously runs the prettify utility on the content of all active editors, updating their values.
   * Triggers a code run if the `autorun` state is true.
   */
  async prettifyCode() {
    for (const editor of Object.values(this.editors)) {
      await editor.prettify();
    }
    if (this.getState("autorun")) this.run();
  }

  /*
   * Resets all editors to their initial content, clears the console panel,
   * and triggers a run if the `autorun` state is true.
   */
  reset() {
    // Resetting editors (this triggers the 'playground:editor:value-changed' events)
    Object.values(this.editors).forEach((editor) => editor.reset());
    this.consolePanel.clear()

    if (this.getState("autorun")) {
      // Cancel the pending debounced run.
      // We must stop the implicit run caused by the editor reset event firing above.
      if (this.#debouncedRunInstance && typeof this.#debouncedRunInstance.cancel === "function") {
        this.#debouncedRunInstance.cancel();
      }

      // Explicitly trigger the single, controlled run.
      this.run();
    }
  }

  /*
   * Synchronizes a state key/value to a `data-{key}` attribute on the root container.
   * This is used for CSS styling or external scripting based on app state.
   */
  #syncAttr(key, val) {
    if (!this.container) return;

    this.container.setAttribute(`data-${key}`, typeof val === "boolean" ? String(val) : val);
  }

  /*
   * Collects content from all editors based on the `orderedFiles` list, concatenating
   * content from files of the same type (e.g., all 'js' files combined).
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
