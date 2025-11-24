import { factories } from "./factory";
import { getLineStarts, indexToLine } from "./utils";
import { highlightFromTokens } from "./highlighter";

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
    if (!pipeline) throw new Error("Unsupported fileType: " + this.fileType);

    // Keep references to the factory functions/tools for the full pipeline
    this._createLexer = pipeline.createLexer;
    this._createParser = pipeline.createParser;

    this.lexer = null;
    this.parser = null;
    this.tokens = [];

    this.ast = null;
    this.errors = [];
    this.highlighted = "";

    this.lineStarts = [];
  }

  run(src = null) {
    if (src !== null) this.src = src;

    this.lineStarts = getLineStarts(this.src);

    // 1. Lexing
    this.lexer = this._createLexer(this.src);
    this.tokens = this.lexer.run();

    // 2. Parsing
    this.parser = this._createParser(this.tokens);
    this.ast = this.parser.run();
    this.errors = this.parser.errors;

    // 3. Folding (This is now redundant if Editor calls the structural parser,
    // but kept for backward compatibility if the full pipeline is used)
    const foldRegions = this.getFoldRegions(this.ast);

    // 4. Highlighting
    this.highlighted = highlightFromTokens(this.src, this.tokens);

    return {
      tokens: this.tokens,
      ast: this.ast,
      errors: this.errors,
      highlighted: this.highlighted,
      foldRegions: foldRegions
    };
  }

  /**
   * NEW: Runs a specialized, fast structural parser to generate fold regions.
   * This is decoupled from the main AST generation for performance.
   * @param {string} src The full source code string.
   * @returns {Array} List of fold regions {startLine, endLine}.
   */
  runStructuralFoldParser(src) {
    const foldPipeline = factories[`${this.fileType}_fold`];
    if (!foldPipeline) {
      console.warn(`No dedicated fold parser configured for ${this.fileType}. Falling back to full AST.`);
      return this.getFoldRegions(this.run(src).ast);
    }

    // 1. Lexing (Fold-specific)
    const lexer = foldPipeline.createLexer(src);
    const tokens = lexer.run();

    // 2. Parsing (Fold-specific)
    const parser = foldPipeline.createParser(tokens);
    const ast = parser.run();

    this.lineStarts = getLineStarts(src); // Ensure line starts are up-to-date

    // 3. Extraction
    return this.getFoldRegions(ast);
  }

  getFoldRegions(ast) {
    const folds = [];
    // Only process AST if it exists and has children (like the Document node)
    if (ast && ast.children) {
      for (const node of ast.children) {
        folds.push(...this._findFolds(node));
      }
    }
    return folds;
  }

  _findFolds(node) {
    const folds = [];

    // Check for any structural node type: Element (HTML Tag), Comment (All), Block (CSS/JS Braces)
    if (node.type === "Element" || node.type === "Comment" || node.type === "Block") {
      const startLine = indexToLine(node.start, this.lineStarts);
      const endLine = indexToLine(node.end, this.lineStarts);

      // A foldable region exists if the element spans more than one line.
      if (endLine > startLine) {
        // Fold starts on the line of the opening token.
        // Fold ends on the line *before* the closing token line (endLine - 1).
        folds.push({
          startLine: startLine, // 1-based line number (inclusive)
          endLine: endLine - 1 // 1-based line number (inclusive)
        });
      }

      // Recurse into children
      if (node.children) {
        for (const child of node.children) {
          folds.push(...this._findFolds(child));
        }
      }
    }

    return folds;
  }
}
