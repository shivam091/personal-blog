export default class CodeBlockUtils {
  // Toggle line numbers on a single code block wrapper
  static toggleLines(wrapper) {
    const btn = wrapper.querySelector(".btn-toggle-lines");
    const gutter = wrapper.querySelector(".gutter");

    if (!btn || !gutter) return;

    btn.addEventListener("click", () => {
      const current = wrapper.getAttribute("data-line-numbers") || "on";
      const next = current === "on" ? "off" : "on";
      wrapper.setAttribute("data-line-numbers", next);
    });

    // Initialize if not already set
    if (!wrapper.hasAttribute("data-line-numbers")) {
      wrapper.setAttribute("data-line-numbers", "on");
    }
  }

  // Initialize all code blocks on the page
  static initAll() {
    document.querySelectorAll(".code-block").forEach(wrapper => {
      this.toggleLines(wrapper);
    });
  }
}
