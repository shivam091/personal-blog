import { LanguageHighlighters } from "./languages";

/**
 * Acts as a factory to return the correct, specialized highlighter instance.
 * It uses a Map to cache instances for efficiency.
 */
export default class Highlighter {
  static #instances = new Map();

  constructor(fileType) {
    if (Highlighter.#instances.has(fileType)) {
      return Highlighter.#instances.get(fileType);
    }

    const HighlighterClass = LanguageHighlighters[fileType] || LanguageHighlighters.js;
    const instance = new HighlighterClass(fileType); // Pass fileType to BaseHighlighter

    // The constructor is designed to return the instance for factory pattern usage
    Highlighter.#instances.set(fileType, instance);
    return instance;
  }
}