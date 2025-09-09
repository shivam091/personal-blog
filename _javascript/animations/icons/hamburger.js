import LineMorph from "./../../utils/animations/elements/line/morph";
import { SPRINGS } from "./../../constants/springs";
import { deepFreeze } from "../../utils/deep-freeze";
import useTouch from "../../hooks/use-touch";

const BASE_FRAMES = deepFreeze({
  closed: [
    { x1: 3, y1: 5, x2: 21, y2: 5 },
    { x1: 3, y1: 12, x2: 21, y2: 12, strokeOpacity: 1 },
    { x1: 3, y1: 19, x2: 21, y2: 19 }
  ],
  open: [
    { x1: 5, y1: 5, x2: 19, y2: 19 },
    { x1: 3, y1: 12, x2: 21, y2: 12, strokeOpacity: 0 },
    { x1: 5, y1: 19, x2: 19, y2: 5 }
  ]
});

const HOVER_FRAMES = deepFreeze({
  closed: [
    { x1: 3, y1: 7, x2: 21, y2: 7 },
    { x1: 3, y1: 12, x2: 21, y2: 12, strokeOpacity: 1 },
    { x1: 3, y1: 17, x2: 21, y2: 17 }
  ],
  open: [
    { x1: 5, y1: 7, x2: 19, y2: 17 },
    { x1: 3, y1: 12, x2: 21, y2: 12, strokeOpacity: 0 },
    { x1: 5, y1: 17, x2: 19, y2: 7 }
  ]
});

const PRESSED_FRAME = deepFreeze([
  { x1: 3, y1: 12, x2: 21, y2: 12 },
  { x1: 3, y1: 12, x2: 21, y2: 12, strokeOpacity: 1 },
  { x1: 3, y1: 12, x2: 21, y2: 12 }
]);

export default class IconHamburger {
  #hamburgerMorph;

  constructor(button) {
    this.toggleButton = button;
    this.isTouch = useTouch();

    this.svg = this.toggleButton.querySelector("svg");
    this.lines = Array.from(this.svg.querySelectorAll("line"));

    this.isOpen = false;
    this.isHovering = false;
    this.isPressed = false;
    this.hoverTimeout = null;

    this.#hamburgerMorph = new LineMorph(this.lines, SPRINGS.tight);

    this.#observeDrawerState();
    this.#syncWithDrawer();

    this.#addHoverEvents();
    this.#addPressEvents();
  }

  get hoverDuration() { return 150; }

  #getCurrentFrame(type = "base") {
    const state = this.isOpen ? "open" : "closed";
    switch (type) {
      case "hover": return HOVER_FRAMES[state];
      case "pressed": return PRESSED_FRAME;
      default: return BASE_FRAMES[state];
    }
  }

  #morphLines(targetFrames) {
    this.#hamburgerMorph.morph(targetFrames);
  }

  #clearHoverTimeout() {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
  }

  #observeDrawerState() {
    const observer = new MutationObserver(() => this.#syncWithDrawer());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-drawer"] });
  }

  #syncWithDrawer() {
    this.isOpen = document.documentElement.getAttribute("data-drawer") === "open";
    this.#morphLines(this.#getCurrentFrame("base"));
  }

  #morphToPressed() {
    this.#clearHoverTimeout();
    this.isHovering = false;
    this.#morphLines(this.#getCurrentFrame("pressed"));
  }

  #restoreFromPressed() {
    const frame = this.isHovering ? this.#getCurrentFrame("hover") : this.#getCurrentFrame("base");
    this.#morphLines(frame);
  }

  #addHoverEvents() {
    const hoverIn = () => {
      this.#clearHoverTimeout();
      this.isHovering = true;
      this.#morphLines(this.#getCurrentFrame("hover"));
      this.hoverTimeout = setTimeout(hoverOut, this.hoverDuration);
    }

    const hoverOut = () => {
      this.#clearHoverTimeout();
      this.isHovering = false;
      this.#morphLines(this.#getCurrentFrame("base"));
    }

    this.toggleButton.addEventListener("mouseenter", hoverIn);

    if (this.isTouch) {
      this.toggleButton.addEventListener("touchstart", hoverIn, { passive: true });
    }
  }

  #addPressEvents() {
    const pressIn = () => {
      if (this.isPressed) return;
      this.isPressed = true;
      this.#morphToPressed();
    };

    const pressOut = () => {
      if (!this.isPressed) return;
      this.isPressed = false;
      this.#restoreFromPressed();
    };

    this.toggleButton.addEventListener("mousedown", pressIn);
    this.toggleButton.addEventListener("mouseup", pressOut);
    this.toggleButton.addEventListener("mouseleave", pressOut);
    if (this.isTouch) {
      this.toggleButton.addEventListener("touchstart", pressIn, { passive: true });
      this.toggleButton.addEventListener("touchend", pressOut, { passive: true });
      this.toggleButton.addEventListener("touchcancel", pressOut, { passive: true });
    }
  }
}
