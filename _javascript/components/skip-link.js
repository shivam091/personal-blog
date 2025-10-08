export default class SkipLink {
  static skipLinkSelector = "[data-skip-link]";
  static skipToAttribute = "data-skip-to";

  static get skipLinkElement() {
    return document.querySelector(this.skipLinkSelector);
  }

  static #focusAndScroll(target) {
    // Make sure the target is focusable
    if (!target.hasAttribute("tabindex")) {
      target.setAttribute("tabindex", "-1");
    }

    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  static #bindEvents(skipLink, targetElement) {
    skipLink.addEventListener("click", (event) => {
      event.preventDefault();
      this.#focusAndScroll(targetElement);
    });
  }

  static initialize() {
    const skipLink = this.skipLinkElement;
    if (!skipLink) return;

    const targetSelector = skipLink.getAttribute(this.skipToAttribute);
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) return;

    this.#bindEvents(skipLink, targetElement);
  }
}
