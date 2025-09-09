import { SPRINGS } from "../../constants/springs";
import { deepFreeze } from "../../utils/deep-freeze";
import LineMorph from "./../../utils/animations/elements/line/morph";

const SHAPES = deepFreeze({
  closed: [
    { x1: 6, y1: 12, x2: 18, y2: 12 },
    { x1: 12, y1: 18, x2: 12, y2: 6 }
  ],
  open: [
    { x1: 6, y1: 9, x2: 12, y2: 15 },
    { x1: 12, y1: 15, x2: 18, y2: 9 }
  ],
  flat: [
    { x1: 8, y1: 12, x2: 16, y2: 12 },
    { x1: 8, y1: 12, x2: 16, y2: 12 }
  ]
});

export default class IconPlus {
  #lineMorph;

  constructor(svg) {
    this.svg = svg;
    if (!this.svg) return;

    const lines = this.svg.querySelectorAll("line");
    this.#lineMorph = new LineMorph(lines, SPRINGS.quick);
  }

  sync(open) {
    this.#lineMorph.morph(open ? SHAPES.open : SHAPES.closed);
  }

  pressIn() {
    this.#lineMorph.morph(SHAPES.flat);
  }

  pressOut(open) {
    this.sync(open);
  }
}
