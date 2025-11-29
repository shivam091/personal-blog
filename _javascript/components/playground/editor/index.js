import { EditorFoldManager } from "./fold-manager";
import { EditorInputHandler } from "./input-handler";
import { prettifyCode } from "./../prettier";
import { EditorState } from "./state";
import { EditorUI } from "./ui";
import { getCursorMetadata } from "./../utils/cursor-metadata";

/*
 * Provides the core logic for a custom, contenteditable-based code editor component.
 * It coordinates State, UI, Input, and Structural features.
 */
export class Editor {
  // The main [contenteditable="true"] panel element
  editable;

  // The closest container element with class ".code-editor"
  codeEditor;

  // The element containing the line numbers (".editor-lines")
  gutterLineNumbersEl;

  // The element containing the fold markers (".editor-folds")
  gutterFoldsEl;

  fileType;
  fileIndex;

  // A unique key/identifier for this editor instance.
  #key;

  // The initial text content of the editor upon instantiation.
  #initialValue;

  // Pending requestAnimationFrame ID for refresh loop
  pendingAnimationFrameId = null;

  // Sub-Modules (Composition)
  state;
  ui;
  foldManager;
  inputHandler;

  // Forwarded Properties/Getters (for external access)
  get cursor() {
    return this.state.cursor;
  }

  constructor(root, uniqueKey, meta = {}) {
    // 1. Basic Initialization
    this.root = root;
    this.#key = uniqueKey;

    this.fileType = meta.fileType || uniqueKey.split("-")[0];
    this.fileIndex = Number(meta.fileIndex ?? uniqueKey.split("-")[1] ?? 0);

    // DOM Element Queries
    this.editable = root.querySelector(`[data-editor-panel="${this.#key}"] [contenteditable="true"]`);
    this.codeEditor = this.editable.closest(".code-editor");
    this.gutterLineNumbersEl = this.codeEditor?.querySelector(".editor-lines");
    this.gutterFoldsEl = this.codeEditor?.querySelector(".editor-folds");

    // 2. Sub-Module Initialization
    this.state = new EditorState();

    // EditorUI needs EditorCore's DOM elements and state for rendering
    this.ui = new EditorUI(this, this.state, this.fileType);

    // EditorFoldManager needs EditorCore's DOM, state, and UI methods
    this.foldManager = new EditorFoldManager(this, this.state);

    // EditorInputHandler needs EditorCore's core methods, DOM, and state
    this.inputHandler = new EditorInputHandler(this, this.state);

    // 3. Initial Setup
    // Initial visibility check to generate lines on load
    const initialLineVisibleAttr = root.getAttribute("data-line-numbers") || "off";
    this.ui.setLineNumberVisibility(initialLineVisibleAttr === "on");

    // Initialization of value and initial DOM structure
    const initialText = this.editable.innerText.replace(/\r/g, "");
    this.updateValue(initialText);
    this.#initialValue = this.value;

    this.inputHandler.initializeObserver();
    this.inputHandler.bindEvents();
    this.foldManager.updateStructuralMetadata();
    this.#refresh();
  }

  /*
   * Optimized getter for the editor's value.
   * Now uses childNodes to account for orphaned text nodes left by
   * native browser cut/delete operations, preventing line count desync.
   */
  get value() {
    // Handle completely empty editor (no children)
    if (this.editable.children.length === 0) {
        return this.editable.textContent || "";
    }

    // Collect the text content of every child DIV element (the lines).
    const lines = Array.from(this.editable.children).map(lineEl => lineEl.textContent);

    return lines.join("\n");
  }

  // Setter for the editor's value, calling updateValue.
  set value(val) {
    this.updateValue(val);
  }

  /*
   * Updates the editor's content with a new string value.
   * It preserves the caret position if possible and triggers necessary UI updates.
   */
  updateValue(val) {
    const beforeMeta = getCursorMetadata(this.editable);
    const newCaretPos = beforeMeta?.caretPos ?? 0;

    // Use UI to generate the HTML
    this.editable.innerHTML = this.ui.toHTML(val);

    if (beforeMeta) {
      this.inputHandler.restoreCaretAt(newCaretPos);
    }

    this.inputHandler.scheduleCursorUpdate();

    this.ui.updateLineNumbers(val.split("\n").length);

    // Single source of truth for value change event
    this.editable.dispatchEvent(new Event("playground:editor:value-changed", { bubbles: true }));

    // Also trigger structural update on full value change
    this.foldManager.updateStructuralMetadata();
  }

  // Resets the editor's content back to the value it had upon initial load.
  reset() {
    this.updateValue(this.#initialValue);
  }

  // Asynchronously attempts to format the current code using the external prettifyCode utility.
  async prettify() {
    try {
      const prettified = await prettifyCode(this.value, this.fileType);
      this.updateValue(prettified);
    } catch (error) {
      console.warn("[Playground] prettify failed", error);
    }
  }

  // Refreshes UI elements based on current state (Line Numbers, Active Line)
  #refresh() {
    this.ui.updateLineNumbers();

    if (this.state.cursor) {
      this.ui.setActiveLine(this.state.cursor.line);
    }

    this.root.dispatchEvent(new CustomEvent("playground:editor:value-updated", {
      bubbles: true,
      detail: {
        value: this.value,
        fileType: this.fileType
      }
    }));
  }

  // Debounces calls to #refresh using requestAnimationFrame to consolidate DOM updates.
  scheduleRefresh() {
    if (this.pendingAnimationFrameId === null) {
      this.pendingAnimationFrameId = requestAnimationFrame(() => {
        this.pendingAnimationFrameId = null;
        this.#refresh();
      });
    }
  }
}
