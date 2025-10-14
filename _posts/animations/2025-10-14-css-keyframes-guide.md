---
layout: post
title: "An Interactive Guide to CSS Keyframes"
description: "Learn how to define, control, and optimize multi-step animations using pure CSS — no JavaScript required."
excerpt: "Bring static designs to life with keyframes"
category: Animations
tags: [css, animation, keyframes, motion, performance]
date: 2025-10-14 16:50
slug: css-keyframes-guide
image:
  path: /assets/img/posts/animations/css-keyframes-guide/cover.png
  width:
  height:
  alt:
changelog:
  - date: 2025-10-14
    change: "Initial publication"
---

## Introduction

While CSS transitions animate between two states, **CSS keyframe animations** allow **full control over multiple animation stages**.
They power complex UI effects like loaders, banners, progress bars, and interactive micro-animations — all without JavaScript.

## What Are Keyframes?

A keyframe defines **how an element’s properties change over time**.
Instead of a simple start and end (like transitions), keyframes can describe multiple checkpoints — giving you detailed control.

{% codeblock %}
{% highlight css linenos %}
@keyframes bounce {
  0% { transform: translateY(0); }
  50% { transform: translateY(-50px); }
  100% { transform: translateY(0); }
}

.ball {
  animation: bounce 1s ease-in-out infinite;
}
{% endhighlight %}
{% endcodeblock %}

The element moves up and down smoothly, repeating forever.

## The Power of `@keyframes`

**Syntax**

{% codeblock %}
{% highlight css linenos %}
@keyframes name {
  from { /* initial styles */ }
  to { /* final styles */ }
}
{% endhighlight %}
{% endcodeblock %}

or with percentages:

{% codeblock %}
{% highlight css linenos %}
@keyframes slide {
  0% { transform: translateX(0); }
  50% { transform: translateX(100px); }
  100% { transform: translateX(0); }
}
{% endhighlight %}
{% endcodeblock %}

### Why Keyframes?

- **Multi-step control:** Define several states beyond just start/end.
- **Reusability:** Apply the same animation to multiple elements.
- **Independence:** Animations can run automatically, not tied to hover/focus.
- **Composability:** Chain or layer animations for advanced motion effects.

## Animation Properties

### 1. `animation-name`

Specifies which keyframes to apply.

{% codeblock %}
{% highlight css linenos %}
animation-name: bounce;
{% endhighlight %}
{% endcodeblock %}

You can define multiple animations by separating names with commas:

{% codeblock %}
{% highlight css linenos %}
animation-name: move, fade;
{% endhighlight %}
{% endcodeblock %}

### 2. `animation-duration`

Sets how long one animation cycle runs.

{% codeblock %}
{% highlight css linenos %}
animation-duration: 2s;
{% endhighlight %}
{% endcodeblock %}

Can be `s` or `ms`.
Each listed animation can have its own duration:

{% codeblock %}
{% highlight css linenos %}
animation-name: fade, scale;
animation-duration: 1s, 3s;
{% endhighlight %}
{% endcodeblock %}

### 3. `animation-timing-function`

Defines **how** the animation progresses through frames.

{% codeblock %}
{% highlight css linenos %}
animation-timing-function: ease-in-out;
{% endhighlight %}
{% endcodeblock %}

**Common Timing Functions**

Check again

| Function                       | Description                                        |
| ------------------------------ | -------------------------------------------------- |
| `ease`                         | Starts slow, speeds up, then slows down (default). |
| `linear`                       | Constant speed throughout.                         |
| `ease-in`                      | Starts slow, speeds up at end.                     |
| `ease-out`                     | Starts fast, slows down at end.                    |
| `ease-in-out`                  | Slow start and end, fast middle.                   |
| `cubic-bezier(x1, y1, x2, y2)` | Custom curve control.                              |
| `steps(n, start/end)`          | Jump-based transitions for discrete steps.         |

### 4. `animation-delay`

Delays the start of the animation.

{% codeblock %}
{% highlight css linenos %}
animation-delay: 0.5s;
{% endhighlight %}
{% endcodeblock %}

Can be used to **stagger multiple elements** or coordinate sequences.

### 5. `animation-iteration-count`

Controls how many times the animation repeats.

{% codeblock %}
{% highlight css linenos %}
animation-iteration-count: infinite;
{% endhighlight %}
{% endcodeblock %}

It can be:

- A number (e.g., `3` for three cycles)
- `infinite` for endless repetition

### 6. `animation-direction`

Defines direction of play for each iteration.

| Value               | Description                          |
| ------------------- | ------------------------------------ |
| `normal`            | Plays forward each time (default)    |
| `reverse`           | Plays backward each time             |
| `alternate`         | Forwards, then backwards alternately |
| `alternate-reverse` | Backwards first, then forwards       |

{% codeblock %}
{% highlight css linenos %}
animation-direction: alternate;
{% endhighlight %}
{% endcodeblock %}

Creates a smooth **back-and-forth** motion.

### 7. `animation-fill-mode`

Controls how styles are applied **before** and **after** animation.

| Value       | Description                                       |
| ----------- | ------------------------------------------------- |
| `none`      | Element returns to initial state                  |
| `forwards`  | Keeps final keyframe styles                       |
| `backwards` | Applies starting keyframe before animation starts |
| `both`      | Applies both `forwards` and `backwards`           |

{% codeblock %}
{% highlight css linenos %}
animation-fill-mode: forwards;
{% endhighlight %}
{% endcodeblock %}

Useful when you want the final state to persist.

### 8. `animation-play-state`

Pauses or resumes the animation.

{% codeblock %}
{% highlight css linenos %}
animation-play-state: paused;
{% endhighlight %}
{% endcodeblock %}

### 9. `animation`

Shorthand for all animation properties:

**Syntax:**
{% codeblock %}
{% highlight css linenos %}
animation: name duration timing-function delay iteration-count direction fill-mode play-state;
{% endhighlight %}
{% endcodeblock %}

**Example:**

{% codeblock %}
{% highlight css linenos %}
animation: bounce 1s ease-in-out 0s infinite alternate both;
{% endhighlight %}
{% endcodeblock %}

## Example

{% codeblock %}
{% highlight html linenos %}
<button class="pulse-btn">Hover Me</button>
{% endhighlight %}
{% endcodeblock %}

{% codeblock %}
{% highlight css linenos %}
.pulse-btn {
  background: #6200ea;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
}
{% endhighlight %}
{% endcodeblock %}

## When and How to Use Animations

**When to use:**

- Drawing user attention (e.g., notifications, loading states)
- Indicating state changes (success, failure)
- Providing visual continuity between views

**How to use effectively:**

- Keep motion purposeful and minimal.
- Maintain consistent timing and easing across UI.
- Avoid continuous, distracting loops.
- Combine with transitions for hybrid effects.

## Animation Events

You can handle animation lifecycle via events:

| Event                | Trigger                        |
| -------------------- | ------------------------------ |
| `animationstart`     | When animation begins          |
| `animationiteration` | Each time an animation repeats |
| `animationend`       | When animation finishes        |


{% codeblock %}
{% highlight js linenos %}
const box = document.querySelector(".box");
box.addEventListener("animationend", () => {
  console.log("Animation completed!");
});
{% endhighlight %}
{% endcodeblock %}

## Multiple Animations

You can chain multiple animations:

{% codeblock %}
{% highlight css linenos %}
animation: fadeIn 1s ease-in, moveUp 2s ease-out 1s;
{% endhighlight %}
{% endcodeblock %}

Each animation runs independently. Use delays to coordinate sequences.

## Performance and `will-change`

When animating frequently changing properties like `transform` or `opacity`, you can use `will-change` to help the browser prepare rendering optimizations.

{% codeblock %}
{% highlight css linenos %}
.box {
  will-change: transform, opacity;
}
{% endhighlight %}
{% endcodeblock %}

Use it selectively — overusing it consumes more memory and GPU resources.

## Best Practices

- **Prefer `transform` and `opacity`** for smoother GPU-powered animations.
- **Avoid animating layout properties** like `width`, `top`, or `left`.
- **Define keyframes cleanly** — don’t overuse complex nesting.
- **Keep durations consistent** across your site for cohesive motion.
- Use **`animation-play-state`** to pause animations for accessibility preferences (e.g., `prefers-reduced-motion`).

## Conclusion

**CSS keyframe animations** let you define motion with precision and intent.
From subtle hover effects to looping loaders, keyframes give full control over timing, direction, and repetition.

Used wisely, they make interfaces feel alive — **without compromising performance or usability.**

{% codeblock %}
{% highlight css linenos %}

{% endhighlight %}
{% endcodeblock %}



{% codeblock %}
{% highlight css linenos %}

{% endhighlight %}
{% endcodeblock %}