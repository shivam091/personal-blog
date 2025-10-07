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

    const elements = typeof selector === "string"
      ? document.querySelectorAll(selector)
      : [selector];

    elements.forEach(element => this.#setupElement(element));
  }

  // Computes neutral (rest) transform state for all boop properties
  #computeRestState() {
    return Object.fromEntries(
      Object.keys(this.boopValues).map(k =>
        k.toLowerCase().includes("scale") ? [k, 1] : [k, 0]
      )
    );
  }

  // Sets up animation behavior and event listeners for a single element
  #setupElement(element) {
    element.style.transform = toTransformString({});
    element.style.transformOrigin = this.transformOrigin;

    const boopValKeys = Object.keys(this.boopValues);
    const restVals = this.#computeRestState();

    const springGroup = new SpringGroup(restVals, this.springConfig);
    const springBoop = new SpringBoop(springGroup, this.boopValues);

    // Bind updates only to THIS element
    springBoop.onUpdate(vals => {
      element.style.transform = toTransformString(vals);
    });

    const target = this.triggerOnParent && element.parentElement ? element.parentElement : element;
    const delays = resolveDelays(boopValKeys.length, this.delay, boopValKeys)[0];

    const trigger = () => springBoop.trigger({ duration: 150, delay: delays });

    target.addEventListener("mouseenter", trigger);
    if (this.isTouch) {
      target.addEventListener("touchstart", trigger, { passive: true });
    }
  }

  static initialize(selector, boopValues = {}, springConfigs = {}) {
    new TransformBoop(selector, boopValues, springConfigs);
  }
}
