import SpringMorph from "../../spring-morph";

// Morphs <circle> elements using spring physics
export default class CircleMorph extends SpringMorph {
  constructor(circles, springConfigs = {}) {
    super(circles, springConfigs);
  }
}
