export default class Tabs {
  constructor(root, tabSelector, panelSelector, tabAttr, panelAttr) {
    this.tabs = [...root.querySelectorAll(tabSelector)];
    this.panels = [...root.querySelectorAll(panelSelector)];
    this.tabAttr = tabAttr;
    this.panelAttr = panelAttr;
    this._bind();
  }

  _bind() {
    this.tabs.forEach(tab => {
      tab.addEventListener("click", () => this.switch(tab.dataset[this.tabAttr]));
    });
  }

  get activeTab() {
    return this.tabs.find(t => t.getAttribute("aria-selected") === "true");
  }

  switch(name) {
    // Tabs: set aria-selected
    this.tabs.forEach(t =>
      t.setAttribute("aria-selected", String(t.dataset[this.tabAttr] === name))
    );

    // Panels: set aria-hidden
    this.panels.forEach(p =>
      p.setAttribute("aria-hidden", String(p.dataset[this.panelAttr] !== name))
    );
  }
}
