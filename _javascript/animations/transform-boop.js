import SpringGroup from "./../utils/animations/spring-group";
import SpringBoop from "./../utils/animations/spring-boop";
import { toTransformString } from "./../utils/transform-utils";
import { resolveDelays } from "../utils/animations/helpers/resolve-delay";
import { SPRINGS } from "../constants/springs";
import useTouch from "../hooks/use-touch";

// Hover/finger-triggered CSS transform boop
export default class TransformBoop {
  constructor(selector, boopValues = {}, {
    tension = SPRINGS.tight.tension,
    friction = SPRINGS.tight.friction,
    mass = 1,
    clamp = false,
    dt = 1 / 60, // default base simulation step (~16.67ms)
    maxDt = 1 / 30, // clamp for stability (~33ms)
    integrator = "verlet",
    triggerOnParent = true,
    delay = 0,
    transformOrigin = "50% 50%"
  } = {}) {
    this.isTouch = useTouch();
    this.springConfig = { tension, friction, mass, clamp, dt, maxDt, integrator };
    this.boopValues = boopValues;
    this.triggerOnParent = triggerOnParent;
    this.delay = delay;
    this.transformOrigin = transformOrigin;

    document.querySelectorAll(selector).forEach(el => this._setup(el));
  }

  _setup(el) {
    // Each element needs its own animation state
    el.style.transform = toTransformString({});
    el.style.transformOrigin = this.transformOrigin;

    const boopValKeys = Object.keys(this.boopValues);

    // Rest state for THIS element
    const rest = Object.fromEntries(
      boopValKeys.map(k =>
        k.toLowerCase().includes("scale") ? [k, 1] : [k, 0]
      )
    );

    // Animator for THIS element
    const animator = new SpringGroup(rest, this.springConfig);

    // Wrap with SpringBoop
    const springBoop = new SpringBoop(animator, this.boopValues);

    // Bind updates only to THIS element
    springBoop.onUpdate(vals => {
      el.style.transform = toTransformString(vals);
      el.style.transformOrigin = this.transformOrigin;
    });

    const target = this.triggerOnParent && el.parentElement ? el.parentElement : el;

    const delays = resolveDelays(boopValKeys.length, this.delay, boopValKeys)[0];

    const trigger = () => springBoop.trigger({ duration: 150, delay: delays });

    target.addEventListener("mouseenter", trigger);
    if (this.isTouch) {
      target.addEventListener("touchstart", trigger, { passive: true });
    }
  }

  static initialize(selector, boopValues = {}, springConfig = {}) {
    new TransformBoop(selector, boopValues, springConfig);
  }
}
