import { getCursorMetadata, findNodeOffset } from "./utils/cursor-metadata";
import { pluralize } from "../../utils/string";

/*
 * Manages the display and persistence of the caret (cursor) and selection
 * metadata across multiple editors in a playground environment.
 */
export class CaretMetadata {
  // Stores the last known caret state for each editor.
  editorStates = {};

  // Maps editor name (data-editor-panel) to its corresponding metadata display element.
  metadataMap = new Map();

  // Active requestAnimationFrame ID for throttled updates.
  frameId = null;

  constructor(container, editorTabs) {
    this.container = container;
    this.editorTabs = editorTabs;

    this.#bindEditors();
    this.#bindTabSwitch();
  }

  /*
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

  /*
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
      ["input", "click", "mouseup", "keyup"].forEach((event) =>
        editor.addEventListener(event, update)
      );

      // Live update while dragging mouse
      editor.addEventListener("mousemove", (event) => {
        if (event.buttons === 1) update();
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
        const selection = window.getSelection();

        // Only update if the selection change occurred inside this editor
        if (selection.anchorNode && editor.contains(selection.anchorNode)) update();
      });
    });
  }

  /*
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

  /*
   * Binds the tab switching mechanism (`this.editorTabs.onSwitch`) to restore the
   * previously saved caret/selection state of the newly active editor, and initializes
   * all editors' caret positions on load.
   */
  #bindTabSwitch() {
    // Helper function to restore the caret or selection using saved state.
    // shouldFocus parameter if for preventing focus stealing during initialization.
    const setCaret = (editable, state, shouldFocus = true) => {
      const selection = window.getSelection();
      const range = document.createRange();

      // Safely collapses the range to the start of the first line (Line 1, Col 1).
      const safeCollapse = () => {
        const firstLine = editable.querySelector(".editor-line");

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

      // Only focus if explicitly allowed (for tab switch)
      if (shouldFocus) {
        editable.focus();
      }

      // Force update after physically moving caret
      editable.dispatchEvent(new Event("selectionchange", { bubbles: true }));
    };

    // Attach handler to the tab switch event
    this.editorTabs.onSwitch = (editorName) => {
      const editable = this.container.querySelector(
        `[data-editor-panel="${editorName}"] [contenteditable="true"]`
      );
      if (!editable) return;

      // Focus and restore caret instantly (shouldFocus defaults to true)
      editable.focus();
      setCaret(editable, this.editorStates[editorName]);
      queueMicrotask(() => this.#update(editorName, editable));
    };

    // Initialize ALL editors instantly on load to set Line 1, Col 1 selection.
    const editors = this.container.querySelectorAll(".editor-panel [contenteditable='true']");
    const activeEditorName = this.editorTabs.activeTab?.dataset.editor;

    editors.forEach((editable) => {
      const panel = editable.closest("[data-editor-panel]");
      const editorName = panel.dataset.editorPanel;
      const metaEl = this.metadataMap.get(editorName);

      if (editable && metaEl) {
        // Physically set the caret to Ln 1, Col 1 using safeCollapse.
        // Passing null state and false for shouldFocus.
        setCaret(editable, null, false);

        // Initialize the visual display.
        metaEl.innerHTML = `<span class="caret-position">Ln 1, Col 1</span>`;

        // Initialize the internal state object.
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

        // Ensure the actual active tab retains its focus (if applicable).
        // We check against the editorTabs activeTab property for correctness.
        if (activeEditorName && editorName === activeEditorName) {
          editable.focus();
        }
      }
    });
  }
}
