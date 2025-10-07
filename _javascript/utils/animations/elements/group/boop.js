import SpringBoop from "../../spring-boop";
import GroupMorph from "./morph";

// Adds boop interactions to <g> elements
export default class GroupMorphBoop extends SpringBoop {
  constructor(groups, boopValues = [], springConfigs = {}) {
    const morph = new GroupMorph(groups, springConfigs);
    super(morph, boopValues, { springConfigs });
  }
}
