import SpringMorph from "../../spring-morph";

// Morphs <use> elements using spring physics
export default class UseMorph extends SpringMorph {
  constructor(uses, springConfigs = {}) {
    super(uses, springConfigs);
  }
}
