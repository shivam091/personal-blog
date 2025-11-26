/*
 * Manages the internal, non-DOM related state of the editor.
 */
export class EditorState {
  // The last known cursor position { line, col }.
  cursor = { line: 1, col: 1 };

  // Store the collapse state for each foldable region.
  // Key: startLine, Value: {endLine, isCollapsed: boolean}
  #foldedRegions = new Map();

  get foldedRegions() {
    return this.#foldedRegions;
  }

  set foldedRegions(map) {
    this.#foldedRegions = map;
  }
}
