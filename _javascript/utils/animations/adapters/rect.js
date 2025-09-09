import { BaseAdapter } from "./base";

// Adapter for animating <rect> attributes with springs
export const RectAdapter = new BaseAdapter([
  "x", "y", "rx", "ry", "width", "height", "transform", "opacity", "fill-opacity", "stroke-opacity"
]);
