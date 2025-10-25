import LazyLoad from "vanilla-lazyload";

export default class LazyLoader {
  static initialize() {
    new LazyLoad({
      elements_selector: "[data-src]",
      class_loading: "lazy-loading",
      class_loaded: "lazy-loaded",
      class_error: "lazy-error",
      callback_enter: this.#handleEnter,
      callback_loaded: this.#handleLoaded,
      callback_error: this.#handleError
    });
  }

  static #removeShimmer(el) {
    if (!el.hasAttribute("data-lqip")) {
      el.closest(".lazy-wrapper")?.classList?.remove("shimmer");
    }
  }

  static #removeSources(el) {
    el.removeAttribute("data-src");
    el.removeAttribute("data-srcset");
    el.removeAttribute("data-bg");
  }

  static #handleEnter(el) {
    if (!el.hasAttribute("data-lqip")) {
      el.closest(".lazy-wrapper")?.classList?.add("shimmer");
    }
  }

  static #handleLoaded(el) {
    LazyLoader.#removeShimmer(el);
    LazyLoader.#removeSources(el);
  }

  static #handleError(el) {
    LazyLoader.#removeShimmer(el);

    // Fallback image if provided
    if (el.dataset.fallback) el.src = el.dataset.fallback;
  }
}
