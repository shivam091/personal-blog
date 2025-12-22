import { LanguageEngine } from "./../parser/language-engine";

/*
 * Manages the structural analysis (folding) logic.
 * Delegates visual updates to EditorGutter (for icons) and Core (for content hiding).
 */
export class EditorFoldManager {
  #core;
  #state;

  // Structural metadata storage
  foldRegions = [];

  constructor(core, state) {
    this.#core = core;
    this.#state = state;
  }

  /*
   * Runs the specialized LanguageEngine method on the full document to update folding structure.
   */
  updateStructuralMetadata() {
    const fullValue = this.#core.value;
    const engine = new LanguageEngine(this.#core.fileType, fullValue);

    this.foldRegions = engine.run(fullValue).foldRegions; // Keeps track of which regions are collapsed

    // Update fold state map
    this.#updateFoldStateMap(this.foldRegions);

    // Ensure gutter line count is correct BEFORE adding fold markers
    this.#core.gutter.update(fullValue.split("\n").length);

    // Now safe to render fold markers
    this.#core.gutter.renderFoldMarkers(this.#state.foldedRegions);

    // Apply the visual hiding
    this.#applyFoldState();

    // Dispatch an event for other UI components
    this.#core.editable.dispatchEvent(new CustomEvent("playground:editor:folds-updated", {
      bubbles: true,
      detail: { foldRegions: this.foldRegions }
    }));
  }

  /*
   * Updates the internal map, keeping existing collapse states if regions match.
   */
  #updateFoldStateMap(newRegions) {
    const newFoldedRegions = new Map();

    for (const region of newRegions) {
      const key = region.startLine;
      const existing = this.#state.foldedRegions.get(key);

      newFoldedRegions.set(key, {
        endLine: region.endLine,
        isCollapsed: existing ? existing.isCollapsed : false
      });
    }

    this.#state.foldedRegions = newFoldedRegions;
  }

  /*
   * Toggles the collapse state for a given fold region.
   */
  toggleFold(startLine) {
    const region = this.#state.foldedRegions.get(startLine);
    if (!region) return;

    region.isCollapsed = !region.isCollapsed;
    this.#state.foldedRegions.set(startLine, region);

    this.#applyFoldState();

    // Update specific icon in gutter
    this.#core.gutter.updateMarkerState(startLine, region.isCollapsed);
  }

  /*
   * Applies the fold state by hiding/showing lines in the editable area AND the gutter.
   */
  #applyFoldState() {
    // Reset all via the cache
    this.#state.lineMap.forEach(el => {
      el.classList.remove("collapsed");
      el.removeAttribute("data-collapsed-lines");
    });

    // Hide lines in editor content
    for (const [startLine, region] of this.#state.foldedRegions.entries()) {
      if (region.isCollapsed) {
        const startEl = this.#state.lineMap.get(startLine);
        if (startEl) startEl.setAttribute("data-collapsed-lines", region.endLine - startLine);

        // Hide the range
        for (let i = startLine + 1; i <= region.endLine; i++) {
          const contentEl = this.#state.lineMap.get(i);
          if (contentEl) contentEl.classList.add("collapsed");
        }
      }
    }

    // Hide folded lines
    this.#core.gutter.applyCollapseState(this.#state.foldedRegions);
  }
}
