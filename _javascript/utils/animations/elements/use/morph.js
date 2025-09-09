import SpringMorph from "../../spring-morph";

// Morphs <use> elements using spring physics
export default class UseMorph extends SpringMorph {
  constructor(uses, springConfig = {}) {
    super(uses, springConfig);
  }
}
