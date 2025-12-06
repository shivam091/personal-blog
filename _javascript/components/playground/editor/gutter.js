/*
 * Manages the visual rendering of the side gutter.
 * Responsibilities: Line numbers (DOM existence), Active Line highlighting, Fold Icons.
 */
export class EditorGutter {
  #core;
  #state;

  constructor(core, state) {
    this.#core = core;
    this.#state = state;
  }

  /*
   * Ensures the gutter has the correct number of line elements.
   * This is the ONLY method allowed to create/remove gutter DOM nodes.
   */
  updateLineNumbers(count) {
    if (!this.#core.gutterEl) return;

    const totalLines = count ?? this.#core.value.split("\n").length;
    const currentLines = this.#core.gutterEl.children.length;

    // Only manipulate DOM if line count changes
    if (totalLines !== currentLines) {
      this.#core.gutterEl.innerHTML = Array.from({ length: totalLines }, (_, i) =>
        `<div class="editor-line" data-line="${i + 1}"></div>`
      ).join("");
    }
  }

  // Toggles the visibility of the entire gutter.
  setVisibility(visible) {
    if (!this.#core.gutterEl) return;

    if (visible) {
      this.#core.gutterEl.classList.remove("hidden-gutter");
    } else {
      this.#core.gutterEl.classList.add("hidden-gutter");
    }
  }

  // Highlights the active line number.
  setActiveLine(line) {
    if (!this.#core.gutterEl) return;

    // Remove existing
    const active = this.#core.gutterEl.querySelector(".editor-active-line");
    if (active) active.classList.remove("editor-active-line");

    // Set new active line
    const lineEl = this.#core.gutterEl.children[line - 1];
    if (lineEl) lineEl.classList.add("editor-active-line");
  }

  /*
   * Decorates the gutter lines with fold markers.
   * Does NOT create elements; only adds classes/attributes to existing ones.
   */
  renderFoldMarkers(foldedRegionsMap) {
    if (!this.#core.gutterEl) return;

    const gutterLines = this.#core.gutterEl.children;

    // 1. Clean up ALL existing fold markers
    for (let el of gutterLines) {
      el.classList.remove("fold-marker");
      el.removeAttribute("data-state");
    }

    // 2. Apply markers where needed
    for (const [startLine, region] of foldedRegionsMap.entries()) {
      const el = gutterLines[startLine - 1];
      if (el) {
        el.classList.add("fold-marker");
        el.dataset.state = region.isCollapsed ? "collapsed" : "expanded";
      }
    }
  }

  // Updates the icon state of a specific line (used when toggling).
  updateMarkerState(line, isCollapsed) {
    const el = this.#core.gutterEl.querySelector(`.editor-line[data-line="${line}"]`);
    if (el) {
      el.dataset.state = isCollapsed ? "collapsed" : "expanded";
    }
  }

  // Applies 'collapsed' class to hidden lines in the gutter.
  applyCollapseState(foldedRegionsMap) {
    if (!this.#core.gutterEl) return;

    // 1. Reset all gutter lines
    Array.from(this.#core.gutterEl.children).forEach(el => {
      el.classList.remove("collapsed");
    });

    // 2. Hide lines inside collapsed regions
    for (const [startLine, region] of foldedRegionsMap.entries()) {
      if (region.isCollapsed) {
        for (let i = startLine + 1; i <= region.endLine; i++) {
          const gutterEl = this.#core.gutterEl.children[i - 1];
          if (gutterEl) gutterEl.classList.add("collapsed");
        }
      }
    }
  }
}
