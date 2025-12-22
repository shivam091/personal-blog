/*
 * Manages the visual rendering of the side gutter.
 * Responsibilities: Line numbers, Active Line highlighting, Fold Icons.
 */
export class EditorGutter {
  #core;

  constructor(core) {
    this.#core = core;
  }

  /*
   * Updates gutter line elements to match current line count.
   */
  update(count) {
    if (!this.#core.gutterEl) return;

    const totalLines = count ?? this.#core.value.split("\n").length;
    const currentLines = this.#core.gutterEl.children.length;

    if (totalLines !== currentLines) {
      this.#core.gutterEl.innerHTML = Array.from({ length: totalLines }, (_, i) =>
        `<div class="editor-line" data-line="${i + 1}">
          <div class="line-number">${i + 1}</div>
          <div class="fold-marker"></div>
        </div>`
      ).join("");

      // Populate the gutter cache
      this.#core.state.gutterMap.clear();
      for (const child of this.#core.gutterEl.children) {
        const lineNum = parseInt(child.dataset.line, 10);
        this.#core.state.gutterMap.set(lineNum, child);
      }
    }
  }

  /*
   * Toggles overall gutter visibility.
   */
  toggleGutterVisibility(visible) {
    if (!this.#core.gutterEl) return;
    this.#core.gutterEl.classList.toggle("hidden", !visible);
  }

  /*
   * Highlights the active line number.
   */
  setActiveLine(line) {
    if (!this.#core.gutterEl) return;

    const prevActive = this.#core.gutterEl.querySelector(".editor-active-line");
    if (prevActive) prevActive.classList.remove("editor-active-line");

    // O(1) Lookup
    const newActive = this.#core.state.gutterMap.get(line);
    if (newActive) newActive.classList.add("editor-active-line");
  }

  /*
   * Renders fold markers for all foldable regions based on a mapping of regions.
   */
  renderFoldMarkers(foldedRegionsMap) {
    if (!this.#core.gutterEl) return;

    // Reset all marker spans
    this.#core.state.gutterMap.forEach(lineEl => {
      const marker = lineEl.querySelector(".fold-marker");
      if (marker) marker.classList.remove("has-marker");
    });

    // Apply markers using O(1) Map lookup
    for (const [startLine, region] of foldedRegionsMap.entries()) {
      const lineEl = this.#core.state.gutterMap.get(startLine);
      if (!lineEl) continue;

      const marker = lineEl.querySelector(".fold-marker");
      marker.classList.add("has-marker");
      marker.dataset.state = region.isCollapsed ? "collapsed" : "expanded";
    }
  }

  /*
   * Updates the fold marker state for a single line after toggling.
   */
  updateMarkerState(line, isCollapsed) {
    const lineEl = this.#core.gutterEl.querySelector(`.editor-line[data-line="${line}"]`);
    if (!lineEl) return;

    const marker = lineEl.querySelector(".fold-marker");
    marker.dataset.state = isCollapsed ? "collapsed" : "expanded";
    marker.classList.add("has-marker");
  }

  /*
   * Applies collapsed styling to gutter lines hidden by a folded region.
   */
  applyCollapseState(foldedRegionsMap) {
    if (!this.#core.gutterEl) return;

    // Clear existing state
    this.#core.gutterEl.querySelectorAll(".collapsed").forEach(el => el.classList.remove("collapsed"));

    for (const [startLine, region] of foldedRegionsMap.entries()) {
      if (region.isCollapsed) {
        for (let i = startLine + 1; i <= region.endLine; i++) {
          // Direct attribute lookup
          const lineEl = this.#core.gutterEl.querySelector(`[data-line="${i}"]`);
          if (lineEl) lineEl.classList.add("collapsed");
        }
      }
    }
  }
}
