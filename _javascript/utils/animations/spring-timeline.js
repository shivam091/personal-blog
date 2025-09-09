import GlobalTicker from "./../global-ticker";
import EventManager from "./../event-manager";

// Timeline scheduler for sequencing spring-based animations
export default class SpringTimeline {
  constructor({ timeUnit = "s" } = {}) {
    this.queue = []; // { fn, delay, done, start }
    this.labels = {}; // named labels mapped to absolute time in seconds
    this.time = 0; // always tracked internally in seconds
    this.active = false;

    this._unsubscribe = GlobalTicker.add(this.update.bind(this));

    this.eventManager = new EventManager();
    this._lastProgress = 0;

    this._defaultUnit = this._normalizeUnit(timeUnit);
  }

  // Normalize unit
  _normalizeUnit(unit) {
    if (unit === "s" || unit === "seconds") return "s";
    if (unit === "ms" || unit === "milliseconds") return "ms";
    throw new Error(`Invalid timeUnit: ${unit}`);
  }

  // Normalize delay into seconds (internal unit)
  _normalizeDelay(delay, unit) {
    const u = this._normalizeUnit(unit || this._defaultUnit);
    return u === "ms" ? delay / 1000 : delay;
  }

  // Convert seconds back into desired unit for callbacks
  _convertTime(seconds, unit) {
    const u = this._normalizeUnit(unit || this._defaultUnit);
    return u === "ms" ? seconds * 1000 : seconds;
  }

  // Add a function to the queue with optional delay and unit
  add(fn, { delay = 0, unit = null } = {}) {
    const delayInSeconds = this._normalizeDelay(delay, unit);
    this.queue.push({
      fn,
      delay: delayInSeconds,
      done: false,
      start: this.time + delayInSeconds
    });
    return this;
  }

  // Add a named label at a specific time (in seconds internally)
  addLabel(name, time, unit = null) {
    this.labels[name] = this._normalizeDelay(time, unit);
    return this;
  }

  // Jump playhead to label or absolute time and update queue state
  seek(labelOrTime, unit = null) {
    let target;
    if (typeof labelOrTime === "string") {
      if (!(labelOrTime in this.labels)) {
        throw new Error(`Label not found: ${labelOrTime}`);
      }
      target = this.labels[labelOrTime];
    } else {
      target = this._normalizeDelay(labelOrTime, unit);
    }
    this.time = target;
    // Mark items as already executed if before the new playhead
    for (const item of this.queue) {
      item.done = this.time >= item.start;
    }
    return this;
  }

  // Start playback from a named label
  fromLabel(name) {
    if (!(name in this.labels)) {
      throw new Error(`Label not found: ${name}`);
    }
    this.seek(this.labels[name]);
    this.play(true);
    return this;
  }

  // Start playing queued functions (reset state unless resuming from seek)
  play(fromSeek = false) {
    this.active = true;
    if (!fromSeek) {
      this.time = 0;
      this.queue.forEach(item => (item.done = false));
    }
    this.eventManager.emit("start");
    return this;
  }

  // Stop and clear the timeline
  stop() {
    this.active = false;
    this.queue = [];
    this.eventManager.emit("stop");
    return this;
  }

  // Dispose timeline and unsubscribe from ticker
  dispose() {
    this.stop();
    this._unsubscribe?.();
    this._unsubscribe = null;
    this.eventManager.clear();
  }

  // Update timeline progression each frame
  update(dt) {
    if (!this.active) return;

    // dt is in seconds from GlobalTicker
    this.time += dt;
    this.eventManager.emit("update", this.time);

    // compute normalized progress based on the farthest scheduled start (seconds)
    const lastStart = this.queue.length
      ? Math.max(...this.queue.map(q => q.start))
      : 0;
    const progress = lastStart > 0 ? Math.min(1, this.time / lastStart) : 1;
    this._lastProgress = progress;
    this.eventManager.emit("progress", this._lastProgress);

    for (const item of this.queue) {
      if (!item.done && this.time >= item.start) {
        item.fn();
        item.done = true;
      }
    }

    if (this.queue.every(item => item.done)) {
      this.stop();
      this.eventManager.emit("complete");
    }
  }

  // Subscribe to start event
  onStart(fn) {
    this.eventManager.on("start", fn);
    return this;
  }

  // Subscribe to stop event
  onStop(fn) {
    this.eventManager.on("stop", fn);
    return this;
  }

  // Subscribe to complete event
  onComplete(fn) {
    this.eventManager.on("complete", fn);
    return this;
  }

  // Subscribe to update event
  onUpdate(fn, { immediate = false, unit = null } = {}) {
    const wrapped = (tSeconds) => fn(this._convertTime(tSeconds, unit));
    if (immediate) fn(this._convertTime(this.time, unit));
    this.eventManager.on("update", wrapped);
    return this;
  }

  // Subscribe to progress event
  onProgress(fn, { immediate = false } = {}) {
    if (immediate) fn(this._lastProgress);
    this.eventManager.on("progress", fn);
    return this;
  }
}
