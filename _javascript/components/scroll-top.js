export default class ScrollTop {
  static scrollTopSelector = "[data-scroll-top]";
  static isVisible = false;
  static ticking = false;

  static get scrollTopElement() {
    return document.querySelector(this.scrollTopSelector);
  }

  static #getScrollThreshold() {
    const el = this.scrollTopElement;

    return parseInt(el?.getAttribute("data-scroll-threshold") || "250", 10);
  }

  static #handleClick(event) {
    event.preventDefault();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  static #updateVisibility() {
    const el = this.scrollTopElement;
    if (!el) return;

    const threshold = this.#getScrollThreshold();
    const shouldShow = window.scrollY > threshold;

    if (shouldShow && !this.isVisible) {
      el.setAttribute("data-state", "visible");

      this.isVisible = true;
    } else if (!shouldShow && this.isVisible) {
      el.setAttribute("data-state", "hidden");

      this.isVisible = false;
    }
  }

  static initialize() {
    const el = this.scrollTopElement;
    if (!el) return;

    el.addEventListener("click", (event) => this.#handleClick(event));

    // Throttle or debounce to avoid over-triggering updateVisibility()
    window.addEventListener("scroll", () => {
      if (!this.ticking) {
        window.requestAnimationFrame(() => {
          this.#updateVisibility();
          this.ticking = false;
        });
        this.ticking = true;
      }
    }, { passive: true });

    window.addEventListener("load", this.#updateVisibility);
    this.#updateVisibility();
  }
}
