import LineMorphBoop from "../../utils/animations/elements/line/boop";
import PolyLineMorphBoop from "../../utils/animations/elements/polyline/boop";
import { SPRINGS } from "./../../constants/springs";

const ARROW_RIGHT_LINE_POINTS = [
  { x1: 5, y1: 12, x2: 23, y2: 12 },
];
const ARROW_RIGHT_POLYLINE_POINTS = [
  { points: [17, 6, 24, 12, 17, 18] },
];

export default class IconArrowRight {
  #lineBoop;
  #polyLineBoop;

  constructor(svg) {
    this.svg = svg;

    const line = this.svg.querySelector("line");
    const polyLine = this.svg.querySelector("polyline");

    this.#lineBoop = new LineMorphBoop([line], ARROW_RIGHT_LINE_POINTS, SPRINGS.smooth);
    this.#polyLineBoop = new PolyLineMorphBoop([polyLine], ARROW_RIGHT_POLYLINE_POINTS, SPRINGS.smooth);

    this.#bindEvents();
  }

  #boop(duration) {
    this.#lineBoop.trigger(duration);
    this.#polyLineBoop.trigger(duration);
  }

  #bindEvents() {
    const target = this.svg.parentElement;
    const trigger = () => this.#boop(150);

    target.addEventListener("mouseenter", trigger);
    target.addEventListener("touchstart", trigger, { passive: true });
  }

  static initialize() {
    document.querySelectorAll(".icon-arrow-right").forEach(icon => new IconArrowRight(icon))
  }
}
