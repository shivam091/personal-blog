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

  // Converts a string of code into the HTML structure used by the editor
  toHTML(src) {
    const engine = new LanguageEngine(this.#fileType, src);
    const { ast, errors, tokens, highlightedLines, foldRegions } = engine.run(src);

    console.log("AST: ", ast);
    console.log("Errors: ", errors);
    console.log("Tokens: ", tokens);
    console.log("Fold regions: ", foldRegions);

    // Map the resulting HTML lines to divs
    return highlightedLines
      .map(lineHTML => `<div class="editor-line">${lineHTML}</div>`)
      .join("");
  }

  // Updates the HTML of a single line element to re-apply formatting.
  updateSingleLineDOM(lineEl) {
    if (!lineEl) return;

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

    if (lineEl.innerHTML !== newLineHTML) lineEl.innerHTML = newLineHTML;
  }

  // Highlights the active line content block.
  setActiveLine(line) {
    // Remove existing
    const active = this.#core.editable.querySelector(".editor-active-line");
    if (active) active.classList.remove("editor-active-line");

    // Set new active line
    const block = this.#core.editable.children[line - 1];
    if (block) block.classList.add("editor-active-line");
  }
}
