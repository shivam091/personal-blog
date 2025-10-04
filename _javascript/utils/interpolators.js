/**
 * Restricts a number to remain within min and max bounds
 *
 * @param {number} value - The number to clamp.
 * @param {number} min - The lower bound of the range.
 * @param {number} max - The upper bound of the range.
 * @returns {number} The clamped value.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between startValue and endValue based on factor t
 * @param {number} startValue - The starting value (when t = 0).
 * @param {number} endValue - The ending value (when t = 1).
 * @param {number} t - Interpolation factor (0 to 1, can go beyond for extrapolation).
 * @returns {number} Interpolated value between startValue and endValue.
 */
export function lerp(startValue, endValue, t) {
  return startValue + (endValue - startValue) * t;
}

// Parse HSL/HSLA string into components
export function parseHSL(str) {
  // hsl(h s% l%) OR hsla(h s% l% / a)
  const match = str.match(/hsla?\(([^)]+)\)/i);
  if (!match) throw new Error(`Invalid HSL/HSLA color: ${str}`);

  // Split values by space or comma, handle optional alpha
  const parts = match[1].replace(/,/g, " ").split(/\s+/).filter(Boolean);

  let h = parseFloat(parts[0]);
  let s = parseFloat(parts[1]);
  let l = parseFloat(parts[2]);
  let a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;

  return [h, s, l, a];
}

// Interpolate hue correctly (shortest arc)
export function mixHue(h1, h2, t) {
  let dh = h2 - h1;
  if (dh > 180) dh -= 360;
  else if (dh < -180) dh += 360;
  return (h1 + dh * t + 360) % 360;
}

// HSL interpolation
export function hslColorMix(a, b, t) {
  const [h1, s1, l1] = parseHSL(a);
  const [h2, s2, l2] = parseHSL(b);

  const h = mixHue(h1, h2, t);
  const s = lerp(s1, s2, t);
  const l = lerp(l1, l2, t);

  return `hsl(${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}%)`;
}

// HSLA interpolation (with alpha)
export function hslaColorMix(a, b, t) {
  const [h1, s1, l1, a1] = parseHSL(a);
  const [h2, s2, l2, a2] = parseHSL(b);

  const h = mixHue(h1, h2, t);
  const s = lerp(s1, s2, t);
  const l = lerp(l1, l2, t);
  const alpha = lerp(a1, a2, t);

  return `hsla(${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}% / ${alpha.toFixed(3)})`;
}

export function parseColor(color) {
  // Handles hsl, rgb, and hex
  if (color.startsWith("hsl")) {
    const [h, s, l] = color.match(/[\d.]+/g).map(Number);
    return { h, s, l };
  } else if (color.startsWith("rgb")) {
    const [r, g, b] = color.match(/[\d.]+/g).map(Number);
    return rgbToHsl(r, g, b);
  } else if (color.startsWith("#")) {
    const { r, g, b } = hexToRgb(color);
    return rgbToHsl(r, g, b);
  }
  throw new Error("Unsupported color format: " + color);
}

export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

export function hslToCss({ h, s, l }) {
  return `hsl(${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}%)`;
}

export function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

export function mixHsl(from, to, t) {
  // handle hue wraparound (circular interpolation)
  let h = from.h + (((to.h - from.h + 540) % 360) - 180) * t;
  let s = from.s + (to.s - from.s) * t;
  let l = from.l + (to.l - from.l) * t;
  return { h, s, l };
}
