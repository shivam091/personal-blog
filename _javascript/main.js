import HeaderGlassEffect from "./layout/header-glass-effect";
import HeaderDrawer from "./layout/header-drawer";
import ThemeSwitcher from "./modules/components/theme-switcher";
import AnalyticsTracker from "./modules/analytics-tracker";
import ScrollTop from "./modules/components/scroll-top";
import SkipLink from "./modules/components/skip-link";
import Tooltip from "./modules/components/tooltip";
import Dropdown from "./modules/components/dropdown";
import Accordion from "./modules/components/accordion";
import Clipboard from "./utils/clipboard";
import Alert from "./modules/components/alert";
import CodeBlockUtils from "./utils/code-block-utils";
import LazyLoader from "./modules/components/lazy-loader";
import RetroCounter from "./components/retro-counter";
import Scrollspy from "./components/scroll-spy";
import CodePlayground from './components/code-playground';
import DetailsPlusMorph from "./animations/details-plus-morph";
import DetailsAnimator from "./animations/details-animator";
import ArrowRightBoop from "./animations/arrow-right-boop";
import HoverBoop from "./utils/animations/hover-boop";
import IconStretchyGuy from "./animations/icon-stretchy-guy";
import HashIconMorph from "./animations/hash-icon-morph";
import ListIconBoop from "./animations/list-icon-boop";

import { bindHeroTyped } from "./components/hero";

import UseMorph from "./utils/animations/use-morph";
import UseMorphBoop from "./utils/animations/use-morph-boop";
import EllipseMorph from "./utils/animations/ellipse-morph";
import EllipseMorphBoop from "./utils/animations/ellipse-morph-boop";
import PolygonMorph from "./utils/animations/polygon-morph";
import PolygonMorphBoop from "./utils/animations/polygon-morph-boop";

document.addEventListener("DOMContentLoaded", () => {

  const morphEllipse = document.getElementById("morphEllipse");

  if (morphEllipse) {
    // create morph instance
    const ellipseMorph = new EllipseMorph([morphEllipse]);

    // animate between two ellipse states
    morphEllipse.addEventListener("click", () => {
      ellipseMorph.morph([
        [[160, 110], [80, 60]]
      ]);
    });
  }

  // ----------------------------------------------

  const poly = document.getElementById("poly");

  if (poly) {
    // Set up booper
    const booper = new PolygonMorphBoop([poly], {
      boop: [
        [
          [50, 140],  // vertex 1
          [150, 40],  // vertex 2
          [250, 140], // vertex 3
        ]
      ]
    });

    // Click to trigger boop
    poly.addEventListener("click", () => booper.trigger(300));
  }

  const polyElem = document.getElementById("polyMorph");

  if (polyElem) {
    // Set up morpher
    const polyMorph = new PolygonMorph([polyElem]);

    // Click to trigger morph
    polyElem.addEventListener("click", () => {
      polyMorph.morph([
        [
          [50, 140],  // vertex 1
          [150, 40],  // vertex 2
          [250, 140], // vertex 3
        ]
      ])
    });
  }

  // ----------------------------------------------

  const sparkles = document.querySelectorAll("svg.icon-magic-wand use");

  const morph = new UseMorph(sparkles, { stiffness: 0.15, damping: 0.75 });

  // Morph sparkles outward with transform effects
  setTimeout(() => {
    morph.morph([
      [[-15, -15], [24, 24]], // move, resize, fade, translate, scale, rotate
      [[12, 20], [20, 20]],
      [[20, -15], [22, 22]],
    ]);
  }, 1000);

  // Morph them back to original state
  setTimeout(() => {
    morph.morph([
      [[-9, -9], [18, 18]],
      [[9, 14], [16, 16]],
      [[15, -10], [17, 17]],
    ]);
  }, 4000);

  // const morph = new UseMorph(sparkles, { stiffness: 0.15, damping: 0.75 });
  //
  // // Morph sparkles outward with transform effects
  // setTimeout(() => {
  //   morph.morph([
  //     [[-15, -15], [24, 24], [1,0], [5, 5], [1.2, 1.2], [45,0]], // move, resize, fade, translate, scale, rotate
  //     [[12, 20], [20, 20], [0.8,0], [0, 0], [1, 1], [0,0]],
  //     [[20, -15], [22, 22], [1,0], [-3, -3], [0.8, 0.8], [-30,0]],
  //   ]);
  // }, 1000);
  //
  // // Morph them back to original state
  // setTimeout(() => {
  //   morph.morph([
  //     [[-9, -9], [18, 18], [1,0], [0,0], [1,1], [0,0]],
  //     [[9, 14], [16, 16], [1,0], [0,0], [1,1], [0,0]],
  //     [[15, -10], [17, 17], [1,0], [0,0], [1,1], [0,0]],
  //   ]);
  // }, 4000);
})

const ellipse = document.getElementById("bubble");
if (ellipse) {
  const booper = new EllipseMorphBoop([ellipse], {
    boop: [
      [[100, 100], [60, 40]] // cx,cy | rx,ry
    ]
  });

  ellipse.addEventListener("click", () => booper.trigger(300));
}

document.querySelectorAll("[data-beautify]").forEach((element) => {
  element.addEventListener("click", () => {
    const sparkles = document.querySelectorAll("svg.icon-magic-wand use");

    // const sparkleBoop = new UseMorphBoop(sparkles, {
    //   boop: [
    //     // For each <use>: [ [x,y], [w,h], [opacity,0], [tx,ty], [sx,sy], [rot,0] ]
    //     [[-15, -15], [24, 24], [0.7,0], [5, 5], [1.3, 1.3], [30,0]],
    //     [[12, 20], [20, 20], [1,0], [0, 0], [1.2, 1.2], [-20,0]],
    //     [[20, -15], [22, 22], [0.8,0], [-3, -3], [0.8, 0.8], [45,0]],
    //   ],
    //   config: { stiffness: 0.15, damping: 0.7 }
    // });
    //
    // // Trigger sparkle boop (auto return to rest)
    // document.querySelector("svg.icon-magic-wand")
    //   .addEventListener("click", () => sparkleBoop.trigger(400));

    const sparkleBoop = new UseMorphBoop(sparkles, {
      boop: [
        [[-12, -12], [20, 20]], // morph first sparkle
        [[12, 16], [18, 18]],   // second sparkle
        [[18, -12], [20, 20]],  // third sparkle
      ],
      config: { stiffness: 0.15, damping: 0.7 }
    });

    // trigger a boop
    sparkleBoop.trigger(300);
  });
})

HeaderGlassEffect.initialize();
HeaderDrawer.initialize();
ThemeSwitcher.initialize();
AnalyticsTracker.initialize();
ScrollTop.initialize();
SkipLink.initialize();
Tooltip.initialize();
Dropdown.initialize();
Accordion.initialize();
Clipboard.initAll();
Alert.init();
CodeBlockUtils.initAll();
LazyLoader.init();
DetailsPlusMorph.initialize();
DetailsAnimator.initialize();
ArrowRightBoop.initialize(".icon-arrow-right");
IconStretchyGuy.initialize();
HashIconMorph.initialize();
ListIconBoop.initialize();

HoverBoop.initialize(".alert-dismiss .icon-times", {boop: {rotate: 15, scale: 1.2}});
HoverBoop.initialize(".icon-arrow-up", {boop: {translateY: -3}});
HoverBoop.initialize(".icon-search", {boop: {rotate: 10, scale: 1.1}});
HoverBoop.initialize(".icon-clipboard-check, .icon-hash", {boop: {scale: 1.1}});

CodePlayground.initAll();

RetroCounter.initAll("[data-retro-counter]", {
  version: "v2",
  namespace: "shivam091-github-io",
  debug: false,
});

new Scrollspy(".toc-wrapper", {
  activeClass: "active",
  rootMargin: "80px 0px -70% 0px"
});

bindHeroTyped();

// document.addEventListener("DOMContentLoaded", () => {
//   const stars = document.querySelectorAll("use[href='#star']");
//
//   stars.forEach(star => {
//     const twinkle = document.createElementNS("http://www.w3.org/2000/svg", "animate");
//     twinkle.setAttribute("attributeName", "opacity");
//     twinkle.setAttribute("values", `${Math.random()*0.4+0.6};1;${Math.random()*0.4+0.6}`);
//     twinkle.setAttribute("dur", `${(Math.random()*3+5).toFixed(1)}s`);
//     twinkle.setAttribute("begin", `${(Math.random()*2).toFixed(1)}s`);
//     twinkle.setAttribute("repeatCount", "indefinite");
//     star.appendChild(twinkle);
//
//     const drift = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
//     drift.setAttribute("attributeName", "transform");
//     drift.setAttribute("type", "translate");
//     const xMove = (Math.random()*12 - 6).toFixed(1); // random -6 to +6
//     const yMove = (Math.random()*8 - 4).toFixed(1);  // random -4 to +4
//     drift.setAttribute("values", `0 0; ${xMove} ${yMove}; 0 0`);
//     drift.setAttribute("dur", `${(Math.random()*15+15).toFixed(1)}s`);
//     drift.setAttribute("repeatCount", "indefinite");
//     star.appendChild(drift);
//   });
// });
