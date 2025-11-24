import { FoldAnalyzer } from "./fold-analyzer";
import { Highlighter } from "./highlighter";
import { factories } from "./factory";
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
    this.pipeline = factories[fileType];
    if (!this.pipeline) throw new Error("Unsupported fileType: " + this.fileType);

    this.lexer = null;
    this.parser = null;

    this.ast = null;
    this.tokens = [];
    this.errors = [];
    this.highlightedLines = [];
    this.foldRegions = [];

    // Pre-calculate line starts for fast position lookup
    this.lineStarts = getLineStarts(this.src);

    this.highlighter = new Highlighter();

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
    this.lexer = this.pipeline.lexer(this.src);
    this.tokens = this.lexer.run();

    // 2. Parsing
    this.parser = this.pipeline.parser(this.tokens);
    this.ast = this.parser.run();

    // 3. Errors
    this.errors = [...this.lexer.errors, ...this.parser.errors];

    // 4. Folding
    this.foldRegions = this.foldAnalyzer.getFoldRegions(this.ast);

    // 5. Highlighting
    this.highlightedLines = this.highlighter.highlight(this.src, this.tokens);

    return {
      ast: this.ast,
      tokens: this.tokens,
      highlightedLines: this.highlightedLines,
      foldRegions: this.foldRegions,
      errors: this.errors
    };
  }
}
