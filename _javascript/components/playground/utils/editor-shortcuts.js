/**
 * @function selectCurrentLine
 * @description Finds the contenteditable line element (`.cp-line`) that contains the current cursor position
 * (or selection anchor) and replaces the current selection with the **entire contents** of that line.
 * It is typically used to implement a "Select Current Line" keyboard shortcut.
 * @exports
 * @returns {void}
 */
export function selectCurrentLine() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  // Find the closest line element
  let node = sel.getRangeAt(0).startContainer;
  // If inside a text node, move up to its parent element
  if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;

  // Traverse up to find the container element representing a single line
  const line = node?.closest(".cp-line");
  if (!line) return;

  // Create a new range spanning the entire contents of the line
  const newRange = document.createRange();
  newRange.selectNodeContents(line);
  sel.removeAllRanges();
  sel.addRange(newRange);
}

/**
 * @function copyCurrentLine
 * @description Finds the contenteditable line element (`.cp-line`) that contains the current cursor position
 * and copies the **entire text content** of that line to the system clipboard, including a final newline character.
 * It is typically used to implement a "Copy Current Line" keyboard shortcut.
 * @exports
 * @returns {void}
 */
export function copyCurrentLine() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  // Find the closest line element
  let node = sel.getRangeAt(0).startContainer;
  // If inside a text node, move up to its parent element
  if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;

  // Traverse up to find the container element representing a single line
  const line = node?.closest(".cp-line");
  if (!line) return;

  // Write the line's text content plus a newline to the clipboard
  navigator.clipboard.writeText(line.textContent + "\n");
}