/**
 * @class ConsolePanel
 * @augments EventTarget
 * @description Manages the display and logging of messages within a dedicated console area.
 * It handles messages received from the preview iframe and provides methods to clear and append logs.
 */
export class ConsolePanel extends EventTarget {
  /** @public {HTMLElement} The DOM element that serves as the console container. */
  el;

  /**
   * @constructor
   * @param {HTMLElement} el The HTML element that will host the console log lines.
   */
  constructor(el) {
    super();
    this.el = el;

    this.#bindMessages();
  }

  /**
   * Clears all messages currently displayed in the console panel.
   * Dispatches a `playground:console-panel:clear` custom event.
   * @public
   */
  clear() {
    if (this.el) {
      this.el.textContent = "";
    }

    // Emit clear event
    this.dispatchEvent(new CustomEvent("playground:console-panel:clear"));
  }

  /**
   * Creates a new log line, formats it with the level, appends it to the console panel,
   * and automatically scrolls to the bottom.
   * Dispatches a `playground:console-panel:append` custom event.
   * @public
   * @param {string} level The log level (e.g., 'log', 'error', 'warn').
   * @param {Array|string} args The message content.
   */
  append(level, args) {
    if (!this.el) return;

    const div = document.createElement("div");
    div.className = `console-line console-line-${level}`;
    div.textContent = `[${level}] ${Array.isArray(args) ? args.join(" ") : args}`;

    this.el.appendChild(div);
    this.el.scrollTop = this.el.scrollHeight;

    // Emit append event
    this.dispatchEvent(new CustomEvent("playground:console-panel:append", {
      detail: { level, args }
    }));
  }

  /**
   * Binds the global window message listener to capture console logs
   * and errors transmitted from the preview iframe (which typically uses postMessage).
   * @private
   */
  #bindMessages() {
    window.addEventListener("message", (e) => {
      const data = e.data;

      // Capture messages intended for the console (e.g., from Preview's message channel)
      if (data?.type === "cp-console") {
        this.append(data.level, data.msg);
      }
      // Capture error events forwarded from the iframe
      if (data?.type === "iframe-error") {
        this.append(data.level, data.args);
      }
    });
  }
}