export default class Alert {
  static #removeAlert(alert) {
    if (!alert) return;
    alert.classList.add("fade-out");
    alert.addEventListener("transitionend", () => alert.remove(), { once: true });
  }

  static #bindEvents() {
    document.querySelectorAll(".alert-dismiss").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.#removeAlert(btn.closest(".alert"));
      });
    });
  }

  static init() {
    this.#bindEvents();
  }
}
