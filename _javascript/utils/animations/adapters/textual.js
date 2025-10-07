import { BaseAdapter } from "./base";

// Adapter for animating <text> and <tspan> attributes with springs
export const TextualAdapter = new BaseAdapter([
  "x", "y", "dx", "dy", "font-size", "textLength", "letter-spacing",
  "transform", "opacity", "fill-opacity", "stroke-opacity"
]);
