---
title: "Encapsulation with Closures"
slug: "encapsulation-closure"
excerpt: "Encapsulate private variables using JavaScript closure patterns."
description: "Learn how to use JavaScript closures to create protected, private state variables that are inaccessible from the global scope."
layout: "snippet"
tags: [javascript, closures, encapsulation, design-patterns, functional-programming, private-state, clean-code, factory-pattern]
category: JavaScript
date: 2026-02-14
image:
  path: /assets/img/goodies/snippets/encapsulation-closure/cover.png
  width: 1536
  height: 1024
  alt: "Cover image illustrating private state encapsulation in JavaScript using closures, symbolized by a shield protecting internal variables."
changelog:
  - date: 2026-02-14
    change: "Initial publication."
---

## Introduction

In JavaScript, **closures** allow a function to access variables from its outer scope even after that outer function
has returned. This behavior enables the creation of **private state**, preventing external code from modifying internal logic.

A closure “remembers” its lexical environment — like carrying a private backpack of variables that only it can access.

While modern JavaScript provides alternatives such as ES modules and **class-based `#private` fields**, closures remain one of the most
flexible and reliable techniques for encapsulation in functional programming.

## The Private Counter Snippet

This version supports initial values, custom step increments, and uses a modern `getter` for read-only access.

{% codeblock %}
{% highlight js linenos %}
/**
 * Creates a counter with protected state and step-logic.
 * @param {number} initialValue - Starting point (default: 0)
 */
function createCounter(initialValue = 0) {
  let count = initialValue; // Private 'source of truth'

  const api = {
    increment: (step = 1) => count += step,
    decrement: (step = 1) => count -= step,
    reset: () => count = initialValue,

    // Modern getter: allows 'counter.value' syntax
    get value() {
      return count;
    }
  };

  return Object.freeze(api); // Ensures API integrity
}
{% endhighlight %}
{% endcodeblock %}

## How It Works

**1. Lexical Scoping:** `count` is a local variable within `createCounter`, entirely inaccessible from the global scope.

**2. Persistence:** The `api` methods form a closure over `count`, keeping it alive in memory as long as the counter object exists.

**3. Encapsulation:** Even though `createCounter()` finishes executing, the `count` variable lives on in memory as
long as the `counter` object exists, but it remains invisible to the rest of your application.

**4. API Protection:** `Object.freeze` prevents callers from deleting or overwriting the methods (e.g., `counter.increment = null` will fail).

## Example Usage
{% codeblock %}
{% highlight js linenos %}
const counter = createCounter(10);

console.log(counter.increment(5)); // 15
console.log(counter.decrement(2)); // 13
console.log(counter.value);        // 13 (Read via getter)

// Attempted tampering fails:
counter.count = 999;               // No effect on internal state
console.log(counter.value);        // Still 13

// Direct access is impossible:
console.log(counter.count);        // undefined

// Resetting the counter:
counter.reset();
console.log(counter.value);        // 10

// Tempering the function:
counter.increment = null;
console.log(counter.increment()); // Still original function (API is frozen)
{% endhighlight %}
{% endcodeblock %}

## Highlights

- **Data Integrity:** State can only be modified through the explicit `increment`, `decrement`, and `reset` methods.
- **Zero Global Pollution:** No global variables are required to track the state.
- **Factory Pattern:** You can create multiple independent counters (e.g., `const c1 = createCounter();`
`const c2 = createCounter();`), and each will maintain its own separate `count`.

## Why Use This Over Classes?

* **No `this` context:** Avoids the common pitfalls of losing `this` context when passing methods around.
* **Functional Design:** Perfect for React Hooks, middleware, and factory-based architectures.
* **Total API Protection:** By freezing the returned object, you prevent any modification to the public interface.

## When to Use Closures?

Use **Closures** for lightweight utilities, React-style hooks without worrying about `bind()` or `this`.
They are excellent for **Unique ID Generators** or simple state containers.

## Key Takeaway

Closures are a lightweight, framework-independent solution for private state, forming the foundation of the **Module Pattern**
in JavaScript.
