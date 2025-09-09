import SpringGroup from "./../utils/animations/spring-group";
import SpringBoop from "./../utils/animations/spring-boop";
import { toTransformString } from "./../utils/transform-utils";

// Hover/finger-triggered CSS transform boop
export default class TransformBoop {
  constructor(selector, boopValues = {}, { tension = 170, friction = 26, mass = 1, clamp = false, triggerOnParent = true } = {}) {
    this.springConfig = { tension, friction, mass, clamp };
    this.boopValues = boopValues;
    this.triggerOnParent = triggerOnParent;

    document.querySelectorAll(selector).forEach(el => this._setup(el));
  }

  _setup(el) {
    // Each element needs its own animation state
    el.style.transform = toTransformString({}, { svg: false });

    // Rest state for THIS element
    const rest = Object.fromEntries(
      Object.keys(this.boopValues).map(k =>
        k.toLowerCase().includes("scale") ? [k, 1] : [k, 0]
      )
    );

    // Animator for THIS element
    const animator = new SpringGroup(rest, this.springConfig);

    // Wrap with SpringBoop
    const springBoop = new SpringBoop(animator, this.boopValues);

    // Bind updates only to THIS element
    springBoop.onUpdate(vals => {
      el.style.transform = toTransformString(vals, { svg: false });
    });

    // Store boop instance on element so each is isolated
    el._boopAdapter = springBoop;

    const target = this.triggerOnParent && el.parentElement ? el.parentElement : el;

    const trigger = () => springBoop.trigger(150);

    target.addEventListener("mouseenter", trigger);
    target.addEventListener("touchstart", trigger, { passive: true });
  }

  static initialize(selector, boopValues = {}, springConfig = {}) {
    new TransformBoop(selector, boopValues, springConfig);
  }
}
