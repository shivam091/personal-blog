import GlobalTicker from "./../global-ticker";
import EventManager from "./../event-manager";
import { clamp } from "../interpolators";

// Timeline scheduler for sequencing spring-based animations
export default class SpringTimeline {
  constructor({ timeUnit = "s", loop = 0, autoClear = true, yoyo = false } = {}) {
    this.queue = []; // { fn, reverseFn, delay, done, start, elapsed }
    this.labels = {}; // named labels mapped to absolute time in seconds
    this.time = 0; // internal timeline in seconds
    this.active = false;
    this.paused = false;
    this._lastProgress = 0;
    this.loop = loop; // remaining loops
    this._initialLoopCount = loop;
    this._autoClear = autoClear;
    this._yoyo = yoyo; // enable reverse looping
    this._forward = true; // current play direction

    this._unsubscribe = GlobalTicker.add(this.update.bind(this));
    this.eventManager = new EventManager();
    this._defaultUnit = this.#normalizeUnit(timeUnit);
  }

  // Normalizes unit
  #normalizeUnit(unit) {
    if (unit === "s" || unit === "seconds") return "s";
    if (unit === "ms" || unit === "milliseconds") return "ms";
    throw new Error(`Invalid timeUnit: ${unit}`);
  }

  // Normalizes delay into seconds (internal unit)
  #normalizeDelay(delay, unit) {
    const u = this.#normalizeUnit(unit || this._defaultUnit);
    return u === "ms" ? delay / 1000 : delay;
  }

  // Converts seconds back into desired unit for callbacks
  #convertTime(seconds, unit) {
    const u = this.#normalizeUnit(unit || this._defaultUnit);
    return u === "ms" ? seconds * 1000 : seconds;
  }

  // Computes total duration (max start time)
  getTotalDuration() {
    return this.queue.length ? Math.max(...this.queue.map(q => q.start)) : 0;
  }

  // Getter for normalized progress (0–1)
  get progress() {
    return this._lastProgress;
  }

  // Setter for progress
  set progress(p) {
    const lastStart = this.getTotalDuration();
    this.time = lastStart * clamp(p, 0, 1);
    for (const item of this.queue) {
      item.done = this.time >= item.start;
      item.elapsed = Math.max(0, this.time - item.start);
    }
    this._lastProgress = p;
    this.eventManager.emit("seek", this.time); // onSeek event
  }

  // Adds a function to the queue with optional delay and unit
  // Accepts optional reverseFn callback for yoyo reverse execution
  add(fn, { reverseFn = null, delay = 0, unit = null } = {}) {
    const delayInSeconds = this.#normalizeDelay(delay, unit);

    this.queue.push({
      fn,
      reverseFn, // optional function to execute on reverse
      delay: delayInSeconds,
      done: false,
      start: this.time + delayInSeconds,
      elapsed: 0, // track elapsed per item
    });
    return this;
  }

  // Adds a function relative to a named label
  addAtLabel(label, fn, { reverseFn = null, delay = 0, unit = null } = {}) {
    if (!(label in this.labels)) {
      throw new Error(`Label not found: ${label}`);
    }
    const labelTime = this.labels[label];
    const delayInSeconds = this.#normalizeDelay(delay, unit);

    this.queue.push({
      fn,
      reverseFn,
      delay: delayInSeconds,
      done: false,
      start: labelTime + delayInSeconds,
      elapsed: 0,
    });
    return this;
  }

  // Adds a named label at a specific time (in seconds internally)
  addLabel(name, time, unit = null) {
    this.labels[name] = this.#normalizeDelay(time, unit);
    return this;
  }

  // Jumps playhead to label or absolute time and update queue state
  seek(labelOrTime, unit = null) {
    let target;

    if (typeof labelOrTime === "string") {
      if (!(labelOrTime in this.labels)) {
        throw new Error(`Label not found: ${labelOrTime}`);
      }
      target = this.labels[labelOrTime];
    } else {
      target = this.#normalizeDelay(labelOrTime, unit);
    }

    this.time = target;

    // Mark items as already executed if before the new playhead
    for (const item of this.queue) {
      item.done = this.time >= item.start;
      item.elapsed = Math.max(0, this.time - item.start);
    }

    this._lastProgress = this.getTotalDuration() ? Math.min(1, this.time / this.getTotalDuration()) : 1;
    this.eventManager.emit("seek", this.time); // fire onSeek event

    return this;
  }

  // Starts playback from a named label
  fromLabel(name) {
    if (!(name in this.labels)) {
      throw new Error(`Label not found: ${name}`);
    }

    this.seek(this.labels[name]);
    this.play(true);
    return this;
  }

  // Starts playing queued functions (reset state unless resuming from seek)
  play(fromSeek = false) {
    this.active = true;
    this.paused = false;

    if (!fromSeek) {
      this.time = 0;
      this.queue.forEach(item => {
        item.done = false;
        item.elapsed = 0;
      });
      this._forward = true;
    }

    this.eventManager.emit("start");
    return this;
  }

  // Pauses timeline progression
  pause() {
    this.paused = true;
    this.eventManager.emit("pause");
    return this;
  }

  // Resumes timeline progression
  resume() {
    this.paused = false;
    this.eventManager.emit("resume");
    return this;
  }

  // Stops and clears the timeline
  stop() {
    this.active = false;
    this.queue = [];
    this.eventManager.emit("stop");
    return this;
  }

  // Disposes timeline and unsubscribe from ticker
  dispose() {
    this.stop();
    this._unsubscribe?.();
    this._unsubscribe = null;
    this.eventManager.clear();
  }

  // Updates timeline progression each frame
  update(dt) {
    if (!this.active || this.paused) return;

    const totalDuration = this.getTotalDuration();
    if (totalDuration === 0) return;

    // Update time according to direction
    this.time += this._forward ? dt : -dt;

    // Clamp time between 0 and totalDuration
    this.time = clamp(this.time, 0, totalDuration);

    // Compute normalized progress
    const progress = totalDuration > 0 ? this.time / totalDuration : 1;
    this._lastProgress = progress;
    this.eventManager.emit("progress", this._lastProgress);
    this.eventManager.emit("update", this.time);

    // Execute scheduled items and track elapsed
    for (const item of this.queue) {
      if (this._forward) {
        if (!item.done && this.time >= item.start) {
          item.fn();
          item.done = true;
        }
      } else {
        // Reverse execution for yoyo if reverseFn exists
        if (item.reverseFn && !item.done && this.time <= item.start + item.delay) {
          item.reverseFn();
          item.done = true;
        }
      }
      item.elapsed = Math.max(0, this.time - item.start);
    }

    // Handle end of timeline
    if ((this._forward && this.time >= totalDuration) || (!this._forward && this.time <= 0)) {
      if (this.loop > 0 || this.loop === Infinity) {
        const completedLoop = this._initialLoopCount - this.loop + 1;
        this.eventManager.emit("loop", completedLoop);

        if (this.loop !== Infinity) this.loop -= 1;

        if (this._yoyo) {
          this._forward = !this._forward; // reverse direction
          this.queue.forEach(item => (item.done = false)); // reset item done flags
          this.eventManager.emit("yoyo", this._forward); // emit yoyo direction change
        } else {
          // Reset timeline for next loop
          this.time = 0;
          this.queue.forEach(item => (item.done = false));
        }
      } else {
        this.active = false;
        this.eventManager.emit("complete");
        if (this._autoClear) this.clear();
      }
    }
  }

  // Clears all scheduled animations from the queue
  clear() {
    this.queue = [];
    return this;
  }

  // Subscribes to start event
  onStart(fn) {
    this.eventManager.on("start", fn);
    return this;
  }

  // Subscribes to stop event
  onStop(fn) {
    this.eventManager.on("stop", fn);
    return this;
  }

  // Subscribes to pause event
  onPause(fn) {
    this.eventManager.on("pause", fn);
    return this;
  }

  // Subscribes to resume event
  onResume(fn) {
    this.eventManager.on("resume", fn);
    return this;
  }

  // Subscribes to complete event
  onComplete(fn) {
    this.eventManager.on("complete", fn);
    return this;
  }

  // Subscribes to update event
  onUpdate(fn, { immediate = false, unit = null } = {}) {
    const wrapped = (tSeconds) => fn(this.#convertTime(tSeconds, unit));
    if (immediate) fn(this.#convertTime(this.time, unit));
    this.eventManager.on("update", wrapped);
    return this;
  }

  // Subscribes to progress event
  onProgress(fn, { immediate = false } = {}) {
    if (immediate) fn(this._lastProgress);
    this.eventManager.on("progress", fn);
    return this;
  }

  // Subscribes to loop event
  onLoop(fn) {
    this.eventManager.on("loop", fn);
    return this;
  }

  // Subscribes to yoyo event
  onYoyo(fn) {
    this.eventManager.on("yoyo", fn);
    return this;
  }

  // Subscribes to seek event
  onSeek(fn) {
    this.eventManager.on("seek", fn);
    return this;
  }
}
