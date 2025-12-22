import { THEME_KEY, DEFAULT_COLOR_MODE } from "../constants/constants";

export default class ThemeSwitcher {
  static initialize() {
    if (!this.#container) return;

    const savedTheme = localStorage.getItem(THEME_KEY) || DEFAULT_COLOR_MODE;
    this.#apply(savedTheme);

    this.#setupDropdownListeners();
  }

  static get #container() {
    return document.querySelector("[data-theme-switcher]");
  }

  static getCurrentTheme() {
    return document.documentElement.dataset.theme || DEFAULT_COLOR_MODE;
  }

  static get #dropdownItems() {
    return this.#container?.querySelectorAll("[data-theme-switcher-list-items]") || [];
  }

  static #getEffectiveTheme(savedTheme) {
    if (savedTheme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return savedTheme;
  }

  static #apply(theme) {
    const actualTheme = this.#getEffectiveTheme(theme);

    document.documentElement.setAttribute("data-theme", actualTheme);
    localStorage.setItem(THEME_KEY, theme);
    this.#updateDropdown(theme);

    window.dispatchEvent(
      new CustomEvent("app-theme-change", {
        detail: { theme: actualTheme }
      })
    );
  }

  static #updateDropdown(selectedTheme) {
    this.#dropdownItems.forEach((item) => {
      const isChecked = item.dataset.colorScheme === selectedTheme;

      item.classList.toggle("dropdown-item-selected", isChecked);
      item.setAttribute("aria-selected", isChecked);
    });
  }

  static #setupDropdownListeners() {
    this.#dropdownItems.forEach((item) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();
        this.#apply(item.dataset.colorScheme);
      });
    });

    // Respond to system theme changes
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      const savedTheme = localStorage.getItem(THEME_KEY) || DEFAULT_COLOR_MODE;
      if (savedTheme === "system") this.#apply("system");
    });
  }
}
