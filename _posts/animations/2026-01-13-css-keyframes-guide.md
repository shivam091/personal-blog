---
layout: post
title: "An Interactive Guide to CSS Keyframes"
description: "Master multi-step CSS animations using @keyframes. Learn control, performance, GPU optimization, and advanced web motion."
excerpt: "Bring static designs to life with keyframes"
category: Animations
tags: [css, keyframes, animation, gpu-performance, multi-step, web-motion, ui-design, frontend, scroll-animation, view-timeline, advanced-css]
date: 2026-01-13 01:39
slug: css-keyframes-guide
image:
  path: /assets/img/posts/animations/css-keyframes-guide/cover.png
  width:
  height:
  alt:
changelog:
  - date: 2026-01-13
    change: "Initial publication"
toc:
  max: 3
---

## Introduction

While CSS transitions animate between two states, **CSS keyframe animations** allow **full control over multiple animation stages**.
They power complex UI effects like loaders, banners, progress bars, and interactive micro-animations — all without JavaScript.

## What Are Keyframes?

A keyframe defines **how an element’s properties change over time**. Unlike transitions, which have simple start and end,
keyframes can describe multiple checkpoints — giving you detailed control.

The `@keyframes` rule allows you to specify the appearance of an element at various points during an animation.

{% codeblock %}
{% highlight css linenos %}
@keyframes bounce {
  0% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-50px);
  }

  100% {
    transform: translateY(0);
  }
}

.ball {
  animation: bounce 1s ease-in-out infinite;
}
{% endhighlight %}
{% endcodeblock %}

The element moves up and down smoothly, repeating forever.

## Using `from` and `to` Keywords

For the start and end of your animation, CSS provides simple keyword aliases that can improve readability:

- `from`: This is an alias for `0%`. It is used to define the element's properties at the **start** of the animation.
- `to`: This is an alias for `100%`. It is used to define the element's properties at the **end** of the animation cycle.

You can rewrite the start and end of the `bounce` animation using these keywords:

{% codeblock %}
{% highlight css linenos %}
@keyframes bounce {
  from {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-50px);
  }

  to {
    transform: translateY(0);
  }
}
{% endhighlight %}
{% endcodeblock %}

Using `from` and `to` is especially helpful for simple animations that only need a beginning and an end state.

## Enhanced Keyframe Definition Techniques

**Omitting Keyframes (Implicit Styling)**

For brevity, you don't always need to define `0%` or `100%`. If you omit the starting keyframe (`0%` or `from`), the browser will implicitly use the element's default or current style. Similarly, if you omit the final keyframe (`100%` or `to`), the browser interpolates back toward the element's base styles.

**Grouping Keyframes**

When multiple keyframes share the exact same style, you can group them using commas. This significantly cleans up complex keyframe
definitions and improves readability:

{% codeblock %}
{% highlight css linenos %}
@keyframes pulsing {
  /* Keyframes 10%, 40%, and 60% all share the same opacity and scale */
  10%,
  40%,
  60% {
    opacity: 0.2;
    transform: scale(1.05);
  }

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
{% endhighlight %}
{% endcodeblock %}

## Why Keyframes?

- **Multi-step control:** Define several states beyond just start/end.
- **Reusability:** Apply the same animation to multiple elements.
- **Independence:** Animations can run automatically, not tied to hover/focus.
- **Composability:** Chain or layer animations for advanced motion effects.

## Animation Properties

CSS provides a set of `animation-*` properties to control animations. For an animation to run, you must specify both the `animation-name` and the `animation-duration`. All other properties are optional.

### 1. `animation-name`

The `animation-name` CSS property specifies name of the `@keyframes` animation to apply.

{% codeblock %}
{% highlight css linenos %}
.element {
  animation-name: bounce;
}
{% endhighlight %}
{% endcodeblock %}

You can define multiple animations by separating names with commas:

{% codeblock %}
{% highlight css linenos %}
.element {
  animation-name: bounce, fade;
}
{% endhighlight %}
{% endcodeblock %}

### 2. `animation-duration`

The `animation-duration` CSS property sets **how long** one animation cycle takes to complete. The duration can be specified either in seconds (`s`) or milliseconds (`ms`).

{% codeblock %}
{% highlight css linenos %}
.element {
  animation-name: bounce;

  /* Duration */
  animation-duration: 2s;
}
{% endhighlight %}
{% endcodeblock %}

You can specify multiple durations for multiple animations, maintaining the order defined in `animation-name` property:

{% codeblock %}
{% highlight css linenos %}
.element {
  animation-name: bounce, fade;

  /* Matches the order: bounce gets 1s, fade gets 3s */
  animation-duration: 1s, 3s;
}
{% endhighlight %}
{% endcodeblock %}

### 3. `animation-timing-function`

The `animation-timing-function` CSS property controls the **speed curve** of the animation.

{% codeblock %}
{% highlight css linenos %}
.element {
  animation-name: bounce;
  animation-duration: 2s;

  /* Timing function */
  animation-timing-function: ease-in-out;
}
{% endhighlight %}
{% endcodeblock %}

**Common Timing Functions:**

| Function                       | Description                                        |
| ------------------------------ | -------------------------------------------------- |
| `linear`                       | Constant speed throughout.                         |
| `ease`                         | Starts slow, speeds up, then slows down (default). |
| `ease-in`                      | Starts slow, speeds up at end.                     |
| `ease-out`                     | Starts fast, slows down at end.                    |
| `ease-in-out`                  | Slow start and end, fast middle.                   |
| `steps(n, start/end)`          | Jump-based animations for discrete steps.          |
| `cubic-bezier(x1, y1, x2, y2)` | Custom curve for precise control.                  |

You can specify multiple timing functions for multiple animations, maintaining the order defined in `animation-name` property:

{% codeblock %}
{% highlight css linenos %}
.element {
  animation-name: bounce, fade;
  animation-duration: 1s, 3s;

  /* Matches the order: bounce gets ease-out, fade gets ease-in-out */
  animation-timing-function: ease-out, ease-in-out;
}
{% endhighlight %}
{% endcodeblock %}

**Note on** `cubic-bezier`: This function gives you granular control over the curve, allowing you to simulate complex
effects like a subtle spring or bounce (where the property briefly overshoots its final value) in your animations.

### 4. `animation-delay`

The `animation-delay` CSS property defines **how long to wait before the animation starts**.

{% codeblock %}
{% highlight css linenos %}
.element {
  animation-delay: 0.5s;
}
{% endhighlight %}
{% endcodeblock %}

This can be used to **stagger multiple elements** or coordinate sequences.

You can specify multiple delays for multiple animations, maintaining the order defined in `animation-name` property:

{% codeblock %}
{% highlight css linenos %}
.element {
  animation-name: bounce, fade;
  animation-duration: 1s, 3s;
  animation-timing-function: ease-out, ease-in-out;

  /* Matches the order: bounce gets 1s delay, fade gets 1.5s delay */
  animation-delay: 1s, 1.5s;
}
{% endhighlight %}
{% endcodeblock %}

#### Negative Delays

A negative value for `animation-delay` is perfectly valid and causes the animation to begin **immediately**, but from a point **partway through its animation cycle.**

For instance, an `animation-delay: -0.5s` applied to an animation with a `1s` duration will start at its midway point (equivalent to the `50%` keyframe), with only `0.5s` of the animation remaining to play out.

The primary utility of a negative delay is for synchronizing or pre-positioning elements without having to define a separate initial state.

> **Core Mechanism Note:** The function of a negative delay is identical across transitions and keyframe animations: it sets the
internal timer backward by the specified amount. For its application in simple, two-state transitions, see the **Negative Delays**
section in my **[An Interactive Guide to CSS Transitions](/post/css-transitions-guide#negative-delays)** post.

**Key takeaway:** The negative value does not mean the element waits; it means the animation starts now, but the timer is conceptually set backwards by that amount.

### 5. `animation-iteration-count`

The `animation-iteration-count` CSS property controls how many times each animation cycle repeats.

{% codeblock %}
{% highlight css linenos %}
.element {
  animation-iteration-count: infinite;
}
{% endhighlight %}
{% endcodeblock %}

It can be a number (e.g., `3` for three cycles) or `infinite` for endless repetition.

You can specify multiple iteration counts for multiple animations, maintaining the order defined in `animation-name` property:

{% codeblock %}
{% highlight css linenos %}
.element {
  animation-name: bounce, fade;
  animation-duration: 1s, 3s;
  animation-timing-function: ease-out, ease-in-out;
  animation-delay: 1s, 1.5s;

  /* Matches the order: bounce runs once, fade runs infinite */
  animation-iteration-count: 1, infinite;
}
{% endhighlight %}
{% endcodeblock %}

### 6. `animation-direction`

The `animation-direction` CSS property defines direction of play for each iteration.

| Value               | Description                          |
| ------------------- | ------------------------------------ |
| `normal`            | Plays forward each time (default)    |
| `reverse`           | Plays backward each time             |
| `alternate`         | Forwards, then backwards alternately |
| `alternate-reverse` | Backwards first, then forwards       |

{% codeblock %}
{% highlight css linenos %}
.element {
  animation-direction: alternate;
}
{% endhighlight %}
{% endcodeblock %}

This creates a smooth **back-and-forth** motion.

You can specify multiple directions for multiple animations, maintaining the order defined in `animation-name` property:

{% codeblock %}
{% highlight css linenos %}
.element {
  animation-name: bounce, fade;
  animation-duration: 1s, 3s;
  animation-timing-function: ease-out, ease-in-out;
  animation-delay: 1s, 1.5s;
  animation-iteration-count: 1, infinite;

  /* Matches the order: bounce runs normal, fade runs alternate */
  animation-direction: normal, alternate;
}
{% endhighlight %}
{% endcodeblock %}

### 7. `animation-fill-mode`

The `animation-fill-mode` CSS property controls how styles are applied **before** and **after** the animation.

| Value       | Description                                       |
| ----------- | ------------------------------------------------- |
| `none`      | Element returns to initial state                  |
| `forwards`  | Keeps final keyframe styles                       |
| `backwards` | Applies starting keyframe before animation starts |
| `both`      | Applies both `forwards` and `backwards`           |

{% codeblock %}
{% highlight css linenos %}
.element {
  animation-fill-mode: forwards;
}
{% endhighlight %}
{% endcodeblock %}

This is useful when you want the final state to persist.

You can specify multiple fill modes for multiple animations, maintaining the order defined in `animation-name` property:

{% codeblock %}
{% highlight css linenos %}
.element {
  animation-name: bounce, fade;
  animation-duration: 1s, 3s;
  animation-timing-function: ease-out, ease-in-out;
  animation-delay: 1s, 1.5s;
  animation-iteration-count: 1, infinite;
  animation-direction: normal, alternate;

  /* Matches the order: bounce stays at end, fade resets (default) */
  animation-fill-mode: forwards, none;
}
{% endhighlight %}
{% endcodeblock %}

### 8. `animation-play-state`

The `animation-play-state` CSS property specifies whether a CSS animation is **running** or **paused**.

{% codeblock %}
{% highlight css linenos %}
.element {
  animation-play-state: paused;
}
{% endhighlight %}
{% endcodeblock %}

**Values:**

| Value | Description | Practical Effect |
| ----- | ----------- | ---------------- |
| `running`, (default) | The animation is currently playing normally. | If the animation was paused, it resumes from the point where it stopped.
| `paused` | The animation is stopped at its current point in the cycle. | The element's properties remain fixed at the state they were in when the pause was applied. |

You can specify multiple play states for multiple animations, maintaining the order defined in `animation-name` property:

{% codeblock %}
{% highlight css linenos %}
.element {
  animation-name: bounce, fade;
  animation-duration: 1s, 3s;
  animation-timing-function: ease-out, ease-in-out;
  animation-delay: 1s, 1.5s;
  animation-iteration-count: 1, infinite;
  animation-direction: normal, alternate;
  animation-fill-mode: forwards, none;

  /* Matches the order: bounce runs, fade is paused */
  animation-play-state: running, paused;
}
{% endhighlight %}
{% endcodeblock %}

**Practical Usage:**

This property is most commonly manipulated using JavaScript (by toggling a CSS class) to give users control over animations, such as:

- **User Control:** Allowing a user to click a "Pause" or "Play" button.
- **Accessibility:** Automatically pausing animations when an element is not visible (e.g., using the Intersection Observer API).
- **Interactivity:** Pausing an animation when a user hovers over the element (which can also be done entirely with CSS using the `:hover` pseudo-class).

### 9. `animation-timeline`

The animation-timeline CSS property is a recent addition to the CSS Animations specification, enabling **scroll-linked**
or **view-linked** animations.

Instead of having the animation progress based on time (controlled by `animation-duration`), this property allows the animation to
progress based on a user's action, typically:

- **Scroll Progress:** The animation progresses as the user scrolls down a container or the main document (`scroll()` or `view()` timelines).
- **Element Visibility:** The animation progresses as a specific element enters or exits the viewport.

**Values:**

| Value | Description |
| ----- | ----------- |
| `auto` (default) | The animation progresses based on time. |
| `scroll(root)` | The animation progresses based on the scroll position of the entire page. |
| `view(block)` | The animation progresses based on a specific element entering and moving through the viewport. |

You can specify multiple timelines for multiple animations, maintaining the order defined in `animation-name` property.

**Examples:**

**1. Single Animation Timeline Example**

This example defines a single animation, `fade-out-on-scroll`, which plays out as the element moves through the **viewport** (`view()`), rather than over a specific duration of time.

{% codeblock %}
{% highlight css linenos %}
/* 1. Define the Keyframes */
@keyframes fade-out-on-scroll {
  /* 0% corresponds to the element's entry into the viewport */
  0% {
    opacity: 1;
    filter: blur(0);
  }

  /* 100% corresponds to the element's exit from the viewport */
  100% {
    opacity: 0;
    filter: blur(10px);
  }
}

/* 2. Apply the Animation and Timeline */
.hero-header {
  height: 50vh;
  padding: 40px;

  animation: fade-out-on-scroll 1s linear 0s 1 normal forwards running view();
  /* The '1s' duration is now the *distance* over which the 0% to 100% keyframe progression occurs relative to the scroll. */
}
{% endhighlight %}
{% endcodeblock %}

**2. Multiple Animations Timeline Example**

This example runs two animations simultaneously on a single element: one that is **time-based** (`color-shift`) and one that is **scroll-based** (`slide-up`).

{% codeblock %}
{% highlight css linenos %}
/* 1. Define Keyframes */
/* Time-based: Loops forever */
@keyframes color-shift {
  0% {
    background-color: darkblue;
  }

  50% {
    background-color: purple;
  }

  100% {
    background-color: darkblue;
  }
}

/* Scroll-based: Plays once based on view entry */
@keyframes slide-up {
  0% {
    transform: translateY(50px);
    opacity: 0;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 2. Apply Animations and Timelines using Shorthand */
.card-element {
  padding: 20px;

  /* List two complete animation definitions separated by a comma. */
  animation:
    /* Animation 1 (Time-based Loop): timeline set to 'auto' */
    color-shift 3s ease-in-out infinite alternate both running auto,

    /* Animation 2 (Scroll-driven Reveal): timeline set to 'view()' */
    slide-up 0.5s linear 0s 1 forwards running view();
}
{% endhighlight %}
{% endcodeblock %}

**Practical Effect:**

This feature is powerful for creating effects like:

- Elements smoothly fading in or sliding into place as they become visible.
- A fixed header's background changing color as the user scrolls past a certain point.
- A progress bar filling up based on how far the user has scrolled through an article.

> **💡 Browser Support Note:** This property is cutting-edge and currently requires high browser compatibility (e.g., **Chromium browsers**).
> It often works in conjunction with the `@scroll-timeline` rule or the simpler `scroll()` and `view()` functions within `animation-timeline`.

### 10. `animation`

Instead of writing multiple CSS animation properties separately, you can combine them into the `animation` **shorthand property**. This property is essential for clean code, especially when defining complex or layered effects.

The full syntax includes **nine** potential values, but only `animation-name` and `animation-duration` are strictly required.

**Syntax:**
{% codeblock %}
{% highlight css linenos %}
animation: <name> <duration> <timing-function> <delay> <iteration-count> <direction> <fill-mode> <play-state> <timeline>;
{% endhighlight %}
{% endcodeblock %}

**Positional Rules: Duration vs. Delay**

Unlike most other values, the browser uses a positional rule to distinguish between the two time values (`duration` and `delay`):

1. The **first time** value provided is always the `animation-duration`.
2. The **second time** value provided is always the `animation-delay`.

If only one time value is present, it is always treated as the `duration`, and the `delay` defaults to `0s`.

| Shorthand Example (Time Values)      | Interpretation                      |
| ------------------------------------ | ----------------------------------- |
| `animation: slide 1.5s linear;`      | duration: 1.5s, delay: 0s (default) |
| `animation: slide 1.5s linear 0.5s;` | duration: 1.5s, delay: 0.5s         |

**Example:**

{% codeblock %}
{% highlight css linenos %}
.element {
  animation: bounce 1s ease-out 0s infinite alternate both; /* timeline defaults to 'auto' */
}
{% endhighlight %}
{% endcodeblock %}

You can chain multiple, independent animations on a single element by separating the full definitions with a comma. This is crucial for compositing complex motion.

{% codeblock %}
{% highlight css linenos %}
.element {
  animation: bounce 1s ease-out, fade 2s ease-in-out 1s; /* Both default to 'auto' timeline */
}
{% endhighlight %}
{% endcodeblock %}

Each animation runs independently. Use delays to coordinate sequences or **different timelines** (as shown in the `animation-timeline` section) to drive them separately.

**Example (Including Scroll Timeline):**

{% codeblock %}
{% highlight css linenos %}
.scroll-reveal {
  /* This combines all 9 properties, including the 'view()' timeline */
  animation: reveal 0.8s ease-in-out 0s 1 normal forwards running view();
}
{% endhighlight %}
{% endcodeblock %}

Each animation runs independently. Use delays to coordinate sequences.

## Keyframes vs Transitions

To truly master UI motion, you need to understand the fundamental difference between **CSS Transitions** and **CSS Keyframe Animations**. While both can animate properties, they are designed for different levels of complexity and control. Transitions are **state-driven** (a property changes from A to B), while Keyframes are **time-driven** (a script dictates how the properties change over a timeline).

For a deep dive into transitions, see the **[An Interactive Guide to CSS Transitions](/post/css-transitions-guide)** post.

| Feature | CSS Transitions | CSS Keyframe Animations |
| :--- | :--- | :--- |
| **Definition** | A bridge between two discrete property values (State A → State B). | A sequence of property changes defined across a timeline (`0%` to `100%`). |
| **Trigger Mechanism** | Must be triggered by a **state change** (e.g., `:hover`, class toggle via JS, `:active`). | Can be triggered **automatically** on page load, via a class, or infinite loop. |
| **Steps / Stages** | **2 Steps:** Always animates from a single start state to a single end state. | **Unlimited Steps:** Defined using percentage stops (`0%`, `50%`, `100%`, etc.). |
| **Cycling / Looping** | **No** native looping. It must be re-triggered for a second play. | **Yes.** Supports infinite looping (`animation-iteration-count: infinite;`). |
| **Property Control** | **Single:** All properties must share the same `duration`, `delay`, and `timing-function` for the overall transition. | **Per Step:** Each keyframe percentage stop (`0%`, `50%`, etc.) can hold completely different sets of property values. |
| **Motion Flow** | Typically reversible (smoothly plays backward when the state is removed). | By default, it runs one-way. Reversibility requires setting `animation-direction` or JS control. |
| **Best For** | **Micro-interactions**, hover effects, subtle UI feedback, toggles (smooth A ↔ B changes). | **Complex effects**, spinners/loaders, staged introductions, scrolling effects, infinite loops. |
| **JavaScript Event** | `transitionend` | `animationend`, `animationstart`, `animationiteration` |

### When to Choose Which?

#### Choose Transitions When:

* You need simple, high-performance feedback on **user interaction** (e.g., a button changes color or a link slides 2 pixels on hover).
* The change only involves **two states** (on/off, open/closed, active/inactive).
* You want the animation to be **easily reversible** when the trigger state is removed.

#### Choose Keyframes When:

* You require **more than two stages** of motion (e.g., a "loading" bar that shrinks, pauses, then moves).
* You need the animation to **loop infinitely** (e.g., a pulsating icon or loading spinner).
* The animation needs to **start automatically** without explicit user interaction (e.g., an element fading in as the page loads).

Understanding this division ensures you use the most efficient tool for the job. Transitions are the lightweight workhorses for UI, while Keyframes are the powerful engines for complex choreography.

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

## Debugging Keyframe Animations

Animations can sometimes be tricky to debug. The most powerful tool available is your browser's built-in developer panel.

**Using the Browser Animations Tab**

Most modern browsers (Chrome, Firefox, Edge) include an **Animations** tab in their Developer Tools. This tool is invaluable for:

- **Visual Timeline:** Seeing a visual representation of all running animations on the page.
- **Scrubbing:** Pausing the animation and manually dragging the timeline to inspect the element's state at any percentage point.
- **Inspection:** Clicking an animation in the panel reveals the exact `animation-name`, duration, and timing function used.

Use this tab to verify that your keyframes are being applied correctly and that the timing curve isn't causing unexpected jerks or jumps.

## When and How to Use Animations

**When to Use:**

- **Drawing Attention:** Highlight critical elements like new notifications, success messages, or prompt users to action.
- **Indicating State:** Clearly signal ongoing processes (loading spinners, progress bars) or successful/failed actions.
- **Providing Continuity:** Create smooth visual transitions between application states or views.

**How to Use Effectively:**

- **Be Purposeful:** Ensure every animation serves a clear function; **avoid purely decorative** or distracting loops.
- **Maintain Consistency:** Use the same `timing-function` and `duration` across similar UI elements for a cohesive feel.
- **Use Delays for Sequence:** Leverage `animation-delay` to **stagger** motion and guide the user's eye through multiple steps.
- **Combine Effects:** Utilize keyframes for complex motion paths and transitions for simple state changes (e.g., hover effects).

## Performance and `will-change`

When animating frequently changing properties like `transform` or `opacity`, you can use the `will-change` CSS property to help the browser prepare rendering optimizations.

{% codeblock %}
{% highlight css linenos %}
.box {
  will-change: transform, opacity;
}
{% endhighlight %}
{% endcodeblock %}

> 💡 **For a deep dive into the performance benefits and necessary cautions** of using `will-change` (especially concerning memory and GPU usage), please refer to the dedicated section in my
**[An Interactive Guide to CSS Transitions](/post/css-transitions-guide#the-will-change-property)** post.

Use it selectively — overusing it consumes more memory and GPU resources.

## Interactive Example

Unlike transitions, keyframes let you control the middle of the story, not just the beginning and the end. Use the
playground below to tweak the iteration counts and directions. See how `alternate-reverse` changes the vibe of the
loop, or how `fill-mode` decides where the element "lives" once the show is over.

{% playground id:"css-keyframes-guide" line_numbers:"on" %}

## Best Practices

To ensure your keyframe animations are smooth, efficient, and accessible, follow these core principles:

- **Prioritize GPU-Accelerated Properties:** For the smoothest motion, **always prefer animating** `transform` and `opacity`. These
properties run on the **GPU** (Graphics Processing Unit) and avoid triggering expensive browser reflows.
- **Avoid Layout-Affecting Properties:** **Never animate properties** like `width`, `height`, `margin`, or `top`/`left`. These
force the browser to recalculate the entire page layout on every frame, causing **jank** (stuttering).
- **Use `will-change` Judiciously:** Apply `will-change` only to the elements about to be animated. This hints to the browser for
performance preparation. **Remove it immediately** after the animation completes to prevent excess memory consumption.
- **Define Keyframes Clearly:** Keep your `@keyframes` simple and focused. Avoid complex logic or nesting within the keyframes
definition itself to ensure cleaner browser parsing.
- **Mind the Duration:** Keep animation durations consistent and appropriate for the context. Fast actions (micro-animations) should be
**under 0.5s**. Complex loaders or banner effects may be longer.
- **Respect Accessibility:** Use `animation-play-state: paused` and/or CSS media queries (like `prefers-reduced-motion`) to honor users who prefer minimal or no motion. **Avoid continuous, distracting loops** unless absolutely necessary (e.g., loading spinners).
- **Combine with animation-fill-mode:** Always explicitly set `animation-fill-mode` (usually to `forwards`) if the element needs to maintain its final animated state. Don't rely on the element resetting unexpectedly.
- **Vendor Prefix Note (Legacy):** While not required in modern, stable browsers, if you need to support very old browser versions (e.g., specific Android or Safari targets), you may still need to use **vendor prefixes** for both the keyframe definition and the properties (e.g., `@-webkit-keyframes` and `-webkit-animation:`).

## Conclusion

**CSS keyframe animations** empower you to define complex, multi-stage motion with ultimate precision and intent. By mastering the
sequence and control properties, and critically, by leveraging **GPU-accelerated properties** like `transform` and `opacity`, you can
create highly engaging and advanced visual effects.

Used wisely, keyframes make interfaces feel truly alive — they provide full control over timing, direction, and repetition
**without compromising performance or usability**. Master this tool, and you unlock the full expressive power of modern CSS motion.

**Key Takeaways:**
- **Full Control:** Define multi-step motion using `%` checkpoints.
- **Performance First:** Prefer `transform` and `opacity` to utilize the GPU.
- **Layering:** Chain multiple animations using comma-separated values.
- **Usability:** Respect user preference using `animation-play-state` and accessibility media queries.
