export class ConsolePanel extends EventTarget {
  constructor(el) {
    super();
    this.el = el;

    this.#bindMessages();
  }

  clear() {
    if (this.el) {
      this.el.textContent = "";
    }
    this.dispatchEvent(new CustomEvent("clear"));
  }

  append(level, args) {
    if (!this.el) return;

    const div = document.createElement("div");
    div.className = `console-line console-${level}`;
    div.textContent = `[${level}] ${Array.isArray(args) ? args.join(" ") : args}`;

    this.el.appendChild(div);
    this.el.scrollTop = this.el.scrollHeight;

    // Emit append event
    this.dispatchEvent(new CustomEvent("append", { detail: { level, args } }));
  }

  #bindMessages() {
    window.addEventListener("message", (e) => {
      const data = e.data;

      // From Preview's message channel
      if (data?.type === "cp-console") {
        this.append(data.level, data.msg);
      }
      // From iframe forwarded console/error events
      if (data?.type === "iframe-error") {
        this.append(data.level, data.args);
      }
    });
  }
}
