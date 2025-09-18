import LineMorph from "./../../utils/animations/elements/line/morph";

const PLUS_VALS = [
  { x1: 4, y1: 12, x2: 20, y2: 12 },
  { x1: 4, y1: 12, x2: 20, y2: 12 },
  { x1: 12, y1: 3, x2: 12, y2: 21 },
  { x1: 12, y1: 3, x2: 12, y2: 21 }
];

export default class IconHash {
  #lineMorph;
  #active = false;

  constructor(svg) {
    this.svg = svg;
    this.lines = svg.querySelectorAll("line");

    this.#lineMorph = new LineMorph(this.lines);

    this.#bindEvents();
  }

  #bindEvents() {
    const target = this.svg.parentElement;

    const morphToPlus = () => {
      if (this.#active) return;

      this.#lineMorph.morph(PLUS_VALS);
      this.#active = true;
    };

    const morphToHash = () => {
      if (!this.#active) return;

      this.#lineMorph.reset();
      this.#active = false;
    };

    target.addEventListener("mousedown", morphToPlus);
    target.addEventListener("mouseup", morphToHash);
    target.addEventListener("mouseleave", morphToHash);

    target.addEventListener("touchstart", morphToPlus, { passive: true });
    target.addEventListener("touchend", morphToHash, { passive: true });
  }

  static initialize(options = {}) {
    document.querySelectorAll(".icon-hash").forEach(icon => new IconHash(icon));
  }
}
