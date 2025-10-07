import SpringMorph from "../../spring-morph";

// Morphs <path> elements using spring physics
export default class PathMorph extends SpringMorph {
  constructor(paths, springConfigs = {}) {
    super(paths, springConfigs);
  }
}
