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
    this.options = Object.assign({ min: MIN_PERCENT, max: MAX_PERCENT }, options);

    // initial CSS var fallback
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

  #bindKeyboard() {
    document.addEventListener("keydown", (e) => {
      // Only trigger when splitHandle is focused
      if (document.activeElement !== this.splitHandle) return;

      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
      if (e.target.matches("textarea, input")) return;

      e.preventDefault();

      const step = e.shiftKey ? 5 : 2;
      const direction = getComputedStyle(this.container).flexDirection;

      if (direction === "row") {
        if (e.key === "ArrowLeft") this.#adjust(-step);
        if (e.key === "ArrowRight") this.#adjust(step);
      } else {
        if (e.key === "ArrowUp") this.#adjust(-step, { vertical: true });
        if (e.key === "ArrowDown") this.#adjust(step, { vertical: true });
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
    const direction = getComputedStyle(this.container).flexDirection;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let percent;
    if (direction === "row") {
      percent = ((clientX - rect.left) / rect.width) * 100;
    } else {
      percent = ((clientY - rect.top) / rect.height) * 100;
    }

    percent = clamp(percent, this.options.min, this.options.max);
    this.#applySplit(percent);
  }

  // delta: horizontal by default, vertical when vertical=true
  #adjust(delta, { vertical = false } = {}) {
    const rect = this.container.getBoundingClientRect();
    const current = vertical
      ? (this.leftPane.getBoundingClientRect().height / rect.height) * 100
      : (this.leftPane.getBoundingClientRect().width / rect.width) * 100;

    const newPercent = clamp(
      current + delta,
      this.options.min,
      this.options.max
    );

    this.#applySplit(newPercent);
  }

  #applySplit(percent) {
    this.leftPane.style.flex = `0 0 ${percent}%`;
  }

  reset() {
    this.leftPane.style.flex = `0 0 ${this.leftPaneDefault}%`;
  }
}
