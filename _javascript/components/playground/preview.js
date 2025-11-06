import { DocumentComposer } from "./document-composer";
import { hashString } from "./utils/string-hash";

/**
 * @class Preview
 * @description Manages the rendering and live updating of user-written code inside
 * a sandboxed iframe. It handles communication for console logging, incremental
 * updates, and performance timing via MessageChannel and postMessage.
 */
export class Preview {
  /** @public {HTMLElement} The root container element. */
  root;
  /** @public {HTMLIFrameElement} The iframe element used for sandboxed code execution. */
  previewFrame;
  /** @public {ConsolePanel} The console panel instance for routing logs. */
  consolePanel;
  /** @public {string} The name/title of the playground. */
  playgroundName;

  /** @private {MessageChannel|null} The MessageChannel instance used for bridging console logs. */
  channel = null;
  /** @private {string|null} Hash of the last successfully rendered content to prevent unnecessary reloads. */
  lastHash = null;
  /** @private {string|null} The object URL of the last Blob used for full iframe load. */
  lastBlobUrl = null;
  /** @private {boolean} Flag indicating whether the iframe's runtime script is initialized and ready for updates. */
  iframeReady = false;
  /** @private {number|null} Timestamp when the last update process started (used for performance timing). */
  lastUpdateStart = null;
  /** @private {MutationObserver} Observer to monitor theme changes on the parent document. */
  themeObserver;

  /**
   * @constructor
   * @param {HTMLElement} root The root DOM element for the playground.
   * @param {ConsolePanel} consolePanel The console panel instance.
   */
  constructor(root, consolePanel) {
    this.root = root;
    this.previewFrame = root.querySelector(".preview-frame");
    this.consolePanel = consolePanel;
    this.playgroundName = root.querySelector(".playground-name")?.textContent.trim();

    // Centralized listener for cross-frame messages
    window.addEventListener("message", this.#handleIframeMessage);

    // Observe theme changes in parent document's <html> element
    this.themeObserver = new MutationObserver(() => this.#applyTheme());
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  }

  /**
   * Centralized handler for all messages coming from the preview iframe.
   * Handles readiness signals and update completion timing.
   * @private
   * @param {MessageEvent} e The message event.
   */
  #handleIframeMessage = (e) => {
    // Basic security check: ensure the message source is the iframe's content window
    if (e.source !== this.previewFrame?.contentWindow) return;

    if (e.data?.type === "preview:ready") {
      this.iframeReady = true;
      this.#applyTheme();
      console.debug("[Preview] Iframe ready for incremental updates.");

      // Mark performance for initial render time
      performance.mark("iframe-render-end");
      performance.measure("iframe-render", "iframe-render-start", "iframe-render-end");
    }

    if (e.data?.type === "preview:update-complete" && this.lastUpdateStart) {
      const end = performance.now();

      // Mark performance for incremental update time
      performance.mark("iframe-update-end");
      performance.measure("iframe-update", { start: this.lastUpdateStart, end });

      const duration = end - this.lastUpdateStart;
      this.lastUpdateStart = null;

      console.debug(`[Preview] Frame updated in ${duration.toFixed(2)} ms`);
    }
  }

  /**
   * Public entry to (re)run the preview. Determines whether to perform an incremental update
   * (if the iframe is ready) or a full reload (if content changed or iframe is not initialized).
   * @public
   * @param {{html: string, css: string, js: string}} content The new code bundle to run.
   */
  run({ html, css, js }) {
    const content = html + css + js;
    const hash = hashString(content);

    // If content hash is unchanged, skip reload/update
    if (hash === this.lastHash && this.lastBlobUrl) {
      console.debug("[Preview] Skipped reload — content unchanged.");
      return;
    }

    this.lastHash = hash;

    // Compose the full HTML document string
    const doc = DocumentComposer.compose({ html, css, js, title: this.playgroundName, safe: true, mode: "live" });

    if (this.iframeReady && this.previewFrame?.contentWindow) {
      // Incremental Update (faster)
      this.lastUpdateStart = performance.now();
      performance.mark("iframe-update-start");

      console.debug("[Preview] Sending incremental update via window.postMessage.");
      // The runtime script inside the iframe handles receiving this message
      this.previewFrame.contentWindow.postMessage({ type: "update", html, css, js }, "*");
    } else {
      // Full Reload (slower, required for initial load or severe DOM change)
      this.#createIframe(doc);
    }
  }

  /**
   * Creates a new sandboxed iframe using a Blob URL containing the full document.
   * It cleans up old resources, establishes a new MessageChannel for console logging,
   * and initiates the load via `iframe.src`.
   * @private
   * @param {string} doc The full HTML document string.
   */
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

    // Sandbox & reset iframe source to ensure a fresh start
    iframe.src = "about:blank";
    iframe.removeAttribute("sandbox");
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");

    // Setup new MessageChannel for console bridging
    const channel = new MessageChannel();
    this.channel = channel;

    // Route messages received on port1 (from iframe) to the ConsolePanel
    channel.port1.onmessage = e => {
      const { level, msg } = e.data || {};
      if (level && msg) this.consolePanel.append(level, msg);
    };

    // Create Blob URL for the new HTML document
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    this.lastBlobUrl = url;

    performance.mark("iframe-render-start");

    // Use onload to initiate port transfer after the iframe document is loaded
    iframe.onload = () => {
      try {
        // Send port2 to the iframe's content window along with the 'init-channel' signal
        iframe.contentWindow.postMessage("init-channel", "*", [channel.port2]);
      } catch (err) {
        console.error("Port transfer failed:", err);
      }
    };

    // Set the source to the Blob URL to load the new document
    iframe.src = url;
  }

  /**
   * Applies the current theme (`data-theme` attribute from the parent document)
   * to the iframe's document element.
   * @private
   */
  #applyTheme() {
    const iframeDoc = this.previewFrame?.contentDocument?.documentElement;
    const theme = document.documentElement.dataset.theme || "light";

    if (iframeDoc) {
      iframeDoc.setAttribute("data-theme", theme);

      // Notify iframe of theme change for potential JS-controlled styling
      if (this.iframeReady && this.previewFrame?.contentWindow) {
        this.previewFrame.contentWindow.postMessage({ type: "theme-change", theme }, "*");
      }
    }
  }
}