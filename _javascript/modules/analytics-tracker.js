export default class AnalyticsTracker {
  static initialize() {
    this.#bindEvents();
  }

  static get #trackedElements() {
    return document.querySelectorAll("[data-analytics-event]") || [];
  }

  static #getEventData(element) {
    return {
      event: element.dataset.analyticsEvent,
      category: element.dataset.analyticsCategory || "engagement",
      label: element.dataset.analyticsLabel || "",
      value: parseInt(element.dataset.analyticsValue || "0", 10),
    };
  }

  static #isDevelopment() {
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.endsWith(".test") ||
      window.DEV_MODE === true // Optional global flag
    );
  }

  static #trackEvent(eventData) {
    if (this.#isDevelopment()) {
      console.log("[Analytics Debug]", eventData);
      return;
    }

    if (typeof gtag === "function") {
      gtag("event", eventData.event, {
        event_category: eventData.category,
        event_label: eventData.label,
        value: eventData.value,
      });
    } else {
      console.warn("gtag is not defined. Skipping analytics.");
    }
  }

  static #bindEvents() {
    this.#trackedElements.forEach((element) => {
      element.addEventListener("click", () => {
        const eventData = this.#getEventData(element);
        this.#trackEvent(eventData);
      });
    });
  }

}
