import useTouch from "../../hooks/use-touch";
import LineMorphBoop from "../../utils/animations/elements/line/boop";
import PolyLineMorphBoop from "../../utils/animations/elements/polyline/boop";
import { deepFreeze } from "../../utils/deep-freeze";
import { SPRINGS } from "./../../constants/springs";

const ARROW_RIGHT_LINE_POINTS = deepFreeze([
  { x1: 5, y1: 12, x2: 23, y2: 12 },
]);
const ARROW_RIGHT_POLYLINE_POINTS = deepFreeze([
  { points: [17, 6, 24, 12, 17, 18] },
]);

export default class IconArrowRight {
  #lineBoop;
  #polyLineBoop;

  constructor(svg) {
    this.svg = svg;
    this.isTouch = useTouch();

    const line = this.svg.querySelector("line");
    const polyLine = this.svg.querySelector("polyline");

    this.#lineBoop = new LineMorphBoop([line], ARROW_RIGHT_LINE_POINTS, SPRINGS.snappy);
    this.#polyLineBoop = new PolyLineMorphBoop([polyLine], ARROW_RIGHT_POLYLINE_POINTS, SPRINGS.snappy);

    this.#bindEvents();
  }

  #boop(duration) {
    this.#lineBoop.trigger({ duration });
    this.#polyLineBoop.trigger({ duration });
  }

  #bindEvents() {
    const target = this.svg.parentElement;
    const trigger = () => this.#boop(150);

    target.addEventListener("mouseenter", trigger);
    if (this.isTouch) {
      target.addEventListener("touchstart", trigger, { passive: true });
    }
  }

  static initialize() {
    document.querySelectorAll(".icon-arrow-right").forEach(icon => new IconArrowRight(icon))
  }
}
