import useTouch from "../../hooks/use-touch";
import SpringTimeline from "../../utils/animations/spring-timeline";
import CircleMorph from "./../../utils/animations/elements/circle/morph";
import LineMorph from "./../../utils/animations/elements/line/morph";
import PathMorph from "./../../utils/animations/elements/path/morph";
import { deepFreeze } from "../../utils/deep-freeze";

const REST_MODE = deepFreeze({
  circles: [
    { cx: 25, cy: 35, r: 15 }, // Head
    { cx: 20, cy: 30, r: 0.5 }, // Left eye
    { cx: 30, cy: 30, r: 0.5 }, // Right eye
  ],
  lines: [
    { x1: 25, y1: 50, x2: 25, y2: 80 }, // Body
    { x1: 25, y1: 80, x2: 15, y2: 100 }, // Left leg
    { x1: 25, y1: 80, x2: 35, y2: 100 }, // Right leg
    { x1: 25, y1: 57, x2: 15, y2: 70 }, // Left arm
    { x1: 25, y1: 57, x2: 35, y2: 70 }, // Right arm
    { x1: 25, y1: 34, x2: 25, y2: 38 }, // Nose
  ],
  paths: [
    { M: [20, 41], Q: [25, 45, 30, 41] } // Mouth
  ]
});

const STRETCHY_MODE = deepFreeze({
  circles: [
    { cx: 25, cy: 15, r: 15 },
    { cx: 20, cy: 10, r: 0.8 },
    { cx: 30, cy: 10, r: 0.8 },
  ],
  lines: [
    { x1: 25, y1: 30, x2: 25, y2: 70 },
    { x1: 25, y1: 70, x2: 15, y2: 100 },
    { x1: 25, y1: 70, x2: 35, y2: 100 },
    { x1: 25, y1: 37, x2: 15, y2: 60 },
    { x1: 25, y1: 37, x2: 35, y2: 60 },
    { x1: 25, y1: 14, x2: 25, y2: 18 },
  ],
  paths: [
    { M: [20, 21], Q: [25, 25, 30, 21] }
  ]
});

const TRANSITION_MODE = deepFreeze({
  circles: [
    { cx: 25, cy: 35, r: 15 },
    { cx: 20, cy: 30, r: 0.5 },
    { cx: 30, cy: 30, r: 0.5 },
  ],
  lines: [
    { x1: 25, y1: 50, x2: 25, y2: 80 },
    { x1: 25, y1: 80, x2: 15, y2: 100 },
    { x1: 25, y1: 80, x2: 35, y2: 100 },
    { x1: 25, y1: 57, x2: 5, y2: 50 },
    { x1: 25, y1: 57, x2: 45, y2: 50 },
    { x1: 25, y1: 34, x2: 25, y2: 38 },
  ],
  paths: [
    { M: [20, 41], Q: [25, 45, 30, 41] }
  ]
});

const SPRING_CONFIG = { tension: 300, friction: 12 };

export default class IconStretchyGuy {
  constructor(svg) {
    this.svg = svg;
    this.isTouch = useTouch();

    this.head = svg.querySelector("#head");
    this.body = svg.querySelector("#body");
    this.leftLeg = svg.querySelector("#left-leg");
    this.rightLeg = svg.querySelector("#right-leg");
    this.leftArm = svg.querySelector("#left-arm");
    this.rightArm = svg.querySelector("#right-arm");

    this.leftEye = svg.querySelector("#left-eye");
    this.rightEye = svg.querySelector("#right-eye");
    this.nose = svg.querySelector("#nose");
    this.mouth = svg.querySelector("#mouth");

    this.circlesMorph = new CircleMorph([this.head, this.leftEye, this.rightEye], SPRING_CONFIG);
    this.linesMorph = new LineMorph(
      [this.body, this.leftLeg, this.rightLeg, this.leftArm, this.rightArm, this.nose],
      SPRING_CONFIG
    );
    this.pathMorph = new PathMorph([this.mouth], SPRING_CONFIG);

    this._bindEvents();
  }

  _bindEvents() {
    if (this.isTouch) {
      this.svg.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.morphToStretchy();
      }, { passive: false });
    } else {
      this.svg.addEventListener("mouseenter", () => this.morphTo(STRETCHY_MODE));
      this.svg.addEventListener("mouseleave", () => this.morphLeave());
    }
  }

  #morphSequence(poses) {
    const timeline = new SpringTimeline({ timeUnit: "ms" });
    poses.forEach(({ state, delay }) => timeline.add(() => this.morphTo(state), { delay }));
    timeline.play();
  }

  // Full boop sequence for mobile touch
  morphToStretchy() {
    this.#morphSequence([
      { state: STRETCHY_MODE },
      { state: TRANSITION_MODE, delay: 150 },
      { state: REST_MODE, delay: 450 }
    ]);
  }

  morphTo(state) {
    this.circlesMorph.morph(state.circles);
    this.linesMorph.morph(state.lines);
    this.pathMorph.morph(state.paths);
  }

  morphLeave() {
    this.#morphSequence([
      { state: TRANSITION_MODE },
      { state: REST_MODE, delay: 300 }
    ]);
  }

  static initialize() {
    const stretchyGuy = document.querySelector(".icon-stretchy-guy");
    if (stretchyGuy) new IconStretchyGuy(stretchyGuy);
  }
}
