import Morph from "./morph";
import { extractPoints, buildAttributes } from "./morph/polygon";

export default class PolygonMorph extends Morph {
  constructor(polygons, config = { stiffness: 0.12, damping: 0.75 }) {
    super(polygons, config, extractPoints, buildAttributes);
  }
}
