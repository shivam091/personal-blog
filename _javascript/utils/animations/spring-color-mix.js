import Spring from "./spring";
import { parseHSL, mixHue, lerp, hslColorMix, mixHsl } from "./../interpolators";

/**
 * SpringColorMix smoothly animates between two colors using Springs per H/S/L/A channel
 * and proper hue interpolation with mixHue / hslColorMix.
 */
export default class SpringColorMix {
  constructor(from, config = {}) {
    // Parse initial color into H, S, L, A
    const [h, s, l, a = 1] = parseHSL(from);
    this.from = { h, s, l, a };
    this.to = { h, s, l, a };

    // Create a Spring per channel
    this.h = new Spring(h, config);
    this.s = new Spring(s, config);
    this.l = new Spring(l, config);
    this.a = new Spring(a, config);

    this._raf = null;
    this._onUpdate = null;
  }

  /**
   * Subscribe to color updates
   */
  onUpdate(fn, { immediate = false } = {}) {
    this._onUpdate = fn;
    if (immediate) fn(this.getColor());
    return this;
  }

  /**
   * Set a new color target
   */
  setTarget(to) {
    const [h, s, l, a = 1] = parseHSL(to);
    this.to = { h, s, l, a };

    this.h.setTarget(h);
    this.s.setTarget(s);
    this.l.setTarget(l);
    this.a.setTarget(a);

    this.start();
  }

  /**
   * Starts the spring-based color animation
   */
  start() {
    cancelAnimationFrame(this._raf);

    const step = () => {
      const settled =
        this.h.step() &
        this.s.step() &
        this.l.step() &
        this.a.step();

      // Compute interpolated color using hue-aware mix
      const color = hslColorMix(
        `hsla(${this.h.value} ${this.s.value}% ${this.l.value}% / ${this.a.value})`,
        `hsla(${this.to.h} ${this.to.s}% ${this.to.l}% / ${this.to.a})`,
        1
      );

      if (this._onUpdate) this._onUpdate(color);

      if (!settled) {
        this._raf = requestAnimationFrame(step);
      }
    };

    this._raf = requestAnimationFrame(step);
  }

  /**
   * Stop animation immediately
   */
  stop() {
    cancelAnimationFrame(this._raf);
  }

  /**
   * Get current interpolated color (HSLA string)
   */
  getColor() {
    return `hsla(${this.h.value.toFixed(1)} ${this.s.value.toFixed(1)}% ${this.l.value.toFixed(1)}% / ${this.a.value.toFixed(3)})`;
  }
}
