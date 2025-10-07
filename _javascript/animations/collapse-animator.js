import { MOTION_DURATIONS, MOTION_EASING_CURVES } from "../constants/motion";

export default class CollapseAnimator {
  constructor(root) {
    this.root = root;
    this.button = root.querySelector(".collapse-toggle");
    this.content = root.querySelector(".collapse-content");
    this.opened = false;
    this.animation = null;

    this.#bindEvents();
  }

  #bindEvents() {
    this.button.addEventListener("click", () => this.toggle());
  }

  #animate({ from, to, open }) {
    if (this.animation) this.animation.cancel();

    const keyframes = [
      { transform: `translateY(${from.offset}px)`, opacity: from.opacity, height: from.height },
      { transform: `translateY(${to.offset}px)`, opacity: to.opacity, height: to.height }
    ];

    const options = {
      duration: MOTION_DURATIONS.medium,
      easing: open ? MOTION_EASING_CURVES.entrance : MOTION_EASING_CURVES.exit,
      fill: "forwards"
    };

    this.animation = this.content.animate(keyframes, options);;

    this.opened = open;
    this.root.dataset.open = open;
    this.root.dispatchEvent(new CustomEvent("collapse", { detail: { open } }));

    // Clean up once finished
    this.animation.onfinish = () => {
      this.animation = null;
      this.content.style.height = open ? "auto" : "0";
    };
  }

  toggle() {
    this.opened ? this.close() : this.open();
  }

  open() {
    this.content.style.height = this.content.scrollHeight + "px"; // ensures accurate frame
    this.#animate({
      open: true,
      from: { offset: -15, opacity: 0, height: "0px" },
      to: { offset: 0, opacity: 1, height: this.content.scrollHeight + "px" }
    });
  }

  close() {
    this.content.style.height = this.content.scrollHeight + "px";
    this.#animate({
      open: false,
      from: { offset: 0, opacity: 1, height: this.content.scrollHeight + "px" },
      to: { offset: -15, opacity: 0, height: "0px" }
    });
  }
}
