---
layout: post
title: "Mastering Asynchronous JavaScript: Callbacks, Promises, and Async/Await"
description: |
  A deep guide to asynchronous JavaScript covering the event loop, callbacks,
  promises, async/await, microtasks, concurrency patterns, and performance
  best practices for modern web development.
excerpt: "Write clean, predictable asynchronous JavaScript"
date: 2026-03-19
category: [JavaScript]
tags: [javascript, async-javascript, modern-js, async, callbacks, promises, async-await, event-loop, microtasks]
image:
  path: /assets/img/posts/javascript/mastering-async-js/cover.png
  width: 1536
  height: 1024
  alt: JavaScript event loop diagram with callbacks, promises, async/await, and microtask vs macrotask queues
changelog:
  - date: 2026-03-19
    change: "Initial publication"
---

## Introduction

JavaScript is single-threaded by design, yet it powers highly interactive, non-blocking applications. This apparent contradiction is resolved through **asynchronous programming**. Understanding how JavaScript handles async operations is essential for writing scalable, maintainable, and performant code.

This article walks step by step through:

* What asynchronous JavaScript really means
* The **Event Loop** and the Runtime Model
* Callback-based patterns and their limitations
* Promises as a structured alternative
* `async` / `await` for clean, modern async code

The goal is not only to explain *how* these work, but *why* each evolution exists.

## What Is Asynchronous JavaScript?

In synchronous code, each operation blocks the next until it completes:

* A task starts
* JavaScript waits for it to finish
* Only then does the next task run

Asynchronous code allows JavaScript to:

* Start a long-running task (network request, timer, file read)
* Continue executing other code
* Handle the result later, when it is ready

This is critical for:

* Network requests (APIs)
* Timers and delays
* User interactions
* Animations

JavaScript achieves this using the **event loop**, callbacks, and microtask queues—but developers interact with it
through higher-level abstractions.

## Why Asynchronous JavaScript Matters

Fetching data from APIs can take significant time. Async execution keeps the UI responsive.

Asynchronous programming allows JavaScript to initiate these operations without blocking the main thread. While the
operation runs in the background, JavaScript continues executing other tasks, keeping applications responsive and interactive.

This is especially important for:

**Network requests**

Fetching data from APIs can take hundreds of milliseconds or even seconds depending on network conditions. Asynchronous
execution allows the application to remain responsive while waiting for the response.

**User interface responsiveness**

Browsers rely on the main thread for rendering and interaction. Blocking this thread with long operations would freeze the UI,
preventing scrolling, clicks, or animations.

**Timers and scheduled tasks**

Functions like `setTimeout` and `setInterval` rely on asynchronous behavior to schedule code execution without interrupting the
rest of the program.

**Concurrent operations**

Multiple asynchronous tasks—such as loading images, fetching data, and handling user input—can progress independently without
forcing sequential execution.

In short, asynchronous programming enables JavaScript to manage waiting efficiently. Instead of stopping the entire program
while a task completes, JavaScript schedules the result to be handled later, ensuring applications remain smooth and responsive.

## The JavaScript Runtime Model: How Asynchronous Code Actually Runs

To truly understand asynchronous JavaScript, it helps to understand *how* JavaScript executes code under the hood.

### Single-Threaded Nature

JavaScript runs on a single main thread, meaning only one piece of JavaScript executes at a time.
Long synchronous tasks would block the UI, which is why asynchronous APIs exist.

### Web APIs

Operations like `fetch` or `setTimeout` are offloaded to **Web APIs** provided by the browser. These APIs run outside the main thread. Once completed, they send their results back to the queues.

## The Event Loop

The **event loop** continuously checks:

1. Is the call stack empty?
2. Are there pending tasks in the queues?

If yes, it moves queued callbacks onto the call stack.

There are two important queues:

* **Macro task queue** (timers, events)
* **Microtask queue** (promises, `queueMicrotask`)

Microtasks always run **before** the next macro task.

> **The Golden Rule:** The Event Loop will empty the *entire* Microtask Queue before moving to the next Macrotask.

Below is the **JavaScript** event loop diagram showing call stack, web APIs, task queue, and microtask queue

```
Call Stack
   ↓
Web APIs (fetch, setTimeout)
   ↓
Task Queue
   ↓
Microtask Queue (priority)
   ↓
Event Loop
```

### Event Loop Execution Flow (Visual Timeline)

Understanding the Event Loop becomes much easier when visualized as a step-by-step execution flow.

```
┌──────────────────────┐
│      Call Stack      │
│ (Executes JS code)   │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│       Web APIs       │
│ (Timers, fetch, DOM) │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────────────┐
│        Task Queues           │
│  ┌────────────────────────┐  │
│  │   Microtask Queue      │  │ ← Promises, queueMicrotask
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │   Macrotask Queue      │  │ ← setTimeout, events
│  └────────────────────────┘  │
└─────────┬────────────────────┘
          │
          ▼
┌──────────────────────┐
│      Event Loop      │
│ Moves tasks to stack │
└──────────────────────┘
```

### How Execution Happens

1. JavaScript executes code from the **Call Stack**
2. Async operations are offloaded to **Web APIs**
3. When complete, callbacks are queued:

   * Promises → **Microtask Queue**
   * Timers/events → **Macrotask Queue**
4. The **Event Loop** checks:

   * If the call stack is empty
   * Then executes **all microtasks first**
   * Then executes **one macrotask**
5. The cycle repeats continuously

### Key Insight

> The Event Loop always prioritizes the **Microtask Queue** over the Macrotask Queue.

This is why promise callbacks run before `setTimeout`, even if the timeout is `0`.

## The Evolution of JavaScript Async Patterns

As JavaScript applications grew in complexity, the language evolved to provide better ways of managing asynchronous operations. Each
generation of async patterns solved problems introduced by the previous one.

### 1. Callbacks

Callbacks were the original solution for asynchronous operations in JavaScript. A callback is simply a function passed into another
function that executes once a task finishes.

While callbacks work well for simple cases, complex workflows quickly lead to deeply nested code structures, often referred to as
**callback hell**.

### 2. Promises

Promises were introduced to provide a more structured way to represent asynchronous results. Instead of passing functions around manually,
a promise represents a value that will eventually be available.

Promises allow developers to chain operations using `.then()` and handle failures using `.catch()`, significantly improving readability
and error management.

### 3. Async/Await

`async` and `await`, introduced in ES2017, build on top of promises to make asynchronous code look synchronous. Instead of chaining
`.then()` calls, developers can write sequential-looking code while still executing asynchronously.

This approach improves readability, simplifies error handling with `try...catch`, and aligns asynchronous code with familiar control
flow patterns.

### Summary of the Evolution

The progression of asynchronous JavaScript can be summarized as:

```
Callbacks → Promises → Async/Await
```

Each step reduces complexity, improves readability, and makes asynchronous logic easier to reason about in large applications.

## Callbacks: The Original Pattern

A **callback** is a function passed as an argument to another function and executed after an asynchronous operation completes. Callbacks were the earliest and most common way to handle async behavior in JavaScript.

### Basic Callback Example

{% codeblock %}
{% highlight js linenos %}
function fetchData(callback) {
  setTimeout(() => {
    callback("Data loaded");
  }, 1000);
}

fetchData((result) => {
  console.log(result);
});
{% endhighlight %}
{% endcodeblock %}

**What’s happening here:**

* `setTimeout` simulates an asynchronous operation
* The callback is invoked once the operation finishes
* Execution continues without blocking the main thread

For small, simple async tasks, callbacks are straightforward and effective.

### Common Callback Patterns

Callbacks remain widely used today, especially in:

- Event listeners
- Streaming and data flow APIs
- Low-level or performance-critical libraries

#### Error-First Callbacks

Many APIs (notably Node.js) use the **error-first callback convention**, where the first argument represents a potential error.

{% codeblock %}
{% highlight js linenos %}
readFile(path, (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});
{% endhighlight %}
{% endcodeblock %}

This pattern ensures errors are explicitly handled before accessing results.

### Limitations of Callbacks

As application complexity increases, callbacks begin to show serious drawbacks:

* No built-in chaining mechanism
* Manual error propagation required
* Inversion of control (you hand over execution flow)
* Readability issues when nesting callbacks deeply

These limitations led to **callback hell**, motivating the evolution toward **Promises** and **async/await**.

## Callback Hell: When Things Go Wrong

Problems arise when multiple async operations depend on each other.

### Nested Callbacks Example

{% codeblock %}
{% highlight js linenos %}
getUser(id, (user) => {
  getOrders(user.id, (orders) => {
    getOrderDetails(orders[0], (details) => {
      console.log(details);
    });
  });
});
{% endhighlight %}
{% endcodeblock %}

This pattern is known as **callback hell**.

### Why Callback Hell Is a Problem

* Code becomes deeply nested and hard to read
* Error handling is repetitive and fragile
* Logic flow is difficult to follow
* Refactoring becomes risky

Callback hell is not just about indentation—it is about **loss of clarity**.

## Promises: A Better Abstraction

A **Promise** represents the eventual result of an asynchronous operation.
It may be pending, fulfilled, or rejected.
It provides a structured way to manage asynchronous operations and replace deeply nested callbacks.

**Promise States:**

A Promise is always in exactly one of these states:

* **Pending** – initial state.
* **Fulfilled (Resolved)** – The operation completed successfully.
* **Rejected** – The operation failed.

Once settled (fulfilled or rejected), the state is immutable.

Promises allow you to chain operations using `.then()` and handle errors gracefully with `.catch()`.

### Creating and Consuming Promises

**Creating a Promise**

{% codeblock %}
{% highlight js linenos %}
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Data loaded");
    }, 1000);
  });
};
{% endhighlight %}
{% endcodeblock %}

**Consuming a Promise**

{% codeblock %}
{% highlight js linenos %}
fetchData()
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
  }).finally(() => {
    console.log("Cleanup logic here")
  });
{% endhighlight %}
{% endcodeblock %}

Promises **flatten nested callbacks** and **centralize error handling**, significantly improving readability.

### Promise Chaining

Promises can be chained to represent sequential asynchronous steps.

{% codeblock %}
{% highlight js linenos %}
getUser(id)
  .then((user) => getOrders(user.id))
  .then((orders) => getOrderDetails(orders[0]))
  .then((details) => console.log(details))
  .catch((error) => console.error(error));
{% endhighlight %}
{% endcodeblock %}

#### Benefits of Promise Chaining

* Linear, readable flow
* Single error-handling path
* Easier composition of async logic

⚠️ However, long chains can still become verbose — a limitation later addressed by `async`/`await`.

### Promise Internals and Behavior

Understanding Promise behavior is critical for avoiding subtle bugs.

**Promises Are Eager**

* Execution begins **immediately** when a Promise is created
* Promises represent a **result**, not the operation itself

{% codeblock %}
{% highlight js linenos %}
Promise.resolve(Promise.resolve(42)).then(console.log);
{% endhighlight %}
{% endcodeblock %}

A common "gotcha" for learners: while the `.then()` block is asynchronous, the code inside the **Promise constructor** runs **synchronously** and immediately.

{% codeblock %}
{% highlight js linenos %}
console.log("1. Before Promise");
new Promise((resolve) => {
  console.log("2. Inside Promise Constructor (Synchronous!)");
  resolve();
});
console.log("3. After Promise");
{% endhighlight %}
{% endcodeblock %}

#### Promise Resolution Rules

* Resolving with a value fulfills the Promise
* Resolving with another Promise adopts its state
* Throwing an error automatically rejects the Promise

These rules make Promise composition predictable and consistent.

### Promise Utility Methods

JavaScript provides static Promise methods for common async coordination patterns.

#### `Promise.all`

`Promise.all` is **fail-fast**. It takes an array of promises and waits for all of them to succeed. However, if **any** single promise
rejects, the entire operation fails immediately.

{% codeblock %}
{% highlight js linenos %}
// Captures an array of results; fails if any task rejects
const results = await Promise.all([taskA(), taskB()]);

// Pro-Tip: Destructure for immediate access
const [dataA, dataB] = await Promise.all([taskA(), taskB()]);
{% endhighlight %}
{% endcodeblock %}

**Best Use Case:** When the tasks are dependent on each other. For example, you need both a user_id and an access_token to
load a dashboard. If you don't get both, the dashboard is useless.

#### `Promise.allSettled`

`Promise.allSettled` waits for every promise to finish, regardless of whether they succeeded or failed. It returns
an array of objects describing the outcome of each.

{% codeblock %}
{% highlight js linenos %}
// Captures an array of outcome objects {status, value/reason}
const outcomes = await Promise.allSettled([taskA(), taskB()]);
{% endhighlight %}
{% endcodeblock %}

**Best Use Case:** When the tasks are independent. For example, loading five different widgets on a page. If the "Weather"
widget fails, you still want the "Stock Market" and "News" widgets to display.

#### `Promise.race`

The Promise settles (either resolves or rejects) as soon as the first promise in the group settles.

{% codeblock %}
{% highlight js linenos %}
// Settles as soon as the first promise settles (winner or error)
const firstSettled = await Promise.race([taskA(), taskB()]);
{% endhighlight %}
{% endcodeblock %}

**Best Use Case:** Implementing a timeout for a network request. If the request doesn't finish in 5 seconds, the "timeout"
promise wins the race and rejects.

#### `Promise.any`

The Promise resolves as soon as the first promise fulfills (succeeds). It ignores rejections unless every promise in the group fails.

{% codeblock %}
{% highlight js linenos %}
// Resolves as soon as the first promise fulfills (ignores errors)
const firstSuccess = await Promise.any([taskA(), taskB()]);
{% endhighlight %}
{% endcodeblock %}

**Best Use Case:** Requesting data from three different "mirror" servers. You don't care if two of them are down; you only need
the first successful response.

## The `queueMicrotask()` API

Sometimes you need to schedule a function to run asynchronously but **immediately** after the current task, without the
overhead of creating a full Promise. This is where `queueMicrotask()` shines.

**Example Comparison:**

{% codeblock %}
{% highlight js linenos %}
console.log("Start");

setTimeout(() => console.log("Macrotask (Timeout)"), 0);

queueMicrotask(() => console.log("Microtask (Direct)"));

Promise.resolve().then(() => console.log("Microtask (Promise)"));

console.log("End");

// Result: Start -> End -> Microtask (Direct) -> Microtask (Promise) -> Macrotask (Timeout)
{% endhighlight %}
{% endcodeblock %}

### Microtask vs Macrotask: Execution Timeline

To truly understand execution order, consider this example:

{% codeblock %}
{% highlight js linenos %}
console.log("1. Start");

setTimeout(() => {
console.log("2. setTimeout (Macrotask)");
}, 0);

Promise.resolve().then(() => {
console.log("3. Promise (Microtask)");
});

queueMicrotask(() => {
console.log("4. queueMicrotask (Microtask)");
});

console.log("5. End");
{% endhighlight %}
{% endcodeblock %}

### Step-by-Step Execution

```
Step 1: Run synchronous code
→ "1. Start"
→ "5. End"

Step 2: Process Microtasks (ALL of them)
→ "3. Promise (Microtask)"
→ "4. queueMicrotask (Microtask)"

Step 3: Process ONE Macrotask
→ "2. setTimeout (Macrotask)"
```

### Final Output

```
1. Start
5. End
3. Promise (Microtask)
4. queueMicrotask (Microtask)
2. setTimeout (Macrotask)
```

### Visual Timeline

```
Call Stack Execution:
[ Start → End ]

Microtask Queue:
[ Promise → queueMicrotask ]

Macrotask Queue:
[ setTimeout ]

Execution Order:
Stack → Microtasks → Macrotask
```

### Important Takeaways

* Microtasks always run **before** macrotasks
* All microtasks are executed **completely** before moving on
* Even `setTimeout(fn, 0)` runs **after** microtasks
* `queueMicrotask` and Promises behave similarly in priority

### Microtask Starvation Warning

Because microtasks have higher priority, continuously adding microtasks can block macrotasks and even UI rendering.

Example:

{% codeblock %}
{% highlight js linenos %}
function loop() {
queueMicrotask(loop);
}

loop();
{% endhighlight %}
{% endcodeblock %}

This creates an infinite microtask loop, preventing the event loop from ever reaching macrotasks.

## Async/Await: Modern Asynchronous JavaScript

Introduced in ES2017, `async` and `await` are "syntactic sugar" built on top of Promises. They allow you to write asynchronous code
that looks and behaves like synchronous code, making it significantly more readable.

* `async`: Declares that a function returns a promise.
* `await`: Pauses the execution of the function until the promise resolves.

### Basic Example

{% codeblock %}
{% highlight js linenos %}
async function fetchData() {
  const result = await new Promise((resolve) => {
    setTimeout(() => resolve("Data loaded"), 1000);
  });

  console.log(result);
}
{% endhighlight %}
{% endcodeblock %}

Key points:

* `async` functions always return a promise
* `await` pauses execution *inside the function* until the promise resolves
* The main thread is not blocked

### Refactoring Promise Chains with Async/Await

#### Promise Version

{% codeblock %}
{% highlight js linenos %}
getUser(id)
  .then((user) => getOrders(user.id))
  .then((orders) => getOrderDetails(orders[0]))
  .then((details) => console.log(details));
{% endhighlight %}
{% endcodeblock %}

#### Async/Await Version

{% codeblock %}
{% highlight js linenos %}
async function loadOrderDetails(id) {
  const user = await getUser(id);
  const orders = await getOrders(user.id);
  const details = await getOrderDetails(orders[0]);

  console.log(details);
}
{% endhighlight %}
{% endcodeblock %}

#### Why Async/Await Is Preferred

* Reads top-to-bottom
* Easier debugging
* Familiar control flow (try/catch, loops)

### Error Handling with Async/Await

Error handling becomes straightforward using `try...catch`.

{% codeblock %}
{% highlight js linenos %}
async function loadData() {
  try {
    const data = await fetchData();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
{% endhighlight %}
{% endcodeblock %}

This mirrors synchronous error handling, making code more predictable.

## Async/Await Under the Hood

`async` / `await` does not block execution.

Internally:

* `await` splits the function into promise-based steps
* Execution resumes via the microtask queue

This explains why:

{% codeblock %}
{% highlight js linenos %}
console.log('start');
await Promise.resolve();
console.log('end');
{% endhighlight %}
{% endcodeblock %}

still behaves asynchronously.

## Top-Level Await

Traditionally, the `await` keyword could only be used inside an `async` function. This restriction meant developers often had to wrap
initialization code inside an async function or an asynchronous IIFE.

Modern JavaScript modules introduced **Top-Level Await**, allowing `await` to be used directly at the module level without wrapping it
inside an async function.

This feature simplifies startup logic in ES modules, especially when loading configuration data, initializing resources, or fetching
initial application state.

### Example

{% codeblock %}
{% highlight js linenos %}
const data = await fetch("/api/data").then(response => response.json());

console.log(data);
{% endhighlight %}
{% endcodeblock %}

### Where Top-Level Await Works

Top-level await is supported in:

* ES modules (`type="module"` in browsers)
* Modern Node.js environments
* Build systems that support ES module syntax

### When to Use It

Top-level await is useful for:

* Loading configuration before application startup
* Fetching initialization data
* Dynamic module loading
* Simplifying setup scripts

However, because modules that use top-level await pause execution until the awaited promise resolves, it should be used carefully in
performance-sensitive code.

## The Self-Starter: Async IIFE

An **IIFE** (pronounced "iffy") stands for **Immediate Invoked Function Expression** is a function that runs as soon
as it is defined. When combined with `async`, it allows you to use `await` inside a script without having to formally
name a function and call it later. It creates a private, asynchronous execution context.

{% codeblock %}
{% highlight js linenos %}
(async () => {
  try {
    const data = await fetchData();
    console.log("Initialization complete:", data);
  } catch (err) {
    console.error("Failed to start app:", err);
  }
})();
{% endhighlight %}
{% endcodeblock %}

**Why Use It?**

* **Top-Level Await Alternative:** Useful in environments (like older Node.js versions or certain `<script>` tags) where you
  can't use `await` outside of a function.
* **Encapsulation:** It keeps your variables out of the global namespace, preventing "variable pollution" and ensuring your
  logic doesn't leak into the `window` or `global` objects.
* **Fire-and-Forget Initialization:** It’s the perfect pattern for setup logic that needs to run exactly once when the script
  loads, such as connecting to a database or fetching initial configuration.

## Async Loops and Iteration

Avoid `forEach` with async code.

**Incorrect**

{% codeblock %}
{% highlight js linenos %}
items.forEach(async (item) => {
  await process(item);
});
{% endhighlight %}
{% endcodeblock %}

**Correct**

{% codeblock %}
{% highlight js linenos %}
for (const item of items) {
  await process(item);
}
{% endhighlight %}
{% endcodeblock %}

**Or parallel:**

{% codeblock %}
{% highlight js linenos %}
await Promise.all(items.map(process));
{% endhighlight %}
{% endcodeblock %}

## Async Iterators and `for-await-of`

JavaScript also supports **asynchronous iteration**, which allows you to work with streams of data that arrive over time rather
than all at once.

This pattern is built around **Async Iterators**, which return promises for each iteration step instead of immediate values.

The `for await...of` loop allows you to consume these asynchronous sequences in a clean, sequential style.

### Basic Example

{% codeblock %}
{% highlight js linenos %}
async function* generateNumbers() {
  yield 1;
  yield 2;
  yield 3;
}

for await (const num of generateNumbers()) {
  console.log(num);
}
{% endhighlight %}
{% endcodeblock %}

Each iteration waits for the promise returned by the iterator to resolve before continuing.

### Common Use Cases

Async iteration is commonly used with:

* **Streams**
* **Large datasets**
* **Network responses**
* **File processing**

For example, in Node.js streams or web APIs that return chunks of data over time.

### Example with Fetch Streams

{% codeblock %}
{% highlight js linenos %}
const response = await fetch("/large-data");
const reader = response.body;

for await (const chunk of reader) {
  console.log(chunk);
}
{% endhighlight %}
{% endcodeblock %}

### Why Async Iteration Matters

Async iterators allow developers to process data progressively instead of waiting for an entire operation to finish. This can significantly
improve performance and memory usage when dealing with large or streaming data sources.

## Cancellation and Timeouts

Promises are not cancelable by default.

### Using AbortController

Use `AbortController` to cancel fetches when a user navigates away, preventing memory leaks and unnecessary network usage.

{% codeblock %}
{% highlight js linenos %}
const controller = new AbortController();

fetch(url, { signal: controller.signal });

controller.abort();
{% endhighlight %}
{% endcodeblock %}

This is essential for:

* Search inputs
* Navigation changes
* Resource cleanup

## Error Handling Patterns

### Global Error Handling

{% codeblock %}
{% highlight js linenos %}
window.addEventListener("unhandledrejection", (e) => {
  console.error(e.reason);
});
{% endhighlight %}
{% endcodeblock %}

### Retry Logic

{% codeblock %}
{% highlight js linenos %}
async function retry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (e) {
    if (retries === 0) throw e;

    // Wait for the specified delay
    await new Promise(resolve => setTimeout(resolve, delay));

    // Recursive call: reduce retry count and double the delay
    return retry(fn, retries - 1, delay * 2);
  }
}
{% endhighlight %}
{% endcodeblock %}

## Sequential vs. Parallel Execution

A common performance mistake is unnecessary sequential `await` usage. Async/await does not mean sequential-only.

Don't `await` independent tasks one after another; it slows down your app. Use `Promise.all` to run them concurrently.

### Sequential (Slower)

{% codeblock %}
{% highlight js linenos %}
const a = await getUser(id);
const b = await getSettings(id);
{% endhighlight %}
{% endcodeblock %}

### Parallel (Faster)

{% codeblock %}
{% highlight js linenos %}
const [a, b] = await Promise.all([
  getUser(id),
  getSettings(id)
]);
{% endhighlight %}
{% endcodeblock %}

This runs operations in parallel while keeping readable syntax.

Use sequential execution **only** when one task depends on another.

## Comparison Table: Which one to use?

| Feature            | Callbacks               | Promises            | Async/Await        |
| ------------------ | ----------------------- | ------------------- | ------------------ |
| **Readability**    | Poor (Nesting)          | Moderate (Chaining) | Excellent (Linear) |
| **Error Handling** | Manual/Difficult        | `.catch()`          | `try`/`catch`      |
| **Complexity**     | High for multiple tasks | Medium              | Low                |

## When to Use What

* **Callbacks:** Best for low-level APIs (like Node.js `fs` module), event listeners (`element.addEventListener`), or simple one-off timers.
* **Promises:** Ideal for library authors, creating composable async logic, or when you need the utility of `Promise.all` and `Promise.race`.
* **Async/Await:** The default choice for application business logic. It makes complex operations look clean and sequential.

> **Pro Tip:** Modern JavaScript favors **`async`/`await`** for clarity, but remember that it is built on top of promises. You cannot
> truly master one without the other.

## Common Mistakes to Avoid

- **The "Ghost" Promise:** Forgetting to `await` a promise, which results in the code continuing before the task is finished.
- **Silent Failures:** Using async functions without a try/catch block, causing unhandled rejections that are difficult to debug.
- **Waterfall Slowness:** Accidentally running independent async tasks in a sequence (waterfall) instead of using Promise.all to run them in parallel.
- **The Hybrid Mess:** Mixing callbacks and promises inconsistently in the same function, leading to "Inversion of Control" bugs.

## Best Practices

1. **Prefer `async`/`await`:** It results in a much cleaner stack trace and is significantly easier to debug than nested `.then()` chains.
2. **Avoid `forEach` for Async:** `forEach` is not promise-aware. It will fire off all your async calls and finish before they resolve. Use `for...of` if you need to run tasks one-by-one, or `.map()` with `Promise.all` for parallel execution.
3. **Handle Every Rejection:** Always wrap your `await` calls in a `try`/`catch` block or ensure there is a global `unhandledrejection` listener for safety.
4. **Beware of Microtask Starvation:** Because microtasks (Promises) have VIP priority, a recursive function that constantly adds new microtasks can "starve" the event loop, preventing the UI from rendering or macrotasks (like `setTimeout`) from ever firing.
5. **Keep the Main Thread Clear:** Offload heavy CPU-bound computation (like image processing or complex math) to **Web Workers**. Asynchronous code handles _waiting_ well, but it doesn't help with _heavy lifting_ on a single thread.

## Wrapping up

Asynchronous JavaScript has evolved to solve real problems:

* Callbacks enabled non-blocking behavior
* Promises brought structure and composability
* Async/await delivered clarity and maintainability

Mastering these concepts allows you to write JavaScript that scales—not just in performance, but in readability and long-term maintainability.

Understanding *why* async patterns exist is the key to using them correctly.
