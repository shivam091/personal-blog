import CircleMorphBoop from "../../utils/animations/elements/circle/boop";

const NUCLEUS_FRAMES = [{ cx: 5, cy: 19, r: 2 }];
const INNER_RING_FRAMES = [{ cx: 5, cy: 19, r: 9 }];
const OUTER_RING_FRAMES = [{ cx: 5.5, cy: 18.5, r: 16 }];

export default class IconRSS {
  #nucleusBoop;
  #innerRingBoop;
  #outerRingBoop;

  constructor(svg) {
    this.svg = svg;

    const [nucleus, innerRing, outerRing] = Array.from(this.svg.querySelectorAll("circle"));

    this.#nucleusBoop = new CircleMorphBoop([nucleus], NUCLEUS_FRAMES, { tension: 300, friction: 22 } );
    this.#innerRingBoop = new CircleMorphBoop([innerRing], INNER_RING_FRAMES, { tension: 300, friction: 18 } );
    this.#outerRingBoop = new CircleMorphBoop([outerRing], OUTER_RING_FRAMES, { tension: 250, friction: 12 } );

    this.#bindEvents();
  }

  #boop(duration) {
    this.#nucleusBoop.trigger({ duration: duration });
    this.#innerRingBoop.trigger({ duration: duration, delay: 16.6 * 4 });
    this.#outerRingBoop.trigger({ duration: duration, delay: 16.6 * 8 });
  }

  #bindEvents() {
    const target = this.svg.parentElement;
    const trigger = () => this.#boop(1500);

    target.addEventListener("mouseenter", trigger);
    target.addEventListener("touchstart", trigger, { passive: true });
  }

  static initialize() {
    document.querySelectorAll(".icon-rss").forEach(icon => new IconRSS(icon))
  }
}
