/*
 * Collects, formats, and displays real-time metrics about the code preview frame,
 * including its dimensions, rendering performance, and active theme.
 * Updated to use scoped CustomEvents instead of the global Performance API to avoid collisions.
 */
export class RenderMetadata {
  // Duration of the last full render, in milliseconds.
  renderTime = 0;

  // Duration of the last incremental update, in milliseconds.
  updateTime = 0;

  // Observer for tracking iframe dimension changes.
  resizeObserver = null;

  // Observer for tracking theme changes on <html>.
  themeObserver = null;

  // Store handler reference for clean removal
  #statsHandler = null;

  constructor(container, preview) {
    this.container = container;
    this.preview = preview;
    this.previewFrame = this.preview?.previewFrame;
    this.el = container.querySelector(".render-metadata");

    if (!this.el || !this.previewFrame) return;

    this.#setupObservers();
    // Call update after all observers are ready to capture initial state.
    this.#update();
  }

  /*
   * Groups and initiates all main observer types (Performance, Resize, Theme).
   */
  #setupObservers() {
    this.#observeRenderStats();
    this.#observeResize();
    this.#observeTheme();
  }

  /*
   * Listens for the specific 'playground:render-stats' event dispatched by the
   * Preview class on this specific container.
   */
  #observeRenderStats() {
    this.#statsHandler = (e) => {
      const { type, duration } = e.detail;

      if (type === "render") {
        this.renderTime = duration;
      } else if (type === "update") {
        this.updateTime = duration;
      }

      this.#update(); // Refresh display after receiving a new performance metric
    };

    this.container.addEventListener("playground:render-stats", this.#statsHandler);
  }

  /*
   * Sets up a ResizeObserver to monitor the `previewFrame` dimensions.
   * Triggers a display update on resize.
   */
  #observeResize() {
    this.resizeObserver = new ResizeObserver(() => this.#update());
    this.resizeObserver.observe(this.previewFrame);
  }

  /*
   * Sets up a MutationObserver to monitor the `data-theme` attribute on the `<html>` element.
   * Triggers a display update on theme change.
   */
  #observeTheme() {
    const root = document.documentElement;
    this.themeObserver = new MutationObserver(() => this.#update());
    this.themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  }

  /*
   * The core rendering function that compiles and displays all collected metadata
   * (dimensions, performance timings, theme) into the status element.
   */
  #update() {
    const rect = this.previewFrame.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    const theme = document.documentElement.getAttribute("data-theme") || "light";

    const parts = [
      // Dimensions
      `<span class="render-dimensions" aria-label="Preview dimensions">${width}px × ${height}px</span>`
    ];

    // Initial rendertime
    if (this.renderTime > 0) {
      parts.push(`
        <span class="render-time" aria-label="Initial Render duration">Rendered in ${this.renderTime.toFixed(2)} ms</span>
      `);
    }

    // Update time
    if (this.updateTime > 0) {
      parts.push(`
        <span class="update-time" aria-label="Last Update duration">Updated in ${this.updateTime.toFixed(2)} ms</span>
      `);
    }

    // Theme
    parts.push(`
      <span class="render-theme" aria-label="Active color theme">${this.#formatTheme(theme)} theme</span>
    `);

    this.el.innerHTML = parts.join("");
  }

  /*
   * Formats a theme string (e.g., "soft-dark") into a display-friendly format ("Soft Dark").
   */
  #formatTheme(theme) {
    // Replace hyphens with space, then capitalize the first letter of every word
    return theme.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /*
   * Public cleanup method for disconnecting all observers to prevent memory leaks
   * when the component is destroyed.
   */
  destroy() {
    // Remove DOM event listener
    if (this.#statsHandler) {
      this.container.removeEventListener("playground:render-stats", this.#statsHandler);
    }

    this.resizeObserver?.disconnect();
    this.themeObserver?.disconnect();
    this.el = null; // Clear reference to DOM element
  }
}
