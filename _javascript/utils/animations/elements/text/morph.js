import SpringMorph from "./../../spring-morph";

// Morphs <text> elements using spring physics
export default class TextMorph extends SpringMorph {
  constructor(texts, springConfigs = {}) {
    super(texts, springConfigs);
  }
}
