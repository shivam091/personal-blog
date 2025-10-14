---
layout: post
title: "An Interactive Guide to CSS Transitions"
description: "Learn how timing, delay, and easing combine to craft smooth micro-interactions and polished UI motion."
excerpt: "Craft smooth, responsive UI motion with CSS transitions"
category: Animations
tags: [css, animation, transition, will-change, performance]
date: 2025-10-14 16:20
slug: css-transitions-guide
image:
  path: /assets/img/posts/animations/css-transitions-guide/cover.png
  width:
  height:
  alt:
changelog:
  - date: 2025-10-14
    change: "Initial publication"
---

## Introduction

CSS transitions allow you to **animate property changes smoothly** over a duration — turning sudden visual changes into fluid, natural motion.
They are perfect for UI enhancements like hover effects, color fades, button presses, and expanding menus.

## What Are CSS Transitions?

A **transition** animates the change between two states of a property.
When a property’s value changes (like `background-color`, `width`, or `opacity`), the browser interpolates between old and new values over time.

{% codeblock %}
{% highlight css linenos %}
.element {
  transition: background-color 0.3s ease-in-out;
}

.element:hover {
  background-color: #ff4081;
}
{% endhighlight %}
{% endcodeblock %}

When hovered, the color changes smoothly over 0.3 seconds.

## Transition Properties Overview

### 1. `transition-property`

Specifies which CSS properties should be animated.

{% codeblock %}
{% highlight css linenos %}
transition-property: background-color, transform;
{% endhighlight %}
{% endcodeblock %}

- You can list multiple properties separated by commas.
- Use `all` to animate every animatable property (not recommended for performance reasons).

> **Tip:** Avoid `all` — explicitly list properties to prevent unwanted animations and repaints.

### 2. `transition-duration`

Defines **how long** the transition takes to complete.

{% codeblock %}
{% highlight css linenos %}
transition-duration: 0.5s;
{% endhighlight %}
{% endcodeblock %}

Supports seconds (`s`) or milliseconds (`ms`).

You can specify multiple durations for multiple properties:

{% codeblock %}
{% highlight css linenos %}
transition-property: opacity, transform;
transition-duration: 0.3s, 0.6s;
{% endhighlight %}
{% endcodeblock %}

### 3. `transition-timing-function`

Controls **how the animation progresses over time.**

{% codeblock %}
{% highlight css linenos %}
transition-timing-function: ease-in-out;
{% endhighlight %}
{% endcodeblock %}

**Common Timing Functions**

| Function                       | Description                                        |
| ------------------------------ | -------------------------------------------------- |
| `ease`                         | Starts slow, speeds up, then slows down (default). |
| `linear`                       | Constant speed throughout.                         |
| `ease-in`                      | Starts slow, speeds up at end.                     |
| `ease-out`                     | Starts fast, slows down at end.                    |
| `ease-in-out`                  | Slow start and end, fast middle.                   |
| `cubic-bezier(x1, y1, x2, y2)` | Custom curve control.                              |
| `steps(n, start/end)`          | Jump-based transitions for discrete steps.         |

**Example:**

{% codeblock %}
{% highlight css linenos %}
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
{% endhighlight %}
{% endcodeblock %}

### 4. `transition-delay`

Delays the start of the animation.

{% codeblock %}
{% highlight css linenos %}
transition-delay: 0.2s;
{% endhighlight %}
{% endcodeblock %}

Useful for staggering multiple transitions.

### 5. `transition`

Shorthand for all four properties:

{% codeblock %}
{% highlight css linenos %}
transition: property duration timing-function delay;
{% endhighlight %}
{% endcodeblock %}

**Example:**

{% codeblock %}
{% highlight css linenos %}
.element {
  transition: transform 0.4s ease-in-out 0.1s;
}
{% endhighlight %}
{% endcodeblock %}

Order matters. Missing values default to their initial state.

## How Transitions Work

A transition only occurs **when a property changes** — usually due to:

- Pseudo-classes (`:hover`, `:focus`, `:active`)
- Class toggling via JavaScript
- Inline style changes (e.g., `element.style.height = "200px"`)
- DOM manipulation or layout updates

{% codeblock %}
{% highlight js linenos %}
const box = document.querySelector(".box");
box.addEventListener("click", () => {
  box.classList.toggle("expanded");
});
{% endhighlight %}
{% endcodeblock %}

{% codeblock %}
{% highlight css linenos %}
.box {
  width: 100px;
  height: 100px;
  transition: width 0.3s ease-in-out;
}

.box.expanded {
  width: 200px;
}
{% endhighlight %}
{% endcodeblock %}

## Transition Events

You can listen to events triggered during or after transitions:

| Event              | Description                           |
| ------------------ | ------------------------------------- |
| `transitionstart`  | Fired when a transition begins.       |
| `transitionrun`    | Fired right before transition starts. |
| `transitionend`    | Fired after transition completes.     |
| `transitioncancel` | Fired if a transition is interrupted. |

**Example:**

{% codeblock %}
{% highlight css linenos %}
box.addEventListener("transitionend", () => {
  console.log("Transition completed!");
});
{% endhighlight %}
{% endcodeblock %}

## Best Practices

- **Keep durations short:** Usually 150–500ms for UI interactions.
- **Avoid animating layout-affecting properties** like `width`, `height`, `top`, `left`.
  Instead, animate **opacity** or **transform** (`scale`, `translate`, `rotate`) — these run on the GPU and are more performant.
- **Define transitions in base state** (`.element`), not in the hover or active state.
- **Combine transitions and transforms** for efficient animations.
- Use `transition: none;` when you need instant visual updates (e.g., for accessibility toggles).

## The `will-change` property

The `will-change` property hints to the browser that an element will change soon.
This allows the browser to prepare optimizations, reducing lag for expensive transitions.

{% codeblock %}
{% highlight css linenos %}
.card {
  will-change: transform, opacity;
}
{% endhighlight %}
{% endcodeblock %}

Use sparingly — excessive `will-change` declarations can increase memory usage.

## Example

{% codeblock %}
{% highlight html linenos %}
<div class="transition-demo">
  <button class="btn">Hover Me</button>
</div>
{% endhighlight %}
{% endcodeblock %}

{% codeblock %}
{% highlight css linenos %}
body {
  display: grid;
  place-items: center;
  height: 100vh;
  background: #f6f6f6;
}

.btn {
  background: #6200ea;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease, transform 0.3s ease;
  will-change: background-color, transform;
}

.btn:hover {
  background-color: #3700b3;
  transform: scale(1.08);
}
{% endhighlight %}
{% endcodeblock %}

## Conclusion

**CSS Transitions** are the foundation of smooth, performant UI motion.
They’re declarative, easy to use, and integrate seamlessly with user interactions.

- Use them for **micro-interactions** (hover, focus, click)
- Combine with **transform** for best performance
- Optimize with **will-change** only when necessary
- Keep motion **subtle and consistent**