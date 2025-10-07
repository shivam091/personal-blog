import ClipboardCheck from "./../animations/icons/clipboard-check";
import Tooltip from "./../modules/components/tooltip";

export default class Clipboard {
  constructor(root) {
    this.root = root;
    this.isCode = root.hasAttribute("data-copy-code");
    this.isLink = root.hasAttribute("data-copy-link");
    this.targetSelector = root.getAttribute("data-copy-target");
    this.isHTML = root.hasAttribute("data-copy-html");

    this.button = this.findButton();
    this.textSource = this.findTextSource();

    this.checkSvg = this.button?.querySelector(".icon-clipboard-check");
    this.checkAnimator = this.checkSvg ? new ClipboardCheck(this.checkSvg) : null;

    this.attachEvents();
  }

  findButton() {
    if (this.isCode) return this.root.querySelector(".btn-copy");
    if (this.isLink || this.targetSelector) return this.root;
    return null;
  }

  findTextSource() {
    if (this.targetSelector) {
      const targetEl = document.querySelector(this.targetSelector);
      if (targetEl) return targetEl;
    } else if (this.isCode) {
      return this.root.querySelector("td.code > pre");
    } else if (this.isLink) {
      return this.root.getAttribute("data-copy-url") || this.root.getAttribute("href") || window.location.href;
    }
    return null;
  }

  attachEvents() {
    if (!this.button || !this.textSource) return;

    this.button.addEventListener("click", (e) => {
      e.preventDefault();
      this.copyText();
    });
  }

  async copyText() {
    let text = "";

    if (typeof this.textSource === "string") {
      text = this.textSource.trim();
    } else if (this.textSource instanceof HTMLInputElement || this.textSource instanceof HTMLTextAreaElement) {
      text = this.textSource.value.trim();
    } else if (this.isHTML) {
      text = this.textSource.innerHTML.trim();
    } else {
      text = this.textSource.innerText.trim();
    }

    try {
      await navigator.clipboard.writeText(text);
      this.showFeedback();
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  }

  showFeedback() {
    const triggerer = this.button;
    const iconEl = triggerer.querySelector("use");
    const originalLabel = triggerer.getAttribute("data-tooltip") || "";

    this.checkAnimator?.showCheck();
    triggerer.setAttribute("aria-label", "Copied!");
    triggerer.setAttribute("data-tooltip", "Copied!");

    Tooltip.update(triggerer);

    setTimeout(() => {
      this.checkAnimator?.resetCheck()
      triggerer.setAttribute("aria-label", originalLabel);
      triggerer.setAttribute("data-tooltip", originalLabel);

      Tooltip.update(triggerer);
    }, 1500);
  }

  static initAll() {
    const selectors = "[data-copy-code], [data-copy-link], [data-copy-target]";

    document.querySelectorAll(selectors).forEach(el => {
      new Clipboard(el);
    });
  }
}
