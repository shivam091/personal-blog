/*
 * Manages the visual rendering of the side gutter.
 * Responsibilities: Line numbers, Active Line highlighting, Fold Icons.
 */
export class EditorGutter {
  #core;
  #state;

  constructor(core, state) {
    this.#core = core;
    this.#state = state;
  }

  // Ensures the gutter has correct number of elements.
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
    }
  }

  setGutterVisibility(visible) {
    if (!this.#core.gutterEl) return;
    this.#core.gutterEl.classList.toggle("hidden", !visible);
  }

  // Highlights the active line number.
  setActiveLine(line) {
    if (!this.#core.gutterEl) return;

    const prev = this.#core.gutterEl.querySelector(".editor-active-line");
    if (prev) prev.classList.remove("editor-active-line");

    const lineEl = this.#core.gutterEl.children[line - 1];
    if (lineEl) lineEl.classList.add("editor-active-line");
  }

  // Adds fold markers via dedicated <span class="fold-marker">
  renderFoldMarkers(foldedRegionsMap) {
    if (!this.#core.gutterEl) return;

    const gutterLines = this.#core.gutterEl.children;

    // Reset all marker spans
    for (let lineEl of gutterLines) {
      const marker = lineEl.querySelector(".fold-marker");
      marker.dataset.state = "";
      marker.classList.remove("has-marker");
    }

    // Apply marker-spans where needed
    for (const [startLine, region] of foldedRegionsMap.entries()) {
      const lineEl = gutterLines[startLine - 1];
      if (!lineEl) continue;

      const marker = lineEl.querySelector(".fold-marker");
      marker.classList.add("has-marker");
      marker.dataset.state = region.isCollapsed ? "collapsed" : "expanded";
    }
  }

  // Updates the fold marker of a specific line.
  updateMarkerState(line, isCollapsed) {
    const lineEl = this.#core.gutterEl.querySelector(
      `.editor-line[data-line="${line}"]`
    );
    if (!lineEl) return;

    const marker = lineEl.querySelector(".fold-marker");
    marker.dataset.state = isCollapsed ? "collapsed" : "expanded";
    marker.classList.add("has-marker");
  }

  // Adds 'collapsed' class to hidden lines in the gutter.
  applyCollapseState(foldedRegionsMap) {
    if (!this.#core.gutterEl) return;

    const gutterLines = this.#core.gutterEl.children;

    // Reset
    Array.from(gutterLines).forEach(lineEl => {
      lineEl.classList.remove("collapsed");
    });

    // Apply collapse
    for (const [startLine, region] of foldedRegionsMap.entries()) {
      if (region.isCollapsed) {
        for (let i = startLine + 1; i <= region.endLine; i++) {
          const lineEl = gutterLines[i - 1];
          if (lineEl) lineEl.classList.add("collapsed");
        }
      }
    }
  }
}
