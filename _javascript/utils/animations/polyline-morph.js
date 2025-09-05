import Morph from "./morph";
import { extractPoints, buildAttributes } from "./morph/polyline";

export default class PolyLineMorph extends Morph {
  constructor(polylines, config = { stiffness: 0.12, damping: 0.75 }) {
    super(polylines, config, extractPoints, buildAttributes);
  }
}
