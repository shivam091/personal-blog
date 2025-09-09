import SpringBoop from "./../../spring-boop";
import TextMorph from "./morph";

// Adds boop interactions to <text> elements
export default class TextMorphBoop extends SpringBoop {
  constructor(texts, boopValues = [], springConfig = {}) {
    const morph = new TextMorph(texts, springConfig);
    super(morph, boopValues, "spread");
  }
}
