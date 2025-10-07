import useTouch from "../../hooks/use-touch";
import CircleMorphBoop from "../../utils/animations/elements/circle/boop";
import PathMorphBoop from "../../utils/animations/elements/path/boop";
import { deepFreeze } from "../../utils/deep-freeze";

const RSS_BOOP_FRAMES = deepFreeze([
  { cx: 5, cy: 19, r: 2 },
]);

const RSS_BOOP = deepFreeze([
  { M: [4, 9], A: [11, 11, 0, 0, 1, 15, 20] },
  { M: [4, 2], A: [18, 18, 0, 0, 1, 22, 20] }
]);

export default class IconRSS {
  #rssBoop;
  #pathBoop;

  constructor(svg) {
    this.svg = svg;
    this.isTouch = useTouch();

    const rssElements = Array.from(this.svg.querySelectorAll("circle"));
    const pathElements = Array.from(this.svg.querySelectorAll("path"));

    this.#rssBoop = new CircleMorphBoop(rssElements, RSS_BOOP_FRAMES, { tension: 300, friction: 22 });

    this.#pathBoop = new PathMorphBoop(
      pathElements,
      RSS_BOOP,
      [
        { tension: 300, friction: 18 },
        { tension: 250, friction: 12 }
      ]
    );

    this.#bindEvents();
  }

  #boop(duration) {
    this.#rssBoop.trigger({ duration });
    this.#pathBoop.trigger({ duration, delay: [(16.6 * 4), (16.6 * 8)] });
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
    document.querySelectorAll(".icon-rss").forEach(icon => new IconRSS(icon))
  }
}
