import Morph from "./morph";
import { extractPoints, buildAttributes } from "./morph/rect";

export default class RectMorph extends Morph {
  constructor(rects, config = { stiffness: 0.12, damping: 0.75 }) {
    super(rects, config, extractPoints, buildAttributes);
  }
}
