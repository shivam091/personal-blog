export class DocumentComposer {
  // Console bridge: sends logs/errors via MessageChannel
  static #liveRuntimeScript() {
    return `
(function() {
  const orig = {
    log: console.log,
    info: console.info,
    debug: console.debug,
    warn: console.warn,
    error: console.error
  };
  let port;

  // Wait for MessageChannel port transfer
  window.addEventListener("message", e => {
    if (e.data === "init-channel" && e.ports[0]) {
      port = e.ports[0];
      window.previewPort = port;
      window.parent?.postMessage({ type: "iframe-ready" }, "*");
    }

    // Notify parent that rendering is complete
    window.parent.postMessage({ type: "render-complete" }, "*");

    // Handle incremental updates
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

      // Execute new JS safely
      if (typeof js === "string") {
        try {
          new Function(js)();
        } catch (err) {
          console.error(err.name + ": " + err.message);
        }
      }
    }
  });

  // Send logs/errors via the channel
  function send(level, args) {
    try {
      if (port) {
        port.postMessage({
          level,
          msg: args.map(a => {
            try {
              return typeof a === "object" ? JSON.stringify(a) : String(a);
            } catch {
              return String(a);
            }
          })
        });
      } else {
        window.parent?.postMessage({ type: "iframe-error", level, args }, "*");
      }
    } catch(_) {}
    orig[level](...args);
  }

  for (const k in orig) {
    console[k] = (...a) => send(k, a);
  }

  window.onerror = (msg, src, line, col) => send("error", [msg + " (" + line + ":" + col + ")"]);
  window.onunhandledrejection = e => send("error", ["Unhandled Promise rejection:", e.reason]);
})();`;
  }

  // Base style reset
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

  // Light/Dark Theme
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

  // Compose full HTML document string for the iframe.
  // Includes incremental-update handling + console bridging.
  static compose({ html = "", css = "", js = "", title = "Playground", safe = false, mode = "export" } = {}) {
    const wrappedJs = safe
      ? `
try {
  new Function(\`${js.replace(/`/g, "\\`")}\`)();
} catch (err) {
  console.error(err.name + ": " + err.message);
}`
      : js;

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
