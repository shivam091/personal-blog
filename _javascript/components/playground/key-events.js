import { copyCurrentLine, selectCurrentLine } from "./utils/editor-shortcuts";

/*
 * Manages global and editor-specific keyboard shortcuts within the
 * playground environment. It uses event delegation on the root container.
 */
export class KeyEvents {
  constructor(container, core, exporter, consolePanel) {
    this.container = container;
    this.core = core;
    this.exporter = exporter;
    this.consolePanel = consolePanel;

    // Attach handler to the main container, relying on delegation
    this.container.addEventListener("keydown", this.#handleKeydown.bind(this));
  }

  /*
   * Single event handler for all keyboard shortcuts. Checks for target focus
   * to determine if global or editor-specific shortcuts should apply.
   */
  #handleKeydown(event) {
    const isCtrlOrCmd = event.ctrlKey || event.metaKey; // Command key on Mac, Control on others
    const isShift = event.shiftKey;
    const key = event.key.toLowerCase();
    const target = event.target;
    const isEditable = target.closest("[contenteditable='true']");

    // Global Shortcuts (Non-editor focus)
    if (!isEditable) {
      if (isCtrlOrCmd && key === "enter") {
        // Run Code: Ctrl/Cmd + Enter
        this.core.requestRun();
      } else if (isCtrlOrCmd && key === "s") {
        // Save/Export: Ctrl/Cmd + S
        event.preventDefault();
        this.exporter.toHTMLDownload();
      } else if (isCtrlOrCmd && key === "l") {
        // Clear Console: Ctrl/Cmd + L
        event.preventDefault();
        this.consolePanel.clear();
      }
      return; // Stop processing if a global shortcut was handled and the editor is not active
    }

    // Editor Shortcuts (Active in [contenteditable])
    if (isCtrlOrCmd && isShift && key === "f") {
      // Prettify: Ctrl/Cmd + Shift + F
      event.preventDefault();
      this.core?.prettifyCode?.();
    } else if (isCtrlOrCmd && key === "l") {
      // Select current line: Ctrl/Cmd + L
      event.preventDefault();
      selectCurrentLine();
    } else if (isCtrlOrCmd && isShift && key === "c") {
      // Copy current line: Ctrl/Cmd + Shift + C
      event.preventDefault();
      copyCurrentLine();
    }
  }
}
