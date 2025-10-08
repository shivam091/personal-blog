import IconPlus from "./../animations/icons/plus";
import CollapseAnimator from "./../animations/collapse-animator";

export default class Collapse {
  static initializeAll() {
    document.querySelectorAll(".collapse").forEach((collapseElement) => {
      const button = collapseElement.querySelector(".collapse-toggle");
      const svg = collapseElement.querySelector(".icon-plus");

      if (!button || !svg) return;

      const animator = new CollapseAnimator(collapseElement);
      const icon = new IconPlus(svg);

      this.#bindEvents(collapseElement, button, icon, animator);
    });
  }

  static #bindEvents(collapseElement, button, icon, animator) {
    // Sync icon when collapse state changes
    collapseElement.addEventListener("collapse", (e) => {
      icon.sync(e.detail.open);
    });

    // Button press and release feedback
    button.addEventListener("mousedown", () => icon.pressIn());
    button.addEventListener("mouseup", () => icon.pressOut(animator.opened));
    button.addEventListener("mouseleave", () => icon.pressOut(animator.opened));
  }
}
