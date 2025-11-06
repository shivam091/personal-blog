import { createElement } from "../../utils/dom";

/*
 * Manages the display and logging of messages within a dedicated console area.
 * It handles messages received from the preview iframe and provides methods to clear
 * and append logs.
 */
export class ConsolePanel extends EventTarget {
  constructor(el) {
    super();
    this.el = el;
  }

  /*
   * Clears all messages currently displayed in the console panel.
   * Dispatches a `playground:console-panel:clear` custom event.
   */
  clear() {
    if (!this.el) return;

    this.el.textContent = "";

    // Emit clear event
    this.dispatchEvent(new CustomEvent("playground:console-panel:clear"));
  }

  /*
   * Creates a new log line, formats it with the level, appends it to the console panel,
   * and automatically scrolls to the bottom.
   * Dispatches a `playground:console-panel:append` custom event.
   */
  append(level, args) {
    if (!this.el) return;

    const consoleLine = createElement("div", {
      className: `console-line console-line-${level}`,
      text: `[${level}] ${Array.isArray(args) ? args.join(" ") : args}`
    });

    this.el.appendChild(consoleLine);
    this.el.scrollTop = this.el.scrollHeight;

    // Emit append event
    this.dispatchEvent(new CustomEvent("playground:console-panel:append", {
      detail: { level, args }
    }));
  }
}
