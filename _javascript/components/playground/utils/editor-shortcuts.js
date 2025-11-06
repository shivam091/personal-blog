/*
 * Private utility function to find the contenteditable line element (`.editor-line`)
 * that contains the current cursor position (or selection anchor).
 */
function _getCurrentLineElement() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return null;

  // Find the closest line element
  let node = selection.getRangeAt(0).startContainer;

  // If inside a text node, move up to its parent element
  if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;

  // Traverse up to find the container element representing a single line
  const line = node?.closest(".editor-line");

  return line;
}

/*
 * Finds the contenteditable line element (`.editor-line`) that contains the current cursor position
 * (or selection anchor) and replaces the current selection with the **entire contents** of that line.
 *
 * It is typically used to implement a "Select Current Line" keyboard shortcut.
 */
export function selectCurrentLine() {
  const selection = window.getSelection();
  const line = _getCurrentLineElement();

  if (!line) return;

  // Create a new range spanning the entire contents of the line
  const newRange = document.createRange();
  newRange.selectNodeContents(line);

  selection.removeAllRanges();
  selection.addRange(newRange);
}

/*
 * Finds the contenteditable line element (`.editor-line`) that contains the current cursor position
 * and copies the **entire text content** of that line to the system clipboard, including a final
 * newline character.
 *
 * It is typically used to implement a "Copy Current Line" keyboard shortcut.
 */
export function copyCurrentLine() {
  const line = _getCurrentLineElement();

  if (!line) return;

  // Write the line's text content plus a newline to the clipboard
  navigator.clipboard.writeText(line.textContent + "\n");
}
