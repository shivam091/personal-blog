---
layout: post
title: "Animations"
date: 2025-09-28 07:20
tags: [animations]
category: Animations
excerpt: This post is a comprehensive test of various animations.
slug: animations
image:
  path: /assets/img/posts/components/cover.png
  width: 1200
  height: 630
  alt: Demonstration of layout components
---

{% svg stretchy-guy %}

<svg viewBox="0 0 200 200" width="200" height="200">
  <ellipse id="bubble" cx="100" cy="100" rx="40" ry="20" fill="skyblue" opacity="1" />
</svg>

<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Start ellipse -->
  <ellipse id="morphEllipse" cx="150" cy="100" rx="40" ry="20" fill="cornflowerblue" />
</svg>

<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <polygon id="poly" points="50 150 150 50 250 150" fill="tomato" opacity="1" />
</svg>

<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <polygon id="polyMorph" points="50,150 150,50 250,150" fill="magenta" opacity="0.2"/>
</svg>

<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <polyline points="60, 110 65, 120 70, 115 75, 130 80, 125 85, 140 90, 135 95, 150 100, 145"/>
</svg>

<svg width="400" height="200">
  <text x="50" y="50" font-size="24" fill="#ff0000" id="animatedText" letter-spacing="0">
    Hello SVG!
  </text>

  <!-- Text with multiple tspans -->
  <text x="100" y="150" font-size="24" fill="#333">
    <tspan x="100" y="150" font-size="24" letter-spacing="0" opacity="1">Hello</tspan>
    <tspan x="160" y="150" font-size="24" letter-spacing="0" opacity="1">SVG!</tspan>
  </text>
</svg>

<svg width="400" height="200">
  <!-- Group containing a rectangle and a circle -->
  <g id="myGroup" style="transform: translate(0,0) scale(1)" stroke="green" stroke-width="1" opacity="1" stroke-width="1">
    <rect x="50" y="50" width="80" height="40" fill="#6C5DD3" rx="8" ry="8"></rect>
    <circle cx="160" cy="70" r="20" fill="#FF6C5D"></circle>
  </g>
</svg>

{% svg magic-wand %}