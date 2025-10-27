export class Controls {
  constructor(container, actions = {}) {
    this.container = container;
    this.actions = actions;

    this.#bindButtons();
    this.#bindCheckboxes();
  }

  #bindButtons() {
    const buttons = this.container.querySelectorAll("button[data-action], [data-action]:not(input)");

    buttons.forEach(btn => {
      const actionName = btn.dataset.action;

      if (typeof this.actions[actionName] === "function") {
        btn.addEventListener("click", () => this.actions[actionName]());
      }
    });
  }

  #bindCheckboxes() {
    this.container.addEventListener("change", e => {
      const cb = e.target.closest("input[type=checkbox][data-action]");
      if (!cb) return;

      const actionName = cb.dataset.action;
      const checked = cb.checked;

      if (typeof this.actions[actionName] === "function") {
        this.actions[actionName](checked);
      }

      const pen = cb.closest(".pen");
      if (pen) {
        pen.setAttribute(`data-${actionName}`, typeof checked === "boolean" ? String(checked) : checked);
      }
    });
  }
}