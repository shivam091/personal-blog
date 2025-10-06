import { CircleAdapter } from "./adapters/circle";
import { EllipseAdapter } from "./adapters/ellipse";
import { LineAdapter } from "./adapters/line";
import { PathAdapter } from "./adapters/path";
import { RectAdapter } from "./adapters/rect";
import { UseAdapter } from "./adapters/use";
import { PolyPointsAdapter } from "./adapters/poly-points";
import { TextualAdapter } from "./adapters/textual";
import { GroupAdapter } from "./adapters/group";

// Registry to map SVG tags to their adapters
export default class AdapterRegistry {
  constructor() {
    // Map of tagName → adapter
    this.map = {
      circle: CircleAdapter,
      ellipse: EllipseAdapter,
      line: LineAdapter,
      path: PathAdapter,
      polygon: PolyPointsAdapter,
      polyline: PolyPointsAdapter,
      rect: RectAdapter,
      use: UseAdapter,
      text: TextualAdapter,
      tspan: TextualAdapter,
      g: GroupAdapter
    };
  }

  // Returns adapter for an element based on tagName
  getAdapter(el) {
    return this.map[el.tagName.toLowerCase()];
  }
}
