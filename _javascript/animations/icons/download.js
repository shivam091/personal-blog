import useTouch from "../../hooks/use-touch";
import LineMorphBoop from "../../utils/animations/elements/line/boop";
import PolyLineMorphBoop from "../../utils/animations/elements/polyline/boop";
import deepFreeze from "../../utils/deep-freeze";
import { SPRINGS } from "./../../constants/springs";

const ARROW_LINE_POINTS = deepFreeze([
  { x1: 12, y1: 17, x2: 12, y2: 5 }
]);
const ARROW_POLYLINE_POINTS = deepFreeze([
  { points: [7, 12, 12, 17, 17, 12] }
]);

export default class IconDownload {
  #lineBoop;
  #polyLineBoop;

  constructor(svg) {
    this.svg = svg;
    this.isTouch = useTouch();

    const line = this.svg.querySelector("line");
    const polyLine = this.svg.querySelector("polyline");

    this.#lineBoop = new LineMorphBoop([line], ARROW_LINE_POINTS, SPRINGS.springy);
    this.#polyLineBoop = new PolyLineMorphBoop([polyLine], ARROW_POLYLINE_POINTS, SPRINGS.springy);

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
    document.querySelectorAll(".icon-download").forEach(icon => new IconDownload(icon))
  }
}
