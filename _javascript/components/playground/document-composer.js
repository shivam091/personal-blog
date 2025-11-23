/*
 * Generates the HTML document required for the live preview iframe or for static export.
 * It handles injecting base styles, theme variables, CSS/HTML content, and the critical
 * JavaScript runtime for live updates and console bridging.
 * The runtime script is updated to use the received MessagePort for all upstream communication.
 */
export class DocumentComposer {
  /*
   * Generates a JavaScript string that is injected into the iframe to
   * create the "live" environment. This script overrides console methods
   * and listens for `postMessage` updates from the parent playground.
   */
  static #liveRuntimeScript() {
    return `
(function() {
  // Store original console methods
  const orig = {
    log: console.log,
    info: console.info,
    debug: console.debug,
    warn: console.warn,
    error: console.error
  };
  let port;

  // Wait for the private port
  window.addEventListener("message", e => {
    if (e.data === "init-channel" && e.ports[0]) {
      port = e.ports[0];
      window.previewPort = port;

      // Notify parent via PORT (not global window)
      port.postMessage({ type: "preview:ready" });
    }

    // Handle incremental updates sent from the parent Core/Preview
    if (e.data?.type === "update") {
      const { html, css, js } = e.data;

      // Update HTML body
      if (typeof html === "string") {
        document.body.innerHTML = html;
      }

      // Update CSS (in <style id="live-style">)
      if (typeof css === "string") {
        let style = document.getElementById("live-style");

        if (!style) {
          style = document.createElement("style");
          style.id = "live-style";
          document.head.appendChild(style);
        }
        style.textContent = css;
      }

      // Execute new JS safely using new Function()
      if (typeof js === "string") {
        try {
          new Function(js)();
        } catch (err) {
          console.error(err.name + ": " + err.message); // Log execution errors
        }
      }

      // Send completion signal via PORT
      if (port) port.postMessage({ type: "preview:update" });
    }
  });

  // Function to send logs/errors via the MessageChannel port or fallback to postMessage
  function send(level, args) {
    try {
      if (port) {
        // Send logs via PORT
        port.postMessage({
          type: "console-panel",
          level,
          msg: args.map(a => {
            if (typeof a === "object" && a !== null) {
              if (a instanceof Error) return a.stack || a.message; // Prefer stack trace for errors
              try {
                return JSON.stringify(a);
              } catch {
                return "Object (circular or complex)"; // Safe fallback for serialization errors
              }
            }
            return String(a);
          })
        });
      } else {
        // Fallback postMessage communication if port is not yet established
        window.parent?.postMessage({ type: "iframe-error", level, args }, "*");
      }
    } catch(_) {}

    // Call original console method to ensure logs appear in browser console
    orig[level](...args);
  }

  // Override all original console methods (log, error, etc.) to bridge logs to parent
  for (const k in orig) {
    console[k] = (...a) => send(k, a);
  }

  // Bridge global error handlers
  window.onerror = (msg, src, line, col) => send("error", [msg + " (" + line + ":" + col + ")"]);
  window.onunhandledrejection = e => send("error", ["Unhandled Promise rejection:", e.reason]);
})();`;
  }

  /*
   * Generates basic CSS reset styles.
   */
  static #baseStyle() {
    return `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  background-color: var(--color-bg-default);
  font-family: system-ui, sans-serif;
}`;
  }

  /*
   * Generates CSS styles for light and dark theme variables.
   */
  static #themeStyle() {
    return `
[data-theme="light"] {
  --color-bg-default: hsl(0 0% 100%);
}
[data-theme="soft-dark"] {
  --color-bg-default: hsl(212 18% 16%);
}
[data-theme="dark"] {
  --color-bg-default: hsl(210 15% 6%);
}`;
  }

  /*
   * Composes the full HTML document string for the iframe.
   */
  static compose({ html = "", css = "", js = "", title = "Playground", safe = false, mode = "export" } = {}) {
    // Optionally wrap user JS execution for safety
    const wrappedJs = safe
      ? `
try {
  ${js}
} catch (err) {
  console.error(err.name + ": " + err.message);
}`
      : js;

    // Compose the full document string
    return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
  <style>
    ${this.#themeStyle()}
    ${this.#baseStyle()}
  </style>
  <style id="live-style">
    ${css}
  </style>
</head>
<body>
  ${html}
  <script type="text/javascript">
    ${mode === "live" ? this.#liveRuntimeScript() : ""}
    ${wrappedJs}
  <\/script>
</body>
</html>`;
  }
}
