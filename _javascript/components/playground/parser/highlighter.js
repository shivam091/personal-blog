import { escapeHTML } from "./utils";

// Encapsulates the logic for converting tokens and source into HTML lines.
export class Highlighter {
  // Converts source code and a flat list of tokens into an array of HTML strings.
  highlight(src, tokens) {
    const lines = src.split("\n");
    const renderedLines = [];

    let globalIndex = 0; // Tracks position in the full source string
    let tokenIndex = 0;
    let activeTokenClass = null; // Tracks state across line breaks

    for (let i = 0; i < lines.length; i++) {
      const lineContent = lines[i];
      const lineStart = globalIndex;
      const lineEnd = globalIndex + lineContent.length;

      let lineHtml = "";
      let localIdx = 0; // Current position inside this specific line

      // 1. Re-open active tag from previous line (e.g., multi-line comment)
      if (activeTokenClass && lineContent.length > 0) {
        lineHtml += `<span class="cp-token ${activeTokenClass}">`;
      }

      // 2. Process tokens intersecting this line
      while (tokenIndex < tokens.length) {
        const token = tokens[tokenIndex];

        if (token.start >= lineEnd) break;

        // Token ended before this line (safety check)
        if (token.end <= lineStart) {
          tokenIndex++;
          continue;
        }

        // Calculate intersection
        const overlapStart = Math.max(token.start, lineStart);
        const overlapEnd = Math.min(token.end, lineEnd);

        // Handle plain text gaps before the token
        const gapStart = lineStart + localIdx;
        if (gapStart < overlapStart) {
          if (activeTokenClass) {
            lineHtml += `</span>`;
            activeTokenClass = null;
          }
          lineHtml += escapeHTML(src.slice(gapStart, overlapStart));
          localIdx = overlapStart - lineStart;
        }

        // Handle the token content
        if (!activeTokenClass || activeTokenClass !== token.highlightClass) {
          if (activeTokenClass) lineHtml += `</span>`;
          lineHtml += `<span class="cp-token ${token.highlightClass}">`;
          activeTokenClass = token.highlightClass;
        }

        lineHtml += escapeHTML(src.slice(overlapStart, overlapEnd));
        localIdx = overlapEnd - lineStart;

        // Check if token continues to next line
        if (token.end > lineEnd) {
          lineHtml += `</span>`;
          break;
        } else {
          // Token finishes on this line
          lineHtml += `</span>`;
          activeTokenClass = null;
          tokenIndex++;
        }
      }

      // 3. Handle remaining text on line
      if (localIdx < lineContent.length) {
        if (activeTokenClass) lineHtml += `</span>`;
        lineHtml += escapeHTML(lineContent.slice(localIdx));
      }

      // 4. Handle empty lines
      if (lineHtml === "") lineHtml = "<br>";

      renderedLines.push(lineHtml);
      globalIndex += lineContent.length + 1;
    }

    return renderedLines;
  }
}
