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
