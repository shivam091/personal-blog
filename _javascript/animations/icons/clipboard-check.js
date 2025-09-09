import SpringGroup from "./../../utils/animations/spring-group";
import SpringBoop from "./../../utils/animations/spring-boop";
import { SPRINGS } from "./../../constants/springs";

export default class IconClipboardCheck {
  #checkPath;
  #checkSpring;
  #transformBoop;

  constructor(svg) {
    this.svg = svg;
    this.#checkPath = this.svg.querySelector("path[d^='m9 14']");
    this.defaultStroke = this.svg.getAttribute("stroke") || "currentColor";
    this.successStroke = "var(--color-fg-success)";
    this.checkFrames = {
      hidden: { strokeOpacity: 0 },
      visible: { strokeOpacity: 1 }
    };
    this.transformFrames = {
      hidden: { rotate: 0, scale: 1 },
      visible: { rotate: 10, scale: 1.1 }
    };

    this.#checkSpring = new SpringGroup(this.checkFrames.hidden, SPRINGS.molasses);
    this.#checkSpring.onUpdate(values => {
      this.#checkPath.setAttribute("stroke-opacity", +values.strokeOpacity.toFixed(2));
    });

    const transformSpring = new SpringGroup(this.transformFrames.hidden, SPRINGS.springy);
    this.#transformBoop = new SpringBoop(transformSpring, this.transformFrames.visible);
    this.#transformBoop.onUpdate(values => {
      this.svg.style.transform = `rotate(${values.rotate}deg) scale(${+values.scale})`;
    });
  }

  showCheck() {
    this.#transformBoop.trigger(150);

    this.svg.setAttribute("stroke", this.successStroke);
    this.#checkSpring.setTarget(this.checkFrames.visible);
  }

  resetCheck() {
    this.svg.setAttribute("stroke", this.defaultStroke);
    this.#checkSpring.setTarget(this.checkFrames.hidden);
  }
}
