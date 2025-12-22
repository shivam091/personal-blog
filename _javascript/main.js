import HeaderGlassEffect from "./layout/header-glass-effect";
import HeaderDrawer from "./layout/header-drawer";

import ScrollTop from "./components/scroll-top";
import SkipLink from "./components/skip-link";
import Tooltip from "./components/tooltip";
import Dropdown from "./components/dropdown";
import Accordion from "./components/accordion";
import Details from "./components/details";
import Collapse from "./components/collapse";
import Alert from "./components/alert";
import LazyLoader from "./components/lazy-loader";
import RetroCounter from "./components/retro-counter";
import Scrollspy from "./components/scroll-spy";
import * as Hero from "./components/hero";
import CodeBlock from "./components/code-block";
import Playground from "./components/playground";

import ThemeSwitcher from "./modules/theme-switcher";
import AnalyticsTracker from "./modules/analytics-tracker";
import ContactForm from "./modules/contact-form";

import Clipboard from "./utils/clipboard";

import TransformBoop from "./animations/transform-boop";
import IconArrowRight from "./animations/icons/arrow-right";
import IconHash from "./animations/icons/hash";
import IconList from "./animations/icons/list";
import IconStretchyGuy from "./animations/icons/stretchy-guy";
import IconRSS from "./animations/icons/rss";
import IconSpeaker from "./animations/icons/speaker";
import IconBook from "./animations/icons/book";
import IconExternalLink from "./animations/icons/external-link";
import IconSkipBack from "./animations/icons/skip-back";
import IconRefresh from "./animations/icons/refresh";
import IconCircleSlash from "./animations/icons/circle-slash";
import IconDownload from "./animations/icons/download";

HeaderGlassEffect.initialize();
HeaderDrawer.initialize();

ScrollTop.initialize();
SkipLink.initialize();
Tooltip.initialize();
Dropdown.initialize();
Accordion.initialize();
Details.initialize();
Collapse.initializeAll();
Alert.initialize();
LazyLoader.initialize();
RetroCounter.initializeAll("[data-retro-counter]", {
  version: "v2",
  namespace: "harshal-ladhe-netlify-app",
  debug: false,
});
Scrollspy.initialize(".toc-wrapper", {
  activeClass: "active",
  rootMargin: "80px 0px -70% 0px"
});
CodeBlock.initializeAll();
Hero.bindHeroTyped();

ThemeSwitcher.initialize();
AnalyticsTracker.initialize();
Clipboard.initializeAll();
ContactForm.initialize();

TransformBoop.initialize(".alert-dismiss .icon-times", { rotate: 15, scaleX: 1.2 });
TransformBoop.initialize(".icon-arrow-up", { translateY: -3 });
TransformBoop.initialize(".icon-search", { rotate: 10, scaleX: 1.1 });
TransformBoop.initialize(".icon-clipboard-check", { scaleX: 1.1 });
TransformBoop.initialize(".icon-adjust", { rotate: -45, scaleX: 1.1 });
TransformBoop.initialize(".icon-candy", { rotate: -20 }, { tension: 350, friction: 10 });

IconArrowRight.initialize();
IconHash.initialize();
IconList.initialize();
IconStretchyGuy.initialize();
IconRSS.initialize();
IconSpeaker.initialize();
IconBook.initialize();
IconExternalLink.initialize();
IconSkipBack.initialize();
IconRefresh.initialize();
IconCircleSlash.initialize();
IconDownload.initialize();

Playground.initializeAll();

function syncAllIframes(theme) {
  document.querySelectorAll("iframe").forEach((iframe) => {
    iframe.contentDocument?.documentElement?.setAttribute("data-theme", theme);

    iframe.contentWindow?.postMessage({ type: "theme-change", theme }, "*");
  });
}

// Initial sync
document.addEventListener("DOMContentLoaded", () => {
  syncAllIframes(ThemeSwitcher.getCurrentTheme());
});

// React to theme changes
window.addEventListener("app-theme-change", (e) => {
  syncAllIframes(e.detail.theme);
});

// Catch late-loading iframes
document.addEventListener("load", (e) => {
  if (e.target.tagName === "IFRAME") {
    const theme = ThemeSwitcher.getCurrentTheme();

    e.target.contentWindow?.postMessage({ type: "theme-change", theme }, "*");
  }
}, true);

window.addEventListener("message", (e) => {
  if (e.data?.type === "theme-request") {
    const theme = document.documentElement.dataset.theme || "light";

    e.source?.postMessage({ type: "theme-change", theme }, "*");
  }
});
