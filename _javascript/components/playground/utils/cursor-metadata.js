/**
 * @function getCursorMetadata
 * @description Computes the line number, column number, selection length, and character offsets
 * for the current cursor position or selection within a contenteditable element.
 *
 * @exports
 * @param {HTMLElement} editable The contenteditable element to check within.
 * @returns {Object|null} An object containing cursor metadata, or null if no valid selection is found.
 * @property {number} line The 1-based line number of the caret/focus.
 * @property {number} col The 1-based column number of the caret/focus.
 * @property {number} selectionLength The total number of characters selected.
 * @property {number} caretPos The absolute character index of the caret (focus node).
 * @property {number} selectionStart The absolute character index where the selection begins (anchor/focus start).
 * @property {number} selectionEnd The absolute character index where the selection ends (anchor/focus end).
 * @property {("forward"|"backward")} selectionDirection The direction of the selection.
 * @property {boolean} full True if the entire document content is selected.
 */
export function getCursorMetadata(editable) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return null;

  const range = selection.getRangeAt(0);
  if (!editable.contains(range.startContainer)) return null;

  // 1. Map DOM structure to a flattened text model
  const { textNodes, value } = collectTextNodes(editable);
  // 2. Determine character offsets for selection boundaries
  const start = getOffset(range.startContainer, range.startOffset, textNodes);
  const end = getOffset(range.endContainer, range.endOffset, textNodes);
  const isBackward = isSelectionBackward(selection);

  // 3. Determine absolute caret position (focus node's offset)
  const caretNodeOffset = getOffset(selection.focusNode, selection.focusOffset, textNodes);
  const caretPos = caretNodeOffset;

  // 4. Calculate line and column
  const before = value.slice(0, caretPos);
  const lines = before.split("\n");

  return {
    line: lines.length, // 1-based line number
    col: lines[lines.length - 1].length + 1, // 1-based column number
    selectionLength: Math.abs(end - start),
    caretPos,
    selectionStart: start,
    selectionEnd: end,
    selectionDirection: isBackward ? "backward" : "forward",
    full: start === 0 && end === value.length,
  };
}

/**
 * @function collectTextNodes
 * @description Traverses the DOM tree within a root element and creates a flattened model
 * of the content, composed of actual text nodes and virtual nodes representing newlines (`\n`)
 * or empty lines. This is crucial for correctly mapping character offsets to DOM positions.
 *
 * It prioritizes a per-line block structure (e.g., `div.cp-line` elements) if present.
 *
 * @exports
 * @param {HTMLElement} root The root element of the contenteditable area.
 * @returns {{textNodes: Array<Object>, value: string}} The flattened text array and the concatenated string value.
 * @property {Array<Object>} textNodes Array of objects mapping a DOM node to its starting character offset.
 * @property {string} value The full, concatenated string content including virtual newlines.
 */
export function collectTextNodes(root) {
  const textNodes = [];
  let value = "";
  let offset = 0;

  // Default path: walk all text nodes (less reliable for line breaks)
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walker.nextNode())) {
    const len = node.data.length;
    textNodes.push({ node, start: offset, end: offset + len });
    value += node.data;
    offset += len;
  }

  // Enhanced path: If structured by lines (e.g., div.cp-line), rebuild the mapping
  // to explicitly insert '\n' between lines and handle empty lines.
  const lines = Array.from(root.children).filter(el => el.nodeType === 1);
  if (lines.length) {
    textNodes.length = 0; // Clear default results
    value = "";
    offset = 0;

    lines.forEach((line, i) => {
      // Collect real text nodes inside this line
      const w = document.createTreeWalker(line, NodeFilter.SHOW_TEXT, null);
      let innerFound = false;
      while ((node = w.nextNode())) {
        innerFound = true;
        const len = node.data.length;
        textNodes.push({ node, start: offset, end: offset + len });
        value += node.data;
        offset += len;
      }

      if (!innerFound) {
        // Handle empty line: use a synthetic placeholder anchored to the line element
        const placeholder = { isPlaceholder: true, parent: line };
        textNodes.push({ node: placeholder, start: offset, end: offset });
      }

      if (i < lines.length - 1) {
        // Add virtual newline between lines
        value += "\n";
        const newlineNode = { isNewline: true, parent: line };
        textNodes.push({ node: newlineNode, start: offset, end: offset + 1 });
        offset += 1;
      }
    });
  }

  return { textNodes, value };
}

/**
 * @function getOffset
 * @description Calculates the absolute character index within the document content
 * corresponding to a given DOM `container` and `offset` (from a Selection or Range object).
 * It uses the flattened `textNodes` map for the conversion.
 *
 * @exports
 * @param {Node} container The DOM node (Text or Element) where the cursor/selection starts/ends.
 * @param {number} offset The character/child offset within the container node.
 * @param {Array<Object>} textNodes The flattened text model created by `collectTextNodes`.
 * @returns {number} The absolute character index (0-based) within the document content.
 */
export function getOffset(container, offset, textNodes) {
  // Case 1: Direct text node match (most common)
  if (container && container.nodeType === 3) {
    for (const { node, start } of textNodes) {
      if (node === container) return start + offset;
    }
  }

  // Case 2: Container is an Element (e.g. `div.cp-line`)
  if (container && container.nodeType === 1) {
    let firstInside = null;
    let lastInside = null;
    // Find first and last text nodes contained within this element
    for (const entry of textNodes) {
      const { node } = entry;
      if (node && node.nodeType === 3 && container.contains(node)) {
        if (!firstInside) firstInside = entry;
        lastInside = entry;
      }
    }

    if (firstInside && lastInside) {
      // Map element offset to character offset at start/end of contained text nodes
      try {
        if (offset === 0) return firstInside.start;
        const childCount = container.childNodes.length;
        if (typeof offset === "number" && offset >= childCount) return lastInside.end;
      } catch (e) {
        // Fallthrough
      }
      return lastInside.end;
    }

    // No text nodes inside (e.g., empty line or line with only a <br>)
    for (const { node, start } of textNodes) {
      if ((node && node.isPlaceholder) && node.parent === container) {
        return start; // Return start of the synthetic placeholder
      }
      if ((node && node.isNewline) && node.parent === container) {
        return start; // Return position of the virtual newline character
      }
    }

    // Last fallback for element container: try to map to a containing text node entry
    for (const { node, start } of textNodes) {
      if (node && node.nodeType === 1 && node.contains && node.contains(container)) {
        return start;
      }
    }
  }

  // Case 3: Container is one of our synthetic newline objects (unlikely from DOM selection)
  if (container && container.isNewline && container.parent) {
    for (const { node, start } of textNodes) {
      if (node === container) return start;
    }
  }

  // Final fallback: return end of the content
  const last = textNodes.at(-1);
  return last ? last.end : 0;
}

/**
 * @function findNodeOffset
 * @description Maps an absolute character index back to a specific DOM node and offset
 * that can be used to set a new cursor position or selection range.
 *
 * @exports
 * @param {HTMLElement} root The root contenteditable element.
 * @param {number} index The absolute character index (0-based) to locate.
 * @returns {{node: Node, offset: number}} An object containing the target DOM node and the offset within it.
 */
export function findNodeOffset(root, index) {
  const { textNodes } = collectTextNodes(root);

  for (const { node, start, end } of textNodes) {
    // Check if the index falls within the bounds of this text node/entry
    if (index >= start && index <= end) {
      // Case 1: Real text node
      if (node && node.nodeType === 3) {
        return { node, offset: index - start };
      }

      // Case 2: Synthetic placeholder (empty line)
      if (node && node.isPlaceholder && node.parent) {
        return { node: node.parent, offset: 0 }; // Set caret at start of the element
      }

      // Case 3: Synthetic newline
      if (node && node.isNewline && node.parent) {
        const el = node.parent;
        const nextEl = el.nextElementSibling;

        // If at the newline position, place the cursor at the start of the next line element
        if (nextEl) {
          return { node: nextEl, offset: 0 };
        }

        // Fallback: place cursor at the end of the current line element
        const lastChild = el && el.lastChild && el.lastChild.nodeType === 3 ? el.lastChild : null;
        if (lastChild) return { node: lastChild, offset: lastChild.data.length };
        return { node: el, offset: el.childNodes.length };
      }

      // Fallback
      return { node, offset: 0 };
    }
  }

  // Final fallback: handle empty editor or index out of bounds
  const last = textNodes.at(-1);
  if (!last) {
    const text = document.createTextNode("");
    root.appendChild(text);
    return { node: text, offset: 0 };
  }

  // Return the very end of the last node
  if (last.node && last.node.nodeType === 3) {
    return { node: last.node, offset: last.end - last.start };
  }

  if (last.node && last.node.isPlaceholder && last.node.parent) {
    return { node: last.node.parent, offset: 0 };
  }

  return { node: last.node, offset: 0 };
}

/**
 * @function isSelectionBackward
 * @description Determines if the current selection in the window is set "backward" (i.e., the
 * anchor node/offset comes after the focus node/offset in the document order).
 *
 * @exports
 * @param {Selection} selection The window.getSelection() object.
 * @returns {boolean} True if the selection is backward, false otherwise.
 */
export function isSelectionBackward(selection) {
  if (!selection.anchorNode || !selection.focusNode) return false;

  try {
    const range = document.createRange();
    range.setStart(selection.anchorNode, selection.anchorOffset);
    range.setEnd(selection.focusNode, selection.focusOffset);
    const collapsed = range.collapsed; // If collapsed, anchor > focus in document order
    range.detach?.();
    return collapsed;
  } catch (e) {
    // Fallback comparison for complex scenarios
    if (selection.anchorNode === selection.focusNode) {
      return selection.anchorOffset > selection.focusOffset;
    }
    // Check if anchor node follows focus node
    const pos = selection.anchorNode.compareDocumentPosition(selection.focusNode);
    return !(pos & Node.DOCUMENT_POSITION_FOLLOWING);
  }
}