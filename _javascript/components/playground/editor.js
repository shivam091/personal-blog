import { LanguageEngine } from "../parser/engine";
import Highlighter from "./highlighter";
import { prettifyCode } from "./prettier";
import { findNodeOffset, getCursorMetadata } from "./utils/cursor-metadata";

export class Editor {
  #root;
  #key;
  #initial;
  #frameId = null;
  #highlighter = null;

  constructor(root, uniqueKey, meta = {}) {
    this.#root = root;
    this.#key = uniqueKey;
    this.fileType = meta.fileType || uniqueKey.split("-")[0];
    this.fileIndex = Number(meta.fileIndex ?? uniqueKey.split("-")[1] ?? 0);

    // Cache DOM lookups
    this.editable = root.querySelector(`[data-editor-panel="${this.#key}"] [contenteditable="true"]`);
    this.codeEditor = this.editable.closest(".code-editor");
    this.linesEl = this.codeEditor?.querySelector(".cp-lines");

    this.#highlighter = new Highlighter(this.fileType);

    this.observer = this.#createMutationObserver();

    // Store initial content after normalization
    this.#normalizeLines(); // Ensure initial DOM structure is correct
    this.#initial = this.value; // Get normalized value

    this.#refresh(); // Initial render
    this.#bindEvents();
  }

  #createMutationObserver() {
    // Only observe changes to text nodes and attributes inside the editable element
    const observer = new MutationObserver(mutations => {
      const linesToUpdate = new Set();

      // Skip handling mutations if we are the ones that caused them (e.g. from innerHTML)
      // This is not the primary way to stop the loop, but good practice.
      // The main protection is in the microtask, but if you want to skip here:
      // if (this._isSelfMutating) return;

      for (const mutation of mutations) {
        let targetNode = mutation.target;

        if (targetNode.nodeType === 3) {
          targetNode = targetNode.parentElement;
        }

        if (!targetNode) continue;

        const lineEl = targetNode.closest('.cp-line');

        if (lineEl && this.editable.contains(lineEl)) {
          linesToUpdate.add(lineEl);
        }
      }

      // Reformat all affected lines
      queueMicrotask(() => {
        if (linesToUpdate.size === 0) return;

        // FIX: Read the current ABSOLUTE character index (caretPos) before disconnect.
        // This correctly captures where the cursor *would* be in the plaintext.
        const beforeMeta = getCursorMetadata(this.editable);

        // CRITICAL 2: Stop observing before we execute the destructive DOM update
        this.observer.disconnect();

        linesToUpdate.forEach(lineEl => this.#updateSingleLineDOM(lineEl));

        // CRITICAL 3: Resume observing immediately after the DOM update
        this.observer.observe(this.editable, {
          childList: true,
          subtree: true,
          characterData: true
        });

        // CRITICAL 4: Robust Caret Restoration using character index
        if (beforeMeta) {
          // Use the saved absolute position to restore the cursor on the *new* DOM
          this.#restoreCaretFromMetadata(beforeMeta.caretPos);
        } else {
          this.#scheduleCursorUpdate();
        }
      });
    });

    // Start observing initially
    observer.observe(this.editable, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return observer;
  }

  /**
   * NEW: Robust Caret Restoration method using absolute character index.
   */
  #restoreCaretFromMetadata(newCaretPos) {
    const sel = window.getSelection();
    if (!sel) return;

    const { node: target, offset } = findNodeOffset(this.editable, newCaretPos);

    const newRange = document.createRange();
    newRange.setStart(target, offset);
    newRange.collapse(true);

    sel.removeAllRanges();
    sel.addRange(newRange);
  }

  /**
   * Optimization: Uses requestAnimationFrame for throttling expensive DOM updates.
   * This ensures #refresh only runs once per animation frame, preventing layout thrashing.
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
   * Optimization: Debounces cursor model update to avoid unnecessary recalculations
   * during fast key presses, mouse moves, etc. Uses a microtask for near-instant update
   * but after the current event/DOM mutation has settled.
   */
  #scheduleCursorUpdate(event) {
    queueMicrotask(() => {
      const meta = getCursorMetadata(this.editable);
      if (!meta) return;

      this.cursor = { line: meta.line, col: meta.col };
      this.#setActiveLine(meta.line);

      // Optimization: Only update cursor model and active line from a keydown/mouseup/focus event.
      // Input event is already handled below and calls #refresh.
      if (event && event.type !== 'input') {
        // If a refresh was pending, let the cursor update proceed before the refresh.
        this.#scheduleRefresh();
      }
    });
  }

  /**
   * Re-applies formatting to a single cp-line element's content.
   * @param {HTMLElement} lineEl The div.cp-line element to update.
   */
  #updateSingleLineDOM(lineEl) {
    if (!lineEl) return;

    // Get the plain text content of the line without any HTML tags (spans, <br>).
    const plainText = lineEl.textContent || '';

    // Apply the formatting defined in #applyFormatting
    const newHTML = this.#applyFormatting(plainText.replace(/\n/g, '')); // Remove native newlines if present

    // Update the line's content.
    lineEl.innerHTML = newHTML;
  }

  // --- Event Binding Optimization ---

  #bindEvents() {
    // Optimization: Consolidate input/change handlers.
    // 'input' event: For content change. Always needs refresh and cursor update.
    this.editable.addEventListener("input", (event) => {
      this.#scheduleRefresh();
      this.#scheduleCursorUpdate(event);
    });

    // Optimization: Immediate active-line updates on navigation keys for a better feel,
    // but still throttled to a single frame.
    this.editable.addEventListener("keydown", (event) => {
      const keys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"];
      // Use event.key directly as event.code can be less reliable across layouts.
      if (keys.includes(event.key)) {
        // Cancel pending refresh to avoid race condition with fast navigation
        cancelAnimationFrame(this.#frameId);
        this.#frameId = null;

        // Use a single RAF for line update for efficiency
        requestAnimationFrame(() => {
          this.#scheduleCursorUpdate(event);
        });
      };
    });

    // Optimization: Fallback for caret moves that don't trigger 'input' (keyup, mouseup, focus).
    // They only need a cursor model update, which is debounced.
    ["keyup", "mouseup", "focus"].forEach(evt =>
      this.editable.addEventListener(evt, e => this.#scheduleCursorUpdate(e))
    );

    // Optimization: Use a custom event with a more specific name for clarity
    this.editable.addEventListener("editor:manual-update", () => this.#scheduleRefresh());
    this.editable.addEventListener("editor:caret-updated", (event) => {
      const { line } = event.detail;

      // Direct call to set the active line based on external sync
      this.#setActiveLine(line);

      // Also update the internal cursor model (optional, but good practice)
      this.cursor = { line: line, col: event.detail.col };
    });
    this.editable.addEventListener("paste", e => this.#handlePaste(e));
  }

  get value() {
    return Array.from(this.editable.children, div => div.textContent).join("\n");
  }

  set value(val) {
    this.updateValue(val);
  }

  updateValue(val) {
    // Optimization: Use innerHTML to replace content, which is the most direct way.
    this.editable.innerHTML = this.#toHTML(val);
    this.#scheduleCursorUpdate();
  }

  reset() {
    this.updateValue(this.#initial);
  }

  async prettify() {
    try {
      const prettified = await prettifyCode(this.value, this.fileType);
      this.updateValue(prettified);
      // Optimization: Use the specific custom event name.
      this.editable.dispatchEvent(new Event("editor:manual-update", { bubbles: true }));
    } catch (error) {
      console.warn("prettify failed", error);
    }
  }

  // Optimization: Merged #updateCursorModel into #scheduleCursorUpdate
  // (The original #updateCursorModel is now essentially #scheduleCursorUpdate's microtask logic)

  // #handlePaste is complex and relies on DOM manipulation/cursor-metadata, leaving as-is
  // as major changes would require refactoring the utility functions too.
  // The original implementation seems robust for handling paste by calculating character index.
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
      if (!sel.rangeCount) return;

      const beforeMeta = getCursorMetadata(this.editable);
      // const range = sel.getRangeAt(0); // Not needed as we use metadata

      if (!beforeMeta) return;

      // ... (Paste logic remains the same: calculate new position, update value, restore caret) ...

      const deletedLength = beforeMeta.selectionEnd - beforeMeta.selectionStart;
      const newCaretPos = beforeMeta.selectionStart + text.length - deletedLength;

      const fullValue = this.value;
      const before = fullValue.slice(0, beforeMeta.selectionStart);
      const after = fullValue.slice(beforeMeta.selectionEnd);
      const newValue = before + text + after;

      this.updateValue(newValue);

      // Restoration logic relies on findNodeOffset, which is in utils/cursor-metadata.js
      // The original code has the logic to findNodeOffset imported, so we keep the original logic for simplicity.
      const { node: target, offset } = findNodeOffset(this.editable, newCaretPos);

      const newRange = document.createRange();
      newRange.setStart(target, offset);
      newRange.collapse(true);

      sel.removeAllRanges();
      sel.addRange(newRange);

      // Optimization: Trigger the manual update and cursor model update *after*
      // DOM is ready (end of microtask), but the immediate DOM changes are done above.
      this.editable.dispatchEvent(new Event("editor:manual-update", { bubbles: true }));
      this.#scheduleCursorUpdate(); // Update cursor model instantly after restore
    };

    pasteFromClipboard();
  }


  // --- Internal Helper Methods ---

  #normalizeLines() {
    // Optimization: Avoids innerText as it can trigger a sync layout.
    // Use the existing logic which ensures internal content matches value() structure.
    const lines = this.editable.innerText.replace(/\r/g, "").split("\n");
    this.editable.innerHTML = this.#toHTML(lines.join("\n"));
  }

  // #applyFormatting and #toHTML are used for rendering and are fine as-is.

  #applyFormatting(line) {
    // if (line.length === 0) return "<br>";

    // const safe = escapeHTML(line)
    //   .replace(/ /g, "<span class='space-char'> </span>")
    //   .replace(/\t/g, "<span class='tab-char'>\t</span>");

    // return safe;

    const engine = new LanguageEngine(this.fileType, line);

    const {ast, tokens, highlighted, errors } = engine.run(line)
    console.log("AST:", ast);
    console.log("Tokens", tokens);
    console.log("Errors", errors);
    return highlighted;
  }

  #toHTML(str) {
    return str
      .split("\n")
      .map(line => `<div class="cp-line">${this.#applyFormatting(line)}</div>`)
      .join("");
  }

  #updateLineNumbers() {
    if (!this.linesEl) return;

    // Optimization: Calculate count only once.
    const count = this.value.split("\n").length;
    const currentLineCount = this.linesEl.children.length;

    // Optimization: Only update the DOM if the line count has changed.
    if (count !== currentLineCount) {
      this.linesEl.innerHTML = Array.from({ length: count }, (_, i) =>
        `<div class="cp-line">${i + 1}</div>`
      ).join("");
    }
  }

  /**
   * Runs the main visual updates. Only called via #scheduleRefresh (RAF-throttled).
   */
  #refresh() {
    this.#updateLineNumbers();
    // Optimization: Active line update is now handled in #scheduleCursorUpdate
    // but we can call it here as a safety fallback after a manual update.
    if (this.cursor) {
      this.#setActiveLine(this.cursor.line);
    }

    this.editable.dispatchEvent(new CustomEvent("editor:value-updated", {
      bubbles: true,
      detail: {
        value: this.value,
        fileType: this.fileType
      }
    }));
  }

  // Highlighting logic is fine, it's a direct DOM manipulation.
  #setActiveLine(line) {
    this.#clearHighlights();

    const block = this.editable.children[line - 1];
    if (!block) return;

    block.classList.add("cp-active-line");

    const lineEl = this.linesEl?.children[line - 1];
    if (lineEl) lineEl.classList.add("cp-active-line");
  }

  #clearHighlights() {
    // Optimization: QuerySelectorAll is a snapshot, forEach is fine.
    this.editable.querySelectorAll(".cp-active-line").forEach(el =>
      el.classList.remove("cp-active-line")
    );
    this.linesEl?.querySelectorAll(".cp-active-line").forEach(el =>
      el.classList.remove("cp-active-line")
    );
  }
}