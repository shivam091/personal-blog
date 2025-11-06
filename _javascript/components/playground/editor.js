import { prettifyCode } from "./prettier";
import { escapeHTML } from "./parser/utils";
import { findNodeOffset, getCursorMetadata } from "./utils/cursor-metadata";

/**
 * @class Editor
 * @description Provides the core logic for a custom, contenteditable-based code editor component.
 * It manages user input, DOM manipulation for visual formatting (spaces/tabs), line numbering,
 * cursor persistence, and code prettification.
 */
export class Editor {
  /** @private {HTMLElement} The root DOM element containing the entire editor component. */
  #root;
  /** @private {string} A unique key/identifier for this editor instance. */
  #key;
  /** @private {string} The initial text content of the editor upon instantiation. */
  #initial;
  /** @private {number|null} The ID for the pending requestAnimationFrame call used for debouncing UI updates. */
  #frameId = null;

  /**
   * @constructor
   * @param {HTMLElement} root The container element for the editor.
   * @param {string} uniqueKey A unique identifier, often containing file type and index (e.g., "js-0").
   * @param {Object} [meta={}] Optional metadata to override fileType and fileIndex.
   */
  constructor(root, uniqueKey, meta = {}) {
    this.#root = root;
    this.#key = uniqueKey;
    /** @public {string} The file type (e.g., 'js', 'html') inferred from the unique key or metadata. */
    this.fileType = meta.fileType || uniqueKey.split("-")[0];
    /** @public {number} The index of the file, inferred from the unique key or metadata. */
    this.fileIndex = Number(meta.fileIndex ?? uniqueKey.split("-")[1] ?? 0);

    // DOM Elements
    /** @public {HTMLElement} The main [contenteditable="true"] panel element where code is entered. */
    this.editable = root.querySelector(`[data-editor-panel="${this.#key}"] [contenteditable="true"]`);
    /** @public {HTMLElement} The closest container element with class ".code-editor". */
    this.codeEditor = this.editable.closest(".code-editor");
    /** @public {HTMLElement|null} The element containing the line numbers (".cp-lines"). */
    this.linesEl = this.codeEditor?.querySelector(".cp-lines");

    /** @public {MutationObserver} The observer instance used to monitor and re-format single-line text changes. */
    this.observer = this.#createMutationObserver();

    // Initialization
    const initialText = this.editable.innerText.replace(/\r/g, "");
    this.updateValue(initialText); // Sets initial DOM structure
    this.#initial = this.value;

    this.#refresh();
    this.#bindEvents();
  }

  /**
   * Optimized getter for the editor's value.
   * Uses children.textContent which is faster than innerText on the whole editor.
   * @public
   * @returns {string} The current text content of the editor, with lines separated by a newline.
   */
  get value() {
    // Collect the text content from each line div and join with a newline.
    // This assumes #toHTML creates one div per line.
    return Array.from(this.editable.children, div => div.textContent).join("\n");
  }

  /**
   * Setter for the editor's value, calling updateValue.
   * @param {string} val The new text content.
   */
  set value(val) {
    this.updateValue(val);
  }

  /**
   * Updates the editor's content with a new string value.
   * It preserves the caret position if possible and triggers necessary UI updates.
   * @public
   * @param {string} val The new content for the editor.
   */
  updateValue(val) {
    const beforeMeta = getCursorMetadata(this.editable);
    const newCaretPos = beforeMeta?.caretPos ?? 0;

    this.editable.innerHTML = this.#toHTML(val);

    if (beforeMeta) {
      this.#restoreCaretAt(newCaretPos);
    }

    this.#scheduleCursorUpdate();

    // Single source of truth for value change event
    this.editable.dispatchEvent(new Event("playground:editor:value-changed", { bubbles: true }));
  }

  /**
   * Resets the editor's content back to the value it had upon initial load.
   * @public
   */
  reset() {
    this.updateValue(this.#initial);
  }

  /**
   * Attempts to format the current code using the external prettifyCode utility.
   * @public
   * @async
   */
  async prettify() {
    try {
      const prettified = await prettifyCode(this.value, this.fileType);
      this.updateValue(prettified);
    } catch (error) {
      console.warn("prettify failed", error);
    }
  }

  /**
   * Attaches all primary and internal event listeners to the editable area.
   * @private
   */
  #bindEvents() {
    // Primary user input events
    this.editable.addEventListener("input", () => {
      this.#scheduleRefresh();
      this.#scheduleCursorUpdate();
    });
    this.editable.addEventListener("paste", e => this.#handlePaste(e));

    // Keydown for structural changes (Enter) or cursor movement requiring updates
    this.editable.addEventListener("keydown", (event) => {
      // Optimizing cursor updates for navigation keys
      const cursorKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"];
      if (cursorKeys.includes(event.key)) {
        // Cancel any pending refresh as cursor update is prioritized
        cancelAnimationFrame(this.#frameId);
        this.#frameId = null;

        requestAnimationFrame(() => {
          this.#scheduleCursorUpdate();
        });
        return;
      }

      if (event.key === "Enter") {
        this.#handleEnterKey(event);
      }
    });

    // Internal editor events
    this.editable.addEventListener("playground:editor:value-changed", () => this.#scheduleRefresh());
    this.editable.addEventListener("playground:editor:caret-updated", (event) => {
      const { line, col } = event.detail;
      this.#setActiveLine(line);
      /** @public {object} The last known cursor position { line, col }. Used for state persistence. */
      this.cursor = { line: line, col: col };
    });
  }

  /**
   * Handles the 'Enter' key press, preventing the default contenteditable behavior,
   * manually inserting a newline, and ensuring the caret and UI are correctly updated.
   * @private
   * @param {KeyboardEvent} event The keyboard event.
   */
  #handleEnterKey(event) {
    event.preventDefault();

    const sel = window.getSelection();
    const beforeMeta = getCursorMetadata(this.editable);
    if (!sel.rangeCount || !beforeMeta) return;

    let fullValue = this.value;
    let newCaretPos = beforeMeta.caretPos;

    // 1. Handle selection deletion
    if (beforeMeta.selectionStart !== beforeMeta.selectionEnd) {
      fullValue = fullValue.slice(0, beforeMeta.selectionStart) + fullValue.slice(beforeMeta.selectionEnd);
      newCaretPos = beforeMeta.selectionStart;
    }

    // 2. Insert the newline
    const newValue = fullValue.slice(0, newCaretPos) + "\n" + fullValue.slice(newCaretPos);

    // 3. Update the value (triggers updateValue, which calls #scheduleCursorUpdate)
    this.updateValue(newValue);

    // 4. Manually set the caret to the new line start (newCaretPos + 1)
    const finalCaretPos = newCaretPos + 1;
    this.#restoreCaretAt(finalCaretPos);

    // 5. Explicitly run necessary UI updates
    this.#updateLineNumbers(newValue.split("\n").length); // Pass count to avoid re-calculating value
    this.#scheduleCursorUpdate(); // Re-schedule to capture the manually set caret
    this.#scheduleRefresh();
  }

  /**
   * Handles the 'Paste' event, preventing the default behavior and manually
   * inserting the text from the clipboard to ensure consistent formatting.
   * @private
   * @param {ClipboardEvent} event The clipboard event.
   */
  #handlePaste(event) {
    event.preventDefault();

    const readText = () =>
      event.clipboardData?.getData("text") ||
      navigator.clipboard?.readText?.() ||
      Promise.resolve("");

    const pasteFromClipboard = async () => {
      const text = await readText();
      if (!text) return;

      const sel = window.getSelection();
      const beforeMeta = getCursorMetadata(this.editable);
      if (!sel.rangeCount || !beforeMeta) return;

      const fullValue = this.value;
      const { selectionStart, selectionEnd } = beforeMeta;

      // 1. Calculate new value
      const before = fullValue.slice(0, selectionStart);
      const after = fullValue.slice(selectionEnd);
      const newValue = before + text + after;

      // 2. Calculate new caret position
      const newCaretPos = selectionStart + text.length;

      // 3. Update the value
      this.updateValue(newValue);

      // 4. Manually set the caret (overwrites updateValue's attempt)
      this.#restoreCaretAt(newCaretPos);

      // 5. Re-schedule to capture the manually set caret
      this.#scheduleCursorUpdate();
    };

    pasteFromClipboard();
  }

  /**
   * Restores the caret at a given character offset within the editor's content.
   * Uses findNodeOffset to map the global character index to a specific DOM node and offset.
   * @private
   * @param {number} caretPos The character offset to restore the caret to.
   */
  #restoreCaretAt(caretPos) {
    const sel = window.getSelection();
    if (!sel) return;

    const { node: target, offset } = findNodeOffset(this.editable, caretPos);

    const newRange = document.createRange();
    newRange.setStart(target, offset);
    newRange.collapse(true);

    sel.removeAllRanges();
    sel.addRange(newRange);
  }

  /**
   * Debounces calls to #refresh using requestAnimationFrame to consolidate DOM updates.
   * @private
   */
  #scheduleRefresh() {
    if (this.#frameId === null) {
      this.#frameId = requestAnimationFrame(() => {
        this.#frameId = null;
        this.#refresh();
      });
    }
  }

  /**
   * Queues a microtask to read the current cursor metadata and dispatch an update event.
   * This is used to capture the final position after DOM manipulation or user input.
   * @private
   */
  #scheduleCursorUpdate() {
    queueMicrotask(() => {
      const meta = getCursorMetadata(this.editable);
      if (!meta) return;

      // Dispatch event to allow handlers to react to the updated cursor position
      this.editable.dispatchEvent(new CustomEvent("playground:editor:caret-updated", {
        bubbles: true,
        detail: meta
      }));
    });
  }

  /**
   * The primary UI update function. Updates line numbers, highlights the active line,
   * and dispatches a value updated event.
   * @private
   */
  #refresh() {
    this.#updateLineNumbers();

    if (this.cursor) {
      this.#setActiveLine(this.cursor.line);
    }

    this.editable.dispatchEvent(new CustomEvent("playground:editor:value-updated", {
      bubbles: true,
      detail: {
        value: this.value,
        fileType: this.fileType
      }
    }));
  }

  /**
   * Updates line numbers based on the current value or an optional count.
   * @private
   * @param {number} [count] Optional count of lines for optimization (to avoid re-calculating value).
   */
  #updateLineNumbers(count) {
    if (!this.linesEl) return;

    count = count ?? this.value.split("\n").length;
    const currentLineCount = this.linesEl.children.length;

    if (count !== currentLineCount) {
      this.linesEl.innerHTML = Array.from({ length: count }, (_, i) =>
        `<div class="cp-line">${i + 1}</div>`
      ).join("");
    }
  }

  /**
   * Highlights the specified line number and its corresponding content block.
   * @private
   * @param {number} line The 1-based line number to set as active.
   */
  #setActiveLine(line) {
    this.#clearHighlights();

    const block = this.editable.children[line - 1];
    if (!block) return;

    block.classList.add("cp-active-line");

    const lineEl = this.linesEl?.children[line - 1];
    if (lineEl) lineEl.classList.add("cp-active-line");
  }

  /**
   * Removes the active line highlight from all elements.
   * @private
   */
  #clearHighlights() {
    this.codeEditor?.querySelectorAll(".cp-active-line").forEach(el =>
      el.classList.remove("cp-active-line")
    );
  }

  /**
   * Converts a string of code into the HTML structure used by the editor
   * (one <div class="cp-line"> per line) and applies formatting.
   * @private
   * @param {string} str The raw code string.
   * @returns {string} The HTML representation.
   */
  #toHTML(str) {
    return str
      .split("\n")
      .map(line => `<div class="cp-line">${this.#applyFormatting(line)}</div>`)
      .join("");
  }

  /**
   * Applies HTML escaping and formats spaces/tabs with styled span elements.
   * @private
   * @param {string} line A single line of text content.
   * @returns {string} The formatted HTML string for the line.
   */
  #applyFormatting(line) {
    if (line.length === 0) return "<br>";

    // Escape HTML entities first to prevent injection, then replace whitespace with styled spans.
    const safe = escapeHTML(line)
      .replace(/ /g, "<span class='cp-token-space'> </span>")
      .replace(/\t/g, "<span class='cp-token-tab'>\t</span>");

    return safe;
  }

  /**
   * Updates the HTML of a single line element to re-apply formatting.
   * Used within the Mutation Observer to re-format the specific line being edited.
   * @private
   * @param {HTMLElement|null} lineEl The div element representing the single line.
   */
  #updateSingleLineDOM(lineEl) {
    if (!lineEl) return;

    const plainText = lineEl.textContent || "";
    // Get text content, strip newlines (as this is a single line update), and re-format.
    const newHTML = this.#applyFormatting(plainText.replace(/\n/g, ""));

    lineEl.innerHTML = newHTML;
  }

  /**
   * Creates and initializes a MutationObserver to watch for character data changes
   * (user typing) within the editable area to dynamically re-apply formatting on the
   * specific line being edited without losing the cursor.
   * @private
   * @returns {MutationObserver} The configured observer instance.
   */
  #createMutationObserver() {
    const observer = new MutationObserver(mutations => {
      const linesToUpdate = new Set();

      for (const mutation of mutations) {
        let targetNode = mutation.target;

        // Find the line element that needs re-formatting
        if (targetNode.nodeType === 3) { // Text node
          targetNode = targetNode.parentElement;
        }

        const lineEl = targetNode?.closest(".cp-line");
        if (lineEl && this.editable.contains(lineEl)) {
          linesToUpdate.add(lineEl);
        }
      }

      queueMicrotask(() => {
        if (linesToUpdate.size === 0) return;

        const beforeMeta = getCursorMetadata(this.editable);

        // Temporarily disconnect observer to prevent an infinite recursion loop during innerHTML update
        this.observer.disconnect();

        linesToUpdate.forEach(lineEl => this.#updateSingleLineDOM(lineEl));

        // Re-connect the observer
        this.observer.observe(this.editable, {
          childList: true,
          subtree: true,
          characterData: true
        });

        // Restore caret and update UI after DOM changes
        if (beforeMeta) {
          this.#restoreCaretAt(beforeMeta.caretPos);
          this.#scheduleRefresh();
        } else {
          this.#scheduleCursorUpdate();
        }
      });
    });

    observer.observe(this.editable, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return observer;
  }
}