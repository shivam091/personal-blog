import { factories } from "./factory";

/**
 * The LanguageEngine is the consumer-facing orchestrator.
 * It is initialized with a fileType and delegates all work to the
 * configured Lexer, Parser, and Highlighter.
 */
export class LanguageEngine {
  constructor(fileType, src) {
    this.fileType = fileType;
    this.src = src;

    // Resolve the pipeline configuration immediately
    const pipeline = factories[fileType];
    if (!pipeline) throw new Error('Unsupported fileType: ' + this.fileType);

    // Keep references to the factory functions/tools
    this._createLexer = pipeline.createLexer;
    this._createParser = pipeline.createParser;
    this._highlighter = pipeline.highlighter;

    this.lexer = null;
    this.parser = null;
    this.tokens = [];
    this.ast = null;
    this.errors = [];
    this.highlighted = '';
  }

  run(src = null) {
    if (src !== null) this.src = src;

    // 1. Lexing
    this.lexer = this._createLexer(this.src);
    this.tokens = this.lexer.run();

    // 2. Parsing
    this.parser = this._createParser(this.tokens);
    this.ast = this.parser.run();
    this.errors = this.parser.errors;

    // 3. Highlighting
    this.highlighted = this._highlighter(this.src, this.tokens);

    return {
      tokens: this.tokens,
      ast: this.ast,
      errors: this.errors,
      highlighted: this.highlighted
    };
  }
}