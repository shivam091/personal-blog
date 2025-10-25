import useTouch from "./../hooks/use-touch";
import { clamp } from "./../utils/interpolators";

const BREAKPOINT = 768;
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
    this.mode = window.innerWidth <= BREAKPOINT ? "vertical" : "horizontal";
    this.options = Object.assign({ min: MIN_PERCENT, max: MAX_PERCENT }, options);

    this.container.dataset.orientation = this.mode;

    // read initial CSS vars
    const styles = getComputedStyle(this.container);
    this.leftPaneDefault = parseFloat(styles.getPropertyValue("--left-pane-size")) || 50;

    this.#bindEvents();
    this.#observeResize();
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

  #observeResize() {
    this.resizeObserver = new ResizeObserver(() => {
      const newMode = window.innerWidth <= BREAKPOINT ? "vertical" : "horizontal";

      if (newMode !== this.mode) {
        this.mode = newMode;
        this.container.dataset.orientation = this.mode; // sync orientation
        this.#resetLayout();
      }
    });

    this.resizeObserver.observe(this.container);
  }

  #bindKeyboard() {
    document.addEventListener("keydown", (e) => {
      // Only trigger when splitHandle is focused
      if (document.activeElement !== this.splitHandle) return;

      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        if (e.target.matches("textarea, input")) return;
        e.preventDefault();

        const step = e.shiftKey ? 5 : 2; // larger move with Shift

        if (this.mode === "horizontal") {
          if (e.key === "ArrowLeft") this.#adjust(-step, 0);
          if (e.key === "ArrowRight") this.#adjust(step, 0);
        } else {
          if (e.key === "ArrowUp") this.#adjust(0, -step);
          if (e.key === "ArrowDown") this.#adjust(0, step);
        }
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

    if (this.mode === "horizontal") {
      let percent = ((clientX - rect.left) / rect.width) * 100;
      percent = clamp(percent, this.options.min, this.options.max);
      this.#applySplit(percent);
    } else {
      let percent = ((clientY - rect.top) / rect.height) * 100;
      percent = clamp(percent, this.options.min, this.options.max);
      this.#applySplit(percent);
    }
  }

  #adjust(dx, dy) {
    const rect = this.container.getBoundingClientRect();
    const current = this.mode === "horizontal" ? this.#getLeftPercent(rect) : this.#getTopPercent(rect);
    const newPercent = clamp(current + (this.mode === "horizontal" ? dx : dy), this.options.min, this.options.max);

    this.#applySplit(newPercent);
  }

  #applySplit(percent) {
    this.container.dataset.orientation = this.mode;
    this.leftPane.style.flex = `0 0 ${percent}%`;
  }

  #resetLayout() {
    this.container.dataset.orientation = this.mode;
    this.leftPane.style.flex = `0 0 ${this.leftPaneDefault}%`;
  }

  #getLeftPercent(rect) {
    const leftWidth = this.leftPane.getBoundingClientRect().width

    return (leftWidth / rect.width) * 100;
  }

  #getTopPercent(rect) {
    const topHeight = this.leftPane.getBoundingClientRect().height;

    return (topHeight / rect.height) * 100;
  }
}
