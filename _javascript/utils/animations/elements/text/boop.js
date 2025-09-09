import SpringBoop from "./../../spring-boop";
import TextMorph from "./morph";

// Adds boop interactions to <text> elements
export default class TextMorphBoop extends SpringBoop {
  constructor(texts, boopValues = [], springConfigs = {}) {
    const morph = new TextMorph(texts, springConfigs);
    super(morph, boopValues, "spread", springConfigs);
  }
}
