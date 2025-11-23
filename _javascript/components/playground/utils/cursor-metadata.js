/*
 * Computes the line number, column number, selection length, and character offsets
 * for the current cursor position or selection within a contenteditable element.
 */
export function getCursorMetadata(editable) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return null;

  const range = selection.getRangeAt(0);
  if (!editable.contains(range.startContainer)) return null;

  // Map DOM structure to a flattened text model
  const { textNodes, value } = collectTextNodes(editable);
  // Determine character offsets for selection boundaries
  const start = getOffset(range.startContainer, range.startOffset, textNodes);
  const end = getOffset(range.endContainer, range.endOffset, textNodes);
  const isBackward = isSelectionBackward(selection);

  // Determine absolute caret position (focus node's offset)
  const caretPos = getOffset(selection.focusNode, selection.focusOffset, textNodes);

  // Calculate line and column
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

/*
 * Traverses the DOM tree within a root element and creates a flattened model
 * of the content, composed of actual text nodes and virtual nodes representing newlines (`\n`)
 * or empty lines. This is crucial for correctly mapping character offsets to DOM positions.
 *
 * It prioritizes a per-line block structure (e.g., `div.editor-line` elements) if present.
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

  // Enhanced path: If structured by lines (e.g., div.editor-line), rebuild the mapping
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

/*
 * Calculates the absolute character index within the document content
 * corresponding to a given DOM `container` and `offset` (from a Selection or Range object).
 * It uses the flattened `textNodes` map for the conversion.
 */
export function getOffset(container, offset, textNodes) {
  // Case 1: Direct text node match (most common)
  if (container && container.nodeType === 3) {
    for (const { node, start } of textNodes) {
      if (node === container) return start + offset;
    }
  }

  // Case 2: Container is an Element (e.g. div.editor-line)
  if (container && container.nodeType === 1) {
    const childCount = container.childNodes.length;

    // Sub-case 2a: Empty Element (Look for synthetic placeholder)
    if (childCount === 0) {
      const placeholder = textNodes.find(t => t.node.isPlaceholder && t.node.parent === container);
      return placeholder ? placeholder.start : 0;
    }

    // Sub-case 2b: Offset is at the very start
    if (offset === 0) {
      const first = textNodes.find(t =>
        // FIX: Check if nodeType exists (real DOM node) before calling contains
        (t.node.nodeType && container.contains(t.node)) || t.node.parent === container
      );
      return first ? first.start : 0;
    }

    // Sub-case 2c: Offset is at the very end
    if (offset >= childCount) {
      let last = null;
      for (let i = textNodes.length - 1; i >= 0; i--) {
        const t = textNodes[i];
        // FIX: Check if nodeType exists (real DOM node) before calling contains
        if ((t.node.nodeType && container.contains(t.node)) || t.node.parent === container) {
          last = t;
          break;
        }
      }
      return last ? last.end : 0;
    }

    // Sub-case 2d: Middle Offset
    const targetChild = container.childNodes[offset];

    const entry = textNodes.find(t =>
      t.node === targetChild ||
      // Note: This check was already safe because nodeType===3 short-circuits
      (t.node.nodeType === 3 && targetChild.contains(t.node))
    );

    if (entry) return entry.start;

    // Fallback for middle offset
    if (offset > 0) {
      const prevChild = container.childNodes[offset - 1];
      let prevEntry = null;
      for (let i = textNodes.length - 1; i >= 0; i--) {
        const t = textNodes[i];
        // FIX: Check for real node before .contains
        if ((t.node.nodeType && prevChild.contains(t.node)) || t.node === prevChild) {
          prevEntry = t;
          break;
        }
      }
      if (prevEntry) return prevEntry.end;
    }
  }

  // Case 3: Container is a synthetic newline object
  if (container && container.isNewline && container.parent) {
    const match = textNodes.find(t => t.node === container);
    return match ? match.start : 0;
  }

  // Final fallback
  const last = textNodes.at(-1);
  return last ? last.end : 0;
}

/*
 * Maps an absolute character index back to a specific DOM node and offset
 * that can be used to set a new cursor position or selection range.
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

/*
 * Determines if the current selection in the window is set "backward" (i.e., the
 * anchor node/offset comes after the focus node/offset in the document order).
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
