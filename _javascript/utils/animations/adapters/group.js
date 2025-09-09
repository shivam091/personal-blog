import { BaseAdapter } from "./base";

// Adapter for animating <g> attributes with springs
export const GroupAdapter = new BaseAdapter([
  "stroke-width", "transform", "opacity", "fill-opacity", "stroke-opacity"
]);