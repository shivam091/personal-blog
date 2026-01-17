// Manages the internal, non-DOM related state of the editor.
export class EditorState {
  // The last known cursor position { line, col }.
  cursor = { line: 1, col: 1 };

  // Store the collapse state for each foldable region.
  // { startLine<number>: { endLine<number>, isCollapsed<boolean> } }
  #foldedRegions = new Map();

  // High-performance DOM registries
  #lineMap = new Map();   // Line Number -> Editable Div
  #gutterMap = new Map(); // Line Number -> Gutter Div

  get lineMap() {
    return this.#lineMap;
  }

  get gutterMap() {
    return this.#gutterMap;
  }

  get foldedRegions() {
    return this.#foldedRegions;
  }

  set foldedRegions(map) {
    this.#foldedRegions = map;
  }
}
