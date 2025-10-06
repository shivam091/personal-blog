import Spring from "./spring";

// Pool for Spring instances
export default class SpringPool {
  static pool = [];
  static MAX_SIZE = 100;

  // Gets a Spring from the pool or create a new one
  static acquire(value = 0, config = {}) {
    const spring = this.pool.pop() || new Spring(value, config);

    spring.reset(value, config);
    spring.inUse = true;

    return spring;
  }

  // Returns a Spring to the pool after stopping it
  static release(spring) {
    spring.stop();
    spring.eventManager.clear();
    spring.inUse = false;
    if (this.pool.length < this.MAX_SIZE) this.pool.push(spring);
  }

  // Empties the pool and release all references
  static clear() {
    this.pool.length = 0;
  }
}
