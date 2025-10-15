export default class Preview {
  constructor(root, consolePanel) {
    this.previewFrame = root.querySelector(".preview-iframe");
    this.consolePanel = consolePanel;
  }

  run(html, css, js) {
    const doc = this._composeDocument(html, css, js);
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    this.previewFrame.src = url;
    this.previewFrame.onload = () => URL.revokeObjectURL(url);
  }

  _composeDocument(html, css, js) {
    const consolePatch = `
      <script>
        (function(){
          const orig = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error
          };
          function send(level, args){
            try {
              parent.postMessage(
                {type:"cp-console", level, msg: args.map(a => {
                  try { return (typeof a === "object" ? JSON.stringify(a) : String(a)); }
                  catch(e){ return String(a); }
                })},
                "*"
              );
            } catch(e){}
            orig[level](...args);
          }
          console.log = (...a)=>send("log", a);
          console.info = (...a)=>send("info", a);
          console.warn = (...a)=>send("warn", a);
          console.error = (...a)=>send("error", a);
          window.onerror = (msg,src,line,col)=>send("error",[msg+" ("+line+":"+col+")"]);
        })();
      <\/script>
    `;

    const baseStyle = `
      html, body {
        margin: 0;
        padding: 0;
        background: var(--color-bg-default);
        color: var(--color-fg-default);
      }
    `;

    const scripts = `
      ${consolePatch}
      <script>${js}<\/script>
    `;

    return `<!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>Playground</title>
    <style>${baseStyle}</style>
    <style>${css}</style>
  </head>
  <body>
  ${html}
  ${scripts}
  </body>
  </html>`;
  }
}
