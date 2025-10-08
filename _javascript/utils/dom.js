// Generate a unique ID with optional prefix
export function generateId(prefix = "floating") {
  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`;
}

// Creates a DOM element with optional attributes, dataset, styles, events, and children.
export function createElement(tag, {
  className,
  id,
  text,
  html,
  attrs = {},
  dataset = {},
  style = {},
  events = {},
  children = []
} = {}) {
  const el = document.createElement(tag);

  // Classes
  if (className) el.className = Array.isArray(className) ? className.join(" ") : className;

  // ID
  if (id) el.id = id;

  // Content (html overrides text)
  if (html != null) el.innerHTML = html;
  else if (text != null) el.textContent = text;

  // Attributes
  Object.entries(attrs).forEach(([key, value]) => {
    if (value != null) el.setAttribute(key, value);
  });

  // Data attributes
  Object.entries(dataset).forEach(([key, value]) => {
    if (value != null) el.dataset[key] = value;
  });

  // Styles
  Object.assign(el.style, style);

  // Events
  Object.entries(events).forEach(([event, handler]) => {
    if (typeof handler === "function") el.addEventListener(event, handler);
  });

  // Children (Node or string)
  children.forEach(child => {
    if (child instanceof Node) el.append(child);
    else if (child != null) el.append(child);
  });

  return el;
}
