// Normalizes springConfigs into an array matching groups length
export function normalizeSpringConfigs(groups, springConfigs) {
  if (!springConfigs || !groups) return;
  const n = groups.length;

  // copy & pad with nulls if shorter
  if (Array.isArray(springConfigs)) {
    return springConfigs
      .slice(0, n)
      .concat(Array(Math.max(0, n - springConfigs.length)).fill(null));
  }

  // single config -> duplicate for every group
  return Array(n).fill(springConfigs);
}

// Applies per-group configs to the actual Spring instances
export function applySpringConfigs(groups, springConfigs) {
  const configs = normalizeSpringConfigs(groups, springConfigs);
  if (!configs) return;

  configs.forEach((config, i) => {
    const group = groups[i];
    if (!group) return;

    // group.springs is an object of Springs; update each one
    Object.values(group.springs).forEach(spring => (spring.config = config));
  });
}
