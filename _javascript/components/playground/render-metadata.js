export class RenderMetadata {
  constructor(container, preview) {
    this.container = container;
    this.preview = preview;
    this.previewFrame = this.preview?.previewFrame;
    this.el = container.querySelector(".render-metadata");
    if (!this.el || !this.previewFrame) return;

    this.lastRenderTime = this.lastUpdateTime = 0;

    this.#observeTheme();
    this.#observeRender();
    this.#observeResize();
    this.#update();
  }

  #observeRender() {
    // Performance observer for accurate durations
    const perfObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "iframe-render") {
          this.lastRenderTime = entry.duration;
        } else if (entry.name === "iframe-update") {
          this.lastUpdateTime = entry.duration;
        }

        this.#update();
      }
    });
    try {
      perfObserver.observe({ entryTypes: ["measure"] });
    } catch {}

    // Measure full render (iframe load)
    const measureRender = () => {
      performance.mark("iframe-render-start");
      this.previewFrame.addEventListener("load", () => {
        performance.mark("iframe-render-end");
        performance.measure("iframe-render", "iframe-render-start", "iframe-render-end");
      }, { once: true });
    };

    measureRender();

    // handle already loaded iframe
    if (this.previewFrame.contentDocument?.readyState === "complete") {
      performance.measure("iframe-render", { start: performance.now() - 1, end: performance.now() });
    }
  }

  #observeResize() {
    const resizeObserver = new ResizeObserver(() => this.#update());
    resizeObserver.observe(this.previewFrame);
  }

  #observeTheme() {
    const root = document.documentElement;
    const observer = new MutationObserver(() => this.#update());
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  }

  #update() {
    if (!this.el) return;

    const rect = this.previewFrame.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    const theme = document.documentElement.getAttribute("data-theme") || "light";

    const parts = [
      `<span class="render-dimensions" aria-label="Preview dimensions">${width}px × ${height}px</span>`
    ];

    if (this.lastRenderTime > 0) {
      parts.push(`
        <span class="middle-dot-divider" aria-hidden="true">•</span>
        <span class="render-time" aria-label="Render duration">Rendered in ${this.lastRenderTime.toFixed(2)} ms</span>
      `);
    }

    if (this.lastUpdateTime > 0) {
      parts.push(`
        <span class="middle-dot-divider" aria-hidden="true">•</span>
        <span class="update-time" aria-label="Update duration">Updated in ${this.lastUpdateTime.toFixed(2)} ms</span>
      `);
    }

    parts.push(`
      <span class="middle-dot-divider" aria-hidden="true">•</span>
      <span class="render-theme" aria-label="Active color theme">${this.#formatTheme(theme)} theme</span>
    `);

    this.el.innerHTML = parts.join("");
  }

  #formatTheme(theme) {
    return theme.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
