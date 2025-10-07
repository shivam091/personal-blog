import { BaseAdapter } from "./base";

// Adapter for animating <use> attributes with springs
export const UseAdapter = new BaseAdapter([
  "x", "y", "width", "height", "transform", "opacity", "fill-opacity", "stroke-opacity"
]);
