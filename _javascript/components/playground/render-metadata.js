/**
 * @class RenderMetadata
 * @description Collects, formats, and displays real-time metrics about the code preview frame,
 * including its dimensions, rendering performance, and active theme. It uses observers
 * to react to changes.
 */
export class RenderMetadata {
  /** @public {HTMLElement} The root container element. */
  container;
  /** @public {Preview} The preview component instance. */
  preview;
  /** @public {HTMLIFrameElement|null} The preview iframe element. */
  previewFrame;
  /** @public {HTMLElement|null} The DOM element used to display the metadata. */
  el;

  /** @private {number} Duration of the last full render, in milliseconds. */
  lastRenderTime = 0;
  /** @private {number} Duration of the last incremental update, in milliseconds. */
  lastUpdateTime = 0;
  /** @private {PerformanceObserver|null} Observer for custom performance marks/measures. */
  perfObserver = null;
  /** @private {ResizeObserver|null} Observer for tracking iframe dimension changes. */
  resizeObserver = null;
  /** @private {MutationObserver|null} Observer for tracking theme changes on <html>. */
  themeObserver = null;


  /**
   * @constructor
   * @param {HTMLElement} container The root container element.
   * @param {Preview} preview The preview component instance.
   */
  constructor(container, preview) {
    this.container = container;
    this.preview = preview;
    this.previewFrame = this.preview?.previewFrame;
    this.el = container.querySelector(".render-metadata");

    // Exit early if the required elements are missing
    if (!this.el || !this.previewFrame) return;

    this.#setupObservers();
    // Call update after all observers are ready to capture initial state.
    this.#update();
  }

  /**
   * Groups and initiates all main observer types (Performance, Resize, Theme).
   * @private
   */
  #setupObservers() {
    this.#initPerformanceObserver();
    this.#observeResize();
    this.#observeTheme();
  }

  /**
   * Sets up a PerformanceObserver to listen for custom performance measures
   * (`iframe-render`, `iframe-update`) dispatched by the `Preview` class.
   * @private
   */
  #initPerformanceObserver() {
    this.perfObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "iframe-render") {
          this.lastRenderTime = entry.duration;
        } else if (entry.name === "iframe-update") {
          this.lastUpdateTime = entry.duration;
        }
        this.#update(); // Refresh display after receiving a new performance metric
      }
    });
    try {
      this.perfObserver.observe({ entryTypes: ["measure"] });
    } catch (error) {
       console.warn("PerformanceObserver failed to start:", error);
    }
  }

  /**
   * Sets up a ResizeObserver to monitor the `previewFrame` dimensions.
   * Triggers a display update on resize.
   * @private
   */
  #observeResize() {
    this.resizeObserver = new ResizeObserver(() => this.#update());
    this.resizeObserver.observe(this.previewFrame);
  }

  /**
   * Sets up a MutationObserver to monitor the `data-theme` attribute on the `<html>` element.
   * Triggers a display update on theme change.
   * @private
   */
  #observeTheme() {
    const root = document.documentElement;
    this.themeObserver = new MutationObserver(() => this.#update());
    this.themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  }

  /**
   * The core rendering function that compiles and displays all collected metadata
   * (dimensions, performance timings, theme) into the status element.
   * @private
   */
  #update() {
    if (!this.el || !this.previewFrame) return;

    const rect = this.previewFrame.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    const theme = document.documentElement.getAttribute("data-theme") || "light";

    const parts = [
      // Dimensions
      `<span class="render-dimensions" aria-label="Preview dimensions">${width}px × ${height}px</span>`
    ];

    // Initial Render Time
    if (this.lastRenderTime > 0) {
      parts.push(`
        <span class="middle-dot-divider" aria-hidden="true">•</span>
        <span class="render-time" aria-label="Initial Render duration">Rendered in ${this.lastRenderTime.toFixed(2)} ms</span>
      `);
    }

    // Update Time
    if (this.lastUpdateTime > 0) {
      parts.push(`
        <span class="middle-dot-divider" aria-hidden="true">•</span>
        <span class="update-time" aria-label="Last Update duration">Updated in ${this.lastUpdateTime.toFixed(2)} ms</span>
      `);
    }

    // Theme
    parts.push(`
      <span class="middle-dot-divider" aria-hidden="true">•</span>
      <span class="render-theme" aria-label="Active color theme">${this.#formatTheme(theme)} theme</span>
    `);

    this.el.innerHTML = parts.join("");
  }

  /**
   * Formats a theme string (e.g., "soft-dark") into a display-friendly format ("Soft Dark").
   * @private
   * @param {string} theme The raw theme string.
   * @returns {string} The formatted theme string.
   */
  #formatTheme(theme) {
    // Replace hyphens with space, then capitalize the first letter of every word
    return theme.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /**
   * Public cleanup method for disconnecting all observers to prevent memory leaks
   * when the component is destroyed.
   * @public
   */
  destroy() {
    this.perfObserver?.disconnect();
    this.resizeObserver?.disconnect();
    this.themeObserver?.disconnect();
    this.el = null; // Clear reference to DOM element
  }
}