import HeaderGlassEffect from "./layout/header-glass-effect";
import HeaderDrawer from "./layout/header-drawer";
import ThemeSwitcher from "./modules/components/theme-switcher";
import AnalyticsTracker from "./modules/analytics-tracker";
import ScrollTop from "./modules/components/scroll-top";
import SkipLink from "./modules/components/skip-link";
import Tooltip from "./modules/components/tooltip";
import Dropdown from "./modules/components/dropdown";
import Accordion from "./modules/components/accordion";
import Details from "./components/details";
import Collapse from "./components/collapse";
import Clipboard from "./utils/clipboard";
import Alert from "./modules/components/alert";
import CodeBlockUtils from "./utils/code-block-utils";
import LazyLoader from "./modules/components/lazy-loader";
import RetroCounter from "./components/retro-counter";
import Scrollspy from "./components/scroll-spy";
import ContactForm from "./modules/contact-form";

import TransformBoop from "./animations/transform-boop";

import IconArrowRight from "./animations/icons/arrow-right";
import IconHash from "./animations/icons/hash";
import IconList from "./animations/icons/list";
import IconStretchyGuy from "./animations/icons/stretchy-guy";
import IconRSS from "./animations/icons/rss";
import IconSpeaker from "./animations/icons/speaker";
import IconBook from "./animations/icons/book";

import { bindHeroTyped } from "./components/hero";

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
ContactForm.init();
Details.initialize();
Collapse.initializeAll();

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

TransformBoop.initialize(".alert-dismiss .icon-times", { rotate: 15, scaleX: 1.2 });
TransformBoop.initialize(".icon-arrow-up", { translateY: -3 });
TransformBoop.initialize(".icon-search", { rotate: 10, scaleX: 1.1 });
TransformBoop.initialize(".icon-clipboard-check, .icon-hash", { scaleX: 1.1 });
TransformBoop.initialize(".icon-adjust", { rotate: -45, scaleX: 1.1 });
TransformBoop.initialize(".icon-candy", { rotate: -20 }, { tension: 350, friction: 10 });

IconArrowRight.initialize();
IconHash.initialize();
IconList.initialize();
IconStretchyGuy.initialize();
IconRSS.initialize();
IconSpeaker.initialize();
IconBook.initialize();


import UseMorph from "./utils/animations/elements/use/morph";
import UseMorphBoop from "./utils/animations/elements/use/boop";
import EllipseMorph from "./utils/animations/elements/ellipse/morph";
import EllipseMorphBoop from "./utils/animations/elements/ellipse/boop";
import PolygonMorph from "./utils/animations/elements/polygon/morph";
import PolygonMorphBoop from "./utils/animations/elements/polygon/boop";


import Spring from "./utils/animations/spring";
import SpringGroup from "./utils/animations/spring-group";
import SpringBoop from "./utils/animations/spring-boop";
import SpringMorph from "./utils/animations/spring-morph";
import SpringTimeline from "./utils/animations/spring-timeline";
import TextMorphBoop from "./utils/animations/elements/text/boop";
import TspanMorphBoop from "./utils/animations/elements/tspan/boop";
import GroupMorphBoop from "./utils/animations/elements/group/boop";

document.addEventListener("DOMContentLoaded", () => {

  const ellipse = document.getElementById("bubble");
  if (ellipse) {
    const booper = new EllipseMorphBoop([ellipse], [
      { cx: 100, cy: 100, rx: 60, ry: 40, opacity: 0.3 }
    ]);

    ellipse.addEventListener("click", () => booper.trigger(300));
  }

  const morphEllipse = document.getElementById("morphEllipse");

  if (morphEllipse) {
    // create morph instance
    const ellipseMorph = new EllipseMorph([morphEllipse]);

    // animate between two ellipse states
    morphEllipse.addEventListener("click", () => {
      ellipseMorph.morph([
        { cx: 160, cy: 110, rx: 80, ry: 60, opacity: 0.3 }
      ]);
    });
  }

  // ----------------------------------------------

  const poly = document.getElementById("poly");

  if (poly) {
    // Set up booper
    const booper = new PolygonMorphBoop([poly], [
      { points: [50, 140, 150, 40, 250, 140], opacity: 0.2 }
    ]);

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
        { points: [50, 140, 150, 40, 250, 140], opacity: 1 }
      ])
    });
  }

  // ----------------------------------------------

  const magicWand = document.querySelector("svg.icon-magic-wand");

  if (magicWand) {
    const sparkles = magicWand.querySelectorAll("use");

    const morph = new UseMorph(sparkles, { stiffness: 0.15, damping: 0.75 });

    // morph.morph([
    //   { x: -15, y: -15, width: 24, height: 24} , // move, resize, fade, translate, scale, rotate
    //   { x: 12, y: 20, width: 20, height: 20} ,
    //   { x: 20, y: -15, width: 22, height: 22} ,
    // ], { delay: 1000 });

    // morph.morph([
    //   { x: -15, y: -15, width: 24, height: 24} , // move, resize, fade, translate, scale, rotate
    //   { x: 12, y: 20, width: 20, height: 20} ,
    //   { x: 20, y: -15, width: 22, height: 22} ,
    // ], { delay: [1000, 2000, 3000] });

    // morph.morph([
    //   { x: -15, y: -15, width: 24, height: 24} , // move, resize, fade, translate, scale, rotate
    //   { x: 12, y: 20, width: 20, height: 20} ,
    //   { x: 20, y: -15, width: 22, height: 22} ,
    // ], {
    //   delay: [
    //     { x: 1000, y: 2000, width: 3000, height: 4000 }, // element 1: per-attr delays
    //     { x: 1000, y: 2000, width: 3000, height: 4000 }, // element 2: per-attr delays
    //     { x: 1000, y: 2000, width: 3000, height: 4000 } // element 2: per-attr delays
    //   ]
    // });

    morph.morph([
      { x: -15, y: -15, width: 24, height: 24} , // move, resize, fade, translate, scale, rotate
      { x: 12, y: 20, width: 20, height: 20} ,
      { x: 20, y: -15, width: 22, height: 22} ,
    ], {
      delay: { x: 1000, y: 2000, width: 3000, height: 4000 }, // per-attr delays for all elements
    });

    // morph.staggerMorph([
    //   { x: -15, y: -15, width: 24, height: 24} , // move, resize, fade, translate, scale, rotate
    //   { x: 12, y: 20, width: 20, height: 20} ,
    //   { x: 20, y: -15, width: 22, height: 22} ,
    // ], { startDelay: 1000, baseDelay: 1000, reverse: true, yoyo: true, yoyoMode: "forward", repeat: 1 });


    // Morph them back to original state
    // setTimeout(() => {
    //   morph.morph([
    //     { x: -9, y: -9, width: 18, height: 18} ,
    //     { x: 9, y: 14, width: 16, height: 16} ,
    //     { x: 15, y: -10, width: 17, height: 17} ,
    //   ]);
    // }, 4000);


    magicWand.addEventListener("click", () => {
      const sparkleBoop = new UseMorphBoop(sparkles, [
        { x: -12, y: -12, width: 20, height: 20, opacity: 0.2, translateY: -3 }, // morph first sparkle
        { x: 12, y: 16, width: 18, height: 18 },   // second sparkle
        { x: 18, y: -12, width: 20, height: 20 },  // third sparkle
      ]);

      // trigger a boop
      sparkleBoop.trigger(300);
    });
  }
})

document.addEventListener("DOMContentLoaded", () => {
  const textEl = document.querySelector("#animatedText");

  if (textEl) {
    // Define boop: jump 10px up and scale font size to 32
    const boopValues = [
      { y: textEl.getAttribute("y") - 10, fontSize: 32, letterSpacing: 2, opacity: 0.7 }
    ];

    const boop = new TextMorphBoop([textEl], boopValues, { tension: 200, friction: 20 });

    // Trigger boop on click
    textEl.addEventListener("click", () => boop.trigger());
  }

  const tspans = document.querySelectorAll("tspan");

  tspans.forEach(tspan => {
    const tspanBoopValues = [
      { x: +tspan.getAttribute("x") - 10, fontSize: 28, letterSpacing: 2, opacity: 0.7 }
    ];

    const tspanBoop = new TspanMorphBoop([tspan], tspanBoopValues, { tension: 180, friction: 20 });

    tspan.addEventListener("click", () => tspanBoop.trigger());
  });

  const myGroup = document.querySelector("#myGroup");

  if (myGroup) {
    const myGroupBoopValues = [
      { translateX: 20, translateY: 0, scaleX: 1.2, opacity: 0.6, strokeWidth: 3 },
    ];

    const myGroupBoop = new GroupMorphBoop([myGroup], myGroupBoopValues, { tension: 180, friction: 20 });

    myGroup.addEventListener("click", () => myGroupBoop.trigger());
  }
})

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

    const sparkleBoop = new UseMorphBoop(sparkles, [
      { x: -12, y: -12, width: 20, height: 20 }, // morph first sparkle
      { x: 12, y: 16, width: 18, height: 18 },   // second sparkle
      { x: 18, y: -12, width: 20, height: 20 },  // third sparkle
    ]);

    // trigger a boop
    sparkleBoop.trigger(300);
  });
});

// document.addEventListener("DOMContentLoaded", () => {
//   const spring = new Spring(0, { stiffness: 120, damping: 14 });

//   spring
//     .onUpdate(val => console.log("Spring update", val))
//     .onProgress(p => console.log("Spring progress", p))
//     .onStart(() => console.log("Spring start"))
//     .onStop(() => console.log("Spring stop"))
//     .onSettle(() => console.log("Spring settled"));

//   // set target
//   spring.setTarget(10);

//   // drive updates with requestAnimationFrame
//   function animate() {
//     const settled = spring.step();
//     if (!settled) requestAnimationFrame(animate);
//   }
//   requestAnimationFrame(animate);

//   const group = new SpringGroup({ x: 0, y: 0 }, { stiffness: 200, damping: 18 });

//   // attach listeners first
//   group
//     .onUpdate(vals => console.log("Group update", vals))
//     .onProgress(p => console.log("Group progress", p))
//     .onStart(() => console.log("Group start"))
//     .onStop(() => console.log("Group stop"))
//     .onSettle(vals => console.log("Group settled", vals));

//   group.setTarget({ x: 10, y: 5 }); // triggers group events

//   const springBoop = new SpringBoop(group, { x: 100, y: 50 });

//   // Multiple callbacks
//   springBoop
//     .onStart(() => console.log("Boop started"))
//     .onProgress(p => console.log("Boop progress", p))
//     .onUpdate(vals => console.log("Boop update", vals))
//     .onStop(() => console.log("Boop stopped"));

//   // Trigger boop
//   springBoop.trigger();

//   const elements = [document.createElement("line"), document.createElement("line")];
//   const morph = new SpringMorph(elements, { stiffness: 100, damping: 12 });

//   // Multiple callbacks
//   morph
//     .onUpdate(vals => console.log("Morph update", vals))
//     .onProgress(p => console.log("Morph progress", p))
//     .onStart(() => console.log("Morph started"))
//     .onStop(() => console.log("Morph stopped"))
//     .onSettle(vals => console.log("Morph settled", vals));

//   // Trigger morph
//   morph.morph([{ x: 100 }, { x: 200 }]);

//   const timeline = new SpringTimeline();

//   timeline
//     .onStart(() => console.log("Timeline started 1"))
//     .onProgress(p => console.log("Timeline progress 1:", p))
//     .onUpdate(time => console.log("Timeline update 1:", time))
//     .onStop(() => console.log("Timeline stopped 1"))
//     .onComplete(() => console.log("Timeline complete 1"));

//   // Add some steps
//   timeline.add(() => console.log("Step 1 executed"), { delay: 1 });
//   timeline.add(() => console.log("Step 2 executed"), { delay: 2 });

//   // Play timeline
//   timeline.play();
// });

// import SpringColor from "./utils/animations/spring-color";
// import SpringColorMix from "./utils/animations/spring-color-mix";

// const colorSpring = new SpringColor("hsl(200 80% 50%)", { tension: 180, friction: 25 });

// colorSpring.onUpdate(color => {
//   document.body.style.backgroundColor = color;
// });

// colorSpring.setTarget("hsla(325, 100%, 50%, 1.00)");


// const box = document.body;

// // Initialize SpringColorMix with initial color
// const springColor = new SpringColorMix("hsl(0 100% 50%)", {
//   tension: 170,
//   friction: 26,
// });

// // Update the div's background each frame
// springColor.onUpdate(color => {
//   box.style.backgroundColor = color;
// }, { immediate: true });

// // Toggle between two colors on click
// let toggle = false;
// box.addEventListener("click", () => {
//   toggle = !toggle;
//   const targetColor = toggle ? "hsl(200 80% 50%)" : "hsl(0 100% 50%)";
//   springColor.setTarget(targetColor);
// });