import Morph from "./morph";
import { extractPoints, buildAttributes } from "./morph/circle";

export default class CircleMorph extends Morph {
  constructor(circles, config = { stiffness: 0.12, damping: 0.75 }) {
    super(circles, config, extractPoints, buildAttributes);
  }
}
