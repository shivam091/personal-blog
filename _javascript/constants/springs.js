export const SPRINGS = {
  // Balanced spring – natural feel, good default for most animations.
  default: {
    tension: 170,
    friction: 26
  },
  // Very elastic – lots of bounce and overshoot, playful feel.
  springy: {
    tension: 300,
    friction: 10
  },
  // Fast and crisp – snappy transitions with slight bounce.
  tight: {
    tension: 450,
    friction: 25
  },
  // Soft and smooth – slow and relaxing with little bounce.
  gentle: {
    tension: 120,
    friction: 14
  },
  // Loose and bouncy – playful with extra wobble.
  wobbly: {
    tension: 180,
    friction: 12
  },
  // Strong and quick – minimal wobble, firm feel.
  stiff: {
    tension: 210,
    friction: 20
  },
  // Heavy and slow – settles gradually, stable feel.
  slow: {
    tension: 280,
    friction: 60,
    mass: 1.2
  },
  // Extra slow and gooey – takes a long time to settle.
  molasses: {
    tension: 280,
    friction: 120,
    mass: 1.5
  },
  // Very fast, little damping
  snappy: {
    tension: 500,
    friction: 15,
    mass: 0.8
  },
  // Fast but stable – quick to settle without much bounce.
  quick: {
    tension: 400,
    friction: 30
  },
  // Steady, smooth transitions
  smooth: {
    tension: 200,
    friction: 30,
    mass: 1.2
  },
  // Playful, lots of wobble
  bounce: {
    tension: 250,
    friction: 8
  },
  // No bounce at all
  overdamped: {
    tension: 200,
    friction: 80,
    mass: 1.2
  },
  // Extreme wobble
  underdamped: {
    tension: 250,
    friction: 5,
    mass: 0.9
  },
};
