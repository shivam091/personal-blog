---
title: "Exponential Backoff with Jitter"
excerpt: "Prevent server traffic spikes using random retry jitter."
description: "Enhance your retry logic with 'Full Jitter' to decohere client requests and protect your infrastructure during recovery."
layout: "snippet"
tags: [javascript, jitter, thundering-herd, backoff, distributed-systems, scalability, architecture, reliability]
category: [JavaScript]
date: 2026-01-28
image:
  path: /assets/img/goodies/snippets/exponential-backoff-with-jitter/cover.png
  width: 1536
  height: 1024
  alt: "Visualization of exponential backoff with jitter, showing randomized retry intervals over time to prevent synchronized retries."
changelog:
  - date: 2026-01-28
    change: "Initial publication with Full Jitter implementation."
---

## Introduction

This utility is an evolution of the [Exponential Backoff](/snippet/async-retry-exponential-backoff) pattern. While standard backoff helps, synchronized retries from thousands of clients can create a **"Thundering Herd"** effect—crashing a server just as it attempts to recover.

Adding **Jitter** (randomness) spreads these requests out, ensuring a smoother recovery for your backend.

## The Jitter Utility

{% codeblock %}
{% highlight js linenos %}
/**
 * Retries an async function with Full Jitter.
 * @param {Function} fn - The async function to retry.
 * @param {Object} options - Configuration options.
 * @param {number} options.retries - Max number of retry attempts.
 * @param {number} options.delay - Initial delay in ms.
 * @param {number} options.maxDelay - Maximum allowable delay cap.
 */
async function retryWithJitter(fn, { retries = 3, delay = 1000, maxDelay = 30000 } = {}) {
  try {
    return await fn();
  } catch (e) {
    if (retries === 0) throw e;

    // Use the current delay limit, but don't exceed maxDelay
    const currentRange = Math.min(delay, maxDelay);

    // Full Jitter: randomize between 0 and the current capped delay
    const jitteredDelay = Math.random() * currentRange;

    console.log(`Retrying in ${Math.round(jitteredDelay)}ms...`);

    await new Promise(resolve => setTimeout(resolve, jitteredDelay));

    return retryWithJitter(fn, { retries: retries - 1, delay: delay * 2, maxDelay });
  }
}
{% endhighlight %}
{% endcodeblock %}

## Why Use Jitter?

| Feature | Exponential Backoff | Full Jitter |
| :--- | :--- | :--- |
| **Logic** | Predictable (1s, 2s, 4s...) | Randomized (0 to max) |
| **Server Load** | Spike-prone | Evenly distributed |
| **Best For** | Internal tools / CLI | Public APIs / Microservices |

## How It Works

1.  **Wait Calculation:** Instead of waiting exactly `N` ms, we pick a random number between `0` and `N`.
2.  **Decoherence:** This ensures that multiple failing clients do not retry at the same time.
3.  **Efficiency:** "Full Jitter" is widely considered the most effective way to reduce contention on a recovering resource.

## Example Usage

{% codeblock %}
{% highlight js linenos %}
const saveUserData = async (data) => {
  console.log("📡 Requesting API...");
  if (Math.random() > 0.5) return { success: true };
  throw new Error("Connection Timeout");
};

// Optimal for high-traffic environments
retryWithJitter(saveUserData, { retries: 5, delay: 1000 })
  .then(() => console.log("Success!"))
  .catch(() => console.error("Failed after multiple attempts."));
{% endhighlight %}
{% endcodeblock %}

## Key Takeaway

For production-scale applications, always favor **Jitter**. It transforms a fragile retry loop into a robust recovery mechanism that respects the health of your entire system architecture.
