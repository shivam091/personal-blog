// hamburger-morph.js
import { lerp } from "./../utils/animations";
import { BASE_FRAMES } from "./../constants/hamburger-frames";
import HamburgerIcon from "./hamburger-icon";
import LineMorph from "./../utils/animations/line-morph"; // <--- switched to LineMorph (manages multiple lines)

export default class HamburgerMorph {
  /**
   * button - the button element that contains the svg <line> elements
   * config - optional config passed into LineMorph (stiffness, damping, ...)
   */
  constructor(button, config = { stiffness: 0.12, damping: 0.75 }) {
    this.button = button;
    this.svg = button.querySelector("svg");
    // grab the three line elements
    const lineNodes = this.svg.querySelectorAll("line");
    this.lines = Array.from(lineNodes);

    this.isOpen = false;
    this.frames = BASE_FRAMES;

    // Create a single LineMorph that manages all lines together.
    // LineMorph's constructor expects (lines, config) and uses the setter
    // you already placed in LineMorph to update attributes/styles.
    this.morph = new LineMorph(this.lines, config);

    // existing interaction manager (hover / press / touch)
    this.interactions = new HamburgerIcon(this);

    this.observeDrawerState();
    this.syncWithDrawer();
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
    const mapped = targetFrames.map(f => ([
      [Number(f.x1), Number(f.y1)],
      [Number(f.x2), Number(f.y2)],
      [Number(f.opacity), 0], // opacity is treated as a 1D point in LineMorph
    ]));

    // Prefer the morph(...) API, but fall back to setTarget(...) if necessary.
    if (typeof this.morph.morph === "function") {
      this.morph.morph(mapped);
    } else if (typeof this.morph.setTarget === "function") {
      // some animator implementations use setTarget - keep compatibility
      this.morph.setTarget(mapped);
    } else {
      console.warn("HamburgerMorph: animator does not expose morph() or setTarget()");
    }
  }

  observeDrawerState() {
    const observer = new MutationObserver(() => this.syncWithDrawer());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-drawer"] });
  }

  syncWithDrawer() {
    const open = document.documentElement.getAttribute("data-drawer") === "open";
    const state = open ? "open" : "closed";
    this.morphLines(this.frames[state]);
    this.isOpen = open;
  }

  /**
   * Interpolated morph used if you want to animate between progress values
   * fromProgress is unused here (kept for API parity)
   */
  animateMorph(fromProgress, toProgress) {
    const targetFrames = this.frames.closed.map((c, i) => {
      const o = this.frames.open[i];
      return {
        x1: lerp(c.x1, o.x1, toProgress),
        y1: lerp(c.y1, o.y1, toProgress),
        x2: lerp(c.x2, o.x2, toProgress),
        y2: lerp(c.y2, o.y2, toProgress),
        opacity: lerp(c.opacity, o.opacity, toProgress),
      };
    });

    this.morphLines(targetFrames);
  }
}
