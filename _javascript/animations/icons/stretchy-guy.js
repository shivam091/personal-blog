import CircleMorph from "./../../utils/animations/elements/circle/morph";
import LineMorph from "./../../utils/animations/elements/line/morph";
import PathMorph from "./../../utils/animations/elements/path/morph";
import SpringTimeline from "./../../utils/animations/spring-timeline";

export default class IconStretchyGuy {
  constructor(svg, { stiffness = 0.12, damping = 0.75 } = {}) {
    this.svg = svg;
    this.spring = { stiffness, damping };

    this.head = svg.querySelector(".head");
    this.body = svg.querySelector(".body");
    this.leftLeg = svg.querySelector(".left-leg");
    this.rightLeg = svg.querySelector(".right-leg");
    this.leftArm = svg.querySelector(".left-arm");
    this.rightArm = svg.querySelector(".right-arm");

    this.leftEye = svg.querySelector(".left-eye");
    this.rightEye = svg.querySelector(".right-eye");
    this.nose = svg.querySelector(".nose");
    this.mouth = svg.querySelector(".mouth");

    this.circlesMorph = new CircleMorph([this.head, this.leftEye, this.rightEye], this.spring);
    this.linesMorph = new LineMorph(
      [this.body, this.leftLeg, this.rightLeg, this.leftArm, this.rightArm, this.nose],
      this.spring
    );
    this.pathMorph = new PathMorph([this.mouth], this.spring);

    // States (rest, stretchy, transition)
    this.rest = {
      circles: [
        { cx: 25, cy: 35, r: 15 },   // Head
        { cx: 20, cy: 30, r: 0.5 },  // Left eye
        { cx: 30, cy: 30, r: 0.5 },  // Right eye
      ],
      lines: [
        { x1: 25, y1: 50, x2: 25, y2: 80 },  // Body
        { x1: 25, y1: 80, x2: 15, y2: 100 }, // Left leg
        { x1: 25, y1: 80, x2: 35, y2: 100 }, // Right leg
        { x1: 25, y1: 57, x2: 15, y2: 70 },  // Left arm
        { x1: 25, y1: 57, x2: 35, y2: 70 },  // Right arm
        { x1: 25, y1: 34, x2: 25, y2: 38 },  // Nose
      ],
      paths: [
        { M: [20, 41], Q: [25, 45, 30, 41] } // Mouth (M20 41 Q25 45 30 41)
      ]
    };

    this.stretchy = {
      circles: [
        { cx: 25, cy: 15, r: 15 },   // Head
        { cx: 20, cy: 10, r: 0.8 },  // Left eye
        { cx: 30, cy: 10, r: 0.8 },  // Right eye
      ],
      lines: [
        { x1: 25, y1: 30, x2: 25, y2: 70 },  // Body
        { x1: 25, y1: 70, x2: 15, y2: 100 }, // Left leg
        { x1: 25, y1: 70, x2: 35, y2: 100 }, // Right leg
        { x1: 25, y1: 37, x2: 15, y2: 60 },  // Left arm
        { x1: 25, y1: 37, x2: 35, y2: 60 },  // Right arm
        { x1: 25, y1: 14, x2: 25, y2: 18 },  // Nose
      ],
      paths: [
        { M: [20, 21], Q: [25, 25, 30, 21] } // Mouth (M20 21 Q25 25 30 21)
      ]
    };

    this.transition = {
      circles: [
        { cx: 25, cy: 35, r: 15 },   // Head
        { cx: 20, cy: 30, r: 0.5 },  // Left eye
        { cx: 30, cy: 30, r: 0.5 },  // Right eye
      ],
      lines: [
        { x1: 25, y1: 50, x2: 25, y2: 80 },  // Body
        { x1: 25, y1: 80, x2: 15, y2: 100 }, // Left leg
        { x1: 25, y1: 80, x2: 35, y2: 100 }, // Right leg
        { x1: 25, y1: 57, x2: 5, y2: 50 },   // Left arm
        { x1: 25, y1: 57, x2: 45, y2: 50 },  // Right arm
        { x1: 25, y1: 34, x2: 25, y2: 38 },  // Nose
      ],
      paths: [
        { M: [20, 41], Q: [25, 45, 30, 41] } // Mouth (M20 41 Q25 45 30 41)
      ]
    };

    // Timeline for exit animation
    this.timeline = new SpringTimeline();

    this._bindEvents();
  }

  _bindEvents() {
    this.svg.addEventListener("mouseenter", () => this.morphTo(this.stretchy));
    this.svg.addEventListener("mouseleave", () => this.morphLeave());

    this.svg.addEventListener("touchstart", () => this.morphTo(this.stretchy), { passive: true });
    this.svg.addEventListener("touchend", () => this.morphLeave(), { passive: true });
  }

  morphTo(state) {
    this.circlesMorph.morph(state.circles);
    this.linesMorph.morph(state.lines);
    this.pathMorph.morph(state.paths);
  }

  morphLeave() {
    // this.timeline
    //   .stop() // clear old
    //   .add(() => this.morphTo(this.transition)) // first
    //   .add(() => this.morphTo(this.rest), { delay: 0.1 }) // after 0.3s
    //   .play();

    this.morphTo(this.transition);
    setTimeout(() => this.morphTo(this.rest), 300);
  }

  static initialize(options = {}) {
    const stretchyGuy = document.querySelector(".icon-stretchy-guy");
    if (stretchyGuy) new IconStretchyGuy(stretchyGuy, options);
  }
}
