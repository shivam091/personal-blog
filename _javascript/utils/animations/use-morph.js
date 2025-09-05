import Morph from "./morph";
import { extractPoints, buildAttributes } from "./morph/use";

export default class UseMorph extends Morph {
  constructor(uses, config = { stiffness: 0.12, damping: 0.75 }) {
    super(uses, config, extractPoints, buildAttributes);
  }
}
