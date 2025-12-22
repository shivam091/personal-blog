import { LanguageEngine } from "./../parser/language-engine";

/*
 * Handles visual rendering of the CODE CONTENT only.
 * (Syntax Highlighting, HTML generation, Active Line background in editor).
 */
export class EditorUI {
  #core;
  #state;
  #fileType;

  constructor(core, state, fileType) {
    this.#core = core;
    this.#state = state;
    this.#fileType = fileType;
  }

  /*
   * Converts a string of code into the HTML structure used by the editor.
   */
  toHTML(src) {
    const engine = new LanguageEngine(this.#fileType, src);
    const { ast, errors, tokens, highlightedLines, foldRegions } = engine.run(src);

    console.log("AST: ", ast);
    console.log("Errors: ", errors);
    console.log("Tokens: ", tokens);
    console.log("Fold regions: ", foldRegions);

    // Map the resulting HTML lines to divs
    return highlightedLines
      .map((lineHTML, i) =>
        `<div class="editor-line" data-line="${i + 1}">${lineHTML || "<br>"}</div>`
      )
      .join("");
  }

  /*
   * Updates the HTML of a single line element to re-apply formatting.
   */
  updateSingleLineDOM(lineEl) {
    if (!lineEl) return;

    const lineNum = parseInt(lineEl.dataset.line, 10);
    const allLines = Array.from(this.#core.editable.children);
    const lineIndex = allLines.indexOf(lineEl);

    if (lineIndex === -1) return;

    const fullText = this.#core.value;
    const engine = new LanguageEngine(this.#fileType, fullText);
    const { ast, errors, tokens, highlightedLines, foldRegions } = engine.run(fullText);

    console.log("AST: ", ast);
    console.log("Errors: ", errors);
    console.log("Tokens: ", tokens);
    console.log("Fold regions: ", foldRegions);

    const newLineHTML = highlightedLines[lineIndex] || "<br>";

    if (lineEl.innerHTML !== newLineHTML) {
      lineEl.innerHTML = newLineHTML;

      // Ensure the cache points to the current version of this element
      // Even if the reference is the same, this ensures consistency
      this.#state.lineMap.set(lineNum, lineEl);
    }
  }

  /*
   * Highlights the active line content block.
   */
  setActiveLine(line) {
    // Remove existing highlight
    const prevActive = this.#core.editable.querySelector(".editor-active-line");
    if (prevActive) prevActive.classList.remove("editor-active-line");

    // Lookup by attribute instead of index
    const newActive = this.#core.state.lineMap.get(line);
    if (newActive) newActive.classList.add("editor-active-line");
  }
}
