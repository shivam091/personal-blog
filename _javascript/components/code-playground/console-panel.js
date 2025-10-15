export default class ConsolePanel {
  constructor(el) {
    this.el = el;

    this._bindMessages();
  }

  clear() {
    if (this.el) {
      this.el.textContent = "";
    }
  }

  append(level, args) {
    if (!this.el) return;

    const div = document.createElement("div");
    div.className = `console-line console-${level}`;
    div.textContent = `[${level}] ${Array.isArray(args) ? args.join(" ") : args}`;

    this.el.appendChild(div);
    this.el.scrollTop = this.el.scrollHeight;
  }

  _bindMessages() {
    window.addEventListener("message", (e) => {
      if (e.data?.type === "cp-console") {
        this.append(e.data.level, e.data.msg);
      }
    });
  }
}
