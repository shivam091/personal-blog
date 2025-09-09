import SpringMorph from "../../spring-morph";

// Morphs <rect> elements using spring physics
export default class RectMorph extends SpringMorph {
  constructor(rects, springConfigs = {}) {
    super(rects, springConfigs);
  }
}
