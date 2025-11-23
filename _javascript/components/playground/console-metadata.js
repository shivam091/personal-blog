/*
 * Responsible for tracking and displaying the running counts of console messages
 * organized by log level (log, info, debug, warn, error). It listens for events emitted
 * by the ConsolePanel to update its internal state and the corresponding UI elements.
 */
export class ConsoleMetadata {
  // Holds initial counts
  counts = { log: 0, info: 0, debug: 0, warn: 0, error: 0 };

  constructor(container, consolePanel, previewTabs) {
    this.container = container;
    this.consolePanel = consolePanel;
    this.previewTabs = previewTabs;

    // Map of log level to the specific DOM element responsible for displaying that count
    this.countEls = {
      log: container.querySelector(".console-count-log .count"),
      info: container.querySelector(".console-count-info .count"),
      debug: container.querySelector(".console-count-debug .count"),
      warn: container.querySelector(".console-count-warn .count"),
      error: container.querySelector(".console-count-error .count"),
    };

    this.#bindEvents();
  }

  /*
   * Binds event listeners to the ConsolePanel instance to update counts
   * when a message is appended or when the console is cleared.
   */
  #bindEvents() {
    // Increment count when a new message is appended
    this.consolePanel.addEventListener("playground:console-panel:append", (event) => {
      const { level } = event.detail;
      const countEl = this.countEls[level];

      if (countEl) {
        this.counts[level]++;
        countEl.textContent = this.counts[level];
      }
    });

    // Reset all counts when the console is cleared
    this.consolePanel.addEventListener("playground:console-panel:clear", () => {
      this.#resetCounts();
    });
  }

  /*
   * Resets the internal counts and updates the display elements to zero.
   */
  #resetCounts() {
    for (const [level, countEl] of Object.entries(this.countEls)) {
      if (countEl) {
        this.counts[level] = 0;
        countEl.textContent = 0;
      }
    }
  }
}
