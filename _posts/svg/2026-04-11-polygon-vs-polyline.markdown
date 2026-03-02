---
layout: post
title: "SVG Polygon vs Polyline: Differences, Fill Rules, and Use Cases"
description: |
  Learn the difference between SVG polygon and polyline elements, including points syntax, open vs closed shapes, fill rules, and
  coordinate sequencing.
excerpt: Master SVG polygons, polylines, and fill rules.
date: 2026-04-11
category: [SVG]
tags: [svg, polygon, polyline, graphics, vector-graphics, shapes, fill-rule, web-design]
image:
  path: /assets/img/posts/svg/polygon-vs-polyline/cover.png
  width: 1536
  height: 1024
  alt: |
    Polygon vs Polyline comparison showing an open cyan polyline and a filled star-shaped polygon on a grid background, illustrating open
    versus closed SVG shapes.
changelog:
  - date: 2026-04-11
    change: "Initial publication & added tags' meta"
---

## Introduction

In [SVG Essentials: Mastering Shapes, Coordinates, and Styling](/post/svg-essentials-mastering-basic-shapes/), we covered core SVG geometry.
However, two elements—`<polygon>` and `<polyline>`—share an identical syntax while behaving very differently in the browser.

This post dives into the specifics of these "point-based" elements, covering everything from the `points` attribute to advanced fill logic.

## Polygon vs Polyline at a Glance

| Feature                   | `<polyline>`                      | `<polygon>`                         |
| ------------------------- | --------------------------------- | ----------------------------------- |
| Shape type                | Open                              | Closed                              |
| Final segment             | Not connected to the start        | Automatically connects to the start |
| Fill behavior             | Often requires `fill="none"`      | Usually filled                      |
| Best use cases            | Charts, graphs, waveforms, routes | Geometric shapes, UI icons, stars   |
| Can define complex shapes | Yes                               | Yes                                 |

**Example Comparison**

{% svg_snippet vectors.polyline_vs_polygon_example %}

## Shared Foundation: The `points` Attribute

Both `<polyline>` and `<polygon>` use the `points` attribute to define their vertices.

**Syntax:**

```html
<element points="x1,y1 x2,y2 x3,y3 ..." />
```

- **Commas:** Used to separate X and Y.
- **Spaces:** Used to separate individual points.
- **No Units:** Values are unitless (relative to the `viewBox`).

**Formatting Best Practices:**

While SVG is highly flexible with white space, the **industry standard** (and most readable) convention is to use a comma between X
and Y, and a space between individual points:

- **Standard (Recommended):** `points="10,10 50,60 90,20"`
- **Space-only:** `points="10 10 50 60 90 20"`
- **Mixed:** `points="10 10, 50 60, 90 20"`

Each pair **defines one vertex**, connected in the order they are written.

> **Note:** SVG coordinates exist relative to the `viewBox` grid and do not require units like `px`.

## `<polyline>` — The Open Connection

`<polyline>` draws **multiple connected straight lines** but does **not close the shape** automatically.

**Key Characteristics:**

- **Open shape:** Last point is NOT connected to the first.
- **Stroke-focused:** Best for paths, charts, and waveforms.

**The "Phantom Fill" Trap**

By default, SVG elements have a `fill="black"`. Even though a polyline is "open", the browser will attempt to fill the area between the start
and end points.

**Always set `fill="none"` on a polyline** unless you are intentionally creating a complex, semi-open shaded area.

```html
<polyline points="10,80 40,20 70,60 100,30" stroke="blue" />
<polyline points="10,80 40,20 70,60 100,30" stroke="blue" fill="none" />
```

**Best For:**

- Line charts
- Route maps
- ECG / waveform visuals
- Freehand drawings

## `<polygon>` — Closed Shapes

A `<polygon>` defines a closed shape. The SVG engine automatically draws a line from the final point back to the
starting point to "seal" the shape.

**Key Characteristics:**

- **Always Closed:** Even if you only provide three points, it will always form a complete enclosure.
- **Area-focused:** Ideal for UI icons, geometric patterns, and map regions.

**Example:**

```html
<polygon
  points="50,10 90,80 10,80"
  fill="lightblue"
  stroke="navy"
  stroke-width="2"
/>
```

**Best For:**

- Geometric UI elements (Hexagons, Stars)
- Map regions
- Data "Area" charts

## Point Order: Why Sequence is Strategy

Points are drawn in the **exact sequence** they appear in the string. Changing the order changes the shape's topology.

For a simple triangle, the order of points doesn't change the silhouette. However, for shapes with 4+ points, the sequence is vital.
If you "scramble" the points, you move from a clean square to a self-intersecting "hourglass" or "butterfly" shape.

```html
<!-- Correct -->
<polygon points="10,10 90,10 90,90 10,90" />

<!-- Scrambled -->
<polygon points="10,10 90,90 90,10 10,90" />
```

Incorrect ordering can cause:

- Self-intersections
- Unexpected fills
- Visual artifacts

## Fill Rules: Managing Overlap

When a shape overlaps itself—like a five-pointed star or a complex "figure-eight" polygon—SVG needs a mathematical logic to
decide which areas are "inside" (filled) and which are "outside" (transparent).

This is controlled by the `fill-rule` property.

### `nonzero` (default)

The `nonzero` rule determines the fill based on the **winding order** (the direction in which you drew the points).

**How it works:** Imagine standing at a point inside the shape. The browser draws a ray in any direction to infinity. It then looks
at every path segment that crosses this ray. If a segment is drawn clockwise, it adds 1; if counter-clockwise, it subtracts 1.

**The Result:** If the final "winding count" is anything other than zero, the area is filled. In most star shapes, the center has a
count higher than zero, so it remains solid.

### `evenodd`

The `evenodd` rule ignores the direction of the lines and focuses strictly on the number of path crossings.

**How it works:** Again, imagine a ray drawn from a point to infinity. The browser simply counts how many times that ray crosses a line.

**The Result:** If the number of crossings is **odd**, the area is filled. If it is **even**, the area is left empty.

**Visual Behavior:** This is why the center of a star becomes **hollow/transparent**—a ray starting from the very center crosses the
star's edges an even number of times.

**Why This Matters**

Choosing the right rule is essential when building:

- **Complex Icons:** Creating "holes" in shapes (like a donut or the letter 'O') without using masks.
- **Geometric Patterns:** Controlling the transparency of overlapping triangles or hexagons.
- **Data Viz:** Ensuring that self-intersecting line charts don't create accidental "solid blocks" of color.

### Side-by-Side Comparison

This diagram compares both SVG `fill-rule` values. A star shape using `nonzero` shows a **filled center**, while the same star
using `evenodd` displays a **hollow center**.

{% svg_snippet vectors.nonzero_vs_evenodd %}

This comparison illustrates the impact of winding logic versus crossing logic. While the `points` attribute is identical for both
shapes, the resulting visual is entirely different.

**Summary:** Use `nonzero` if you want a solid, "heavy" look for complex shapes. Use `evenodd` if you want a delicate, wireframe-style
look with automatic cutouts in overlapping areas.

## Refining the Look: Joins and Caps

Because these shapes are composed of sharp angles, the way the "elbows" of the lines look is critical for a professional finish.

- **`stroke-linejoin`:** Controls the corners. Use `round` for a friendly look, `bevel` for flat corners, or `miter` for sharp spikes.
- **`stroke-linecap` (Polyline only):** Use `round` or `square` to give your lines a finished look.
- **`stroke-miterlimit`:** If you use `miter` joins at very sharp angles, the "spike" can become infinitely long. This attribute caps
  that spike to prevent visual glitches.

## Putting it into Practice

This section puts the theory into action. Whether you're building a simple UI or a complex data dashboard, these examples show how to
choose the right tool for the job.

### Basic: Geometric Essentials

#### 1. The Simplest Triangle (`<polygon>`)

The most fundamental use of a polygon is the triangle. With just three points, SVG automatically connects the last vertex back
to the first, creating a perfect enclosure.

{% svg_snippet vectors.triangle_example %}

**Why it works:** By using `stroke-linejoin="round"`, we avoid the sharp, "stabbing" corners that can occur with narrow angles,
giving the shape a more modern, friendly appearance.

#### 2. Route Map Visualization (`<polyline>`)

Unlike a polygon, a polyline is ideal for paths that shouldn't close. Here, we use it to visualize a travel route or a "connect-the-dots" path.

{% svg_snippet vectors.route_example %}

**Pro Tip:** We use `fill="none"` here to avoid the "Phantom Fill" effect. The `stroke-dasharray` attribute creates a professional
dashed-line look often seen in map applications.

### Advanced: Data & UI

#### 1. The Star Shape (`evenodd` Rule)

When a polygon self-intersects, like in a five-pointed star, the `fill-rule` determines if the center is "hollow" or "solid."

{% svg_snippet vectors.star_example %}

**Why it matters:** Using `fill-rule="evenodd"` allows you to create complex geometry with "cutouts" without having to define multiple
separate paths or masks.

#### 2. The Hybrid Area Chart

In data visualization, we often combine both elements. A `polyline` draws the trend line, while a `polygon` creates the shaded area underneath.

{% svg_snippet vectors.hybrid_area_chart_example %}

**Strategy:** To make a polygon look like an area chart, you must include the "floor" coordinates (like `0,100` and `100,100`) in your `points`
string so the fill sits flat against the bottom of the grid.

#### 3. Geometric UI Hexagon

Polygons are the go-to for rigid UI elements like hex-grid buttons or achievement badges.

{% svg_snippet vectors.ui_hexagon_example %}

**Context:** This is significantly more performant than using a high-res image for a simple shape, and it stays perfectly crisp regardless of the screen's pixel density or zoom level.

## Best Practices

1. **Always Define `fill` for Polylines** — Since the default is `fill="black"`, explicitly use `fill="none"` to avoid accidental shading.
2. **Order of Points Matters** — Points are connected exactly in the order written. Incorrect ordering can produce unexpected shapes.
3. **Use `stroke-linejoin` for Better Corners** — For charts and icons, use `stroke-linejoin="round"`. This produces cleaner visual results.
4. **Use a Consistent Coordinate Grid** — Working with a predictable grid like: `viewBox="0 0 100 100"` makes positioning shapes easier.

## When to Use Which?

**Use `<polyline>` when:**

- building line charts
- drawing routes or paths
- connecting points visually
- showing progress or trends

**Use `<polygon>` when:**

- creating geometric shapes
- drawing stars or icons
- filling closed areas
- designing UI illustrations

If your shape requires curves or mixed geometry, move to [`<path>`](/post/svg-essentials-mastering-the-path-element).

## Performance Tip: Point Density

While SVGs are lightweight, a `<polyline>` with 10,000 points (e.g., a high-resolution map or a stock market "all-time" chart) can cause
the browser to lag during window resizing or animations.

This can be mitigated by:

- Using `vector-effect="non-scaling-stroke"` so the line thickness stays consistent when the SVG scales.
- Simplify coordinates using tools like **SVGO** or the **Ramer-Douglas-Peucker** algorithm before exporting data-heavy shapes.

## Interactive Example

To truly grasp how coordinates and closing logic work, use the playground below. Try dragging the vertices into an "hourglass" shape or
switching to **Polyline** mode to see the "Phantom Fill" effect in real-time.

{% playground id:"polygon-vs-polyline" %}

## Wrapping Up

Although they share the same `points` syntax, the choice between `<polygon>` and `<polyline>` comes down to whether you need a
closed enclosure or an open path.

- **Use** `polyline` for data visualizations and route maps.
- **Use** `polygon` for icons, badges, and geometric shapes.

If your design requires complex curves, holes, or mixing lines and arcs, it’s time to graduate to the most powerful tool in the
SVG toolkit: [the `<path>` element](/post/svg-essentials-mastering-the-path-element).
