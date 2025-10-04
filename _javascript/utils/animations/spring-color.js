import Spring from "./spring";
import { parseColor, hslToCss } from "./../interpolators";

/**
 * Uses multiple numeric Springs to animate between two colors (HSL or HSLA).
 * Fully reuses Spring physics for each channel.
 */
export default class SpringColor {
  constructor(from, config = {}) {
    this.from = parseColor(from);

    // Create independent springs per color channel
    this.h = new Spring(this.from.h, config);
    this.s = new Spring(this.from.s, config);
    this.l = new Spring(this.from.l, config);

    // Optional alpha
    if (this.from.a !== undefined) {
      this.a = new Spring(this.from.a ?? 1, config);
    }

    this._raf = null;
    this._onUpdate = null;
  }

  onUpdate(fn, { immediate = false } = {}) {
    this._onUpdate = fn;
    if (immediate) fn(this.getColor());
    return this;
  }

  setTarget(to) {
    this.to = parseColor(to);

    this.h.setTarget(this.to.h);
    this.s.setTarget(this.to.s);
    this.l.setTarget(this.to.l);
    if (this.a) this.a.setTarget(this.to.a ?? 1);

    this.start();
  }

  start() {
    const step = () => {
      const settled =
        this.h.step() &
        this.s.step() &
        this.l.step() &
        (this.a ? this.a.step() : 1);

      if (this._onUpdate) this._onUpdate(this.getColor());

      if (!settled) {
        this._raf = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(this._raf);
      }
    };

    cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(step);
  }

  stop() {
    cancelAnimationFrame(this._raf);
  }

  getColor() {
    const color = {
      h: this.h.value,
      s: this.s.value,
      l: this.l.value,
    };
    if (this.a) color.a = this.a.value;
    return hslToCss(color);
  }
}