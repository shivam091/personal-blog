export default class Tabs {
  constructor(container, {
    tabSelector = "[data-tab]",
    panelSelector = "[data-panel]",
    tabAttr = "tab",
    panelAttr = "panel",
    activeClass = "active",
    onSwitch = null
  } = {}) {
    this.container = container;
    this.tabSelector = tabSelector;
    this.panelSelector = panelSelector;
    this.tabAttr = tabAttr;
    this.panelAttr = panelAttr;
    this.activeClass = activeClass;
    this.onSwitch = onSwitch;

    this.tabs = Array.from(container.querySelectorAll(this.tabSelector));
    this.panels = Array.from(container.querySelectorAll(this.panelSelector));

    this.#bindEvents();

    // Set first tab active by default
    if (this.tabs.length > 0) {
      const first = this.tabs[0].dataset[this.tabAttr];

      if (first) this.switch(first);
    }
  }

  #bindEvents() {
    this.tabs.forEach(tab => {
      tab.addEventListener("click", () => this.switch(tab.dataset[this.tabAttr]));
    });
  }

  switch(name) {
    this.tabs.forEach(tab => {
      const selected = tab.dataset[this.tabAttr] === name;

      tab.classList.toggle(this.activeClass, selected);
      tab.setAttribute("aria-selected", selected);

      if (selected) {
        tab.setAttribute("aria-current", "page");
      } else {
        tab.removeAttribute("aria-current");
      }
    });

    // Show/hide panels based on panelAttr
    this.panels.forEach(panel => {
      const match = panel.dataset[this.panelAttr] === name;

      panel.classList.toggle(this.activeClass, match);
      panel.setAttribute("aria-hidden", !match);
    });

    if (typeof this.onSwitch === "function") {
      this.onSwitch(name);
    }
  }

  get activeTab() {
    return this.tabs.find(tab => tab.getAttribute("aria-selected") === "true");
  }
}
