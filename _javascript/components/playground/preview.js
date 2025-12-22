import { DocumentComposer } from "./document-composer";
import { hashString } from "./utils/string-hash";

/*
 * Manages the rendering and live updating of user-written code inside
 * a sandboxed iframe. It handles communication for console logging, incremental
 * updates, and performance timing via a private MessageChannel and postMessage.
 */
export class Preview {
  // The MessageChannel instance used for bridging console logs and status.
  channel = null;

  // Hash of the last successfully rendered content to prevent unnecessary reloads.
  lastHash = null;

  // The object URL of the last Blob used for full iframe load.
  lastBlobUrl = null;

  // Flag indicating whether the iframe's runtime script is initialized and ready for updates.
  iframeReady = false;

  // Timestamp when the last update process started (used for performance timing).
  lastUpdateStart = null;

  constructor(root, consolePanel) {
    this.root = root;
    this.previewFrame = root.querySelector(".preview-frame");
    this.consolePanel = consolePanel;
    this.playgroundName = root.querySelector(".playground-name")?.textContent.trim();
  }

  /*
   * Centralized handler for messages coming specifically from this instance's private channel.
   */
  #handleChannelMessage = (e) => {
    const data = e.data;

    // Iframe is ready
    if (data?.type === "preview:ready") {
      const duration = performance.now() - this.renderStartTime;
      this.iframeReady = true;

      console.debug("[Playground] Channel established. Iframe ready.");

      // Dispatch scoped event for RenderMetadata
      this.#dispatchMetric("render", duration);
      console.debug(`[Playground] Frame rendered in ${duration.toFixed(2)} ms`);
    }

    // Update Complete
    if (data?.type === "preview:update" && this.lastUpdateStart) {
      const duration = performance.now() - this.lastUpdateStart;
      this.lastUpdateStart = null;

      this.#dispatchMetric("update", duration);
      console.debug(`[Playground] Frame updated in ${duration.toFixed(2)} ms`);
    }

    // Console Logs
    if (data?.type === "console-panel") {
      this.consolePanel.append(data.level, data.msg);
    }

    // Errors
    if (data?.type === "iframe-error") {
      this.consolePanel.append(data.level, data.args);
    }
  };

  /*
   * Helper to dispatch performance metrics to the container and RenderMetadata listens
   * to it.
   */
  #dispatchMetric(type, duration) {
    this.root.dispatchEvent(new CustomEvent("playground:render-stats", {
      detail: { type, duration }
    }));
  }

  /*
   * Public entry to (re)run the preview. Determines whether to perform an incremental update
   * (if the iframe is ready) or a full reload (if content changed or iframe is not initialized).
   */
  run({ html, css, js }) {
    const content = html + css + js;
    const hash = hashString(content);

    // If content hash is unchanged, skip reload/update
    if (hash === this.lastHash && this.lastBlobUrl) {
      console.debug("[Playground] Frame reloading skipped — content unchanged.");
      return;
    }

    this.lastHash = hash;

    // Compose the full HTML document string
    const doc = DocumentComposer.compose({ html, css, js, title: this.playgroundName, safe: true, mode: "live" });

    if (this.iframeReady && this.previewFrame?.contentWindow) {
      // Incremental Update
      this.lastUpdateStart = performance.now();
      console.debug("[Playground] Sending incremental update.");

      // Send update DOWN via standard postMessage (one-way)
      this.previewFrame.contentWindow.postMessage({ type: "update", html, css, js }, "*");
    } else {
      // Full Reload
      this.#createIframe(doc);
    }
  }

  /*
   * Creates a new sandboxed iframe using a Blob URL containing the full document.
   * It cleans up old resources, establishes a new MessageChannel for console logging,
   * and initiates the load via `iframe.src`.
   */
  #createIframe(doc) {
    const iframe = this.previewFrame;

    // Cleanup old channel
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

    // Setup new Private Channel
    this.channel = new MessageChannel();

    // Listen to Port 1
    this.channel.port1.onmessage = this.#handleChannelMessage;

    // Sandbox & reset iframe source to ensure a fresh start
    iframe.src = "about:blank";
    iframe.removeAttribute("sandbox");
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");

    // Create Blob URL for the new HTML document
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    this.lastBlobUrl = url;

    this.renderStartTime = performance.now();

    // Set the source to the Blob URL to load the new document
    iframe.src = url;
  }

  /*
   * Applies the current theme (`data-theme` attribute from the parent document)
   * to the iframe's document element.
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
