---
layout: post
title: "CSS Masking Deep Dive: Mastering mask-* Properties with Real Examples"
description: |
  A complete, advanced guide to CSS masking covering all mask-* properties, compositing, multiple layers, browser quirks, and practical UI patterns with examples.
excerpt: "Master advanced visual layouts using CSS mask properties."
date: 2026-05-10
category: [CSS]
tags: [css, css-masking, mask-image, web-design, frontend, advanced-css, ui-effects, animations]
signoff: |
image:
  path: /assets/img/posts/css/css-gradient-overlay/cover.png
  width: 1536
  height: 1024
  alt: Illustration of CSS gradient overlay techniques on hero banners with layered gradients, blend modes, and UI elements.
changelog:
  - date: 2026-05-10
    change: "Initial publication"
---

## Introduction

CSS masking is one of the most powerful yet underused visual tools in modern frontend development. It allows you to
control **what parts of an element are visible** using images, gradients, or SVG masks.

Unlike `clip-path`, which creates hard edges, masking supports **soft transparency, gradients, and complex compositing**.

This guide covers **every `mask-*` property**, how they work together, and how to use them in real-world UI patterns.

## What is CSS Masking?

Masking defines visibility based on alpha (transparency) or luminance (brightness).

- White / opaque → visible
- Black / transparent → hidden
- Gray → partially visible

{% codeblock %}
{% highlight css linenos %}
.masked {
  mask-image: linear-gradient(to right, black, transparent);
}
{% endhighlight %}
{% endcodeblock %}

## Core Concept: Mask Layers

CSS masking behaves like `background`:

- Supports **multiple layers**
- Each layer can have its own:
  * position
  * size
  * repeat
  * compositing behavior

## CSS Propertoes

### `mask-image`

Defines the mask source.

**Supported values:**

- `url()` → image or SVG
- `linear-gradient()`, `radial-gradient()`
- `none`

{% codeblock %}
{% highlight css linenos %}
.element {
  mask-image: radial-gradient(circle, black 60%, transparent 100%);
}
{% endhighlight %}
{% endcodeblock %}

**Use Cases:**

- Fade edges
- Spotlight effects
- Text reveals

### mask-mode

Controls how mask values are interpreted.

{% codeblock %}
{% highlight css linenos %}
.element {
  mask-mode: alpha;      /* default */
  mask-mode: luminance;
}
{% endhighlight %}
{% endcodeblock %}

**Supported mask modes:**

- `alpha` -	Uses transparency
- `luminance` -	Uses brightness

### `mask-repeat`

Controls tiling of mask.

{% codeblock %}
{% highlight css linenos %}
.element {
  mask-repeat: no-repeat;
}
{% endhighlight %}
{% endcodeblock %}

**Supported values:**

- `repeat`
- `repeat-x`
- `repeat-y`
- `no-repeat`
- `space`
- `round`

### `mask-position`

Sets mask placement.

{% codeblock %}
{% highlight css linenos %}
.element {
  mask-position: center;
}
{% endhighlight %}
{% endcodeblock %}

Works exactly like `background-position`.

### `mask-size`

Controls scaling.

{% codeblock %}
{% highlight css linenos %}
.element {
  mask-size: cover;
}
{% endhighlight %}
{% endcodeblock %}

**Supported values:**

- `auto`
- `cover`
- `contain`
- custom sizes (100px 100px)

### `mask-origin`

Defines positioning reference.

{% codeblock %}
{% highlight css linenos %}
.element {
  mask-origin: border-box;
}
{% endhighlight %}
{% endcodeblock %}

Options:

- `border-box`
- `padding-box`
- `content-box`

### `mask-clip`

Controls clipping area.

{% codeblock %}
{% highlight css linenos %}
.element {
  mask-clip: content-box;
}
{% endhighlight %}
{% endcodeblock %}

### `mask-composite`- Advanced

Controls how multiple masks combine.

{% codeblock %}
{% highlight css linenos %}
.element {
  mask-image: url(mask1.png), url(mask2.png);
  mask-composite: add, subtract;
}
{% endhighlight %}
{% endcodeblock %}

**Supported values:**

- `add`
- `subtract`
- `intersect`
- `exclude`

> ⚠️ Browser support varies; WebKit uses different syntax.

### `mask-type` - SVG specific

{% codeblock %}
{% highlight css linenos %}
.element {
  mask-type: luminance;
}
{% endhighlight %}
{% endcodeblock %}

Mostly used with SVG masks.

### Shorthand - `mask`

{% codeblock %}
{% highlight css linenos %}
.element {
  mask: url(mask.png) no-repeat center / cover;
}
{% endhighlight %}
{% endcodeblock %}

## Multiple Mask Layers Example

{% codeblock %}
{% highlight css linenos %}
.element {
  mask-image:
    radial-gradient(circle at center, black 40%, transparent 60%),
    linear-gradient(to right, black, transparent);

  mask-composite: intersect;
}
{% endhighlight %}
{% endcodeblock %}

## Practical Patterns

### 1. Image Fade Effect

{% codeblock %}
{% highlight css linenos %}
.fade {
  mask-image: linear-gradient(to bottom, black 70%, transparent);
}
{% endhighlight %}
{% endcodeblock %}

### 2. Text Reveal Animation

{% codeblock %}
{% highlight css linenos %}
.text {
  mask-image: linear-gradient(90deg, transparent, black, transparent);
  mask-size: 200%;
  animation: reveal 3s infinite;
}

@keyframes reveal {
  0% {
    mask-position: 100%
  }

  100% {
    mask-position: 0%
  }
}
{% endhighlight %}
{% endcodeblock %}

### 3. Gradient Border Mask Trick

{% codeblock %}
{% highlight css linenos %}
.card {
  background: linear-gradient(white, white) padding-box,
              linear-gradient(45deg, red, blue) border-box;

  border: 4px solid transparent;
  mask-composite: exclude;
}
{% endhighlight %}
{% endcodeblock %}

### 4. Spotlight Hover Effect

{% codeblock %}
{% highlight css linenos %}
.card {
  mask-image: radial-gradient(circle at var(--x) var(--y), black 20%, transparent 40%);
}
{% endhighlight %}
{% endcodeblock %}

## Browser Support & Prefixes

- WebKit browsers require `-webkit-mask-*`
- Always include prefixed version:

{% codeblock %}
{% highlight css linenos %}
.element {
  -webkit-mask-image: linear-gradient(black, transparent);
  mask-image: linear-gradient(black, transparent);
}
{% endhighlight %}
{% endcodeblock %}

## `mask` vs. `clip-path`

| Feature        | `mask` | `clip-path` |
| -------------- | ------ | ----------- |
| Soft edges     |   ✅   |     ❌      |
| Gradients      |   ✅   |     ❌      |
| Performance    |   ⚠️   |     ✅      |
| Complex shapes |   ✅   |     ✅      |

## Bonus: Reusable SCSS Mixin

{% codeblock %}
{% highlight scss linenos %}
@mixin mask-gradient($direction: to bottom, $from: black, $to: transparent) {
  -webkit-mask-image: linear-gradient($direction, $from, $to);
  mask-image: linear-gradient($direction, $from, $to);
}
{% endhighlight %}
{% endcodeblock %}

**Usage:**

{% codeblock %}
{% highlight scss linenos %}
.fade {
  @include mask-gradient(to bottom, black 60%, transparent);
}
{% endhighlight %}
{% endcodeblock %}

## Interactive Example

{% playground id:"css-masking" line_numbers:"on" %}

## Best Practices

- Prefer **gradients over images** for performance
- Use `will-change` cautiously for animations
- Combine with `opacity` and `filter` for richer effects
- Test in Safari (masking behaves differently)

## Common Pitfalls

- Forgetting `-webkit-*` prefix
- Incorrect `mask-composite` behavior across browsers
- Using large image masks (performance issues)
- Assuming mask behaves like `clip-path`

## When to Use Masking

Use masking when you need:

- Soft fades
- Reveal animations
- Complex UI overlays
- Advanced hover effects
- Creative image treatments

## Conclusion

CSS masking unlocks a new layer of visual control beyond traditional layout and styling tools. Once you understand
how mask layers, gradients, and compositing work together, you can build effects that previously required heavy SVG
or canvas logic.

Mastering `mask-*` properties gives you the ability to create **modern, dynamic, and visually rich interfaces with pure CSS**.
