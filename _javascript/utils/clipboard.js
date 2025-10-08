import ClipboardCheck from "./../animations/icons/clipboard-check";
import Tooltip from "../components/tooltip";

export default class Clipboard {
  constructor(root) {
    this.root = root;
    this.button = this.findButton();
    this.textSource = this.findTextSource();
    this.checkSvg = this.button?.querySelector(".icon-clipboard-check");
    this.checkAnimator = this.checkSvg ? new ClipboardCheck(this.checkSvg) : null;

    this.attachEvents();
  }

  get isCode() {
    return this.root.hasAttribute("data-copy-code");
  }

  get isLink() {
    return this.root.hasAttribute("data-copy-link");
  }

  get targetSelector() {
    return this.root.getAttribute("data-copy-target");
  }

  get isHTML() {
    return this.root.hasAttribute("data-copy-html");
  }

  findButton() {
    if (this.isCode) return this.root.querySelector(".btn-copy");
    if (this.isLink || this.targetSelector) return this.root;
    return null;
  }

  findTextSource() {
    if (this.targetSelector)
      return document.querySelector(this.targetSelector) || null;
    if (this.isCode)
      return this.root.querySelector("td.code > pre") || null;
    if (this.isLink)
      return this.root.getAttribute("data-copy-url") || this.root.getAttribute("href") || window.location.href;
    return null;
  }

  attachEvents() {
    if (!this.button || !this.textSource) return;

    // Prevent multiple listeners if called twice
    if (this.button._clipboardListener) return;
    this.button._clipboardListener = true;

    this.button.addEventListener("click", (e) => {
      e.preventDefault();
      this.copyText();
    });
  }

  async copyText() {
    let text = "";

    if (typeof this.textSource === "string")
      text = this.textSource.trim();
    else if (this.textSource instanceof HTMLInputElement || this.textSource instanceof HTMLTextAreaElement)
      text = this.textSource.value.trim();
    else
      text = this.isHTML ? this.textSource.innerHTML.trim() : this.textSource.innerText.trim();

    try {
      await navigator.clipboard.writeText(text);
      this.showFeedback();
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  }

  showFeedback(duration = 1500) {
    if (!this.button) return;

    const triggerer = this.button;
    const originalLabel = triggerer.getAttribute("data-tooltip") || "";

    this.checkAnimator?.showCheck();
    triggerer.setAttribute("aria-label", "Copied!");
    triggerer.setAttribute("data-tooltip", "Copied!");
    Tooltip.update(triggerer);

    setTimeout(() => {
      this.checkAnimator?.resetCheck();
      triggerer.setAttribute("aria-label", originalLabel);
      triggerer.setAttribute("data-tooltip", originalLabel);
      Tooltip.update(triggerer);
    }, duration);
  }

  static initAll() {
    const selectors = "[data-copy-code], [data-copy-link], [data-copy-target]";
    document.querySelectorAll(selectors).forEach(el => new Clipboard(el));
  }
}
