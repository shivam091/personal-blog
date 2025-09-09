import { BaseAdapter } from "./base";

// Adapter for animating <circle> attributes with springs
export const CircleAdapter = new BaseAdapter([
  "r", "cx", "cy", "transform", "opacity", "fill-opacity", "stroke-opacity"
]);
