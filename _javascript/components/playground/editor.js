import { prettifyCode } from "./prettier";
import { findNodeOffset, getCursorMetadata } from "./utils/cursor-metadata";
import { LanguageEngine } from "./fold-parser/language-engine";

/*
 * Provides the core logic for a custom, contenteditable-based code editor component.
 * It manages user input, DOM manipulation for visual formatting (spaces/tabs), line numbering,
 * cursor persistence, and code prettification.
 */
export class Editor {
  // The root DOM element containing the entire editor component.
  #root;

  // A unique key/identifier for this editor instance.
  #key;

  // The initial text content of the editor upon instantiation.
  #initialValue;

  // The ID for the pending requestAnimationFrame call used for debouncing UI updates.
  #pendingAnimationFrameId = null;

  // Default cursor state property.
  cursor = { line: 1, col: 1 };

  // Structural update debounce ID
  #structuralFrameId = null;

  // Store the collapse state for each foldable region
  #foldedRegions = new Map(); // Key: startLine, Value: {endLine, isCollapsed: boolean}

  constructor(root, uniqueKey, meta = {}) {
    this.#root = root;
    this.#key = uniqueKey;

    // The full document AST. (No longer required to be stored, but kept for legacy/debug)
    this.fullAST = null;

    // The calculated fold regions.
    this.foldRegions = [];

    // The file type (e.g., 'js', 'html') inferred from the unique key or metadata.
    this.fileType = meta.fileType || uniqueKey.split("-")[0];

    // The index of the file, inferred from the unique key or metadata.
    this.fileIndex = Number(meta.fileIndex ?? uniqueKey.split("-")[1] ?? 0);

    // The main [contenteditable="true"] panel element where code is entered.
    this.editable = root.querySelector(`[data-editor-panel="${this.#key}"] [contenteditable="true"]`);

    // The closest container element with class ".code-editor".
    this.codeEditor = this.editable.closest(".code-editor");

    // The element containing the line numbers (".editor-lines").
    this.linesEl = this.codeEditor?.querySelector(".editor-lines");

    this.foldsEl = this.codeEditor?.querySelector(".editor-folds");

    // Initial visibility check to generate lines on load if the attribute is "on"
    const initialLineVisibleAttr = root.getAttribute("data-line-numbers") || "off";
    this.#setLineNumberVisibility(initialLineVisibleAttr === "on");

    // The observer instance used to monitor and re-format single-line text changes.
    this.observer = this.#createMutationObserver();

    // Initialization
    const initialText = this.editable.innerText.replace(/\r/g, "");
    this.updateValue(initialText); // Sets initial DOM structure
    this.#initialValue = this.value;

    this.#refresh();
    this.#bindEvents();
    this.#scheduleStructuralUpdate();
  }

  /*
   * Optimized getter for the editor's value.
   * Uses children.textContent which is faster than innerText on the whole editor.
   */
  get value() {
    // Collect the text content from each line div and join with a newline.
    // This assumes #toHTML creates one div per line.
    return Array.from(this.editable.children, div => div.textContent).join("\n");
  }

  /*
   * Setter for the editor's value, calling updateValue.
   */
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

    this.editable.innerHTML = this.#toHTML(val);

    if (beforeMeta) {
      this.#restoreCaretAt(newCaretPos);
    }

    this.#scheduleCursorUpdate();

    // Single source of truth for value change event
    this.editable.dispatchEvent(new Event("playground:editor:value-changed", { bubbles: true }));
  }

  /*
   * Resets the editor's content back to the value it had upon initial load.
   */
  reset() {
    this.updateValue(this.#initialValue);
  }

  /*
   * Asynchronously attempts to format the current code using the external prettifyCode utility.
   */
  async prettify() {
    try {
      const prettified = await prettifyCode(this.value, this.fileType);
      this.updateValue(prettified);
    } catch (error) {
      console.warn("[Playground] prettify failed", error);
    }
  }

  /**
   * Updates the internal map, keeping existing collapse states if regions match.
   * This preserves the user's folding state when content changes.
   * @param {Array<{startLine: number, endLine: number}>} newRegions - The fold regions from the parser.
   */
  #updateFoldStateMap(newRegions) {
    const newFoldedRegions = new Map();
    for (const region of newRegions) {
        const key = region.startLine;
        const existing = this.#foldedRegions.get(key);

        // Preserve the collapse state if the region already existed, otherwise default to false (expanded)
        newFoldedRegions.set(key, {
            endLine: region.endLine,
            isCollapsed: existing ? existing.isCollapsed : false
        });
    }
    this.#foldedRegions = newFoldedRegions;
  }

  /**
   * Renders the fold markers (+/- icons) in the line number gutter.
   */
  #renderFoldGutter() {
    if (!this.foldsEl) return;

    const totalLines = this.editable.children.length;
    this.foldsEl.innerHTML = '';

    const fragment = document.createDocumentFragment();

    for (let line = 1; line <= totalLines; line++) {
        const lineContainer = document.createElement('div');
        lineContainer.className = 'editor-fold-line';

        const region = this.#foldedRegions.get(line);

        if (region) {
            const marker = document.createElement('div');
            marker.className = 'fold-marker';
            marker.dataset.line = line;
            marker.dataset.state = region.isCollapsed ? 'collapsed' : 'expanded';
            marker.textContent = region.isCollapsed ? '+' : '−';

            lineContainer.appendChild(marker);
            lineContainer.classList.add('foldable-start');
        }

        fragment.appendChild(lineContainer);
    }

    this.foldsEl.appendChild(fragment);
  }

  #applyFoldState() {
    // 1. Ensure all editor lines are visible initially
    Array.from(this.editable.children).forEach(lineEl => lineEl.classList.remove('collapsed'));

    // 2. Iterate over collapsed regions and hide lines
    for (const [startLine, region] of this.#foldedRegions.entries()) {
        if (region.isCollapsed) {
            // Hide lines starting from the line *after* the opening tag (index startLine)
            // up to the line before the closing tag (index region.endLine).
            for (let i = startLine; i <= region.endLine; i++) {
                const lineEl = this.editable.children[i];
                if (lineEl) {
                    lineEl.classList.add('collapsed');
                }
            }
        }
    }
  }

  #toggleFold(startLine) {
    const region = this.#foldedRegions.get(startLine);
    if (!region) return;

    region.isCollapsed = !region.isCollapsed;
    this.#foldedRegions.set(startLine, region);

    this.#applyFoldState();

    // Update the marker icon in the folds gutter
    const markerEl = this.foldsEl.querySelector(`.fold-marker[data-line="${startLine}"]`);
    if (markerEl) {
        markerEl.dataset.state = region.isCollapsed ? 'collapsed' : 'expanded';
        markerEl.textContent = region.isCollapsed ? '+' : '−';
    }
  }

  #handleGutterClick(event) {
    // Event delegation on this.foldsEl
    const marker = event.target.closest('.fold-marker');
    if (marker) {
        const startLine = parseInt(marker.dataset.line, 10);
        this.#toggleFold(startLine);
    }
  }

  /**
   * Runs the specialized LanguageEngine method on the *full* document
   * to update the folding structure using the fast structural parser.
   * @public
   */
  #updateStructuralMetadata() {
    const fullValue = this.value;
    const engine = new LanguageEngine(this.fileType, fullValue);

    // Run the NEW specialized structural parser method
    // This is much faster than running the full engine.run()
    const foldRegions = engine.runStructuralFoldParser(fullValue); // <-- KEY CHANGE

    // We don't need to store a full AST here, only the folding data
    this.fullAST = null;
    this.errors = []; // Clear errors for simplicity, only relevant for full AST
    this.foldRegions = foldRegions;

    // Update Fold State Map
    this.#updateFoldStateMap(foldRegions); // Keeps track of which regions are collapsed

    // Render Markers
    this.#renderFoldGutter(); // Draws the '+' or '-' icons in the gutter

    // Re-apply any existing collapse state
    this.#applyFoldState(); // Hides/shows the lines based on the current state

    // Dispatch an event for the editor UI to draw fold markers/gutter icons
    this.editable.dispatchEvent(new CustomEvent("playground:editor:folds-updated", {
        bubbles: true,
        detail: { foldRegions }
    }));

    console.log("Fold Regions Updated:", this.foldRegions);
    // console.log("Full AST Updated: [SKIPPED FOR PERFORMANCE]"); // No longer necessary
  }

  // NEW: Debounce function for structural updates
  #scheduleStructuralUpdate() {
    clearTimeout(this.#structuralFrameId); // Clear any existing timeout
    this.#structuralFrameId = setTimeout(() => {
        this.#structuralFrameId = null;
        this.#updateStructuralMetadata();
    }, 500); // 500ms debounce
  }

  /*
   * Attaches all primary and internal event listeners to the editable area.
   */
  #bindEvents() {
    // Primary user input events
    this.editable.addEventListener("input", () => {
      this.#scheduleRefresh();
      this.#scheduleCursorUpdate();
      this.#scheduleStructuralUpdate();
    });
    this.editable.addEventListener("paste", e => this.#handlePaste(e));

    // Keydown for structural changes (Enter) or cursor movement requiring updates
    this.editable.addEventListener("keydown", (event) => {
      // Optimizing cursor updates for navigation keys
      const cursorKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"];
      if (cursorKeys.includes(event.key)) {
        // Cancel any pending refresh as cursor update is prioritized
        cancelAnimationFrame(this.#pendingAnimationFrameId);
        this.#pendingAnimationFrameId = null;

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

      // The last known cursor position { line, col }. Used for state persistence.
      this.cursor = { line: line, col: col };
    });

    // Listen for the global toggle event dispatched by Core.
    this.#root.addEventListener("playground:editor:toggle-line-numbers", (e) => {
      this.#setLineNumberVisibility(e.detail.visible);
    });

    if (this.foldsEl) {
      this.foldsEl.addEventListener("click", this.#handleGutterClick.bind(this));
    }
  }

  /*
   * Handles the 'Enter' key press, preventing the default contenteditable behavior,
   * manually inserting a newline, and ensuring the caret and UI are correctly updated.
   */
  #handleEnterKey(event) {
    event.preventDefault();

    const sel = window.getSelection();
    const beforeMeta = getCursorMetadata(this.editable);
    if (!sel.rangeCount || !beforeMeta) return;

    let fullValue = this.value;
    let newCaretPos = beforeMeta.caretPos;

    // Handle selection deletion
    if (beforeMeta.selectionStart !== beforeMeta.selectionEnd) {
      fullValue = fullValue.slice(0, beforeMeta.selectionStart) + fullValue.slice(beforeMeta.selectionEnd);
      newCaretPos = beforeMeta.selectionStart;
    }

    // Insert the newline
    const newValue = fullValue.slice(0, newCaretPos) + "\n" + fullValue.slice(newCaretPos);

    // Update the value (triggers updateValue, which calls #scheduleCursorUpdate)
    this.updateValue(newValue);

    // Manually set the caret to the new line start (newCaretPos + 1)
    const finalCaretPos = newCaretPos + 1;
    this.#restoreCaretAt(finalCaretPos);

    // Explicitly run necessary UI updates
    this.#updateLineNumbers(newValue.split("\n").length); // Pass count to avoid re-calculating value
    this.#scheduleCursorUpdate(); // Re-schedule to capture the manually set caret
    this.#scheduleRefresh();
  }

  /*
   * Handles the 'Paste' event, preventing the default behavior and manually
   * inserting the text from the clipboard to ensure consistent formatting.
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

      // Calculate new value
      const before = fullValue.slice(0, selectionStart);
      const after = fullValue.slice(selectionEnd);
      const newValue = before + text + after;

      // Calculate new caret position
      const newCaretPos = selectionStart + text.length;

      // Update the value
      this.updateValue(newValue);

      // Manually set the caret (overwrites updateValue's attempt)
      this.#restoreCaretAt(newCaretPos);

      // Re-schedule to capture the manually set caret
      this.#scheduleCursorUpdate();
    };

    pasteFromClipboard();
  }

  /*
   * Restores the caret at a given character offset within the editor's content.
   * Uses findNodeOffset to map the global character index to a specific DOM node and offset.
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

  /*
   * Debounces calls to #refresh using requestAnimationFrame to consolidate DOM updates.
   */
  #scheduleRefresh() {
    if (this.#pendingAnimationFrameId === null) {
      this.#pendingAnimationFrameId = requestAnimationFrame(() => {
        this.#pendingAnimationFrameId = null;
        this.#refresh();
      });
    }
  }

  /*
   * Queues a microtask to read the current cursor metadata and dispatch an update event.
   * This is used to capture the final position after DOM manipulation or user input.
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

  /*
   * The primary UI update function. Updates line numbers, highlights the active line,
   * and dispatches a value updated event.
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

  /*
   * Controls line number DOM presence.
   * This is the single source of truth for generating or removing lines.
   */
  #setLineNumberVisibility(visible) {
    if (!this.linesEl) return;

    if (visible) {
      // Lines are visible, so update/generate them
      this.#updateLineNumbers();

      // If the lines were just generated AND we know the cursor position,
      // set the active line highlight immediately.
      if (this.cursor) {
        this.#setActiveLine(this.cursor.line);
      }
    } else {
      // Lines are not visible, so remove DOM elements
      this.linesEl.innerHTML = "";
    }
  }

  /*
   * Updates line numbers based on the current value or an optional count.
   */
  #updateLineNumbers(count) {
    if (!this.linesEl) return;

    // Check the data attribute directly or check if the container is currently visible.
    const isVisible = this.#root.getAttribute("data-line-numbers") === "on";

    if (!isVisible) {
      // If not visible, ensure the DOM is empty and stop.
      this.linesEl.innerHTML = "";
      return;
    }

    count = count ?? this.value.split("\n").length;
    const currentLineCount = this.linesEl.children.length;

    if (count !== currentLineCount) {
      // Generate the line numbers only when necessary
      this.linesEl.innerHTML = Array.from({ length: count }, (_, i) =>
        `<div class="editor-line">${i + 1}</div>`
      ).join("");
    }
  }

  /*
   * Highlights the specified line number and its corresponding content block.
   */
  #setActiveLine(line) {
    this.#clearHighlightsFromEditable();
    this.#clearHighlightsFromGutter();

    const block = this.editable.children[line - 1];
    if (!block) return;

    block.classList.add("editor-active-line");

    const lineEl = this.linesEl?.children[line - 1];
    if (lineEl) lineEl.classList.add("editor-active-line");
  }

  /*
   * Removes the active line highlight from all editable.
   */
  #clearHighlightsFromEditable() {
    this.codeEditor?.querySelectorAll(".editor-active-line").forEach(el =>
      el.classList.remove("editor-active-line")
    );
  }

  /*
   * Removes the active line highlight from all gutter.
   */
  #clearHighlightsFromGutter() {
    this.linesEl?.querySelectorAll(".editor-active-line").forEach(el =>
      el.classList.remove("editor-active-line")
    );
  }

  /*
   * Converts a string of code into the HTML structure used by the editor
   * (one <div class="editor-line"> per line) and applies formatting.
   */
  #toHTML(str) {
    return str
      .split("\n")
      .map(line => `<div class="editor-line">${this.#applyFormatting(line)}</div>`)
      .join("");
  }

  /*
   * Applies HTML escaping and formats spaces/tabs with styled span elements.
   */
  #applyFormatting(line) {
    // NOTE: This runs the full LanguageEngine pipeline line-by-line for highlighting,
    // which is independent of the full-document folding process.
    const engine = new LanguageEngine(this.fileType, line);

    // Only run the highlighting part of the pipeline here
    const { highlighted } = engine.run(line);
    return highlighted;
  }

  /*
   * Updates the HTML of a single line element to re-apply formatting.
   * Used within the Mutation Observer to re-format the specific line being edited.
   */
  #updateSingleLineDOM(lineEl) {
    if (!lineEl) return;

    const plainText = lineEl.textContent || "";
    // Get text content, strip newlines (as this is a single line update), and re-format.
    const newHTML = this.#applyFormatting(plainText.replace(/\n/g, ""));

    lineEl.innerHTML = newHTML;
  }

  /*
   * Creates and initializes a MutationObserver to watch for character data changes
   * (user typing) within the editable area to dynamically re-apply formatting on the
   * specific line being edited without losing the cursor.
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

        const lineEl = targetNode?.closest(".editor-line");
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
