export function getCursorMetadata(editable) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return null;

  const range = selection.getRangeAt(0);
  if (!editable.contains(range.startContainer)) return null;

  const { textNodes, value } = collectTextNodes(editable);
  const start = getOffset(range.startContainer, range.startOffset, textNodes);
  const end = getOffset(range.endContainer, range.endOffset, textNodes);
  const isBackward = isSelectionBackward(selection);

  const caretNodeOffset = getOffset(selection.focusNode, selection.focusOffset, textNodes);
  const caretPos = caretNodeOffset;
  const before = value.slice(0, caretPos);
  const lines = before.split("\n");

  return {
    line: lines.length,
    col: lines[lines.length - 1].length + 1,
    selectionLength: Math.abs(end - start),
    caretPos,
    selectionStart: start,
    selectionEnd: end,
    selectionDirection: isBackward ? "backward" : "forward",
    full: start === 0 && end === value.length,
  };
}

export function collectTextNodes(root) {
  const textNodes = [];
  let value = "";
  let offset = 0;

  // walker for all text nodes inside root
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walker.nextNode())) {
    // skip zero-length text nodes created by formatting libraries if desired:
    // optional: if (node.data.length === 0) continue;
    const len = node.data.length;
    textNodes.push({ node, start: offset, end: offset + len });
    value += node.data;
    offset += len;
  }

  // Now ensure line breaks are represented. We need to map DOM line separation
  // to '\n' positions. Many editors represent lines as block elements (div.cp-line).
  // If your editor uses per-line divs, prefer this code path for correct newlines.
  const lines = Array.from(root.children).filter(el => el.nodeType === 1);
  if (lines.length) {
    // Rebuild using per-line approach but using actual text nodes under each line.
    // This ensures explicit '\n' between lines and creates placeholder text nodes for empty lines.
    textNodes.length = 0;
    value = "";
    offset = 0;

    lines.forEach((line, i) => {
      // collect text nodes inside this line
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
        // empty line placeholder: add a zero-length Text node for stable offsets
        const placeholder = { isPlaceholder: true, parent: line };
        // Do not mutate DOM here. Instead keep the element as placeholder node entry.
        // Mark with isPlaceholder so findNodeOffset can treat it correctly.
        textNodes.push({ node: placeholder, start: offset, end: offset });
      }

      if (i < lines.length - 1) {
        // newline between lines
        value += "\n";
        const newlineNode = { isNewline: true, parent: line };
        textNodes.push({ node: newlineNode, start: offset, end: offset + 1 });
        // represent newline as a virtual text node anchored to the line element.
        // store a synthetic nodeRef object to denote newline; keep node as line with a flag

        offset += 1;
      }
    });
  }

  return { textNodes, value };
}

export function getOffset(container, offset, textNodes) {
  // direct text node match (most common)
  if (container && container.nodeType === 3) {
    for (const { node, start } of textNodes) {
      if (node === container) return start + offset;
    }
  }

  // If container is an Element (e.g. your .cp-line) we need to map it
  if (container && container.nodeType === 1) {
    // find all text entries inside this element
    let firstInside = null;
    let lastInside = null;
    for (const entry of textNodes) {
      const { node } = entry;
      if (node && node.nodeType === 3 && container.contains(node)) {
        if (!firstInside) firstInside = entry;
        lastInside = entry;
      }
    }

    // if there are text nodes inside, decide position
    if (firstInside && lastInside) {
      // best-effort mapping:
      // - offset === 0 => caret at start of first text node
      // - offset >= child count or unknown => caret at end of last text node
      // - otherwise place at end of lastInside (safe)
      try {
        if (offset === 0) return firstInside.start;
        const childCount = container.childNodes.length;
        if (typeof offset === "number" && offset >= childCount) return lastInside.end;
      } catch (e) {
        // fallthrough to return lastInside.end
      }
      return lastInside.end;
    }

    // no text nodes inside. check for synthetic placeholder/newline anchored to this element
    for (const { node, start } of textNodes) {
      if ((node && node.isPlaceholder) && node.parent === container) {
        return start; // empty line start
      }
      if ((node && node.isNewline) && node.parent === container) {
        // newline is represented as a single '\n' char sitting after this line
        return start; // position of that newline (so caret at newline)
      }
    }

    // last fallback for element container: try to find a parent-mapped text node
    // (walk up to nearest textNodes entry that contains container)
    for (const { node, start, end } of textNodes) {
      if (node && node.nodeType === 1 && node.contains && node.contains(container)) {
        // place caret at start of that mapped entry
        return start;
      }
    }
  }

  // If container is not matched above, see if container is actually one of our synthetic nodes
  if (container && container.isNewline && container.parent) {
    // container is the synthetic object (unlikely for DOM selection) -> map to its start
    for (const { node, start } of textNodes) {
      if (node === container) return start;
    }
  }

  // final fallback: return end of last entry (safe but try to avoid hitting this)
  const last = textNodes.at(-1);
  return last ? last.end : 0;
}

export function findNodeOffset(root, index) {
  const { textNodes } = collectTextNodes(root);

  for (const { node, start, end } of textNodes) {
    if (index >= start && index <= end) {
      if (node && node.nodeType === 3) {
        return { node, offset: index - start };
      }
      // synthetic placeholder/newline anchored to an element
      if (node && node.isPlaceholder && node.parent) {
        // place caret at start of that empty line element
        return { node: node.parent, offset: 0 };
      }
      if (node && node.isNewline && node.parent) {
        // place caret after the last child of the line element (i.e. at end of that line)
        const el = node.parent;
        const nextEl = el.nextElementSibling; // <-- ADDED: Get the next line element

        // **Modification:** Check if there is a next line element and put the cursor there.
        if (nextEl) {
          // Newline should collapse to the start of the next line element
          return { node: nextEl, offset: 0 };
        }

        // Existing (original) logic as a fallback for the end of the document
        const lastChild = el && el.lastChild && el.lastChild.nodeType === 3 ? el.lastChild : null;
        if (lastChild) return { node: lastChild, offset: lastChild.data.length };
        return { node: el, offset: el.childNodes.length };
      }

      // fallback: return element with offset 0
      return { node, offset: 0 };
    }
  }

  // no entries -> empty editor
  const last = textNodes.at(-1);
  if (!last) {
    const text = document.createTextNode("");
    root.appendChild(text);
    return { node: text, offset: 0 };
  }

  if (last.node && last.node.nodeType === 3) {
    return { node: last.node, offset: last.end - last.start };
  }

  if (last.node && last.node.isPlaceholder && last.node.parent) {
    return { node: last.node.parent, offset: 0 };
  }

  return { node: last.node, offset: 0 };
}

export function isSelectionBackward(selection) {
  if (!selection.anchorNode || !selection.focusNode) return false;

  try {
    const range = document.createRange();
    range.setStart(selection.anchorNode, selection.anchorOffset);
    range.setEnd(selection.focusNode, selection.focusOffset);
    const collapsed = range.collapsed;
    range.detach?.();
    // If range is collapsed then anchor is after focus (backward)
    return collapsed;
  } catch (e) {
    // fallback to compareDocumentPosition
    if (selection.anchorNode === selection.focusNode) {
      return selection.anchorOffset > selection.focusOffset;
    }
    const pos = selection.anchorNode.compareDocumentPosition(selection.focusNode);
    return !(pos & Node.DOCUMENT_POSITION_FOLLOWING);
  }
}
