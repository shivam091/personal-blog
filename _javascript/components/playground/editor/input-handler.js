import { findNodeOffset, getCursorMetadata } from "./../utils/cursor-metadata";

/*
 * Manages all user input events, cursor positioning, and the Mutation Observer
 * for single-line updates.
 */
export class EditorInputHandler {
  #core;
  #state;
  observer;

  constructor(core, state) {
    this.#core = core;
    this.#state = state;
  }

  // Attaches all primary and internal event listeners.
  bindEvents() {
    // Primary user input events
    this.#core.editable.addEventListener("input", () => {
      this.#core.gutter.update();

      this.#core.scheduleRefresh();
      this.scheduleCursorUpdate();
      this.#core.foldManager.updateStructuralMetadata();
    });
    this.#core.editable.addEventListener("paste", e => this.#handlePaste(e));

    // Keydown handling
    this.#core.editable.addEventListener("keydown", (event) => {
      const cursorKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"];
      if (cursorKeys.includes(event.key)) {
        cancelAnimationFrame(this.#core.pendingAnimationFrameId);
        this.#core.pendingAnimationFrameId = null;

        requestAnimationFrame(() => {
          this.scheduleCursorUpdate();
        });
        return;
      }

      if (event.key === "Enter") {
        this.#handleEnterKey(event);
      }
    });

    // Internal editor events
    this.#core.editable.addEventListener("playground:editor:value-changed", () => this.#core.scheduleRefresh());

    this.#core.editable.addEventListener("playground:editor:caret-updated", (event) => {
      const { line, col } = event.detail;

      this.#core.ui.setActiveLine(line);
      this.#core.gutter.setActiveLine(line);

      this.#state.cursor = { line: line, col: col };
    });

    // Listen for the global folds updated event
    this.#core.editable.addEventListener("playground:editor:folds-updated", () => {
      if (this.#state.cursor) {
        this.#core.ui.setActiveLine(this.#state.cursor.line);
        this.#core.gutter.setActiveLine(this.#state.cursor.line);
      }
    });

    // Gutter click for folding
    if (this.#core.gutterEl) {
      this.#core.gutterEl.addEventListener("click", this.#handleGutterClick.bind(this));
    }
  }

  // Handles click on the fold gutter
  #handleGutterClick(event) {
    const marker = event.target.closest(".fold-marker.has-marker");
    if (!marker) return;

    // 2. Find the parent line element to get the line number
    const lineEl = marker.closest(".editor-line");
    if (!lineEl) return;

    // 3. Get the line number from the PARENT
    const startLine = parseInt(lineEl.dataset.line, 10);

    // 4. Toggle
    this.#core.foldManager.toggleFold(startLine);
  }

  /*
   * Queues a microtask to read the current cursor metadata and dispatch an update event.
   * This is used to capture the final position after DOM manipulation or user input.
   */
  scheduleCursorUpdate() {
    queueMicrotask(() => {
      const meta = getCursorMetadata(this.#core.editable);
      if (!meta) return;

      // Dispatch event to allow handlers to react to the updated cursor position
      this.#core.editable.dispatchEvent(new CustomEvent("playground:editor:caret-updated", {
        bubbles: true,
        detail: meta
      }));
    });
  }

  /*
   * Restores the caret at a given character offset within the editor's content.
   * Uses findNodeOffset to map the global character index to a specific DOM node and offset.
   */
  restoreCaretAt(caretPos) {
    const selection = window.getSelection();
    if (!selection) return;

    const { node: target, offset } = findNodeOffset(this.#core.editable, caretPos);

    const newRange = document.createRange();
    newRange.setStart(target, offset);
    newRange.collapse(true);

    selection.removeAllRanges();
    selection.addRange(newRange);
  }

  // Handles the 'Enter' key press.
  #handleEnterKey(event) {
    event.preventDefault();

    const beforeMeta = getCursorMetadata(this.#core.editable);
    if (!beforeMeta) return;

    let fullValue = this.#core.value;
    let newCaretPos = beforeMeta.caretPos;

    // Handle selection deletion
    if (beforeMeta.selectionStart !== beforeMeta.selectionEnd) {
      fullValue = fullValue.slice(0, beforeMeta.selectionStart) + fullValue.slice(beforeMeta.selectionEnd);
      newCaretPos = beforeMeta.selectionStart;
    }

    // Insert the newline
    const newValue = fullValue.slice(0, newCaretPos) + "\n" + fullValue.slice(newCaretPos);
    this.#core.updateValue(newValue); // Triggers full update

    // Manually set the caret to the new line start (newCaretPos + 1)
    const finalCaretPos = newCaretPos + 1;
    this.restoreCaretAt(finalCaretPos);

    // Explicitly run necessary UI updates
    this.#core.gutter.update(newValue.split("\n").length);
    this.scheduleCursorUpdate(); // Re-schedule to capture the manually set caret
    this.#core.scheduleRefresh();
  }

  /*
   * Handles the 'Paste' event, preventing the default behavior and manually
   * inserting the text from the clipboard to ensure consistent formatting.
   */
  #handlePaste(event) {
    event.preventDefault();
    const readText = () => event.clipboardData?.getData("text") || navigator.clipboard?.readText?.() || Promise.resolve("");

    const pasteFromClipboard = async () => {
      const text = await readText();
      if (!text) return;

      const beforeMeta = getCursorMetadata(this.#core.editable);
      if (!beforeMeta) return;

      const fullValue = this.#core.value;
      const { selectionStart, selectionEnd } = beforeMeta;

      // Calculate new value
      const before = fullValue.slice(0, selectionStart);
      const after = fullValue.slice(selectionEnd);
      const newValue = before + text + after;

      // Calculate new caret position
      const newCaretPos = selectionStart + text.length;

      // Update the value
      this.#core.updateValue(newValue);

      // Manually set the caret (overwrites updateValue's attempt)
      this.restoreCaretAt(newCaretPos);

      // Re-schedule to capture the manually set caret
      this.scheduleCursorUpdate();
    };

    pasteFromClipboard();
  }

  /*
   * Creates and initializes a MutationObserver to watch for character data changes
   * (user typing) within the editable area to dynamically re-apply formatting on the
   * specific line being edited without losing the cursor.
   */
  initializeObserver() {
    this.observer = new MutationObserver(mutations => {
      const linesToUpdate = new Set();

      for (const mutation of mutations) {
        let targetNode = mutation.target;

        // Find the line element that needs re-formatting
        if (targetNode.nodeType === 3) targetNode = targetNode.parentElement;

        const lineEl = targetNode?.closest(".editor-line");
        if (lineEl && this.#core.editable.contains(lineEl)) linesToUpdate.add(lineEl);
      }

      queueMicrotask(() => {
        if (linesToUpdate.size === 0) return;
        const beforeMeta = getCursorMetadata(this.#core.editable);

        // Temporarily disconnect observer to prevent an infinite recursion loop during innerHTML update
        this.observer.disconnect();

        // Only UI updates need to happen here (highlighting)
        linesToUpdate.forEach(lineEl => this.#core.ui.updateSingleLineDOM(lineEl));

        // Re-connect the observer
        this.observer.observe(this.#core.editable, {
          childList: true,
          subtree: true,
          characterData: true
        });

        // Restore caret and update UI after DOM changes
        if (beforeMeta) {
          this.restoreCaretAt(beforeMeta.caretPos);
          this.#core.scheduleRefresh();
        } else {
          this.scheduleCursorUpdate();
        }
      });
    });

    this.observer.observe(this.#core.editable, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
}
