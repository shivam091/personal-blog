import SpringMorph from "../../spring-morph";

// Morphs <line> elements using spring physics
export default class LineMorph extends SpringMorph {
  constructor(lines, springConfig = {}) {
    super(lines, springConfig);
  }
}
