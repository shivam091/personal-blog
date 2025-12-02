import { indexToLine } from "./utils";

const STRUCTURAL_NODES = ["Element", "Comment", "Block", "Parentheses", "Brackets", "FunctionCall", "TemplateLiteral", "AtRule"];

/*
 * Analyzes a given AST to identify structural regions (like comments, blocks,
 * or elements) that span multiple lines, converting their byte indices (start/end)
 * into 1-based line numbers suitable for editor display.
 */
export class FoldAnalyzer {
  constructor(lineStarts) {
    this.lineStarts = lineStarts;
  }

  /**
   * Main entry point. Traverses the AST and collects all foldable regions.
   * @param {object} ast The root node of the Abstract Syntax Tree.
   * @returns {Array<{startLine: number, endLine: number}>} List of fold regions.
   */
  getFoldRegions(ast) {
    const folds = [];

    // Only process AST if it exists and has children (like the Document node)
    if (ast?.children) {
      for (const node of ast.children) {
        folds.push(...this.#findFolds(node));
      }
    }

    return folds;
  }

  /**
   * Recursive helper method to find folds within a single node and its children.
   * @param {object} node The current AST node to check.
   * @returns {Array<{startLine: number, endLine: number}>} Folds found in this branch.
   */
  #findFolds(node) {
    const folds = [];

    // 1. Check if the node type is foldable
    if (STRUCTURAL_NODES.includes(node.type)) {
      // Convert byte indices to 1-based line numbers.
      const startLine = indexToLine(node.start, this.lineStarts);
      const endLine = indexToLine(node.end, this.lineStarts);

      // 2. A foldable region must span at least two lines.
      if (endLine > startLine) {
        // Current structural nodes (Block, Element, Comment, Parentheses, Brackets)
        // are set up to hide the content up to the line *before* the closing delimiter's line.
        const foldEndLine = endLine - 1;

        // 3. Only create a fold if the region actually spans multiple lines of content.
        if (foldEndLine > startLine) {
          folds.push({
            startLine: startLine, // The line with the opening token (inclusive)
            endLine: foldEndLine  // The last line of content to be hidden (inclusive)
          });
        }
      }

      // 4. Recurse into children (handles missing or empty arrays gracefully)
      if (node.children) {
        for (const child of node.children) {
          folds.push(...this.#findFolds(child));
        }
      }
    }

    return folds;
  }
}
