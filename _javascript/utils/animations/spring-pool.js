import Spring from "./spring";

// Pool for Spring instances
export default class SpringPool {
  static pool = [];

  // Get a Spring from the pool or create a new one
  static acquire(value = 0, config = {}) {
    const spring = this.pool.pop() || new Spring(value, config);
    spring.reset(value, config);
    return spring;
  }

  // Return a Spring to the pool after stopping it
  static release(spring) {
    spring.stop();
    spring.eventManager.clear();
    this.pool.push(spring);
  }

  // Empty the pool and release all references
  static clear() {
    this.pool.length = 0;
  }
}
