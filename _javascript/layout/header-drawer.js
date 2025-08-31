import HamburgerMorph from "./../animations/hamburger-morph";
import { COLOR_SWAP_TRANSITION } from "./../constants/motion";

export default class HeaderDrawer {
  static drawer = document.getElementById("header-drawer");
  static toggleButton = document.querySelector(".toggle-menu");
  static animationFrames = [
    { opacity: 0, transform: "translateX(25%)" },
    { opacity: 1, transform: "translateX(0)" }
  ];
  static focusableElements = null;
  static animation = null;
  static isOpen = false;
  static lastFocused = null;

  static openDrawer() {
    this.isOpen = true;
    this.lastFocused = document.activeElement;
    document.documentElement.setAttribute("data-drawer", "open");
    this.toggleButton?.setAttribute("aria-expanded", "true");

    this.animation.playbackRate = 1;
    this.animation.play();
    this.animateNavItemsIn();

    // Focus first link in drawer
    this.focusableElements[0]?.focus();
  }

  static closeDrawer(restoreFocus = true) {
    if (!this.drawer || !this.animation) return;
    this.isOpen = false;
    document.documentElement.setAttribute("data-drawer", "close");
    this.toggleButton?.setAttribute("aria-expanded", "false");

    this.animation.reverse();

    this.animateNavItemsOut();

    // Restore focus to toggle button
    if (restoreFocus) this.lastFocused?.focus();
  }

  static toggleDrawer() {
    this.isOpen ? this.closeDrawer() : this.openDrawer();
  }

  static trapFocus(e) {
    const first = this.focusableElements[0];
    const last = this.focusableElements[this.focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  static animateNavItemsIn() {
    const items = this.drawer.querySelectorAll(".nav-item");

    items.forEach((item, index) => {
      item.animate(
        [
          { transform: "translateX(20px)" },
          { transform: "translateX(0)" }
        ],
        {
          duration: 350,
          delay: index * 500,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "forwards"
        }
      );
    });
  }

  static animateNavItemsOut() {
    const items = this.drawer.querySelectorAll(".nav-item");

    items.forEach((item, index) => {
      item.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(20px)" }
        ],
        {
          duration: 250,
          delay: index * 50,
          easing: "cubic-bezier(0.7, 0, 0.84, 0)",
          fill: "forwards"
        }
      );
    });
  }

  static handleResize = () => {
    if (window.innerWidth >= 768 && this.isOpen) this.closeDrawer(false);
  }

  static initialize() {
    document.documentElement.setAttribute("data-drawer", "close");
    if (!this.toggleButton || !this.drawer) return;

    this.focusableElements = Array.from(
      this.drawer.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])")
    );

    this.hamburger = new HamburgerMorph(this.toggleButton);
    this.animation = this.drawer.animate(this.animationFrames, COLOR_SWAP_TRANSITION);
    this.animation.pause();
    this.animation.currentTime = 0;

    // Toggle
    this.toggleButton.addEventListener("click", () => this.toggleDrawer());

    // Keyboard close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) this.closeDrawer();
      if (e.key === "Tab" && this.isOpen) this.trapFocus(e);
    });

    // Auto-close drawer on resize ≥768px
    window.addEventListener("resize", this.handleResize);
  }
}
