---
layout: post
title: "Unleashing CSS Logical Properties"
date: 2025-08-24 10:22
shortinfo: "Design once, adapt everywhere."
excerpt: "Future-proof your layouts with CSS Logical Properties — one set of styles that adapts across languages, directions, and writing modes — no more messy RTL hacks or duplicate stylesheets."
tags: [css, web-development, layout, responsive, rtl, logical-properties, writing-modes, internationalization, i18n, frontend, best-practices, globalization, accessibility]
category: CSS
slug: unleashing-css-logical-properties
image:
  path: /assets/img/posts/css/unleashing-css-logical-properties/cover.png
  width: 1200
  height: 800
  alt: "Cover image with the title text 'Unleashing CSS Logical Properties' and arrows showing inline and block axes"
---

## Introduction

In modern web design, layouts must seamlessly adapt to different languages and writing modes — **CSS Logical Properties** offer a future-proof way
to style elements that respect **writing direction**, **text flow**, and **orientation**.

Whether it’s **right-to-left (RTL)** languages like Arabic and Hebrew, or vertical writing in Japanese, logical properties let you create one
stylesheet that works everywhere.

Instead of tying layout to fixed physical directions (`left`, `right`, `top`, `bottom`), they use flow-relative directions: **start**, **end**, **inline**, and **block**.

**With physical properties:**

{% codeblock %}
{% highlight css linenos %}
/* Physical properties */
margin-left: 1rem; /* Always on the left side */
{% endhighlight %}
{% endcodeblock %}

In an RTL layout, `margin-left` still applies to the left side — which may no longer be the “start” of the text.

**With logical properties:**

{% codeblock %}
{% highlight css linenos %}
/* Logical equivalent */
margin-inline-start: 1rem; /* Adapts to start side based on writing mode */
{% endhighlight %}
{% endcodeblock %}

If the document switches to RTL, `margin-inline-start` automatically applies to the right — no extra styles needed.

This ensures your layout is **writing mode aware**.

> Logical properties are broadly supported in current versions of Chrome, Edge, Firefox, and Safari; verify specifics on MDN when targeting older browsers.

## Benefits of Logical Properties

1. **Internationalization Ready** – Works for RTL and vertical writing without needing separate stylesheets.
2. **Consistent Layouts** – Automatically adjusts for writing mode changes, keeping design predictable.
3. **Cleaner Code** – Reduces redundancy and removes the need for duplicated directional styles.
4. **Accessibility Friendly** – Plays nicely with screen readers in RTL and vertical text contexts.
5. **Performance Friendly** – Fewer overrides and media queries improve maintainability.
6. **Future Proof** – Ready for expanded language and writing system support as browsers evolve.

## When to Use Logical vs. Physical

Logical properties shine when your layout needs to adapt across **different writing modes**, such as left-to-right (English), right-to-left (Arabic/Hebrew), or vertical scripts (Japanese). They future-proof your styles so you don’t have to rewrite CSS when switching directions or supporting multilingual content.

That said, **physical properties aren’t “wrong.”** If your project is a small, LTR-only site (like a personal blog or an internal tool with no internationalization needs), using `margin-left` or `padding-top` may be perfectly fine and even easier for quick prototyping.

Think of it this way:

- Use **logical properties** when accessibility, scalability, and localization are priorities.
- Use **physical properties** when the content direction is fixed and simplicity matters.

> Flow-relative properties help assistive tech expose consistent semantics across LTR, RTL, and vertical scripts, reducing
> the risk of one-off overrides that drift out of sync.

## Understanding Inline vs Block Axes

**Inline axis** — the direction in which text flows.

**Block axis** — the direction perpendicular to the inline axis, where blocks (paragraphs, divs) stack.

**Key idea**: Logical properties use `inline` / `block` combined with `start` / `end`:
- `inline-start` – leading edge of the inline axis (left in LTR, right in RTL, top in some vertical modes).
- `inline-end` – trailing edge of the inline axis.
- `block-start` – leading edge of the block axis (top in horizontal writing).
- `block-end` – trailing edge of the block axis.

### `horizontal-tb` (LTR – e.g., English)

```
+-----------------------------------------+
| inline-start                 inline-end |
|    (left)         → inline →   (right)  |
| block-start (top)                       |
|                                         |
|        ↓ block                          |
|                                         |
| block-end (bottom)                      |
+-----------------------------------------+
```

### `horizontal-tb` (RTL – e.g., Arabic, Hebrew)

```
+-----------------------------------------+
| inline-end                 inline-start |
|    (left)         ← inline ←   (right)  |
| block-start (top)                       |
|                                         |
|        ↓ block                          |
|                                         |
| block-end (bottom)                      |
+-----------------------------------------+
```

> In RTL: inline axis flows **right** → **left**, so `inline-start` = right, `inline-end` = left.

### `vertical-rl` (e.g., Traditional Mongolian)

```
+----------------+
| block-start  → |  (right)
| inline-start   |  (top)
|                |
|        ↓ block |
|                |
| inline-end     |  (bottom)
| block-end    ← |  (left)
+----------------+
```

### `vertical-lr` (e.g., some East Asian scripts)

```
+----------------+
| block-start  ← |  (left)
| inline-start   |  (top)
|                |
|        ↓ block |
|                |
| inline-end     |  (bottom)
| block-end    → |  (right)
+----------------+
```

### Quick Reference: Logical vs Physical Mappings

| Writing mode        | Inline axis  | Block axis   | inline-start | inline-end | block-start | block-end |
| ------------------- | ------------ | ------------ | ------------ | ---------- | ----------- | --------- |
| `horizontal-tb` LTR | left → right | top → bottom | left         | right      | top         | bottom    |
| `horizontal-tb` RTL | right → left | top → bottom | right        | left       | top         | bottom    |
| `vertical-rl`       | top → bottom | right → left | top          | bottom     | right       | left      |
| `vertical-lr`       | top → bottom | left → right | top          | bottom     | left        | right     |

> Think of `inline-*` as ‘text flow direction’ and `block-*` as ‘line stacking direction’.

### Inline vs. Block in Action

**Example 1 — Inline / Block sizing**

{% codeblock %}
{% highlight css linenos %}
.box {
  inline-size: 40ch;    /* horizontal-tb: width; vertical-rl/lr: height */
  block-size: 10rem;    /* horizontal-tb: height; vertical-rl/lr: width */
  padding-inline: 1rem; /* horizontal-tb: left & right; vertical: top & bottom */
  padding-block: 0.5rem;/* horizontal-tb: top & bottom; vertical: right & left */
}
{% endhighlight %}
{% endcodeblock %}

**Example 2 — Direction-aware margins**

{% codeblock %}
{% highlight css linenos %}
.card {
  margin-inline-start: 1rem; /* horizontal LTR: left; horizontal RTL: right; vertical: top */
  margin-block-start: 2rem;  /* horizontal: top; vertical-rl: right; vertical-lr: left */
}
{% endhighlight %}
{% endcodeblock %}

**Example 3 — Switching writing modes**

{% codeblock %}
{% highlight css linenos %}
/* Default: horizontal LTR */
.article {
  writing-mode: horizontal-tb;
  direction: ltr;
}

/* Vertical (e.g., Japanese-style) */
.vertical {
  writing-mode: vertical-rl;
  /* Set `direction` only if your content is RTL; otherwise omit. */
}
{% endhighlight %}
{% endcodeblock %}

## Categories of Logical Properties

Here’s a categorized list of logical properties with their physical equivalents — use this as your quick lookup table.

### Dimension

| # | Logical Property      | Description                      | Physical LTR Equivalent | Physical RTL Equivalent |
| - | --------------------- | -------------------------------- | ----------------------- | ----------------------- |
| 1 | **`inline-size`**     | Logical width in the inline axis | `width`                 | `width`                 |
| 2 | **`block-size`**      | Logical height in the block axis | `height`                | `height`                |
| 3 | **`min-inline-size`** | Minimum width in the inline axis | `min-width`             | `min-width`             |
| 4 | **`max-inline-size`** | Maximum width in the inline axis | `max-width`             | `max-width`             |
| 5 | **`min-block-size`**  | Minimum height in the block axis | `min-height`            | `min-height`            |
| 6 | **`max-block-size`**  | Maximum height in the block axis | `max-height`            | `max-height`            |

### Margin

| # | Logical Property          | Description                                                      | Physical LTR Equivalent        | Physical RTL Equivalent        |
| - | ------------------------- | ---------------------------------------------------------------- | ------------------------------ | ------------------------------ |
| 1 | **`margin-inline-start`** | Margin at the start of the inline axis                           | `margin-left`                  | `margin-right`                 |
| 2 | **`margin-inline-end`**   | Margin at the end of the inline axis                             | `margin-right`                 | `margin-left`                  |
| 3 | **`margin-inline`**       | Shorthand for both `margin-inline-start` and `margin-inline-end` | `margin-left` + `margin-right` | `margin-right` + `margin-left` |
| 4 | **`margin-block-start`**  | Margin at the start of the block axis                            | `margin-top`                   | `margin-top`                   |
| 5 | **`margin-block-end`**    | Margin at the end of the block axis                              | `margin-bottom`                | `margin-bottom`                |
| 6 | **`margin-block`**        | Shorthand for both `margin-block-start` and `margin-block-end`   | `margin-top` + `margin-bottom` | `margin-top` + `margin-bottom` |

### Padding

| # | Logical Property           | Description                                                        | Physical LTR Equivalent          | Physical RTL Equivalent          |
| - | -------------------------- | ------------------------------------------------------------------ | -------------------------------- | -------------------------------- |
| 1 | **`padding-inline-start`** | Padding at the start of the inline axis                            | `padding-left`                   | `padding-right`                  |
| 2 | **`padding-inline-end`**   | Padding at the end of the inline axis                              | `padding-right`                  | `padding-left`                   |
| 3 | **`padding-inline`**       | Shorthand for both `padding-inline-start` and `padding-inline-end` | `padding-left` + `padding-right` | `padding-right` + `padding-left` |
| 4 | **`padding-block-start`**  | Padding at the start of the block axis                             | `padding-top`                    | `padding-top`                    |
| 5 | **`padding-block-end`**    | Padding at the end of the block axis                               | `padding-bottom`                 | `padding-bottom`                 |
| 6 | **`padding-block`**        | Shorthand for both `padding-block-start` and `padding-block-end`   | `padding-top` + `padding-bottom` | `padding-top` + `padding-bottom` |

### Borders

| #  | Logical Property                | Description                                                      | Physical LTR Equivalent                    | Physical RTL Equivalent            |
| -- | ------------------------------- | ---------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------- |
| 1  | **`border-inline-start`**       | Border at the start of the inline axis                           | `border-left`                              | `border-right`                |
| 2  | **`border-inline-end`**         | Border at the end of the inline axis                             | `border-right`                             | `border-left`                 |
| 3  | **`border-inline`**             | Shorthand for both `border-inline-start` and `border-inline-end` | `border-left` + `border-right`             | `border-right` + `border-left`         |
| 4  | **`border-block-start`**        | Border at the start of the block axis                            | `border-top`                               | `border-top`                  |
| 5  | **`border-block-end`**          | Border at the end of the block axis                              | `border-bottom`                            | `border-bottom`               |
| 6  | **`border-block`**              | Shorthand for both `border-block-start` and `border-block-end`   | `border-top` + `border-bottom`             | `border-top` + `border-bottom`               |
| 7  | **`border-inline-start-width`** | Width of the border at inline-start                              | `border-left-width`                        | `border-right-width`                |
| 8  | **`border-inline-start-color`** | Color of the border at inline-start                              | `border-left-color`                        | `border-right-color`                |
| 9  | **`border-inline-start-style`** | Style of the border at inline-start                              | `border-left-style`                        | `border-right-style`                |
| 10 | **`border-inline-end-width`**   | Width of the border at inline-end                                | `border-right-width`                       | `border-left-width`                |
| 11 | **`border-inline-end-color`**   | Color of the border at inline-end                                | `border-right-color`                       | `border-left-color`                |
| 12 | **`border-inline-end-style`**   | Style of the border at inline-end                                | `border-right-style`                       | `border-left-style`                |
| 13 | **`border-block-start-width`**  | Width of the border at block-start                               | `border-top-width`                         | `border-top-width`                |
| 14 | **`border-block-start-color`**  | Color of the border at block-start                               | `border-top-color`                         | `border-top-color`                |
| 15 | **`border-block-start-style`**  | Style of the border at block-start                               | `border-top-style`                         | `border-top-style`                |
| 16 | **`border-block-end-width`**    | Width of the border at block-end                                 | `border-bottom-width`                      | `border-bottom-width`                |
| 17 | **`border-block-end-color`**    | Color of the border at block-end                                 | `border-bottom-color`                      | `border-bottom-color`                |
| 18 | **`border-block-end-style`**    | Style of the border at block-end                                 | `border-bottom-style`                      | `border-bottom-style`                |
| 19 | **`border-inline-width`**       | Shorthand for width of borders on both inline sides              | `border-left-width` + `border-right-width` | `border-right-width` + `border-left-width`   |
| 20 | **`border-inline-style`**       | Shorthand for style of borders on both inline sides              | `border-left-style` + `border-right-style` | `border-right-style` + `border-left-style`   |
| 21 | **`border-inline-color`**       | Shorthand for color of borders on both inline sides              | `border-left-color` + `border-right-color` | `border-right-color` + `border-left-color`   |
| 22 | **`border-block-width`**        | Shorthand for width of borders on both block sides               | `border-top-width` + `border-bottom-width` | `border-top-width` + `border-bottom-width` |
| 23 | **`border-block-style`**        | Shorthand for style of borders on both block sides               | `border-top-style` + `border-bottom-style` | `border-top-style` + `border-bottom-style` |
| 24 | **`border-block-color`**        | Shorthand for color of borders on both block sides               | `border-top-color` + `border-bottom-color` | `border-top-color` + `border-bottom-color` |

### Border Radius

| # | Logical Property                | Description                                                   | Physical LTR Equivalent      | Physical RTL Equivalent      |
| - | ------------------------------- | ------------------------------------------------------------- | ---------------------------- | ---------------------------- |
| 1 | **`border-start-start-radius`** | Radius for the corner where block-start and inline-start meet | `border-top-left-radius`     | `border-top-right-radius`    |
| 2 | **`border-start-end-radius`**   | Radius for the corner where block-start and inline-end meet   | `border-top-right-radius`    | `border-top-left-radius`     |
| 3 | **`border-end-start-radius`**   | Radius for the corner where block-end and inline-start meet   | `border-bottom-left-radius`  | `border-bottom-right-radius` |
| 4 | **`border-end-end-radius`**     | Radius for the corner where block-end and inline-end meet     | `border-bottom-right-radius` | `border-bottom-left-radius`  |

### Positioning / Offsets

| # | Logical Property         | Description                                                    | Physical LTR Equivalent             | Physical RTL Equivalent             |
| - | ------------------------ | -------------------------------------------------------------- | ----------------------------------- | ----------------------------------- |
| 1 | **`inset-inline-start`** | Offset from the inline-start edge                              | `left`                              | `right`                             |
| 2 | **`inset-inline-end`**   | Offset from the inline-end edge                                | `right`                             | `left`                              |
| 3 | **`inset-inline`**       | Shorthand for both `inset-inline-start` and `inset-inline-end` | `left` + `right`                    | `right` + `left`                    |
| 4 | **`inset-block-start`**  | Offset from the block-start edge                               | `top`                               | `top`                               |
| 5 | **`inset-block-end`**    | Offset from the block-end edge                                 | `bottom`                            | `bottom`                            |
| 6 | **`inset-block`**        | Shorthand for both `inset-block-start` and `inset-block-end`   | `top` + `bottom`                    | `top` + `bottom`                    |
| 7 | **`inset`**              | Shorthand for all four logical inset properties                | `top` + `right` + `bottom` + `left` | `top` + `right` + `bottom` + `left` |

### Resizing

| # | Logical Property / Value | Description                        | Physical LTR Equivalent | Physical RTL Equivalent |
| - | ------------------------ | ---------------------------------- | ----------------------- | ----------------------- |
| 1 | **`resize: block`**      | Allows resize in block axis only.  | `resize: vertical`      | `resize: vertical`      |
| 2 | **`resize: inline`**     | Allows resize in inline axis only. | `resize: horizontal`    | `resize: horizontal`    |

### Containment

| # | Logical Property                    | Description                                                                                                               | Physical LTR Equivalent    | Physical RTL Equivalent    |
| - | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------- | -------------------------- |
| 1 | **`contain-intrinsic-block-size`**  | Specifies the element’s intrinsic size in the block (vertical) axis when its contents are subject to size containment.    | `contain-intrinsic-height` | `contain-intrinsic-height` |
| 2 | **`contain-intrinsic-inline-size`** | Specifies the element’s intrinsic size in the inline (horizontal) axis when its contents are subject to size containment. | `contain-intrinsic-width`  | `contain-intrinsic-width`  |

### Floats & Clears

| # | Logical Property / Value  | Description                                                                         | Physical LTR Equivalent | Physical RTL Equivalent |
| - | ------------------------- | ----------------------------------------------------------------------------------- | ----------------------- | ----------------------- |
| 1 | **`float: inline-start`** | Floats an element to the start side of the inline axis (like `float: left` in LTR). | `float: left`           | `float: right`          |
| 2 | **`float: inline-end`**   | Floats an element to the end side of the inline axis.                               | `float: right`          | `float: left`           |
| 3 | **`clear: inline-start`** | Prevents floating elements on the start side.                                       | `clear: left`           | `clear: right`          |
| 4 | **`clear: inline-end`**   | Prevents floating elements on the end side.                                         | `clear: right`          | `clear: left`           |

### Text Alignment

| # | Logical Property / Value | Description                                       | Physical LTR Equivalent | Physical RTL Equivalent |
| - | ------------------------ | ------------------------------------------------- | ----------------------- | ----------------------- |
| 1 | **`text-align: start`**  | Aligns text to the start side of the inline axis. | `text-align: left`      | `text-align: right`     |
| 2 | **`text-align: end`**    | Aligns text to the end side of the inline axis.   | `text-align: right`     | `text-align: left`      |

### Tables

| # | Logical Property / Value         | Description                                   | Physical LTR Equivalent | Physical RTL Equivalent |
| - | -------------------------------- | --------------------------------------------- | ----------------------- | ----------------------- |
| 1 | **`caption-side: block-start`**  | Places table caption before table block axis. | `caption-side: top`     | `caption-side: top`     |
| 2 | **`caption-side: block-end`**    | Places table caption after table block axis.  | `caption-side: bottom`  | `caption-side: bottom`  |
| 3 | **`caption-side: inline-start`** | Places caption at inline start of table.      | `caption-side: left`    | `caption-side: right`   |
| 4 | **`caption-side: inline-end`**   | Places caption at inline end of table.        | `caption-side: right`   | `caption-side: left`    |

### Scroll Margin

| # | Logical Property                 | Description                                        | Physical LTR Equivalent                      | Physical RTL Equivalent                      |
| - | -------------------------------- | -------------------------------------------------- | -------------------------------------------- | -------------------------------------------- |
| 1 | **`scroll-margin-inline-start`** | Scroll margin at inline start edge                 | `scroll-margin-left`                         | `scroll-margin-right`                        |
| 2 | **`scroll-margin-inline-end`**   | Scroll margin at inline end edge                   | `scroll-margin-right`                        | `scroll-margin-left`                         |
| 3 | **`scroll-margin-inline`**       | Shorthand for both `inline-start` and `inline-end` | `scroll-margin-left` + `scroll-margin-right` | `scroll-margin-right` + `scroll-margin-left` |
| 4 | **`scroll-margin-block-start`**  | Scroll margin at block start edge                  | `scroll-margin-top`                          | `scroll-margin-top`                          |
| 5 | **`scroll-margin-block-end`**    | Scroll margin at block end edge                    | `scroll-margin-bottom`                       | `scroll-margin-bottom`                       |
| 6 | **`scroll-margin-block`**        | Shorthand for both `block-start` and `block-end`   | `scroll-margin-top` + `scroll-margin-bottom` | `scroll-margin-top` + `scroll-margin-bottom` |

### Scroll Padding

| # | Logical Property                  | Description                                        | Physical LTR Equivalent                        | Physical RTL Equivalent                        |
| - | --------------------------------- | -------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| 1 | **`scroll-padding-inline-start`** | Scroll padding at inline start edge                | `scroll-padding-left`                          | `scroll-padding-right`                         |
| 2 | **`scroll-padding-inline-end`**   | Scroll padding at inline end edge                  | `scroll-padding-right`                         | `scroll-padding-left`                          |
| 3 | **`scroll-padding-inline`**       | Shorthand for both `inline-start` and `inline-end` | `scroll-padding-left` + `scroll-padding-right` | `scroll-padding-right` + `scroll-padding-left` |
| 4 | **`scroll-padding-block-start`**  | Scroll padding at block start edge                 | `scroll-padding-top`                           | `scroll-padding-top`                           |
| 5 | **`scroll-padding-block-end`**    | Scroll padding at block end edge                   | `scroll-padding-bottom`                        | `scroll-padding-bottom`                        |
| 6 | **`scroll-padding-block`**        | Shorthand for both `block-start` and `block-end`   | `scroll-padding-top` + `scroll-padding-bottom` | `scroll-padding-top` + `scroll-padding-bottom` |

### Overflow

| # | Logical Property      | Description                                                                           | Physical LTR Equivalent | Physical RTL Equivalent |
| - | --------------------- | ------------------------------------------------------------------------------------- | ----------------------- | ----------------------- |
| 1 | **`overflow-block`**  | Controls overflow in the block direction (top → bottom in LTR/RTL).                   | `overflow-y`            | `overflow-y`            |
| 2 | **`overflow-inline`** | Controls overflow in the inline direction (left → right in LTR, right → left in RTL). | `overflow-x`            | `overflow-x`            |

### Overscroll Behavior

| # | Logical Property                 | Description                        | Physical LTR Equivalent | Physical RTL Equivalent |
| - | -------------------------------- | ---------------------------------- | ----------------------- | ----------------------- |
| 1 | **`overscroll-behavior-inline`** | Overscroll behavior in inline axis | `overscroll-behavior-x` | `overscroll-behavior-x` |
| 2 | **`overscroll-behavior-block`**  | Overscroll behavior in block axis  | `overscroll-behavior-y` | `overscroll-behavior-y` |

> Note: Inline maps to horizontal, block maps to vertical — regardless of writing direction.

### Scroll Snap

| # | Logical Property / Value       | Description                                                                         | Physical LTR Equivalent | Physical RTL Equivalent |
| - | ------------------------------ | ----------------------------------------------------------------------------------- | ----------------------- | ----------------------- |
| 1 | **`scroll-snap-type: block`**  | Defines scroll snapping along the **block axis** (vertical in LTR/RTL).             | `scroll-snap-type: y`   | `scroll-snap-type: y`   |
| 2 | **`scroll-snap-type: inline`** | Defines scroll snapping along the **inline axis** (horizontal in LTR/RTL).          | `scroll-snap-type: x`   | `scroll-snap-type: x`   |
| 3 | **`scroll-snap-align: start`** | Snap aligns the element’s **start edge** with the scroll container’s snap position. | Top / Left              | Top / Right             |
| 4 | **`scroll-snap-align: end`**   | Snap aligns the element’s **end edge** with the scroll container’s snap position.   | Bottom / Right          | Bottom / Left           |

## Interactive Example

Now that we’ve seen the different categories of logical properties, let’s try a small live example to see them in action.

{% codeblock %}
{% highlight html linenos %}
<!-- Logical padding & margin example -->
<article class="card">
  <header class="card-header">
    <div class="avatar"></div>
    <div>
      <div class="title">Logical padding &amp; margin</div>
      <div class="meta">Uses <code>padding-inline</code> &amp; <code>margin-block</code></div>
    </div>
  </header>

  <div class="card-body">
    Logical properties adapt based on writing mode & direction.
  </div>
</article>
{% endhighlight %}
{% endcodeblock %}

{% codeblock %}
{% highlight css linenos %}
.card {
  padding-block: 1rem;
  padding-inline: 1rem;
}
{% endhighlight %}
{% endcodeblock %}

👉 [View Full Interactive Demo on CodePen](https://codepen.io/shivam091/pen/NPGavRO)

## Best Practices

- **Start with fallbacks** — Use physical as fallbacks, then layer logical — don’t mix both unintentionally
- **Test different flows** — Validate layouts in both `horizontal-tb` and `vertical-rl` writing modes to catch axis-mapping issues.
- **Prefer explicit properties** — Use individual logical properties (`margin-inline-start`) instead of shorthands for broader browser support.
- **Handle RTL layouts** — Apply `direction: rtl` for languages like **Arabic** and **Hebrew** to switch inline flow automatically.
- **Control writing flow** — Use `writing-mode` for vertical text layouts, keeping in mind that block and inline axes swap roles.
- **Use alignment shortcuts** — Rely on `text-align: start` / `end` to adapt automatically in LTR and RTL contexts.
- **Adopt logical positioning** — Replace physical offsets (`top`, `right`, `bottom`, `left`) with `inset-block` / `inset-inline` for flexibility.
- **Check browser support** — Always confirm on [MDN’s compatibility tables](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values#browser_compatibility) before using less common logical properties.

## Fallbacks for Older Browsers

If you need to support older browsers that don’t recognize logical properties, you can define physical property fallbacks first, followed by
your logical properties. This ensures that browsers without logical property support (e.g., Internet Explorer) still display layouts correctly.

**Without Logical Properties (LTR & RTL handled separately):**

{% codeblock %}
{% highlight css linenos %}
/* LTR */
.card {
  margin-left: 1rem;
  padding-left: 1rem;
  text-align: left;
}

/* RTL */
html[dir="rtl"] .card {
  margin-right: 1rem;
  padding-right: 1rem;
  text-align: right;
}
{% endhighlight %}
{% endcodeblock %}

**With Logical Properties (Single stylesheet):**

{% codeblock %}
{% highlight css linenos %}
.card {
  margin-inline-start: 1rem;
  padding-inline-start: 1rem;
  text-align: start;
}
{% endhighlight %}
{% endcodeblock %}

**Hybrid Approach (Fallback + Logical):**

{% codeblock %}
{% highlight css linenos %}
.card {
  /* Physical property fallbacks */
  margin-left: 1rem;
  padding-left: 1rem;
  text-align: left;

  /* Logical properties override */
  margin-inline-start: 1rem;
  padding-inline-start: 1rem;
  text-align: start;
}
{% endhighlight %}
{% endcodeblock %}

**`@supports`-Based Approach (Clean separation)**

{% codeblock %}
{% highlight css linenos %}
/* Physical property fallbacks */
.card {
  margin-left: 1rem;
  padding-left: 1rem;
  text-align: left;
}

/* Apply logical properties only if supported */
@supports (margin-inline-start: 1rem) {
  .card {
    margin-inline-start: 1rem;
    padding-inline-start: 1rem;
    text-align: start;
  }
}
{% endhighlight %}
{% endcodeblock %}

{% details summary="**Why use `@supports?`**" %}
- Keeps fallback styles intact for older browsers without relying solely on cascade overrides.
- Ensures logical properties are parsed only when supported.
- Makes debugging easier by clearly separating legacy and modern styles.
{% enddetails %}

## Conclusion

CSS Logical Properties aren’t just about cleaner code — they represent the future of responsive, internationalized web design.
By thinking in terms of flow-relative directions instead of fixed sides, you create layouts that are naturally direction-aware, resilient,
and easier to maintain across languages and scripts.

Start small: replace `margin-left` with `margin-inline-start`, or `width` with `inline-size`. Over time, your CSS will become not only simpler,
but also future-proof and truly international-ready.
