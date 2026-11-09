// Animation loop with start/pause/reset. `raf` is injectable for tests.
export class Loop {
  constructor({ step, draw, reset, stepsPerFrame = 1, raf, caf } = {}) {
    this.stepFn = step ?? (() => {});
    this.drawFn = draw ?? (() => {});
    this.resetFn = reset ?? (() => {});
    this.stepsPerFrame = stepsPerFrame;
    this.raf = raf ?? ((cb) => globalThis.requestAnimationFrame(cb));
    this.caf = caf ?? ((id) => globalThis.cancelAnimationFrame(id));
    this.running = false;
    this.started = false;
    this.frame = 0;
    this._id = null;
    this.onChange = null;
  }
  _tick = () => {
    if (!this.running) return;
    for (let i = 0; i < this.stepsPerFrame; i++) this.stepFn();
    this.frame++;
    this.drawFn();
    this._id = this.raf(this._tick);
  };
  start() {
    if (this.running) return;
    this.running = true;
    this.started = true;
    this._id = this.raf(this._tick);
    this.onChange?.(this);
  }
  pause() {
    if (!this.running) return;
    this.running = false;
    if (this._id != null) this.caf(this._id);
    this._id = null;
    this.onChange?.(this);
  }
  toggle() { this.running ? this.pause() : this.start(); }
  // Stop, rebuild state through resetFn, draw once. Does not restart.
  reset() {
    this.pause();
    this.started = false;
    this.frame = 0;
    this.resetFn();
    this.drawFn();
    this.onChange?.(this);
  }
  // Reset and start: what the original "Inicia" button did.
  restart() { this.reset(); this.start(); }
}
