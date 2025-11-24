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

    // 3. Folding (NOW this.ast is ready)
    const foldRegions = this.getFoldRegions(this.ast);

    // 4. Highlighting
    this.highlighted = this._highlighter(this.src, this.tokens);

    return {
      tokens: this.tokens,
      ast: this.ast,
      errors: this.errors,
      highlighted: this.highlighted,
      foldRegions: foldRegions
    };
  }

  getFoldRegions(ast) {
    const folds = [];
    if (ast && ast.children) {
      for (const node of ast.children) {
        folds.push(...this._findFolds(node));
      }
    }
    return folds;
  }

  _findFolds(node) {
    const folds = [];

    if (node.type === 'Element') {
      const startLine = indexToLine(node.start, this.lineStarts);
      // We look for the line of the '>' symbol that closes the element.
      const endLine = indexToLine(node.end, this.lineStarts);

      // A foldable region exists if the element spans more than one line.
      if (endLine > startLine) {
        // Fold starts on the line of the opening tag.
        // Fold ends on the line *before* the closing tag line.
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
    // You can add logic for other foldable structures here (e.g., multiline comments)

    return folds;
  }
}

/**
 * Pre-calculates line starting positions for fast index-to-line conversion.
 * @param {string} src The full source code string.
 * @returns {number[]} An array where each element is the index of the start of that line.
 */
function getLineStarts(src) {
  const lineStarts = [0]; // Line 1 starts at index 0
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '\n') {
      lineStarts.push(i + 1);
    }
  }
  return lineStarts;
}

/**
 * Converts a character index to a 1-based line number.
 * @param {number} index Character index.
 * @param {number[]} lineStarts Array of line starting indices.
 * @returns {number} The 1-based line number.
 */
function indexToLine(index, lineStarts) {
  let low = 0;
  let high = lineStarts.length - 1;
  let result = 1; // Default to line 1

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (lineStarts[mid] <= index) {
      result = mid + 1;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return result;
}