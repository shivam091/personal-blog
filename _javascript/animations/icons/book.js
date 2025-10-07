import LineMorphBoop from "./../../utils/animations/elements/line/boop";
import useTouch from "../../hooks/use-touch";
import { deepFreeze } from "../../utils/deep-freeze";
import { SPRINGS } from "../../constants/springs";

const LINE_BOOP_VALS = deepFreeze([
  { x1: 1.5, y1: 7, x2: 4.5, y2: 7 },
  { x1: 1.5, y1: 11, x2: 4.5, y2: 11 },
  { x1: 1.5, y1: 15, x2: 4.5, y2: 15 },
  { x1: 1.5, y1: 19, x2: 4.5, y2: 19 },
  { x1: 9, y1: 9, x2: 15.5, y2: 9 },
  { x1: 9, y1: 13, x2: 17, y2: 13 },
  { x1: 9, y1: 17, x2: 15, y2: 17 },
]);
const delay = deepFreeze([100, 200, 300, 400, 100, 200, 300]);

export default class IconBook {
  #lineBoop;

  constructor(svg) {
    this.svg = svg;
    this.isTouch = useTouch();

    const lines = this.svg.querySelectorAll("line");

    this.#lineBoop = new LineMorphBoop(lines, LINE_BOOP_VALS, SPRINGS.springy);

    this.#bindEvents();
  }

  #bindEvents() {
    const target = this.svg.parentElement;
    const trigger = () => this.#boop(200);

    target.addEventListener("mouseenter", trigger);
    if (this.isTouch) {
      target.addEventListener("touchstart", trigger, { passive: true });
    }
  }

  #boop(duration) {
    this.#lineBoop.trigger({ duration, delay });
  }

  static initialize() {
    document.querySelectorAll(".icon-book").forEach(icon => new IconBook(icon));
  }
}
