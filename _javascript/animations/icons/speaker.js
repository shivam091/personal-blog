import PathMorphBoop from "../../utils/animations/elements/path/boop";
import { deepFreeze } from "../../utils/deep-freeze";
import { SPRINGS } from "../../constants/springs";
import useTouch from "../../hooks/use-touch";

const WAVES_BOOP_FRAMES = deepFreeze([
  { M: [17.5, 9], A: [5, 5, 0, 0, 1, 17.5, 15] },
  { M: [21, 18], A: [9, 9, 0, 0, 0, 21, 6] },
]);

export default class IconSpeaker {
  #waves;
  #wavesBoop;

  constructor(svg) {
    this.svg = svg;
    this.isTouch = useTouch();

    this.#waves = this.svg.querySelectorAll("path[d^='M16 9'], path[d^='M19 18']");

    this.#wavesBoop = new PathMorphBoop(this.#waves, WAVES_BOOP_FRAMES, SPRINGS.springy);

    this.#bindEvents();
  }

  #boop(duration) {
    this.#wavesBoop.trigger({ duration, delay: [0, 50] });
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
    document.querySelectorAll(".icon-speaker").forEach(icon => new IconSpeaker(icon))
  }
}
