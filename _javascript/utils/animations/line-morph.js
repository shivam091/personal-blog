import Morph from "./morph";
import { extractPoints, buildAttributes } from "./morph/line";

export default class LineMorph extends Morph {
  constructor(lines, config = { stiffness: 0.12, damping: 0.75 }) {
    super(lines, config, extractPoints, buildAttributes);
  }
}
