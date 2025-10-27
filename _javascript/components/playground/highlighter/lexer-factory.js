/**
 * Factory class to instantiate the correct language Lexer.
 * Returns the specialized instance directly.
 */
export class Lexer {
  constructor(fileType) {
    const LexerClass = LanguageLexers[fileType] || LanguageLexers.js; // Fallback to JsLexer
    return new LexerClass();
  }
}