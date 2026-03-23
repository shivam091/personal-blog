export default class HeaderGlassEffect {
  static observerTrigger = null;
  static observerSky = null;
  static isScrolling = false;

  static siteHeader = document.querySelector(".site-header");
  static glassTrigger = document.querySelector("[data-glass-trigger]");
  static skyContainer = document.querySelector("[data-cloud-shapes]");

  static updateGlassEffect() {
    if (!this.glassTrigger || !this.siteHeader) return;

    const triggerTop = this.glassTrigger.getBoundingClientRect().top;
    const distanceScrolled = Math.max(0, -triggerTop);
    const maxDistance = 100;

    const progress = Math.min(1, distanceScrolled / maxDistance);
    const opacity = (0.7 * progress).toFixed(2);
    const blur = (4 * progress).toFixed(1) + "px";

    this.siteHeader.style.setProperty("--glass-opacity", opacity);
    this.siteHeader.style.setProperty("--blur-amount", blur);
    this.siteHeader.classList.toggle("glassy-backdrop", progress > 0);
  }

  static updateGlassEffectBound = this.updateGlassEffect.bind(this);

  static startTrackingScroll() {
    if (!this.isScrolling) {
      window.addEventListener("scroll", this.updateGlassEffectBound, { passive: true });
      this.isScrolling = true;
    }
    this.updateGlassEffect();
  }

  static stopTrackingScroll() {
    if (this.isScrolling) {
      window.removeEventListener("scroll", this.updateGlassEffectBound);
      this.isScrolling = false;
    }

    if (!this.siteHeader) return;

    this.siteHeader.style.setProperty("--glass-opacity", "0");
    this.siteHeader.style.setProperty("--blur-amount", "0px");
    this.siteHeader.classList.remove("glassy-backdrop");
    this.siteHeader.removeAttribute("data-is-over-threshold");
  }

  static initialize() {
    if (!this.siteHeader || !this.glassTrigger || !this.skyContainer) return;

    // 1. Manage Glass Effect State
    this.observerTrigger = new IntersectionObserver(
      ([entry]) => {
        entry.isIntersecting ? this.stopTrackingScroll() : this.startTrackingScroll();
      },
      { threshold: 0.98 }
    );
    this.observerTrigger.observe(this.glassTrigger);

    // 2. Manage "Past Sky" Threshold
    this.observerSky = new IntersectionObserver(
      ([entry]) => {
        const isPastSky = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        this.siteHeader.toggleAttribute("data-is-over-threshold", isPastSky);
      },
      { threshold: 0 }
    );
    this.observerSky.observe(this.skyContainer);
  }

  static destroy() {
    this.stopTrackingScroll();
    this.observerTrigger?.disconnect();
    this.observerSky?.disconnect();
    this.observerTrigger = null;
    this.observerSky = null;
  }
}
