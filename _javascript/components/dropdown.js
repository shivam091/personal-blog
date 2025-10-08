import * as PopperUtils from "../utils/popper";

export default class Dropdown {
  static selector = "[data-dropdown]";
  static button = ".dropdown-toggle";
  static menu = ".dropdown-menu";

  static get elements() {
    return document.querySelectorAll(this.selector);
  }

  static #toggleVisibility(button, menu, show) {
    button.classList.toggle("show", show);
    menu.classList.toggle("show", show);
    button.setAttribute("aria-expanded", String(show));

    if (show) {
      PopperUtils.createInstance(button, menu, {
        placement: button.dataset.dropdownPosition || "bottom",
      });
    } else {
      PopperUtils.destroyInstance(menu);
    }
  }

  static closeAll() {
    this.elements.forEach((dropdown) => {
      const button = dropdown.querySelector(this.button);
      const menu = dropdown.querySelector(this.menu);
      if (button && menu) this.#toggleVisibility(button, menu, false);
    });
  }

  static toggle(button, menu) {
    const open = menu.classList.contains("show");
    this.closeAll();
    this.#toggleVisibility(button, menu, !open);
  }

  static #bind(dropdown) {
    const button = dropdown.querySelector(this.button);
    const menu = dropdown.querySelector(this.menu);
    if (!button || !menu) return;

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggle(button, menu);
    });

    window.addEventListener("resize", () => {
      if (menu.classList.contains("show")) PopperUtils.updateInstance(menu);
    });
  }

  static initialize() {
    this.elements.forEach((dropdown) => this.#bind(dropdown));

    document.addEventListener("click", (e) => {
      if (!e.target.closest(this.selector)) this.closeAll();
    });

    document.addEventListener("keydown", ({ key }) => {
      if (key === "Escape") this.closeAll();
    });
  }
}
