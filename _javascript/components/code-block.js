export default class CodeBlock {
  constructor(wrapper) {
    this.#bindLineNumberToggle(wrapper);
  }

  #bindLineNumberToggle(wrapper) {
    const toggleButton = wrapper.querySelector("[data-action='toggleLineNumbers']");
    if (!toggleButton) return;

    // Initialize if not already set
    if (!wrapper.hasAttribute("data-line-numbers")) {
      wrapper.setAttribute("data-line-numbers", "on");
    }

    toggleButton.addEventListener("click", () => {
      const current = wrapper.getAttribute("data-line-numbers") || "on";
      const next = current === "on" ? "off" : "on";
      wrapper.setAttribute("data-line-numbers", next);
    });
  }

  static initializeAll() {
    document.querySelectorAll(".code-block").forEach(wrapper => {
      new CodeBlock(wrapper);
    });
  }
}
