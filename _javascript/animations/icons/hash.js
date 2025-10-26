import { SPRINGS } from "../../constants/springs";
import useTouch from "../../hooks/use-touch";
import deepFreeze from "../../utils/deep-freeze";
import LineMorph from "./../../utils/animations/elements/line/morph";
import LineMorphBoop from "./../../utils/animations/elements/line/boop";

const PLUS_VALS = deepFreeze([
  { x1: 4, y1: 12, x2: 20, y2: 12 },
  { x1: 4, y1: 12, x2: 20, y2: 12 },
  { x1: 12, y1: 3, x2: 12, y2: 21 },
  { x1: 12, y1: 3, x2: 12, y2: 21 }
]);

const BOOP_VALS = deepFreeze([
  { x1: 4, y1: 10, x2: 20, y2: 10 },
  { x1: 4, y1: 14, x2: 20, y2: 14 },
  { x1: 11, y1: 3, x2: 9, y2: 21 },
  { x1: 15, y1: 3, x2: 13, y2: 21 }
]);

const PRESSED_SPRING = {
  tension: SPRINGS.springy.tension * 2,
  friction: SPRINGS.springy.friction * 3,
}

export default class IconHash {
  #lineMorph;
  #lineMorphBoop;
  #active = false;

  constructor(svg) {
    this.svg = svg;
    this.isTouch = useTouch();

    this.lines = svg.querySelectorAll("line");
    this.#lineMorph = new LineMorph(this.lines, PRESSED_SPRING);
    this.#lineMorphBoop = new LineMorphBoop(this.lines, BOOP_VALS, SPRINGS.springy);

    this.#bindEvents();
  }

  #bindEvents() {
    const target = this.svg.parentElement;

    const boop = () => this.#lineMorphBoop.trigger({ duration: 150 });

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

    if (this.isTouch) {
      target.addEventListener("touchstart", morphToPlus, { passive: true });
      target.addEventListener("touchend", morphToHash, { passive: true });
    } else {
      target.addEventListener("mouseenter", boop);
      target.addEventListener("mousedown", morphToPlus);
      target.addEventListener("mouseup", morphToHash);
      target.addEventListener("mouseleave", morphToHash);
    }
  }

  static initialize() {
    document.querySelectorAll(".icon-hash").forEach(icon => new IconHash(icon));
  }
}
