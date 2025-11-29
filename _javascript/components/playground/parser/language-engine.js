import { factories } from "./factory";
import { FoldAnalyzer } from "./fold-analyzer";
import { Highlighter } from "./highlighter";
import { getLineStarts } from "./utils";

/*
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
    if (!pipeline) throw new Error("Unsupported fileType: " + this.fileType);

    // Keep references to the factory functions/tools for the full pipeline
    this._createLexer = pipeline.createLexer;
    this._createParser = pipeline.createParser;
    this.highlighter = new Highlighter();

    this.lexer = null;
    this.parser = null;
    this.ast = null;

    this.tokens = [];
    this.errors = [];
    this.highlightedLines = [];

    // Pre-calculate line starts for fast position lookup
    this.lineStarts = getLineStarts(this.src);

    // Analyze all folds
    this.foldAnalyzer = new FoldAnalyzer(this.lineStarts);
  }

  // Executes the full language analysis pipeline (Lexing, Parsing, Folding, Highlighting).
  run(src = this.src) {
    if (src !== this.src) {
      this.src = src;
      this.lineStarts = getLineStarts(this.src);
      this.foldAnalyzer = new FoldAnalyzer(this.lineStarts);
    }

    // 1. Lexing
    this.lexer = this._createLexer(this.src);
    this.tokens = this.lexer.run();

    // 2. Parsing
    this.parser = this._createParser(this.tokens);
    this.ast = this.parser.run();

    // 3. Combine Lexer errors and Parser errors.
    this.errors = [...this.lexer.errors, ...this.parser.errors];

    // 4. Folding
    const foldRegions = this.foldAnalyzer.getFoldRegions(this.ast);

    // 5. Highlighting
    this.highlightedLines = this.highlighter.highlight(this.src, this.tokens);

    return {
      ast: this.ast,
      tokens: this.tokens,
      highlightedLines: this.highlightedLines,
      foldRegions: foldRegions,
      errors: this.errors
    };
  }
}
