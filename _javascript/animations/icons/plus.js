import { SPRINGS } from "../../constants/springs";
import LineMorph from "./../../utils/animations/elements/line/morph";

const SHAPE_PLUS_POINTS = [
  { x1: 6, y1: 12, x2: 18, y2: 12 },
  { x1: 12, y1: 18, x2: 12, y2: 6 }
];
const SHAPE_FLAT_POINTS = [
  { x1: 8, y1: 12, x2: 16, y2: 12 },
  { x1: 8, y1: 12, x2: 16, y2: 12 }
];
const SHAPE_CHEVRON_DOWN_POINTS = [
  { x1: 6, y1: 9, x2: 12, y2: 15 },
  { x1: 12, y1: 15, x2: 18, y2: 9 }
];

export default class IconPlus {
  #lineMorph;

  constructor(details) {
    this.details = details;
    this.svg = details.querySelector("summary .icon-plus");
    if (!this.svg) return;

    const lines = this.svg.querySelectorAll("line");
    this.#lineMorph = new LineMorph(lines, SPRINGS.smooth);

    this.#bindEvents();
    this.#syncToState();
  }

  #morphLines(target) {
    this.#lineMorph.morph(target);
  }

  #syncToState() {
    this.details.hasAttribute("open")
      ? this.#morphLines(SHAPE_CHEVRON_DOWN_POINTS)
      : this.#morphLines(SHAPE_PLUS_POINTS);
  }

  #bindEvents() {
    const summary = this.details.querySelector("summary");

    const pressIn = () => {
      this.#morphLines(SHAPE_FLAT_POINTS);
    }

    const pressOut = () => {
      this.#syncToState();
    }

    summary.addEventListener("mousedown", pressIn);
    summary.addEventListener("mouseup", pressOut);
    summary.addEventListener("mouseleave", pressOut);
    summary.addEventListener("touchstart", pressIn);
    summary.addEventListener("touchend", pressOut);

    this.details.addEventListener("toggle", pressOut);
  }
}
