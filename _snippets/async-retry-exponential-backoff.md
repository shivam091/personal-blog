---
title: "Exponential Backoff Retry Utility"
excerpt: "Retry async operations with exponential backoff and caps."
description: "A production-ready recursive utility to retry failed asynchronous operations with a configurable delay that doubles and caps to prevent infinite wait times."
layout: "snippet"
tags: [javascript, async-retry, backoff, promises, error-handling, resilience, nodejs, async-await, api-calls, clean-code]
category: [JavaScript]
date: 2026-01-28
image:
  path: /assets/img/goodies/snippets/async-retry-exponential-backoff/cover.png
  width: 1536
  height: 1024
  alt: "Illustration of exponential retry logic showing a circular retry loop, increasing delays, and a digital countdown timer."
changelog:
  - date: 2026-01-28
    change: "Initial publication with Options Object and Max Delay support."
---

## Introduction

In modern web development, network requests are prone to transient failures. Instead of failing immediately, a **retry strategy** allows your application to recover gracefully.

This snippet implements an asynchronous retry function using **Exponential Backoff**. By doubling the delay between each attempt, you reduce the load on the failing service and give it time to stabilize.

> **Scalability Note:** If you are building a high-traffic system and need to prevent "Thundering Herd" spikes, see the advanced [Exponential Backoff with Jitter](/snippet/async-retry-jitter) version.

## The Retry Snippet

{% codeblock %}
{% highlight js linenos %}
/**
 * Retries an async function with exponential backoff.
 * @param {Function} fn - The async function to retry.
 * @param {Object} options - Configuration options.
 * @param {number} options.retries - Max number of retry attempts.
 * @param {number} options.delay - Initial delay in ms.
 * @param {number} options.maxDelay - Maximum allowable delay cap.
 */
async function retry(fn, { retries = 3, delay = 1000, maxDelay = 30000 } = {}) {
  try {
    return await fn();
  } catch (e) {
    if (retries === 0) throw e;

    console.warn(`Retrying... attempts left: ${retries}. Waiting ${delay}ms.`);

    await new Promise(resolve => setTimeout(resolve, delay));

    // Double the delay for next time, capped at maxDelay
    const nextDelay = Math.min(delay * 2, maxDelay);

    return retry(fn, { retries: retries - 1, delay: nextDelay, maxDelay });
  }
}
{% endhighlight %}
{% endcodeblock %}

## How It Works

1.  **The Attempt:** Executes the passed function `fn()`.
2.  **The Catch:** Intercepts the error if the promise rejects.
3.  **The Base Case:** If `retries` hits 0, the error is finally thrown.
4.  **The Wait:** Execution pauses for the duration of `delay`.
5.  **The Recursion:** Calls itself with a decremented counter and an increased delay.

## Highlights

* **Options Object:** Named parameters prevent "argument soup" and improve readability.
* **Max Delay Cap:** Prevents wait times from becoming excessively long.
* **Clean Recursion:** Handles the async event loop without complex state variables.

## Example Usage

{% codeblock %}
{% highlight js linenos %}
const fetchData = async () => {
  if (Math.random() > 0.7) return { data: "Success!" };
  throw new Error("Server Busy");
};

async function run() {
  try {
    const result = await retry(fetchData, {
      retries: 5,
      delay: 500,
      maxDelay: 10000
    });
    console.log(result.data);
  } catch (err) {
    console.error("Operation failed after all retries.");
  }
}

run();
{% endhighlight %}
{% endcodeblock %}

## Notes & Tips

* **Error Filtering:** Update the `catch` block to check for `404` or `401` status codes to avoid retrying doomed requests.
* **Idempotency:** Ensure the function being retried is safe to run multiple times (like `GET` requests).
* **Production Logs:** Replace `console.warn` with a proper monitoring tool (like Sentry or Datadog) for better observability.

## Key Takeaway

The `retry` utility provides a safety net for flaky APIs. By using an **Options Object** and **Max Delay**, you ensure your code remains maintainable and resilient under stress.
