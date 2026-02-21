---
layout: post
title: "Mastering the CSS steps() Timing Function"
description: |
  Master discrete interpolation in CSS animations. Learn to implement steps(), step-start, and step-end for frame-based
  sprite sheets and typewriter effects.
excerpt: "Master discrete frame-based jumps in CSS animations."
category: Animations
tags: [css, animation, steps(), transitions, keyframes, timing-functions, web-design, css-tricks]
date: 2026-02-21
slug: css-step-timing-function
image:
  path: /assets/img/posts/animations/css-step-timing-function/cover.png
  width: 1536
  height: 1024
  alt: Visualization of stepped timing functions showing discrete state jumps vs linear interpolation.
changelog:
  - date: 2026-02-21
    change: "Initial publication"
toc:
  max: 3
---

## Introduction

In the world of CSS animations, we are conditioned to seek smoothness. We use `ease-in-out` or `cubic-bezier()` to make elements
glide across the screen. But what happens when you don't want a glide? What if you want a **jump**?

The `steps()` timing function allows you to break an animation into discrete intervals. Instead of interpolating values continuously,
the browser "teleports" the property from one state to another instantly. This is the secret behind the typewriter effect, retro
8-bit animations, and loading spinners that feel mechanical.

The `steps()` timing function in CSS allows you to break an animation or transition into discrete intervals instead of smooth curves.
Unlike `ease` or `linear`, which interpolate values continuously, `steps()` jumps from one state to another instantly — perfect for
pixel art, typewriter effects, or sprite-based animations.

## Syntax

```css
animation-timing-function: steps(<number-of-steps>, <jump-term>);
```

- **Number of Steps:** An integer representing the number of equal-length intervals.
- **Jump Term (Optional):** Defines when the change happens within the step. The most common are `start` and `end` (default).

### The Shorthand Keywords

CSS provides two convenient keywords for the most common use cases:

- `step-start:` Equivalent to `steps(1, start)`. The animation jumps to the end state immediately.
- `step-end:` Equivalent to `steps(1, end)`. The animation stays at the start state until the very end of the duration.

## Choosing Your "Jump" Logic: Start vs. End

Understanding the difference between `start` and `end` is often the biggest hurdle for developers.

| Mode                | When step occurs                   | Mental Model                                                         | Common use case         |
| ------------------- | ---------------------------------- | -------------------------------------------------------------------- | ----------------------- |
| **steps(n, end)**   | At the **end** of each interval.   | The first frame is seen immediately; the last frame is seen at 100%. | Typewriter, loaders     |
| **steps(n, start)** | At the **start** of each interval. | The first frame is skipped; the second frame is seen immediately.    | Sprite sheet animations |

**Example Difference:**

```css
animation-timing-function: steps(5, start);
/* vs */
animation-timing-function: steps(5, end);
```

> **Pro Tip:** If you are building a **Typewriter Effect**, you almost always want `end`. This ensures the first letter isn't skipped the
> moment the animation begins.

## Practical Implementation

### The Typewriter Effect: Using `steps()` with `@keyframes`

This is the most iconic use of `steps()`. By animating the `width` of a container and using `overflow: hidden`, we can reveal text
_character by character_.

{% codeblock %}
{% highlight html linenos %}
<div class="typing-container">
  <p class="typing-text">Hello world!</p>
</div>

<style>
.typing-text {
  width: 0;
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid #0af;
  animation: typing 3s steps(12, end) forwards, blink 0.8s infinite;;
}

@keyframes typing {
  to {
    width: 12ch;
  }
}

@keyframes blink {
  50% {
    border-color: transparent;
  }
}
</style>
{% endhighlight %}
{% endcodeblock %}

**Explanation:** A typewriter-like text reveal — each letter appears in a step rather than gradually.

### Step-based Transition

{% codeblock %}
{% highlight html linenos %}
<div class="loader"></div>

<style>
.loader {
  width: 100px;
  height: 20px;
  background: linear-gradient(90deg, #0af 0 50%, #ccc 50%);
  background-size: 200%;
  transition: background-position 2s steps(4, end);
}
.loader:hover {
  background-position: -100%;
}
</style>
{% endhighlight %}
{% endcodeblock %}

**Explanation:** The background shifts in 4 discrete jumps instead of a smooth slide.

### Sprite Animation

Before video and Lottie files, the web ran on **Sprite Sheets**. A sprite sheet is a single image containing every frame of an animation.
Using `steps()`, we can "slide" the background image to show one frame at a time.

{% codeblock %}
{% highlight html linenos %}
<div class="sprite"></div>

<style>
.sprite {
  width: 80px;
  height: 80px;
  background: url(sprite.png) left center / 480px no-repeat;
  animation: walk 1s steps(6, end) infinite;
}

@keyframes walk {
  100% { background-position: -480px; }
}
</style>
{% endhighlight %}
{% endcodeblock %}

**Explanation:** Each step shows one frame of the sprite — smooth illusion of motion without easing.

## Advanced Troubleshooting: The "Off-by-One" Error

When working with `steps()`, you might notice your animation feels "cut off" or ends on the wrong frame. This usually happens because of a mismatch between your **step count** and your **keyframe values**.

**The Rule of Thumb:**

If you have `N` frames in an image, you want `steps(N)`. However, your keyframe `to` value must be the **total width of the image**, not the position of the last frame. This is because the "jump" happens at the very end of the line.

## When to Use `steps()`

**Use `steps()` when:**

- **Retro Aesthetics:** Creating 8-bit or pixel art movements.
- **Loading States:** Discrete progress bars or "pulsing" LEDs.
- **Complex Icons:** Animating a toggle switch where you want an instant "click" look rather than a slide.
- **Typewriters:** Any text-reveal interaction.

**Avoid `steps()` when:**

- You need organic, fluid motion (use `cubic-bezier` instead).
- You are animating transforms that require sub-pixel smoothing to avoid "jank."

## Pro Tips

- Combine with `infinite` for looping GIF-like effects.
- Use `steps(count, start)` for exact frame control with sprites.
- `animation-delay` and `animation-direction` (`alternate`) pair well with step animations.
- For debugging, temporarily reduce the step count.

## Conclusion

The `steps()` timing function is your go-to for non-smooth, frame-style animations.
From retro typewriters to 8-bit motion, `steps()` gives you pixel-perfect control — something easing curves can’t.

## Summary

The `steps()` function is a precision tool that replaces interpolation with iteration. By mastering the jump logic, you can
move away from "floaty" web animations and toward crisp, intentional micro-interactions.

- `steps(n, end)` is your default for text and simple jumps.
- `steps(n, start)` is your specialized tool for sprite sheets and instant-start sequences.
- **Character counts** are your best friend when defining step numbers.

**Master it once — and every animation gains new precision.**
