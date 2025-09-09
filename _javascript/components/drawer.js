export default class Drawer {
  static drawer = document.getElementById("header-drawer");
  static toggleButton = document.querySelector(".toggle-menu");
  static focusableElements = [];
  static isOpen = false;
  static lastFocused = null;
  static animationController = null;

  static init(animationController = null) {
    document.documentElement.setAttribute("data-drawer", "close");
    if (!this.toggleButton || !this.drawer) return;

    this.animationController = animationController;

    this.focusableElements = Array.from(
      this.drawer.querySelectorAll(
        "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"
      )
    );

    this.drawer.addEventListener("click", (e) => {
      const target = e.target.closest("a[href]");
      if (target) {
        this.closeDrawer(false); // don’t restore focus because page will navigate
      }
    });

    // Toggle click
    this.toggleButton.addEventListener("click", () => this.toggleDrawer());

    // Keyboard handling
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) this.closeDrawer();
      if (e.key === "Tab" && this.isOpen) this.trapFocus(e);
    });

    // Outside click handling
    document.addEventListener("click", this.handleOutsideClick);

    // Auto-close drawer on resize ≥768px
    window.addEventListener("resize", this.handleResize);
  }

  static openDrawer() {
    this.isOpen = true;
    this.lastFocused = document.activeElement;

    document.documentElement.setAttribute("data-drawer", "open");
    this.toggleButton?.setAttribute("aria-expanded", "true");

    this.focusableElements[0]?.focus();
  }

  static closeDrawer(restoreFocus = true) {
    if (!this.drawer) return;
    this.isOpen = false;

    document.documentElement.setAttribute("data-drawer", "close");
    this.toggleButton?.setAttribute("aria-expanded", "false");

    if (restoreFocus) this.lastFocused?.focus();
  }

  static toggleDrawer() {
    this.isOpen ? this.closeDrawer() : this.openDrawer();
  }

  static handleOutsideClick = (e) => {
    if (!this.isOpen) return;

    // If click is inside drawer OR toggle button → ignore
    if (this.drawer.contains(e.target) || this.toggleButton.contains(e.target)) {
      return;
    }

    // Otherwise → close drawer
    this.closeDrawer();
  };

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

  static handleResize = () => {
    if (window.innerWidth >= 768 && this.isOpen) this.closeDrawer(false);
  };
}
