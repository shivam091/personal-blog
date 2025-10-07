import setStyles from "./../../utils/styles";
import IconDiamonds from "./../../animations/icons/diamonds";
import IconChevronDown from "./../../animations/icons/chevron-down";

export default class Accordion {
  static #diamondsInstances = new WeakMap();
  static #chevronDownInstances = new WeakMap();

  static get accordions() {
    return document.querySelectorAll("[data-accordion]");
  }

  static getItems(container) {
    return container.querySelectorAll(".accordion-item");
  }

  static #isTransitioning(item) {
    return item._isTransitioning === true;
  }

  static #setTransitioning(item, value) {
    item._isTransitioning = value;
  }

  static #animateHeight(element, targetHeight, callback, startHeight = element.scrollHeight) {
    setStyles(element, {
      overflow: "hidden",
      height: `${startHeight}px`,
    });

    void element.offsetHeight; // force reflow

    requestAnimationFrame(() => {
      element.style.height = `${targetHeight}px`;

      const onTransitionEnd = () => {
        element.removeEventListener("transitionend", onTransitionEnd);
        if (callback) callback();
      };

      element.addEventListener("transitionend", onTransitionEnd, { once: true });
    });
  }

  static #animateDiamond(svg) {
    if (!svg) return;
    let instance = this.#diamondsInstances.get(svg);
    if (!instance) {
      instance = new IconDiamonds(svg);
      this.#diamondsInstances.set(svg, instance);
    }
    instance.boop();
  }

  static #animateChevron(svg, up = true) {
    if (!svg) return;
    let instance = this.#chevronDownInstances.get(svg);
    if (!instance) {
      instance = new IconChevronDown(svg);
      this.#chevronDownInstances.set(svg, instance);
    }
    if (up) instance.up();
    else instance.reset();
  }

  static expand(item) {
    if (this.#isTransitioning(item)) return;
    this.#setTransitioning(item, true);

    const { body, diamondSvg, chevronSvg } = item._refs;
    setStyles(body, { display: "block" });
    item.setAttribute("data-expanded", true);

    this.#animateHeight(body, body.scrollHeight, () => {
      setStyles(body, { height: "auto", overflow: "visible" });
      this.#setTransitioning(item, false);
    });

    this.#animateDiamond(diamondSvg);
    this.#animateChevron(chevronSvg, true);
  }

  static collapse(item) {
    if (this.#isTransitioning(item)) return;
    this.#setTransitioning(item, true);

    const { body, chevronSvg } = item._refs;
    item.removeAttribute("data-expanded");

    this.#animateHeight(body, 0, () => {
      setStyles(body, { display: "none" });
      this.#setTransitioning(item, false);
    }, body.scrollHeight);

    this.#animateChevron(chevronSvg, false);
  }

  static collapseAllExcept(container, currentItem) {
    this.getItems(container).forEach(item => {
      if (item !== currentItem && item.hasAttribute("data-expanded")) {
        this.collapse(item);
      }
    });
  }

  static toggle(container, item) {
    if (this.#isTransitioning(item)) return;

    const isExpanded = item.hasAttribute("data-expanded");
    const toggleButton = item._refs.toggleButton;
    toggleButton?.setAttribute("aria-expanded", String(!isExpanded));

    if (isExpanded) {
      this.collapse(item);
    } else {
      this.collapseAllExcept(container, item);
      this.expand(item);
    }
  }

  static #bind(container, item) {
    const toggleButton = item.querySelector(".accordion-toggle");
    const body = item.querySelector(".accordion-body");
    const header = item.querySelector(".accordion-header");
    const diamondSvg = header?.querySelector("svg.icon-diamonds");
    const chevronSvg = header?.querySelector("svg.icon-chevron-down");

    if (!toggleButton || !body || !header) return;

    item._refs = { toggleButton, body, header, diamondSvg, chevronSvg };

    toggleButton.addEventListener("click", () => this.toggle(container, item));

    setStyles(body, { display: "none", height: "0" });
  }

  static initialize() {
    this.accordions.forEach(container => {
      this.getItems(container).forEach(item => this.#bind(container, item));
    });
  }
}