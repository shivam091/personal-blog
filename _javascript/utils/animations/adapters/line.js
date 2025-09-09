import { BaseAdapter } from "./base";

// Adapter for animating <line> attributes with springs
export const LineAdapter = new BaseAdapter([
  "x1", "y1", "x2", "y2", "transform", "opacity", "stroke-opacity"
]);
