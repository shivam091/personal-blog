import SpringMorph from "./../../spring-morph";

// Morphs <tspan> elements using spring physics
export default class TspanMorph extends SpringMorph {
  constructor(tspans, springConfig = {}) {
    super(tspans, springConfig);
  }
}
