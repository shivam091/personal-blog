---
title: "Encapsulation with Private Class Fields"
slug: "encapsulation-private-class-fields"
excerpt: "Use native #private syntax to protect class properties in JavaScript."
description: "Learn how to use modern JavaScript Private Class Fields to create secure, memory-efficient objects with hidden internal state."
layout: "snippet"
tags: [javascript, oop, encapsulation, classes, clean-code]
category: JavaScript
date: 2026-02-14
image:
  path: /assets/img/goodies/snippets/encapsulation-private-class-fields/cover.png
  width: 1536
  height: 1024
  alt: "Representation of a JavaScript Class with a locked vault icon for private fields."
changelog:
  - date: 2026-02-14
    change: "Initial publication."
---

## Introduction

Modern JavaScript (ES2022+) introduced **Private Class Fields**, marked by the `#` prefix. Historically, developers used the `_variable`
convention to signal privacy, but native private fields provide **Hard Encapsulation** enforced by the engine.

Unlike closures, which rely on function scope, private fields are a native engine-level feature that ensures properties cannot be
accessed or modified outside the class body.

## The Private Class Counter

{% codeblock %}
{% highlight js linenos %}
/**
 * A Counter class using native private fields demonstrating
 * hard encapsulation.
 */
class Counter {
  #count; // Explicit private field declaration
  #initialValue;

  constructor(initialValue = 0) {
    this.#count = initialValue;
    this.#initialValue = initialValue;
  }

  increment(step = 1) {
    return this.#count += step;
  }

  decrement(step = 1) {
    return this.#count -= step;
  }

  reset() {
    this.#count = this.#initialValue;
  }

  // Getter for read-only access
  get value() {
    return this.#count;
  }
}
{% endhighlight %}
{% endcodeblock %}

## How It Works

**1. The `#` Prefix:** The `#` is a structural change. Accessing `counter.#count` from outside the class throws a **Syntax Error**
     at parse-time.

**2. Prototype Efficiency:** Methods are stored on `Counter.prototype`. Instances share the same functions in memory, which is highly efficient.

**3. Engine-Level Security:** Privacy is enforced by the runtime, preventing "hacks" to access internal data.

## Example Usage

{% codeblock %}
{% highlight js linenos %}
const counter = new Counter(10);

counter.increment(5);
console.log(counter.value); // 15

counter.decrement(2);
console.log(counter.value); // 13

// This will throw a Syntax Error:
console.log(counter.#count);
{% endhighlight %}
{% endcodeblock %}

## Why Use This Over Closures?

While [Closures](/snippet/closure-private-counter) are excellent for functional programming and factory functions, Classes are often preferred in 2026 for:

- **Performance:** Shared methods via the prototype save memory when creating thousands of instances.
- **Explicit Intent:** Seeing `#variable` at the top of a class makes it immediately obvious what the internal state is.
- **Static Privacy:** You can have private variables that belong to the *Class itself* (static), which closures cannot easily replicate
  without extra boilerplate.

## When to Use Class Fields?

Use **Class Fields** for complex state machines, high-performance applications (where you have thousands of instances), or when
building a library that follows a traditional OOP structure.

## Key Takeaway

Private Class Fields are the modern standard for **Object-Oriented Encapsulation**. They offer a cleaner syntax than closures for
complex state management while providing engine-level security against external tampering.
