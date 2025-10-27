import { getCursorMetadata, findNodeOffset } from "./utils/cursor-metadata";
import { pluralize } from "../../utils/string";

export class CaretMetadata {
  constructor(container, editorTabs) {
    this.container = container;
    this.editorTabs = editorTabs;

    // Store per editor: { editorName: { line, col, selection, pos, direction } }
    this.editorStates = {};

    // Map of editorName -> metadata element
    this.metadataMap = new Map();

    // Active RAF ID for throttled updates
    this.frameId = null;

    this.#bindEditors();
    this.#bindTabSwitch();
  }

  /**
   * RequestAnimationFrame-based throttled update scheduler
   */
  #scheduleUpdate(editorName, editor) {
    cancelAnimationFrame(this.frameId);
    this.frameId = requestAnimationFrame(() => {
      requestAnimationFrame(() => this.#update(editorName, editor));
    });
  }

  /**
   * Bind caret and selection listeners to all editors
   */
  #bindEditors() {
    const editors = this.container.querySelectorAll(".editor-panel [contenteditable='true']");

    editors.forEach((editor) => {
      const panel = editor.closest("[data-editor-panel]");
      const editorName = panel.dataset.editorPanel;

      const metaEl = panel.querySelector(".caret-metadata");
      if (metaEl) this.metadataMap.set(editorName, metaEl);

      const update = () => this.#scheduleUpdate(editorName, editor);

      // Input and general caret events
      ["input", "click", "mouseup", "keyup"].forEach((e) =>
        editor.addEventListener(e, update)
      );

      // Live update while dragging mouse
      editor.addEventListener("mousemove", (e) => {
        if (e.buttons === 1) update();
      });

      // Run after paste
      editor.addEventListener("paste", () => queueMicrotask(update));

      // Keyboard navigation and selection
      editor.addEventListener("keydown", (event) => {
        const keys = [
          "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
          "Home", "End", "PageUp", "PageDown"
        ];
        if (event.shiftKey && keys.includes(event.key)) update();
      });

      // Programmatic or other selection updates
      editor.addEventListener("select", update);

      // Observe global selection changes to catch rapid caret moves
      document.addEventListener("selectionchange", () => {
        const sel = window.getSelection();
        if (sel.anchorNode && editor.contains(sel.anchorNode)) update();
      });
    });
  }

  /**
   * Compute and update caret metadata (line, column, selection)
   */
  #update(editorName, editable) {
    const metaEl = this.metadataMap.get(editorName);
    if (!metaEl) return; // No metadata element for this tab

    const metadata = getCursorMetadata(editable);
    if (!metadata) return;

    const {
      line,
      col,
      selectionLength,
      selectionStart,
      selectionEnd,
      selectionDirection,
      caretPos,
      full,
    } = metadata;

    // Update metadata display
    const parts = [`<span class="caret-position">Ln ${line}, Col ${col}</span>`];
    if (selectionLength > 0) {
      parts.push(`
        <span class="middle-dot-divider" aria-hidden="true">•</span>
        <span class="caret-selection">${pluralize(selectionLength, "character")} selected</span>
      `);
    }
    metaEl.innerHTML = parts.join("");

    // Persist current editor state
    this.editorStates[editorName] = {
      line,
      col,
      full,
      selection: selectionLength,
      pos: caretPos,
      direction: selectionDirection,
      start: selectionStart,
      end: selectionEnd,
    };

    editable.dispatchEvent(new CustomEvent("editor:caret-updated", {
      bubbles: true,
      detail: { line: metadata.line, col: metadata.col }
    }));
  }

  /**
   * Handle caret restoration and metadata sync when switching tabs
   */
  #bindTabSwitch() {
    const setCaret = (editable, state) => {
      const selection = window.getSelection();
      const range = document.createRange();

      const safeCollapse = () => {
        const firstLine = editable.querySelector(".cp-line");
        if (!firstLine) {
          const text = document.createTextNode("");
          editable.appendChild(text);
          range.setStart(text, 0);
        } else if (firstLine.firstChild) {
          range.setStart(firstLine.firstChild, 0);
        } else {
          const br = document.createElement("br");
          firstLine.appendChild(br);
          range.setStart(firstLine, 0);
        }
        range.collapse(true);
      };

      if (state && Number.isFinite(state.start) && Number.isFinite(state.end)) {
        try {
          const start = findNodeOffset(editable, state.start);
          const end = findNodeOffset(editable, state.end);
          range.setStart(start.node, start.offset);
          range.setEnd(end.node, end.offset);
        } catch {
          safeCollapse();
        }
      } else {
        safeCollapse(); // Default: line 1 col 1
      }

      selection.removeAllRanges();
      selection.addRange(range);

      // Immediately trigger metadata recalculation
      editable.dispatchEvent(new Event("selectionchange", { bubbles: true }));
    };

    this.editorTabs.onSwitch = (editorName) => {
      const editable = this.container.querySelector(
        `[data-editor-panel="${editorName}"] [contenteditable="true"]`
      );
      if (!editable) return;

      // Focus and restore caret instantly
      editable.focus();
      setCaret(editable, this.editorStates[editorName]);

      // Ensure metadata reflects immediately after caret restore
      queueMicrotask(() => this.#update(editorName, editable));
    };

    // Initialize first active tab instantly
    const activeTab = this.editorTabs.activeTab;
    if (activeTab) {
      const editorName = activeTab.dataset.editor;
      const editable = this.container.querySelector(
        `[data-editor-panel="${editorName}"] [contenteditable="true"]`
      );
      if (editable) {
        editable.focus();
        setCaret(editable, null); // Line 1 col 1
        queueMicrotask(() => this.#update(editorName, editable));
      }
    }
  }
}
