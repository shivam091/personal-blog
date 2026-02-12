---
title: "The Holy Grail Layout (Grid Edition)"
slug: "holy-grail-layout"
excerpt: "A responsive Holy Grail layout built with CSS Grid and grid-template-areas—no floats, no hacks."
description: |
  Build the classic Holy Grail layout using modern CSS Grid. Learn grid-template-areas to create a clean, responsive header,
  sidebars, main content, and footer—without floats or layout hacks.
layout: "snippet"
tags: [css, css-grid, layout, responsive-design, web-design, holy-grail-layout, holy-grail-layout]
category: [CSS]
date: 2026-01-10
image:
  path: /assets/img/goodies/snippets/holy-grail-layout/cover.png
  width: 1536
  height: 1024
  alt: "Diagram showing a webpage layout with header, footer, two sidebars, and a center content area."
changelog:
  - date: 2026-01-10
    change: "Initial publication"
---

## Introduction

The **Holy Grail layout** is a classic web design pattern consisting of a header, three columns (sidebar, main content, sidebar),
and a footer. Historically, this layout was difficult to achieve with floats or early flexbox techniques without structural hacks.

CSS Grid makes this pattern straightforward—providing a **clear, semantic, and responsive** solution with minimal code.

## The Grid Snippet

{% codeblock %}
{% highlight css linenos %}
:root {
  --sidebar-width: 200px;
  --layout-gap: 0;
}

.holy-grail-wrapper {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav main side"
    "footer footer footer";
  grid-template-columns: var(--sidebar-width) 1fr var(--sidebar-width);
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: var(--layout-gap);
}

header {
  grid-area: header;
}

nav {
  grid-area: nav;
}

main {
  grid-area: main;
}

aside {
  grid-area: side;
}

footer {
  grid-area: footer;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .holy-grail-wrapper {
    grid-template-areas:
      "header"
      "main"
      "nav"
      "side"
      "footer";
    grid-template-columns: 1fr;
  }
}
{% endhighlight %}
{% endcodeblock %}

If you want a deeper breakdown of how `grid-template-areas` works—including alignment, spanning, and how the explicit/implicit grid behaves—see
[Mastering CSS Grid: Grid Areas, Item Alignment, and Spanning](/post/mastering-css-grid).

## Minimal HTML Structure

Only the wrapper requires a class. All layout positioning is handled by semantic elements.

{% codeblock %}
{% highlight html linenos %}
<div class="holy-grail-wrapper">
  <header>Header</header>
  <nav>Navigation</nav>
  <main>Main Content</main>
  <aside>Right Sidebar</aside>
  <footer>Footer</footer>
</div>
{% endhighlight %}
{% endcodeblock %}

This keeps the markup clean and readable while allowing CSS Grid to control layout independently of source order.

{% playground id:"holy-grail-layout" line_numbers:"on" orientation:"vertical" %}

## Highlights

- **Semantic naming:** `grid-template-areas` acts as a visual blueprint for the layout.
- **Sticky footer:** `min-height: 100vh` combined with a `1fr` row pushes the footer to the bottom.
- **Ultra-responsive:** Mobile layout is achieved by remapping areas—no DOM changes required.
- **Configurable:** Sidebar widths are controlled via CSS variables.

## Customization Tips

### Adjust Sidebar Width

{% codeblock %}
{% highlight css linenos %}
:root {
  --sidebar-width: 240px;
}
{% endhighlight %}
{% endcodeblock %}

### Remove the Right Sidebar

- Remove the `<aside>` element
- Update the grid areas:

{% codeblock %}
{% highlight css linenos %}
.holy-grail-wrapper {
  grid-template-areas:
    "header header"
    "nav main"
    "footer footer";
  grid-template-columns: var(--sidebar-width) 1fr;
}
{% endhighlight %}
{% endcodeblock %}

### Make a Sidebar Sticky

{% codeblock %}
{% highlight css linenos %}
nav {
  position: sticky;
  top: 0;
  align-self: start;
}
{% endhighlight %}
{% endcodeblock %}

### Change Mobile Order

Simply rearrange the `grid-template-areas` inside the media query.

## Accessibility Notes

- Semantic elements (`header`, `nav`, `main`, `aside`, `footer`) provide meaningful landmarks for assistive technologies.
- Ensure the **source order matches the logical reading order**, even if the visual layout changes.
- Avoid unnecessary ARIA roles when semantic elements already convey meaning.

## Common Variations

- **Two-column layout:** Remove the right sidebar for blogs and docs.
- **Dashboard layout:** Left nav + main + utility rail.
- **Content-first mobile:** Stack `main` immediately below `header`.
- **Ad rail:** Replace `aside` with promotional or analytics content.

## Use Cases

- **Dashboard UIs:** Left nav, center data, right-side filters.
- **Blog Layouts:** Main article with a sidebar for categories and another for ads.
- **Documentation Sites:** Header navigation with a sticky table of contents.

## Key Takeaway

This Grid-based Holy Grail layout is:

- Modern and hack-free
- Easy to reason about
- Fully responsive
- Accessible by default
- Flexible enough for real-world UI systems

Use it as a **layout foundation**, then adapt it via grid areas rather than restructuring your markup.
