import useTouch from "./../hooks/use-touch";
import { clamp } from "./../utils/interpolators";

const MIN_PERCENT = 20;
const MAX_PERCENT = 80;

export default class SplitPane {
  constructor(container, options = {}) {
    this.container = container;
    this.leftPane = container.querySelector("[data-pane='left']");
    this.rightPane = container.querySelector("[data-pane='right']");
    this.splitHandle = container.querySelector("[data-split-handle]");

    this.isTouch = useTouch();
    this.isDragging = false;

    // orientation can be 'horizontal', 'vertical', or 'auto'
    this.options = Object.assign({
      min: MIN_PERCENT,
      max: MAX_PERCENT,
      orientation: "auto"
    }, options);

    const styles = getComputedStyle(this.container);
    this.leftPaneDefault = parseFloat(styles.getPropertyValue("--left-pane-size")) || 50;

    this.#bindEvents();
    this.#bindKeyboard();
  }

  #bindEvents() {
    const start = (e) => this.#start(e);
    const move = (e) => this.#move(e);
    const stop = () => this.#stop();

    this.splitHandle.addEventListener("mousedown", start);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);

    if (this.isTouch) {
      this.splitHandle.addEventListener("touchstart", start, { passive: false });
      window.addEventListener("touchmove", move, { passive: false });
      window.addEventListener("touchend", stop);
    }
  }

  // Helper to determine if we are currently in vertical mode
  get isVertical() {
    if (this.options.orientation === "auto") {
      return getComputedStyle(this.container).flexDirection === "column";
    }
    return this.options.orientation === "vertical";
  }

  #bindKeyboard() {
    document.addEventListener("keydown", (e) => {
      // Only trigger when splitHandle is focused
      if (document.activeElement !== this.splitHandle) return;

      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;

      e.preventDefault();
      const step = e.shiftKey ? 5 : 2;

      // Handle logic based on orientation
      if (this.isVertical) {
        if (e.key === "ArrowUp") this.#adjust(-step);
        if (e.key === "ArrowDown") this.#adjust(step);
      } else {
        if (e.key === "ArrowLeft") this.#adjust(-step);
        if (e.key === "ArrowRight") this.#adjust(step);
      }
    });
  }

  #start(e) {
    e.preventDefault();

    this.isDragging = true;
    this.container.classList.add("resizing");
    this.splitHandle.focus({ preventScroll: true });

    document.body.style.userSelect = "none";
  }

  #stop() {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.container.classList.remove("resizing");

    document.body.style.userSelect = "";
  }

  #move(e) {
    if (!this.isDragging) return;

    const rect = this.container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let percent;
    if (this.isVertical) {
      percent = ((clientY - rect.top) / rect.height) * 100;
    } else {
      percent = ((clientX - rect.left) / rect.width) * 100;
    }

    this.#applySplit(clamp(percent, this.options.min, this.options.max));
  }

  // delta: horizontal by default, vertical when vertical=true
  #adjust(delta) {
    const rect = this.container.getBoundingClientRect();
    const paneRect = this.leftPane.getBoundingClientRect();

    // Calculate current percentage based on active axis
    const current = this.isVertical
      ? (paneRect.height / rect.height) * 100
      : (paneRect.width / rect.width) * 100;

    this.#applySplit(clamp(current + delta, this.options.min, this.options.max));
  }

  #applySplit(percent) {
    this.leftPane.style.flex = `0 0 ${percent}%`;
  }

  reset() {
    this.leftPane.style.flex = `0 0 ${this.leftPaneDefault}%`;
  }
}
