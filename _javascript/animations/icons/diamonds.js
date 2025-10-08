import SpringGroup from "../../utils/animations/spring-group";
import SpringBoop from "../../utils/animations/spring-boop";
import deepFreeze from "../../utils/deep-freeze";

const INITIAL_VALS = deepFreeze({ top: 0, left: 0, right: 0, bottom: 0 });
const BOOP_VALS = deepFreeze({ top: 3, left: 3, right: -3, bottom: -3 });

export default class IconDiamonds {
  #diamondBoop;

  constructor(svg) {
    this.svg = svg;
    [this.top, this.left, this.right, this.bottom] = this.svg.querySelectorAll("polygon");

    const springGroup = new SpringGroup(INITIAL_VALS, { tension: 350, friction: 10 });
    this.#diamondBoop = new SpringBoop(springGroup, BOOP_VALS);

    this.#diamondBoop.onUpdate(state => this.#render(state));
  }

  boop(duration = 150) {
    this.#diamondBoop.trigger({ duration });
  }

  #render(state) {
    this.top && (this.top.style.transform = `translateY(${state.top}px)`);
    this.left && (this.left.style.transform = `translateX(${state.left}px)`);
    this.right && (this.right.style.transform = `translateX(${state.right}px)`);
    this.bottom && (this.bottom.style.transform = `translateY(${state.bottom}px)`);
  }
}
