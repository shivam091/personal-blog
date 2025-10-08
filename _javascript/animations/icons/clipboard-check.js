import SpringGroup from "./../../utils/animations/spring-group";
import SpringBoop from "./../../utils/animations/spring-boop";
import { SPRINGS } from "./../../constants/springs";
import deepFreeze from "../../utils/deep-freeze";

const CHECK_FRAMES = deepFreeze({
  hidden: { strokeOpacity: 0 },
  visible: { strokeOpacity: 1 }
});

const TRANSFORM_FRAMES = deepFreeze({
  hidden: { rotate: 0, scale: 1 },
  visible: { rotate: 10, scale: 1.1 }
});

export default class IconClipboardCheck {
  #checkPath;
  #checkSpring;
  #transformBoop;

  constructor(svg) {
    this.svg = svg;
    this.#checkPath = this.svg.querySelector("path[d^='m9 14']");
    this.defaultStroke = this.svg.getAttribute("stroke") || "currentColor";
    this.successStroke = "var(--color-fg-success)";

    this.#checkSpring = new SpringGroup(CHECK_FRAMES.hidden, SPRINGS.quick);
    this.#checkSpring.onUpdate(values => {
      this.#checkPath.setAttribute("stroke-opacity", +values.strokeOpacity.toFixed(2));
    });

    const transformSpring = new SpringGroup(TRANSFORM_FRAMES.hidden, SPRINGS.springy);
    this.#transformBoop = new SpringBoop(transformSpring, TRANSFORM_FRAMES.visible);
    this.#transformBoop.onUpdate(values => {
      this.svg.style.transform = `rotate(${values.rotate}deg) scale(${+values.scale})`;
    });
  }

  showCheck() {
    this.#transformBoop.trigger({ duration: 150 });

    this.svg.setAttribute("stroke", this.successStroke);
    this.#checkSpring.setTarget(CHECK_FRAMES.visible);
  }

  resetCheck() {
    this.svg.setAttribute("stroke", this.defaultStroke);
    this.#checkSpring.setTarget(CHECK_FRAMES.hidden);
  }
}
