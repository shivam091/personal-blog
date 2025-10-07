import { COLOR_SWAP_TRANSITION } from "./../constants/motion";

export default class DrawerAnimation {
  constructor(drawerEl) {
    this.root = document.documentElement;
    this.drawer = drawerEl;

    this.frames = [
      { opacity: 0, transform: "translateX(25%)" },
      { opacity: 1, transform: "translateX(0)" },
    ];

    this.animation = this.drawer.animate(this.frames, COLOR_SWAP_TRANSITION);
    this.animation.pause();

    this.initialized = false;

    // Observe only data-drawer attribute
    this.observer = new MutationObserver(() => {
      const state = this.root.getAttribute("data-drawer");

      if (!this.initialized) {
        // Initial sync without animation
        if (state === "open") {
          this.animation.finish(); // Drawer fully visible
        } else {
          this.animation.cancel();  // Drawer hidden
          this.animation.currentTime = 0;
        }
        this.initialized = true;
        return;
      }

      // Animate normally after initialization
      state === "open" ? this.#play() : this.#reverse();
    });

    this.observer.observe(this.root, {
      attributes: true,
      attributeFilter: ["data-drawer"]
    });
  }

  #play() {
    if (this.animation.playState === "running" && this.animation.playbackRate > 0) return;
    this.animation.playbackRate = 1;
    this.animation.play();
  }

  #reverse() {
    if (this.animation.playState === "running" && this.animation.playbackRate < 0) return;
    this.animation.reverse();
  }
}
