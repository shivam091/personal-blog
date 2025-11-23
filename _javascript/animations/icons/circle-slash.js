import useTouch from "../../hooks/use-touch";

export default class IconCircleSlash {
  constructor(svg) {
    this.svg = svg;
    if (!this.svg) return;

    this.rotation = 0;
    this.isHovering = false;
    this.isTouch = useTouch();

    this.#setDefaults();
    this.#bindEvents();
  }

  #setDefaults() {
    this.svg.style.transition = "transform 0.8s cubic-bezier(0.17, 0.67, 0.36, 1.04), opacity 0.25s";
    this.svg.style.transformOrigin = "center center";
    this.svg.style.opacity = 0.7;
  }

  #bindEvents() {
    const target = this.svg.parentElement;

    if (this.isTouch) {
      target.addEventListener("touchstart", () => this.#handleEnter(), { passive: true });
      target.addEventListener("touchend", () => {
        this.#handleClick();
        this.#handleLeave();
      }, { passive: true });
    } else {
      target.addEventListener("click", () => this.#handleClick());
      target.addEventListener("mouseenter", () => this.#handleEnter());
      target.addEventListener("mouseleave", () => this.#handleLeave());
    }

  }

  #handleClick() {
    this.rotation += 180;
    this.svg.style.transform = `rotate(${this.rotation}deg)`;
  }

  #handleEnter() {
    this.isHovering = true;
    this.svg.style.opacity = 1;
  }

  #handleLeave() {
    this.isHovering = false;
    this.svg.style.opacity = 0.7;
  }

  static initialize() {
    document.querySelectorAll(".icon-circle-slash").forEach(icon => new IconCircleSlash(icon));
  }
}
