import PolyLineMorph from "./../../utils/animations/elements/polyline/morph";

const CHEVRON_UP_POINTS = [{ points: [6, 14, 12, 8, 18, 14] }];

export default class IconChevronDown {
  #morph;

  constructor(svg) {
    this.svg = svg;
    this.polyline = this.svg.querySelector("polyline");

    this.#morph = new PolyLineMorph([this.polyline]);
  }

  up() {
    this.#morph.morph(CHEVRON_UP_POINTS);
  }

  reset() {
    this.#morph.reset();
  }
}
