import CircleMorphBoop from "./../../utils/animations/elements/circle/boop";
import RectMorphBoop from "./../../utils/animations/elements/rect/boop";
import useTouch from "../../hooks/use-touch";
import deepFreeze from "../../utils/deep-freeze";

const RECT_BOOP_VALS = deepFreeze([{ width: 14 }, { width: 14 }, { width: 14 }]);
const CIRCLE_BOOP_VALS = deepFreeze([{ r: 1.8 }, { r: 1.8 }, { r: 2 }]);
const delay = deepFreeze([100, 200, 300]);

export default class IconList {
  #circleBoop;
  #rectBoop;

  constructor(svg) {
    this.svg = svg;
    this.isTouch = useTouch();

    const circles = this.svg.querySelectorAll("circle");
    const rects = this.svg.querySelectorAll("rect");

    this.#circleBoop = new CircleMorphBoop(circles, CIRCLE_BOOP_VALS, { tension: 300, friction: 16 });
    this.#rectBoop = new RectMorphBoop(rects, RECT_BOOP_VALS, { tension: 300, friction: 16 });

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
    this.#circleBoop.trigger({ duration, delay });
    this.#rectBoop.trigger({ duration, delay });
  }

  static initialize() {
    document.querySelectorAll(".icon-list").forEach(icon => new IconList(icon));
  }
}
