export class ConsoleMetadata {
  constructor(container, consolePanel, previewTabs) {
    this.container = container;
    this.consolePanel = consolePanel;
    this.previewTabs = previewTabs;

    this.countEls = {
      log: container.querySelector(".console-count-log .count"),
      info: container.querySelector(".console-count-info .count"),
      debug: container.querySelector(".console-count-debug .count"),
      warn: container.querySelector(".console-count-warn .count"),
      error: container.querySelector(".console-count-error .count"),
    };

    this.counts = { log: 0, info: 0, debug: 0, warn: 0, error: 0 };

    this.#bindButtons();
    this.#bindEvents();
  }

  #bindButtons() {
    Object.keys(this.countEls).forEach((level) => {
      const btn = this.container.querySelector(`.console-count-${level}`);
      btn.addEventListener("click", () => this.previewTabs.switch("console"));
    });
  }

  #bindEvents() {
    this.consolePanel.addEventListener("append", (e) => {
      const { level } = e.detail;
      if (this.counts[level] !== undefined) {
        this.counts[level]++;
        this.countEls[level].textContent = this.counts[level];
      }
    });

    this.consolePanel.addEventListener("clear", () => {
      this.#resetCounts();
    });
  }

  #resetCounts() {
    Object.keys(this.counts).forEach((level) => {
      this.counts[level] = 0;
      this.countEls[level].textContent = 0;
    });
  }
}
