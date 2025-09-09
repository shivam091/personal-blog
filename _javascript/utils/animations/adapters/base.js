import * as TransformUtils from "../../transform-utils";

export class BaseAdapter {
  // Central dictionary of SVG ↔ JS mappings
  static NAME_MAP = {
    "fill-opacity": "fillOpacity",
    "stroke-opacity": "strokeOpacity",
    "font-size": "fontSize",
    "textLength": "textLength",
    "letter-spacing": "letterSpacing",
    "stroke-width": "strokeWidth"
  };

  constructor(attributes = []) {
    // Automatically handle transforms if "transform" is in the list
    this.hasTransform = attributes.includes("transform");;

    // Map JS key → SVG attribute
    this.map = {};
    attributes.forEach(attr => {
      const jsKey = BaseAdapter.NAME_MAP[attr] || attr;
      this.map[jsKey] = attr;
    });
  }

  // Extract attributes from elements
  extractAttributes(el) {
    const attrs = {};

    for (const [jsKey, svgAttr] of Object.entries(this.map)) {
      const val = el.getAttribute(svgAttr);
      if (val !== null) {
        const num = Number(val);
        attrs[jsKey] = isNaN(num) ? val : num;
      }
    }

    if (this.hasTransform) {
      Object.assign(attrs, TransformUtils.parseTransform(el.style.transform || ""));
    }

    return attrs;
  }

  // Apply state values back to elements
  setAttributes(el, group) {
    const state = group.getState();

    // Only set attributes that exist in this.map
    for (const [jsKey, svgAttr] of Object.entries(this.map)) {
      const val = state[jsKey];
      if (val == null) continue;
      el.setAttribute(svgAttr, typeof val === "number" ? val.toFixed(2) : val);
    }

    // Compose transform string if adapter has transforms
    if (this.hasTransform) {
      const transformState = {};

      for (const key of Object.keys(TransformUtils.DEFAULT_TRANSFORMS)) {
        if (state[key] != null) transformState[key] = state[key];
      }
      if (Object.keys(transformState).length > 0) {
        el.style.transform = TransformUtils.toTransformString(transformState);
      }
    }
  }
}
