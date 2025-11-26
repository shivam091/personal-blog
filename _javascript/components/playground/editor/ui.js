import { LanguageEngine } from "./../parser/language-engine";

/*
 * Handles all visual rendering and DOM manipulation for the editor UI elements
 * (Line Numbers, Highlighting, Active Line).
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
    // Run the engine on the full text
    const engine = new LanguageEngine(this.#fileType, src);
    const { ast, tokens, highlightedLines, errors, foldRegions } = engine.run(src)

    console.log("AST:", ast);
    console.log("Tokens", tokens);
    console.log("Errors", errors);
    console.log("Folds", foldRegions)

    // Map the resulting HTML lines to divs
    return highlightedLines
      .map(lineHTML => `<div class="editor-line">${lineHTML}</div>`)
      .join("");
  }

  /*
   * Updates the HTML of a single line element to re-apply formatting.
   * Parses the FULL document to ensure context (comments, strings) is preserved,
   * but only updates the DOM for the specific line.
   */
  updateSingleLineDOM(lineEl) {
    if (!lineEl) return;

    // 1. Identify which line index we are editing
    // We need this to extract the specific HTML from the full engine result.
    const allLines = Array.from(this.#core.editable.children);
    const lineIndex = allLines.indexOf(lineEl);

    if (lineIndex === -1) return;

    // 2. Get the FULL text of the editor (which includes the character the user just typed)
    // We must parse the whole thing so the Lexer knows if we are inside a comment block/string.
    const fullText = this.#core.value;

    // 3. Run the Engine on the FULL text
    const engine = new LanguageEngine(this.#fileType, fullText);
    const { ast, tokens, highlightedLines, errors, foldRegions } = engine.run(fullText);

    console.log("AST:", ast);
    console.log("Tokens", tokens);
    console.log("Errors", errors);
    console.log("Folds", foldRegions)

    // 4. Extract ONLY the HTML for the line we are editing
    // result.highlightedLines corresponds perfectly to the line indices
    const newLineHTML = highlightedLines[lineIndex] || "<br>";

    // 5. Update the DOM
    // Checking inequality prevents unnecessary browser repaints if the tokens didn't visually change
    if (lineEl.innerHTML !== newLineHTML) {
      lineEl.innerHTML = newLineHTML;
    }
  }

  /*
   * Controls line number DOM presence.
   * This is the single source of truth for generating or removing lines.
   */
  setLineNumberVisibility(visible) {
    if (!this.#core.gutterLineNumbersEl) return;

    if (visible) {
      // Lines are visible, so update/generate them
      this.updateLineNumbers();

      // If the lines were just generated AND we know the cursor position,
      // set the active line highlight immediately.
      if (this.#state.cursor) {
        this.setActiveLine(this.#state.cursor.line);
      }
    } else {
      // Lines are not visible, so remove DOM elements
      this.#core.gutterLineNumbersEl.innerHTML = "";
    }
  }

  // Updates line numbers based on the current value or an optional count.
  updateLineNumbers(count) {
    if (!this.#core.gutterLineNumbersEl) return;

    // Check the data attribute directly or check if the container is currently visible.
    const isVisible = this.#core.root.getAttribute("data-line-numbers") === "on";

    if (!isVisible) {
      return;
    }

    count = count ?? this.#core.value.split("\n").length;
    const currentLineCount = this.#core.gutterLineNumbersEl.children.length;

    if (count !== currentLineCount) {
      // Generate the line numbers
      this.#core.gutterLineNumbersEl.innerHTML = Array.from({ length: count }, (_, i) =>
        `<div class="editor-line">${i + 1}</div>`
      ).join("");
    }

    if (this.#state.cursor) {
      this.setActiveLine(this.#state.cursor.line);
    }
  }

  // Highlights the specified line number and its corresponding content block.
  setActiveLine(line) {
    this.#clearHighlights();

    const block = this.#core.editable.children[line - 1];
    if (block) block.classList.add("editor-active-line");

    const lineEl = this.#core.gutterLineNumbersEl?.children[line - 1];
    if (lineEl) lineEl.classList.add("editor-active-line");
  }

  // Clears all active line highlights
  #clearHighlights() {
    this.#core.codeEditor?.querySelectorAll(".editor-active-line").forEach(el =>
      el.classList.remove("editor-active-line")
    );
    this.#core.gutterLineNumbersEl?.querySelectorAll(".editor-active-line").forEach(el =>
      el.classList.remove("editor-active-line")
    );
  }
}
