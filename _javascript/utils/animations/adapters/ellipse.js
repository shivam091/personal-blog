import { BaseAdapter } from "./base";

// Adapter for animating <ellipse> attributes with springs
export const EllipseAdapter = new BaseAdapter([
  "cx", "cy", "rx", "ry", "transform", "opacity", "fill-opacity", "stroke-opacity"
]);
