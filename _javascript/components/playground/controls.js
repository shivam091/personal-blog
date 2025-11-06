/**
 * @class Controls
 * @description Responsible for establishing a declarative link between interactive DOM elements
 * (buttons, checkboxes) using the `data-action` attribute and specific application
 * functions defined in the actions map. It uses event delegation for efficiency.
 */
export class Controls {
  /** @public {HTMLElement} The root element containing the controls. */
  container;
  /** @public {Object<string, function>} Map of action names to handler functions. */
  actions;

  /**
   * Manages binding click and change events for control elements (buttons/checkboxes)
   * based on their 'data-action' attributes.
   * @constructor
   * @param {HTMLElement} container - The root element containing the controls.
   * @param {Object<string, function>} [actions={}] - Map of action names to handler functions.
   */
  constructor(container, actions = {}) {
    this.container = container;
    this.actions = actions;

    this.#bindActions();
  }

  /**
   * Attaches two primary delegated listeners (`click` and `change`) to the container.
   * @private
   */
  #bindActions() {
    this.container.addEventListener("click", this.#handleButtonClick);
    this.container.addEventListener("change", this.#handleCheckboxChange);
  }

  /**
   * Handles clicks delegated from the container. Executes the corresponding action
   * handler if the clicked element (or its ancestor) has a `data-action` attribute
   * and is not a checkbox.
   * @private
   * @param {Event} event - The click event.
   */
  #handleButtonClick = (event) => {
    // Look for elements with data-action that are NOT checkboxes
    const btn = event.target.closest("[data-action]:not(input)");
    if (!btn) return;

    const actionName = btn.dataset.action;

    if (typeof this.actions[actionName] === "function") {
      this.actions[actionName](); // Execute handler with no arguments
    }
  }

  /**
   * Handles change events delegated from the container, specifically targeting checkboxes.
   * It executes the action handler and synchronizes the state to the closest ancestor with class `.pen`.
   * @private
   * @param {Event} event - The change event.
   */
  #handleCheckboxChange = (event) => {
    // Only target checkboxes with data-action
    const cb = event.target.closest("input[type=checkbox][data-action]");
    if (!cb) return;

    const actionName = cb.dataset.action;
    const checked = cb.checked;

    // 1. Execute the action handler, passing the boolean state
    if (typeof this.actions[actionName] === "function") {
      this.actions[actionName](checked);
    }

    // 2. Sync state to the closest container (e.g., .pen)
    const pen = cb.closest(".pen");
    if (pen) {
      // Synchronize the checkbox state to a data-attribute on the parent (e.g., data-autorun="true")
      pen.setAttribute(`data-${actionName}`, String(checked));
    }
  }
}