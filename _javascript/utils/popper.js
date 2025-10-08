import { createPopper } from "@popperjs/core";

const instances = new WeakMap();

// Default modifiers for all poppers
const defaultModifiers = [
  { name: "offset", options: { offset: [0, 8] } },
  { name: "preventOverflow", options: { boundary: "viewport" } },
  { name: "flip", options: { fallbackPlacements: ["top", "bottom", "right", "left"] } },
  { name: "eventListeners", options: { scroll: true, resize: true } },
];

// Creates a Popper instance for an element
export function createInstance(target, popperElement, options = {}) {
  const arrowEl = popperElement.querySelector("[data-popper-arrow]");

  // Create a fresh modifier array per instance to avoid mutating defaults
  const modifiers = [...defaultModifiers];

  if (arrowEl) {
    modifiers.push({ name: "arrow", options: { element: arrowEl, padding: 5 } });
  }

  // Merge user modifiers (user modifiers take precedence)
  const mergedModifiers = options.modifiers
    ? [...modifiers.filter(m => !options.modifiers.some(um => um.name === m.name)), ...options.modifiers]
    : modifiers;

  const instance = createPopper(target, popperElement, {
    placement: options.placement || "top",
    strategy: options.strategy || "absolute",
    modifiers: mergedModifiers,
  });

  instances.set(popperElement, instance);
  return instance;
}

// Destroys a Popper instance for an element
export function destroyInstance(popperElement) {
  const instance = instances.get(popperElement);
  if (instance) {
    instance.destroy();
    instances.delete(popperElement);
  }
}

// Updates a Popper instance
export function updateInstance(popperElement) {
  const instance = instances.get(popperElement);
  if (instance) instance.update();
}
