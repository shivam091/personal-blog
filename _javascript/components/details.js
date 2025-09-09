import IconFlat from "../animations/icons/flat";

export default class Details {
  static initialize() {
    document.querySelectorAll("details").forEach(details => {
      const svg = details.querySelector(".icon-flat");
      if (!svg) return;

      const icon = new IconFlat(svg);

      // Initial sync
      icon.setState(details.open);

      // Keep in sync
      details.addEventListener("toggle", () => {
        icon.setState(details.open);
      });
    });
  }
}
