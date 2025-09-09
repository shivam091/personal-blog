import SpringMorph from "../../spring-morph";

// Morphs <g> elements using spring physics
export default class GroupMorph extends SpringMorph {
  constructor(groups, springConfigs = {}) {
    super(groups, springConfigs);
  }
}
