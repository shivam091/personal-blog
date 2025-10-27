import { DocumentComposer } from "./document-composer";

export class Preview {
  constructor(root, consolePanel) {
    this.root = root;
    this.previewFrame = root.querySelector(".preview-frame");
    this.consolePanel = consolePanel;
    this.playgroundName = root.querySelector(".playground-name")?.textContent.trim();

    this.channel = null;
    this.lastHash = null;
    this.lastBlobUrl = null;
    this.iframeReady = false;

    // Listen for iframe readiness and theme sync
    window.addEventListener("message", e => {
      if (e.data?.type === "iframe-ready") {
        this.iframeReady = true;
        this.#applyTheme();
        console.debug("[Preview] Iframe ready for incremental updates.");
      }

      if (e.data?.type === "render-complete" && this.lastUpdateStart) {
        const end = performance.now();
        const duration = end - this.lastUpdateStart;

        performance.mark("iframe-update-end");
        performance.measure("iframe-update", { start: this.lastUpdateStart, end });

        this.lastUpdateStart = null;
        console.debug(`[Preview] Frame updated in ${duration.toFixed(2)} ms`);
      }
    });

    // Observe theme changes in parent document
    const observer = new MutationObserver(() => this.#applyTheme());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    this.themeObserver = observer;
  }

  // Public entry to (re)run the preview. Performs incremental update if iframe already loaded.
  run({ html, css, js }) {
    const content = html + css + js;
    const hash = this.#hash(content);

    // If unchanged → skip
    if (hash === this.lastHash && this.lastBlobUrl) {
      console.debug("[Preview] Skipped reload — content unchanged.");
      return;
    }

    this.lastHash = hash;

    const doc = DocumentComposer.compose({ html, css, js, title: this.playgroundName, safe: true, mode: "live" });

    if (this.iframeReady && this.previewFrame?.contentWindow) {
      this.lastUpdateStart = performance.now();
      performance.mark("iframe-update-start");

      console.debug("[Preview] Sending incremental update via window.postMessage.");

      this.previewFrame.contentWindow.postMessage({ type: "update", html, css, js }, "*");
    } else {
      this.#createIframe(doc);
    }
  }

  // Create iframe from scratch with new document + console bridge.
  #createIframe(doc) {
    const iframe = this.previewFrame;

    // Clean up old connections
    if (this.channel) {
      this.channel.port1.close();
      this.channel.port2.close();
      this.channel = null;
    }
    if (this.lastBlobUrl) {
      URL.revokeObjectURL(this.lastBlobUrl);
      this.lastBlobUrl = null;
    }

    this.iframeReady = false;

    // Sandbox & reset
    iframe.src = "about:blank";
    iframe.removeAttribute("sandbox");
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");

    // Setup console message channel
    const channel = new MessageChannel();
    this.channel = channel;

    channel.port1.onmessage = e => {
      const { level, msg } = e.data || {};
      if (level && msg) this.consolePanel.append(level, msg);
    };

    // Blob for new HTML document
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    this.lastBlobUrl = url;

    iframe.onload = () => {
      try {
        const renderStart = performance.now();

        iframe.contentWindow.postMessage("init-channel", "*", [channel.port2]);

        iframe.contentWindow.addEventListener("DOMContentLoaded", () => {
          const renderEnd = performance.now();
          const duration = renderEnd - renderStart;
          this.previewFrame.dispatchEvent(new CustomEvent("render-complete", { detail: duration }));
        });
      } catch (err) {
        console.error("Port transfer failed:", err);
      }

      // Delay slightly to ensure DOM readiness
      setTimeout(() => this.#applyTheme(), 30);
      this.iframeReady = true;
    };

    iframe.src = url;
  }

  // Apply current theme to iframe document.
  #applyTheme() {
    const iframeDoc = this.previewFrame?.contentDocument?.documentElement;
    const theme = document.documentElement.dataset.theme || "light";
    if (iframeDoc) iframeDoc.setAttribute("data-theme", theme);
  }

  // Simple hash for change detection.
  #hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}
