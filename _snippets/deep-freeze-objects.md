---
title: "Deep Freeze Objects in JavaScript"
excerpt: "Recursively lock every object level for true immutability"
description: "Lock objects and their children immutably — prevent accidental mutations and enforce deep immutability in strict mode."
layout: "snippet"
tags: [javascript, Object.freeze, deep-freeze, immutability, secure-coding, strict-mode]
category: [JavaScript]
date: 2025-09-29
image:
  path: /assets/img/goodies/snippets/deep-freeze-objects/cover.png
  width: 1536
  height: 1024
  alt: "Promotional digital graphic showing the phrase ‘JavaScript deepFreeze()’ with code-themed visuals and design elements aligned to the left."
changelog:
  - date: 2025-09-29
    change: "Initial publication"
---

## Introduction

Sometimes you want a JavaScript object to be **completely immutable**, including all nested objects. The built-in `Object.freeze()` only locks top-level properties, leaving nested objects mutable.

This snippet provides a production-safe `deepFreeze(obj)` function that recursively freezes an object and all its nested objects or arrays — ensuring true immutability and predictable behavior.

## Deep Freeze Utility

{% codeblock %}
{% highlight js linenos %}
function deepFreeze(obj) {
  if (obj && typeof obj === "object") {
    Object.getOwnPropertyNames(obj).forEach((prop) => {
      const value = obj[prop];
      if (value && typeof value === "object") deepFreeze(value);
    });
    return Object.freeze(obj);
  }
  return obj;
}
{% endhighlight %}
{% endcodeblock %}

## Highlights

- Works on objects and arrays.
- Standalone function, **no prototype pollution**.
- Safe to use in production applications.

## How It Works

1. Checks if the value is an object or array.
2. Iterates over all own properties using `Object.getOwnPropertyNames()`.
3. Recursively freezes any nested objects or arrays.
4. Applies `Object.freeze()` to the current object.
5. Returns the frozen object.

This ensures **all levels of the object tree are immutable**, preventing accidental mutations.

## Example Usage

{% codeblock %}
{% highlight js linenos %}
"use strict"; // Required to throw errors on illegal assignments

const user = {
  name: "Alice",
  preferences: {
    theme: "dark",
    language: "en"
  },
  roles: ["admin", "editor"]
};

// Recursively freeze the object
deepFreeze(user);

// Attempt to modify top-level property
user.name = "Bob"; // Throws TypeError in strict mode

// Attempt to modify nested object
user.preferences.theme = "light"; // Throws TypeError in strict mode

// Attempt to modify nested array
user.roles.push("viewer"); // Throws TypeError in strict mode

console.log(user);
// Output remains unchanged:
// { name: "Alice", preferences: { theme: "dark", language: "en" }, roles: ["admin", "editor"] }
{% endhighlight %}
{% endcodeblock %}

## Use Cases

- **Immutable configuration objects:** Prevent accidental changes to app settings.
- **Library defaults:** Freeze default options so consumers cannot mutate them.
- **Security-sensitive data:** Ensure critical objects remain unchanged.
- **State management in front-end frameworks:** Enforce immutability to prevent unexpected re-renders.
- **Immutable Redux states:** Protect state objects from accidental mutations.
- **Shared objects in multi-module applications:** Safely share objects without risk of modification.

## Notes & Tips

- **Strict Mode Required for Errors:** Without "use strict", assignments fail silently.
- **Performance Consideration:** Recursively freezing deeply nested objects has O(n) complexity — avoid freezing very
  large objects in performance-critical paths.
- **Nested Arrays:** The utility handles arrays seamlessly.
- **Production Safety:** Standalone function avoids modifying Object.prototype, eliminating prototype pollution risks.
- **Alternatives:** For large-scale applications, consider libraries like [immer](https://immerjs.github.io/immer/) for immutable state management.
- **Debugging:** Frozen objects throw errors on modification attempts, making bugs easier to catch early.

## Key Takeaway

The `deepFreeze(obj)` utility ensures your objects are truly immutable at all levels, providing safer, more predictable JavaScript applications and robust state management without the risks associated with modifying `Object.prototype`.
