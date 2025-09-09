import { CircleAdapter } from "./adapters/circle-adapter";
import { EllipseAdapter } from "./adapters/ellipse-adapter";
import { LineAdapter } from "./adapters/line-adapter";
import { PathAdapter } from "./adapters/path-adapter";
import { RectAdapter } from "./adapters/rect-adapter";
import { UseAdapter } from "./adapters/use-adapter";
import { PointsAdapter } from "./adapters/points-adapter";
import { TextualAdapter } from "./adapters/textual-adapter";
import { GroupAdapter } from "./adapters/group-adapter";

// Registry to map SVG tags to their adapters
export default class AdapterRegistry {
  constructor() {
    // Map of tagName → adapter
    this.map = {
      circle: CircleAdapter,
      ellipse: EllipseAdapter,
      line: LineAdapter,
      path: PathAdapter,
      polygon: PointsAdapter,
      polyline: PointsAdapter,
      rect: RectAdapter,
      use: UseAdapter,
      text: TextualAdapter,
      tspan: TextualAdapter,
      g: GroupAdapter
    };
  }

  // Return adapter for an element based on tagName
  getAdapter(el) {
    return this.map[el.tagName.toLowerCase()];
  }
}
