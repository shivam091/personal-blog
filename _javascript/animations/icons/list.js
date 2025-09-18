import CircleMorphBoop from "./../../utils/animations/elements/circle/boop";
import RectMorphBoop from "./../../utils/animations/elements/rect/boop";
import { SPRINGS } from "./../../constants/springs";

const RECT_BOOP_VALS = [
  { x: 9, y: 5.4, width: 13, height: 1.5, rx: 0.6 },
  { x: 9, y: 11.4, width: 13, height: 1.5, rx: 0.6 },
  { x: 9, y: 17.4, width: 13, height: 1.5, rx: 0.6 }
];
const CIRCLE_BOOP_VALS = [
  { cx: 5, cy: 6, r: 1.8 },
  { cx: 5, cy: 12, r: 1.8 },
  { cx: 5, cy: 18, r: 1.8 }
];

export default class IconList {
  #circleBoop;
  #rectBoop;

  constructor(svg) {
    this.svg = svg;

    const circles = this.svg.querySelectorAll("circle");
    const rects = this.svg.querySelectorAll("rect");

    this.#circleBoop = new CircleMorphBoop(circles, CIRCLE_BOOP_VALS, SPRINGS.slow);
    this.#rectBoop = new RectMorphBoop(rects, RECT_BOOP_VALS, SPRINGS.slow);

    this.#bindEvents();
  }

  #bindEvents() {
    const trigger = () => this.#boop(200);

    const target = this.svg.parentElement;
    target.addEventListener("mouseenter", trigger);
    target.addEventListener("touchstart", trigger, { passive: true });
  }

  #boop(duration) {
    this.#circleBoop.trigger({ duration: duration });
    this.#rectBoop.trigger({ duration: duration });
  }

  static initialize() {
    document.querySelectorAll(".icon-list").forEach(icon => new IconList(icon));
  }
}
