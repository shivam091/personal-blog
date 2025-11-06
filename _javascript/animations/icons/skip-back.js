import useTouch from "../../hooks/use-touch";
import PolygonMorphBoop from "../../utils/animations/elements/polygon/boop";
import deepFreeze from "../../utils/deep-freeze";
import { SPRINGS } from "./../../constants/springs";

const POLYGON_POINTS = deepFreeze([
  { points: [16, 20, 6, 12, 16, 4, 16, 20] }
]);

export default class IconSkipBack {
  #polygonBoop;

  constructor(svg) {
    this.svg = svg;
    this.isTouch = useTouch();

    const polygon = this.svg.querySelector("polygon");

    this.#polygonBoop = new PolygonMorphBoop([polygon], POLYGON_POINTS, SPRINGS.springy);

    this.#bindEvents();
  }

  #boop(duration) {
    this.#polygonBoop.trigger({ duration });
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
    document.querySelectorAll(".icon-skip-back").forEach(icon => new IconSkipBack(icon))
  }
}
