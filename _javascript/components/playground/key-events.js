export class KeyEvents {
  constructor(container, core, exporter, consolePanel) {
    this.container = container;
    this.core = core;
    this.exporter = exporter;
    this.consolePanel = consolePanel;

    this.#bindContainerShortcuts();
    this.#bindEditorShortcuts();
  }

  // Bind shortcuts that should work from anywhere in the playground
  #bindContainerShortcuts() {
    this.container.addEventListener("keydown", event => {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      // Refresh output: Ctrl+Enter
      if (isCtrlOrCmd && event.key === "Enter") {
        this.core.requestRun();
      }

      // Export: Ctrl+S
      if (isCtrlOrCmd && event.key.toLowerCase() === "s") {
        event.preventDefault();

        this.exporter.toHTMLDownload();
      }

      // Clear console: Ctrl+L
      if (isCtrlOrCmd && event.key.toLowerCase() === "l") {
        event.preventDefault();

        this.consolePanel.clear();
      }
    });
  }

  // Bind shortcuts that only apply while typing in a contenteditable
  #bindEditorShortcuts() {
    const panels = this.container.querySelectorAll(".editor-panel[data-editor-panel]");

    panels.forEach(panel => {
      const editable = panel.querySelector("[contenteditable]");
      if (!editable) return;

      editable.addEventListener("keydown", event => {
        const isCtrlOrCmd = event.ctrlKey || event.metaKey;
        const isShift = event.shiftKey;

        // Prettify: Ctrl+Shift+F
        if (isCtrlOrCmd && isShift && event.key.toLowerCase() === "f") {
          event.preventDefault();

          this.core?.prettifyCode?.();
        }

        // Select current line: Ctrl+L
        if (isCtrlOrCmd && event.key.toLowerCase() === "l") {
          event.preventDefault();
          const sel = window.getSelection();
          const range = sel.getRangeAt(0);
          let node = range.startContainer;

          // If it's a text node, go to its parent
          if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;

          const line = node?.closest(".cp-line");

          if (!line) return;
          const newRange = document.createRange();
          newRange.selectNodeContents(line);
          sel.removeAllRanges();
          sel.addRange(newRange);
          return;
        }

        // Copy current line: Ctrl+Shift+C
        if (isCtrlOrCmd && isShift && event.key.toLowerCase() === "c") {
          event.preventDefault();
          const sel = window.getSelection();
          const range = sel.getRangeAt(0);
          let node = range.startContainer;

          // If it's a text node, go to its parent
          if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;

          const line = node?.closest(".cp-line");
          if (!line) return;
          navigator.clipboard.writeText(line.textContent + "\n");
          return;
        }
      });
    });
  }
}