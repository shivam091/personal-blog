export function Diagnostics(editor) {
  const gutter = document.createElement("div");
  gutter.className = "editor-gutter";
  editor.codeEditor.appendChild(gutter);

  editor.on("update", ({ ast }) => {
    gutter.innerHTML = "";
    console.log(ast.errors)
    if (!ast || !ast.errors) return;
    ast.errors.forEach(err => {
      const el = document.createElement("div");
      el.className = "gutter-error";
      el.style.top = `${(err.line - 1) * 20}px`;
      el.textContent = "●";
      gutter.appendChild(el);
    });
  });
}
