import { getCursorMetadata, findNodeOffset } from "./utils/cursor-metadata";
import { pluralize } from "../../utils/string";

/**
 * Manages the display and persistence of the caret (cursor) and selection
 * metadata across multiple editor tabs/panels in a playground environment.
 */
export class CaretMetadata {
  constructor(container, editorTabs) {
    this.container = container;
    this.editorTabs = editorTabs;

    this.editorStates = {};
    this.metadataMap = new Map();
    this.frameId = null;

    this.#bindEditors();
    this.#bindTabSwitch();
  }

  /**
   * Schedules a throttled update for the given editor using requestAnimationFrame (RAF).
   * It uses a double RAF to ensure the DOM is stable before reading cursor position.
   */
  #scheduleUpdate(editorName, editor) {
    cancelAnimationFrame(this.frameId);

    this.frameId = requestAnimationFrame(() => {
      // Second RAF ensures the browser has had a chance to process the initial DOM change
      requestAnimationFrame(() => this.#update(editorName, editor));
    });
  }

  /**
   * Binds necessary event listeners (input, mouse, keyboard, selection, custom events)
   * to all contenteditable editor panels to trigger a metadata update on change.
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

      // Run after paste (queued to wait for paste to fully complete)
      editor.addEventListener("paste", () => queueMicrotask(update));

      // Keyboard navigation and selection
      editor.addEventListener("keydown", (event) => {
        const keys = [
          "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
          "Home", "End", "PageUp", "PageDown"
        ];

        // Update on selection change via Shift + Arrow keys
        if (event.shiftKey && keys.includes(event.key)) update();
      });

      // Programmatic or other selection updates
      editor.addEventListener("select", update);

      // Custom event from the Editor class when value is programmatically changed
      editor.addEventListener("playground:editor:value-changed", update);

      // Observe global selection changes to catch rapid caret moves
      document.addEventListener("selectionchange", () => {
        const sel = window.getSelection();

        // Only update if the selection change occurred inside this editor
        if (sel.anchorNode && editor.contains(sel.anchorNode)) update();
      });
    });
  }

  /**
   * Computes the current caret/selection metadata, updates the display element,
   * persists the state to `this.editorStates`, and dispatches a custom event.
   */
  #update(editorName, editable) {
    const metaEl = this.metadataMap.get(editorName);
    if (!metaEl) return;

    const metadata = getCursorMetadata(editable);

    // If the editor lost focus to another playground during load,
    // metadata might be null. In that case, we intentionally do nothing
    // to preserve the last known state (or the initialized default).
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

    // Dispatch event to allow other components (e.g., the Editor class) to react
    editable.dispatchEvent(new CustomEvent("playground:editor:caret-updated", {
      bubbles: true,
      detail: { line: metadata.line, col: metadata.col }
    }));
  }

  /**
   * Binds the tab switching mechanism (`this.editorTabs.onSwitch`) to restore the
   * previously saved caret/selection state of the newly active editor.
   */
  #bindTabSwitch() {
    // Helper function to restore the caret or selection using saved state.
    const setCaret = (editable, state) => {
      const selection = window.getSelection();
      const range = document.createRange();

      // Safely collapses the range to the start of the first line.
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
        safeCollapse(); // Default: line 1 col 1 if no state is found
      }

      selection.removeAllRanges();
      selection.addRange(range);

      // Force update after physically moving caret
      editable.dispatchEvent(new Event("selectionchange", { bubbles: true }));
    };

    // Attach handler to the tab switch event
    this.editorTabs.onSwitch = (editorName) => {
      const editable = this.container.querySelector(
        `[data-editor-panel="${editorName}"] [contenteditable="true"]`
      );
      if (!editable) return;

      // Focus and restore caret instantly
      editable.focus();
      setCaret(editable, this.editorStates[editorName]);
      queueMicrotask(() => this.#update(editorName, editable));
    };

    // Initialize first active tab instantly on load
    const activeTab = this.editorTabs.activeTab;

    if (activeTab) {
      const editorName = activeTab.dataset.editor;
      const panel = this.container.querySelector(`[data-editor-panel="${editorName}"]`);
      const editable = panel?.querySelector('[contenteditable="true"]');
      const metaEl = this.metadataMap.get(editorName);

      if (editable && metaEl) {
        // 1. Manually set the visual display to Default (Ln 1, Col 1).
        // We do NOT call setCaret() here, because that steals focus
        // from other playgrounds on the same page.
        metaEl.innerHTML = `<span class="caret-position">Ln 1, Col 1</span>`;

        // 2. Initialize the internal state object so it's ready for the first tab switch.
        this.editorStates[editorName] = {
          line: 1,
          col: 1,
          full: false,
          selection: 0,
          pos: 0,
          direction: "none",
          start: 0,
          end: 0,
        };
      }
    }
  }
}
