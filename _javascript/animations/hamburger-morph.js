import {
  BASE_FRAMES,
  HOVER_FRAMES,
  PRESSED_FRAME
} from "./../constants/hamburger-frames";
import LineMorph from "./../utils/animations/line-morph";

export default class HamburgerMorph {
  constructor(button, config = { stiffness: 0.12, damping: 0.75 }) {
    this.toggleButton = document.querySelector(".toggle-menu");
    if (!this.toggleButton) return;

    this.svg = this.toggleButton.querySelector("svg");
    this.lines = Array.from(this.svg.querySelectorAll("line"));

    this.isOpen = false;
    this.isHovering = false;
    this.isPressed = false;
    this.hoverTimeout = null;

    this.morph = new LineMorph(this.lines, config);

    this.observeDrawerState();
    this.syncWithDrawer();

    this.addHoverEvents();
    this.addPressEvents();
  }

  get hoverDuration() { return 150; }

  getCurrentFrame(type = "base") {
    const state = this.isOpen ? "open" : "closed";
    switch (type) {
      case "hover": return HOVER_FRAMES[state];
      case "pressed": return PRESSED_FRAME;
      default: return BASE_FRAMES[state];
    }
  }

  /**
   * Accepts targetFrames as an array like BASE_FRAMES.closed (3 objects)
   * Maps them to the shape LineMorph.morph expects:
   * [
   *   [ [x1,y1], [x2,y2], [opacity, 0] ], // first line
   *   ...
   * ]
   */
  morphLines(targetFrames) {
    this.morph.morph(targetFrames);
  }

  clearHoverTimeout() {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
  }

  observeDrawerState() {
    const observer = new MutationObserver(() => this.syncWithDrawer());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-drawer"] });
  }

  syncWithDrawer() {
    this.isOpen = document.documentElement.getAttribute("data-drawer") === "open";
    this.morphLines(this.getCurrentFrame("base"));
  }

  handleHoverIn = () => {
    this.clearHoverTimeout();
    this.isHovering = true;
    this.morphLines(this.getCurrentFrame("hover"));
    this.hoverTimeout = setTimeout(this.handleHoverOut, this.hoverDuration);
  }

  handleHoverOut = () => {
    this.clearHoverTimeout();
    this.isHovering = false;
    this.morphLines(this.getCurrentFrame("base"));
  }

  morphToPressed() {
    this.clearHoverTimeout();
    this.isHovering = false;
    this.morphLines(this.getCurrentFrame("pressed"));
  }

  restoreFromPressed() {
    const frame = this.isHovering
      ? this.getCurrentFrame("hover")
      : this.getCurrentFrame("base");
    this.morphLines(frame);
  }

  addHoverEvents() {
    ["mouseenter", "touchstart"].forEach(evt =>
      this.toggleButton.addEventListener(evt, this.handleHoverIn, { passive: true })
    );
  }

  addPressEvents() {
    const pressIn = () => {
      if (this.isPressed) return;
      this.isPressed = true;
      this.morphToPressed();
    };

    const pressOut = () => {
      if (!this.isPressed) return;
      this.isPressed = false;
      this.restoreFromPressed();
    };

    ["mousedown", "touchstart"].forEach(evt =>
      this.toggleButton.addEventListener(evt, pressIn, { passive: true })
    );

    ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach(evt =>
      this.toggleButton.addEventListener(evt, pressOut)
    );
  }
}
