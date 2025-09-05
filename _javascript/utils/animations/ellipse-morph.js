import Morph from "./morph";
import { extractPoints, buildAttributes } from "./morph/ellipse";

export default class EllipseMorph extends Morph {
  constructor(ellipses, config = { stiffness: 0.12, damping: 0.75 }) {
    super(ellipses, config, extractPoints, buildAttributes);
  }
}
