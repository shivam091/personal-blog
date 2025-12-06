import { EditorFoldManager } from "./fold-manager";
import { EditorInputHandler } from "./input-handler";
import { EditorState } from "./state";
import { EditorUI } from "./ui";
import { EditorGutter } from "./gutter";

import { prettifyCode } from "./../prettier";
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
  gutterEl;

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
  gutter;
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
    this.gutterEl = this.codeEditor?.querySelector(".editor-gutter");

    // 2. Sub-Module Initialization
    this.state = new EditorState();

    // EditorUI needs EditorCore's DOM elements and state for rendering content
    this.ui = new EditorUI(this, this.state, this.fileType);

    // EditorGutter manages the side strip
    this.gutter = new EditorGutter(this, this.state);

    // EditorFoldManager needs EditorCore's DOM, state, and UI methods
    this.foldManager = new EditorFoldManager(this, this.state);

    // EditorInputHandler needs EditorCore's core methods, DOM, and state
    this.inputHandler = new EditorInputHandler(this, this.state);

    // 3. Initial Setup
    // Initial visibility check to generate lines on load
    const initialLineVisibleAttr = root.getAttribute("data-line-numbers") || "off";
    this.gutter.setVisibility(initialLineVisibleAttr === "on");

    // Initialization of value and initial DOM structure
    const initialText = this.editable.innerText.replace(/\r/g, "");
    this.updateValue(initialText);
    this.#initialValue = this.value;

    this.inputHandler.initializeObserver();
    this.inputHandler.bindEvents();

    // Calculate folds after value is set
    this.foldManager.updateStructuralMetadata();
    this.#refresh();
  }

  // Getter for the editor's value.
  get value() {
    if (this.editable.children.length === 0) {
        return this.editable.textContent || "";
    }
    const lines = Array.from(this.editable.children).map(lineEl => lineEl.textContent);
    return lines.join("\n");
  }

  // Setter for the editor's value
  set value(val) {
    this.updateValue(val);
  }

  // Updates the editor's content with a new string value.
  updateValue(val) {
    const beforeMeta = getCursorMetadata(this.editable);
    const newCaretPos = beforeMeta?.caretPos ?? 0;

    // Use UI to generate the HTML
    this.editable.innerHTML = this.ui.toHTML(val);

    if (beforeMeta) {
      this.inputHandler.restoreCaretAt(newCaretPos);
    }

    this.inputHandler.scheduleCursorUpdate();

    // Use Gutter to update line numbers
    this.gutter.updateLineNumbers(val.split("\n").length);

    this.editable.dispatchEvent(new Event("playground:editor:value-changed", { bubbles: true }));

    // Trigger structural update
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
    this.gutter.updateLineNumbers();

    if (this.state.cursor) {
      this.ui.setActiveLine(this.state.cursor.line);
      this.gutter.setActiveLine(this.state.cursor.line);
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
