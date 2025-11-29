import { LanguageEngine } from "./../parser/language-engine";

/*
 * Manages the structural analysis (folding) and rendering of fold markers/icons.
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

  // Runs the specialized LanguageEngine method on the full document to update folding structure.
  updateStructuralMetadata() {
    const fullValue = this.#core.value;
    const engine = new LanguageEngine(this.#core.fileType, fullValue);

    this.foldRegions = engine.run(fullValue).foldRegions;

    // Update Fold State Map
    this.#updateFoldStateMap(this.foldRegions); // Keeps track of which regions are collapsed

    // Render Markers
    this.#renderFoldGutter();

    // Re-apply any existing collapse state
    this.#applyFoldState(); // Hides/shows the lines based on the current state

    // Dispatch an event for the editor UI to draw fold markers/gutter icons
    this.#core.editable.dispatchEvent(new CustomEvent("playground:editor:folds-updated", {
      bubbles: true,
      detail: { foldRegions: this.foldRegions }
    }));
  }

  // Updates the internal map, keeping existing collapse states if regions match.
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

  // Renders the fold markers in the line number gutter.
  #renderFoldGutter() {
    if (!this.#core.gutterFoldsEl) return;

    const totalLines = this.#core.editable.children.length;
    this.#core.gutterFoldsEl.innerHTML = "";
    const fragment = document.createDocumentFragment();

    for (let line = 1; line <= totalLines; line++) {
      const lineContainer = document.createElement("div");
      lineContainer.className = "editor-line";

      const region = this.#state.foldedRegions.get(line);

      if (region) {
        const marker = document.createElement("div");
        marker.className = "fold-marker";
        marker.dataset.line = line;
        marker.dataset.state = region.isCollapsed ? "collapsed" : "expanded";

        lineContainer.appendChild(marker);
        lineContainer.classList.add("foldable-start");
      }
      fragment.appendChild(lineContainer);
    }
    this.#core.gutterFoldsEl.appendChild(fragment);
  }

  // Applies the fold state by hiding/showing lines in the editable area.
  #applyFoldState() {
    // Ensure all editor lines are visible initially
    Array.from(this.#core.editable.children).forEach(lineEl => {
      lineEl.classList.remove("collapsed");
      // Remove the data attribute on all lines before re-application
      lineEl.removeAttribute("data-collapsed-lines");
    });
    Array.from(this.#core.gutterLineNumbersEl.children).forEach(lineNoEl => lineNoEl.classList.remove("collapsed"));
    Array.from(this.#core.gutterFoldsEl.children).forEach(foldEl => foldEl.classList.remove("collapsed"));

    // Iterate over collapsed regions and hide lines
    for (const [startLine, region] of this.#state.foldedRegions.entries()) {
      if (region.isCollapsed) {
        const startLineEl = this.#core.editable.children[startLine - 1];
        const collapsedLineCount = region.endLine - startLine;

        // Set the data attribute on the STARTING line element
        if (startLineEl) {
          startLineEl.setAttribute("data-collapsed-lines", collapsedLineCount);
        }

        // Hide the lines in the range (startLine + 1 to endLine)
        for (let i = startLine + 1; i <= region.endLine; i++) {
          // Use i - 1 to access the correct zero-based DOM element
          const contentLineEl = this.#core.editable.children[i - 1];
          const lineNumberEl = this.#core.gutterLineNumbersEl?.children[i - 1];
          const foldMarkerEl = this.#core.gutterFoldsEl?.children[i - 1];

          if (contentLineEl) {
            contentLineEl.classList.add("collapsed");
          }
          if (lineNumberEl) {
            lineNumberEl.classList.add("collapsed");
          }
          if (foldMarkerEl) {
            foldMarkerEl.classList.add("collapsed");
          }
        }
      }
    }
  }

  // Toggles the collapse state for a given fold region.
  toggleFold(startLine) {
    const region = this.#state.foldedRegions.get(startLine);
    if (!region) return;

    region.isCollapsed = !region.isCollapsed;
    this.#state.foldedRegions.set(startLine, region);

    this.#applyFoldState();

    // Update the marker icon in the folds gutter
    const markerEl = this.#core.gutterFoldsEl.querySelector(`.fold-marker[data-line="${startLine}"]`);
    if (markerEl) {
      markerEl.dataset.state = region.isCollapsed ? "collapsed" : "expanded";
    }
  }
}
