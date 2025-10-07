import IconPlus from "./../animations/icons/plus";
import CollapseAnimator from "./../animations/collapse-animator";

export default class Collapse {
  static initializeAll() {
    document.querySelectorAll(".collapse").forEach(collapseElement => {
      const button = collapseElement.querySelector(".collapse-toggle");
      const content = collapseElement.querySelector(".collapse-content");
      const svg = collapseElement.querySelector(".icon-plus");

      const animator = new CollapseAnimator(collapseElement);
      const icon = new IconPlus(svg);

      // Sync icon
      collapseElement.addEventListener("collapse", (e) => {
        icon.sync(e.detail.open);
      });

      // Press feedback
      button.addEventListener("mousedown", () => icon.pressIn());
      button.addEventListener("mouseup", () => icon.pressOut(animator.opened));
      button.addEventListener("mouseleave", () => icon.pressOut(animator.opened));
    });
  }
}