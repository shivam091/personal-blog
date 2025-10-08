import { SPRINGS } from "../../constants/springs";
import deepFreeze from "../../utils/deep-freeze";
import PolyLineMorph from "../../utils/animations/elements/polyline/morph";

const SHAPES = deepFreeze({
  closed: [{ points: [5, 12, 12, 12, 19, 12] }],
  open: [{ points: [6, 9, 12, 15, 18, 9] }],
});

export default class IconFlat {
  #polylineMorph;
  #state = "closed"; // track current state

  constructor(svg) {
    this.svg = svg;
    if (!this.svg) return;

    const polyline = this.svg.querySelector("polyline");
    this.#polylineMorph = new PolyLineMorph([polyline], SPRINGS.quick);
  }

  // Transition between open/closed states
  setState(open) {
    const targetState = open ? "open" : "closed";

    // Skip if already in that state
    if (this.#state === targetState) return;

    this.#polylineMorph.morph(SHAPES[targetState]);
    this.#state = targetState;
  }

  // Get current animation or morph state
  getState() {
    return {
      state: this.#state,
      morph: this.#polylineMorph?.getState?.() ?? null,
    };
  }

  // Optionally add a toggle method for convenience
  toggle() {
    const nextState = this.#state === "open" ? "closed" : "open";
    this.setState(nextState === "open");
  }
}
