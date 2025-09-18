import { MOTION_DURATIONS, MOTION_EASING_CURVES } from "./../constants/motion";

export default class DetailsAnimator {
  constructor(details) {
    this.details = details;
    this.content = this.details.querySelector(".content");
    if (!this.content) return;

    // Create single animation instance for enter/exit
    this.animation = this.content.animate(
      [
        { transform: "translateY(-15px)", opacity: 0 },
        { transform: "translateY(0)", opacity: 1 }
      ],
      { duration: MOTION_DURATIONS.medium, easing: MOTION_EASING_CURVES.entrance, fill: "forwards" }
    );

    this.animation.pause();
    if (!this.details.open) this.animation.currentTime = 0;

    this.#bindEvents();
  }

  open() {
    this.animation.playbackRate = 1;
    this.animation.play();
  }

  close() {
    this.animation.reverse();
  }

  #bindEvents() {
    this.details.addEventListener("toggle", () => {
      this.details.open ? this.open() : this.close();
    });
  }
}
