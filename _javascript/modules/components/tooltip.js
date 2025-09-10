import * as PopperUtils from "./../../utils/popper";
import * as DomUtils from "./../../utils/dom";

export default class Tooltip {
  static tooltipMap = new WeakMap();

  static get tooltipElements() {
    return document.querySelectorAll("[data-tooltip]");
  }

  static createTooltipContainer(text) {
    const id = DomUtils.generateId("tooltip");

    const content = DomUtils.createElement("div", {
      className: "tooltip-content",
      text
    });

    const arrow = DomUtils.createElement("div", {
      className: "tooltip-arrow",
      attrs: { "data-popper-arrow": "" }
    });

    const container = DomUtils.createElement("div", {
      id,
      className: "tooltip",
      attrs: {
        role: "presentation",
        "aria-live": "polite",
        "aria-hidden": "true"
      },
      children: [content, arrow]
    });

    return container;
  }

  static getTooltipDelay(target) {
    return parseInt(target.getAttribute("data-tooltip-delay") || "3000", 10);
  }

  static show(event) {
    const target = event?.currentTarget;
    if (!target || this.tooltipMap.has(target)) return;

    const tooltipText = target.getAttribute("data-tooltip");
    if (!tooltipText) return;

    const delay = this.getTooltipDelay(target);
    const tooltip = this.createTooltipContainer(tooltipText);

    document.body.appendChild(tooltip);

    PopperUtils.createInstance(target, tooltip, {
      placement: target.getAttribute("data-tooltip-position") || "top",
    });

    requestAnimationFrame(() => tooltip.classList.add("show"));
    target.setAttribute("aria-describedby", tooltip.id);
    this.tooltipMap.set(target, tooltip);

    if ("ontouchstart" in window) {
      setTimeout(() => this.hide({ currentTarget: target }), delay);
    }
  }

  static update(target) {
    if (!target) return;

    const tooltipText = target.getAttribute("data-tooltip");

    if (!tooltipText) return;

    const tooltip = this.tooltipMap.get(target);
    if (tooltip) {
      const content = tooltip.querySelector(".tooltip-content") || tooltip;
      content.textContent = tooltipText;

      PopperUtils.updateInstance(tooltip);
    }
  }

  static hide(event) {
    const target = event.currentTarget;
    const tooltip = this.tooltipMap.get(target);

    if (tooltip) {
      tooltip.classList.remove("show");
      tooltip.classList.add("hide");
      target.removeAttribute("aria-describedby");

      const removeTooltip = () => {
        if (tooltip && tooltip.parentNode) {
          tooltip.remove();
          this.tooltipMap.delete(target);
          PopperUtils.destroyInstance(tooltip);
        }
      };

      let removed = false;
      const cleanup = () => {
        if (!removed) {
          removeTooltip();
          removed = true;
        }
      };

      tooltip.addEventListener("transitionend", cleanup, { once: true });
      setTimeout(cleanup, 300);
    }
  }

  static handleEscape(event) {
    if (event.key === "Escape") {
      this.hide({ currentTarget: document.activeElement });
    }
  }

  static getHoverHandlers() {
    let hoverTimer;

    return {
      safeShow: (event) => {
        clearTimeout(hoverTimer);
        const target = event.currentTarget;

        hoverTimer = setTimeout(() => Tooltip.show({ currentTarget: target }), 200);
      },
      safeHide: (event) => {
        clearTimeout(hoverTimer);
        const target = event.currentTarget;

        hoverTimer = setTimeout(() => Tooltip.hide({ currentTarget: target }), 50);
      },
    };
  }

  static initialize() {
    this.tooltipElements.forEach((el) => {
      const { safeShow, safeHide } = this.getHoverHandlers();

      el.addEventListener("mouseenter", safeShow);
      el.addEventListener("mouseleave", safeHide);

      el.addEventListener("focus", (event) => this.show(event));
      el.addEventListener("blur", (event) => this.hide(event));

      el.addEventListener("touchstart", (event) => this.show(event), { passive: true });
      el.addEventListener("touchend", (event) => this.hide(event), { passive: true });

      // el.addEventListener("pointerdown", (event) => this.show(event));
      // el.addEventListener("pointerup", (event) => this.hide(event));

      el.addEventListener("keydown", (event) => this.handleEscape(event));
    });
  }
}
