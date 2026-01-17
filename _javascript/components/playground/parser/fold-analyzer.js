import { indexToLine } from "./utils";

const STRUCTURAL_NODES = ["Element", "Comment", "Block", "Parentheses", "Brackets"];

/*
 * Analyzes a given AST to identify structural regions (like comments, blocks,
 * or elements) that span multiple lines, converting their byte indices (start/end)
 * into 1-based line numbers suitable for editor display.
 */
export class FoldAnalyzer {
  constructor(lineStarts) {
    this.lineStarts = lineStarts;
  }

  /*
   * Helper function to assign a priority to the fold type for redundancy checking.
   * Higher priority folds are preferred when overlapping exactly with lower priority ones.
   */
  #getFoldPriority(type) {
    switch (type) {
      case "Block":
        return 3;
      case "Element":
        return 2;
      case "Parentheses":
      case "Brackets":
        return 1;
      default: // Comments, Text, etc.
        return 0;
    }
  }

  /*
   * Main entry point. Traverses the AST and collects all foldable regions.
   */
  getFoldRegions(ast) {
    let allFolds = [];

    if (ast?.children) {
      for (const node of ast.children) {
        allFolds.push(...this.#findFolds(node));
      }
    }

    // PASS 1: Sort
    // Sort by startLine (ascending), then by length (descending).
    // This puts the "outermost" and "earliest" folds first.
    allFolds.sort((a, b) => {
      if (a.startLine !== b.startLine) {
        return a.startLine - b.startLine;
      }
      return (b.endLine - b.startLine) - (a.endLine - a.startLine);
    });

    // PASS 2: Filter and Prioritize
    // We use a Map to track the "winner" for each start line.
    const prioritizedMap = new Map();

    for (const fold of allFolds) {
      const existing = prioritizedMap.get(fold.startLine);

      if (!existing) {
        prioritizedMap.set(fold.startLine, fold);
      } else {
        const currentPriority = this.#getFoldPriority(fold.type);
        const existingPriority = this.#getFoldPriority(existing.type);

        // Replace existing fold if the new one has higher semantic priority.
        // If priorities are equal, the first one seen is kept (as it's longer due to sort).
        if (currentPriority > existingPriority) {
          prioritizedMap.set(fold.startLine, fold);
        }
      }
    }

    // Convert Map back to array and strip the internal 'type' property
    return Array.from(prioritizedMap.values()).map(({ startLine, endLine }) => ({
      startLine,
      endLine,
    }));
  }

  /*
   * Recursive helper method to find folds within a single node and its children.
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
            endLine: foldEndLine, // The last line of content to be hidden (inclusive)
            type: node.type // Add node type temporary for redundancy filtering (PASS 2 in getFoldRegions)
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
