import { SHARED_TOKEN_TYPES } from "./tokens";
import { escapeRegex } from "./utils";

export class BaseLexer {
  #tokenMap;

  constructor(tokenMapConfig) {
    this.#tokenMap = this.#buildTokenMap(tokenMapConfig);
  }

  // Utility to generate a token regex map from structured config provided by subclasses
  #buildTokenMap(config) {
    const map = new Map();

    // 1. Add comment token (Highest Priority)
    if (config.comment) {
      map.set("COMMENT", config.comment);
    }

    // 2. Add structural tokens that need to be prioritized (REGEX, ARROW, etc.)
    for (const [type, regex] of Object.entries(config.structural || {})) {
      map.set(type, regex);
    }

    // 3. Add shared structural tokens (STRING, NUMBER)
    map.set("STRING", SHARED_TOKEN_TYPES.STRING);
    map.set("NUMBER", SHARED_TOKEN_TYPES.NUMBER);

    // 4. Add word-based tokens (e.g., KEYWORD, TAG)
    for (const [type, set] of Object.entries(config.words || {})) {
      if (set && set.size > 0) {
        // Use full word boundary for word-based tokens
        const pattern = `\\b(${[...set].map(escapeRegex).join("|")})\\b`;
        map.set(type, new RegExp(pattern));
      }
    }

    // Convert map to prioritized array for sequential scanning
    // Exclude PLAIN as it's the fallback logic.
    return Array.from(map.entries())
      .map(([type, regex]) => ({ type, regex }));
  }

  /**
   * Tokenizes a single line of text.
   */
  tokenize(line) {
    let position = 0;
    const tokens = [];
    let text = line;

    while (position < text.length) {
      let match = null;
      let matchedType = "PLAIN";

      for (const { type, regex } of this.#tokenMap) {
        // Use .exec() on the remaining string
        const result = regex.exec(text.substring(position));

        if (result && result.index === 0) {
          match = result[0];
          matchedType = type;
          break; // Found the highest priority match
        }
      }

      if (match) {
        tokens.push({ type: matchedType, value: match });
        position += match.length;
      } else {
        // Handle PLAIN text segment (anything that didn't match a rule)
        const remainingText = text.substring(position);

        // Find the next non-word character (space, operator, etc.) to limit the plain segment
        const matchNextTokenStart = remainingText.search(/[^a-zA-Z0-9_$]/);
        let segmentEnd = remainingText.length;

        if (matchNextTokenStart !== -1) {
          segmentEnd = matchNextTokenStart;
        }

        let plainSegment = remainingText.substring(0, segmentEnd);

        // If segment is empty but remaining text isn't (e.g., starts with a special character not in token map)
        if (plainSegment.length === 0 && remainingText.length > 0) {
          plainSegment = remainingText.substring(0, 1);
        }

        if (plainSegment.length > 0) {
          tokens.push({ type: "PLAIN", value: plainSegment });
          position += plainSegment.length;
        } else {
          // Should only happen if the loop logic failed, safety break
          position = text.length;
        }
      }
    }
    return tokens;
  }
}
