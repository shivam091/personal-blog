import { formatCode } from "./prettier";
import Prism from "prismjs";

export default class Editor {
  constructor(root, type) {
    this.root = root;
    this.type = type;
    this.textarea = root.querySelector(`[data-editor="${type}"] textarea`);
    this.highlightDiv = document.createElement("pre");
    this.highlightDiv.className = `editor-highlight language-${type}`;
    this.highlightDiv.setAttribute("aria-hidden", "true");
    this.highlightDiv.style.position = "absolute";
    this.highlightDiv.style.top = 0;
    this.highlightDiv.style.left = 0;
    this.highlightDiv.style.pointerEvents = "none";
    this.highlightDiv.style.width = "100%";
    this.highlightDiv.style.padding = "8px";
    this.highlightDiv.style.overflow = "auto";
    this.textarea.parentNode.insertBefore(this.highlightDiv, this.textarea);

    this.initial = this.textarea.value;
    this.highlight();
  }

  get value() {
    return this.textarea.value;
  }

  set value(val) {
    this.textarea.value = val;
  }

  reset() {
    this.value = this.initial;
  }

  async format() {
    this.value = await formatCode(this.value, this.type);
  }

  highlight() {
    this.highlightDiv.innerHTML = Prism.highlight(this.value, Prism.languages[this.type], this.type);
  }
}



// export default class Editor {
//   constructor(root, type) {
//     this.root = root;
//     this.type = type;
//     this.textarea = root.querySelector(`[data-editor="${type}"] textarea`);
//     this.initial = this.textarea.value;
//   }
//
//   get value() {
//     return this.textarea.value;
//   }
//
//   set value(val) {
//     this.textarea.value = val;
//   }
//
//   reset() {
//     this.value = this.initial;
//   }
// }


// import Prism from "prismjs";
// import "prismjs/components/prism-markup";      // HTML
// import "prismjs/components/prism-css";         // CSS
// import "prismjs/components/prism-javascript";  // JS
// import "prismjs/plugins/line-numbers/prism-line-numbers";
// import "prismjs/themes/prism.css";
// import "prismjs/plugins/line-numbers/prism-line-numbers.css";
//
// export default class Editor {
//   constructor(root, type) {
//     this.root = root;
//     this.type = type;
//
//     // textarea
//     this.textarea = root.querySelector(`[data-editor="${type}"] textarea`);
//
//     // create overlay highlight container
//     this.pre = document.createElement("pre");
//     this.pre.className = "line-numbers";
//     this.code = document.createElement("code");
//     this.code.className = `language-${this._mapLanguage(type)}`;
//     this.pre.appendChild(this.code);
//
//     // insert <pre><code> before textarea
//     this.textarea.parentNode.insertBefore(this.pre, this.textarea);
//
//     // style positioning
//     this.pre.style.position = "absolute";
//     this.textarea.style.background = "transparent";
//     this.textarea.style.color = "transparent";
//     this.textarea.style.caretColor = "black";
//     this.textarea.style.resize = "none";
//
//     this.initial = this.textarea.value;
//
//     // bind events
//     this._bindEvents();
//     this.updateHighlight();
//   }
//
//   _mapLanguage(type) {
//     switch (type) {
//       case "html": return "markup";
//       case "css": return "css";
//       case "js": return "javascript";
//       default: return "clike";
//     }
//   }
//
//   _bindEvents() {
//     this.textarea.addEventListener("input", () => this.updateHighlight());
//
//     // sync scroll
//     this.textarea.addEventListener("scroll", () => {
//       this.pre.scrollTop = this.textarea.scrollTop;
//       this.pre.scrollLeft = this.textarea.scrollLeft;
//     });
//   }
//
//   updateHighlight() {
//     const escaped = this.textarea.value
//       .replace(/&/g, "&amp;")
//       .replace(/</g, "&lt;")
//       .replace(/>/g, "&gt;");
//
//     this.code.innerHTML = escaped;
//     Prism.highlightElement(this.code);
//   }
//
//   get value() {
//     return this.textarea.value;
//   }
//
//   set value(val) {
//     this.textarea.value = val;
//     this.updateHighlight();
//   }
//
//   reset() {
//     this.value = this.initial;
//   }
// }
