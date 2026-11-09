// Canvas plotting helper replacing the Java CuadroMath. World coordinates in,
// pixels out. Handles devicePixelRatio and optional axes with tick labels.
export class Plot {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.axes = opts.axes ?? false;
    this.xlabel = opts.xlabel ?? '';
    this.ylabel = opts.ylabel ?? '';
    this.margin = this.axes ? { l: 48, r: 10, t: 10, b: 32 } : { l: 0, r: 0, t: 0, b: 0 };
    this.bg = opts.bg ?? '#ffffff';
    this.fg = opts.fg ?? '#222222';
    this.xTicks = opts.xTicks ?? 5;
    this.yTicks = opts.yTicks ?? 5;
    this.setScales(opts.xmin ?? 0, opts.xmax ?? 1, opts.ymin ?? 0, opts.ymax ?? 1);
    this.resize();
  }
  setScales(xmin, xmax, ymin, ymax) {
    this.xmin = xmin; this.xmax = xmax; this.ymin = ymin; this.ymax = ymax;
  }
  resize() {
    const dpr = globalThis.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect?.();
    const w = Math.max(1, Math.round((rect?.width || this.canvas.width) * dpr));
    const h = Math.max(1, Math.round((rect?.height || this.canvas.height) * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w; this.canvas.height = h;
    }
    this.dpr = dpr;
    this.W = w / dpr; this.H = h / dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  get plotW() { return this.W - this.margin.l - this.margin.r; }
  get plotH() { return this.H - this.margin.t - this.margin.b; }
  toPixel(x, y) {
    return [
      this.margin.l + (x - this.xmin) / (this.xmax - this.xmin) * this.plotW,
      this.margin.t + (this.ymax - y) / (this.ymax - this.ymin) * this.plotH,
    ];
  }
  fromPixel(px, py) {
    return [
      this.xmin + (px - this.margin.l) / this.plotW * (this.xmax - this.xmin),
      this.ymax - (py - this.margin.t) / this.plotH * (this.ymax - this.ymin),
    ];
  }
  // Pixel coordinates of a pointer event relative to the canvas CSS box.
  eventToWorld(ev) {
    const r = this.canvas.getBoundingClientRect();
    return this.fromPixel(ev.clientX - r.left, ev.clientY - r.top);
  }
  clear() {
    const c = this.ctx;
    c.fillStyle = this.bg;
    c.fillRect(0, 0, this.W, this.H);
    if (this.axes) this.drawAxes();
    c.save();
    c.beginPath();
    c.rect(this.margin.l, this.margin.t, this.plotW, this.plotH);
    c.clip();
  }
  // Must be called after clear() when drawing is finished (restores clipping).
  end() { this.ctx.restore(); }
  color(c) { this.ctx.strokeStyle = c; this.ctx.fillStyle = c; }
  lineWidth(w) { this.ctx.lineWidth = w; }
  line(x1, y1, x2, y2) {
    const c = this.ctx; const [a, b] = this.toPixel(x1, y1); const [d, e] = this.toPixel(x2, y2);
    c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke();
  }
  polyline(xs, ys) {
    const c = this.ctx; c.beginPath();
    for (let i = 0; i < xs.length; i++) {
      const [px, py] = this.toPixel(xs[i], ys[i]);
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.stroke();
  }
  // Filled bar from x1 to x2, from baseline y0 to height h (world units).
  bar(x1, x2, h, y0 = 0, fill = true) {
    const [a, b] = this.toPixel(x1, h); const [d, e] = this.toPixel(x2, y0);
    const x = Math.min(a, d), y = Math.min(b, e), w = Math.abs(d - a), hh = Math.abs(e - b);
    if (fill) this.ctx.fillRect(x, y, w, hh); else this.ctx.strokeRect(x, y, w, hh);
  }
  // Rectangle given world corner (x,y) and world size (w,h).
  rect(x, y, w, h, fill = false) {
    const [a, b] = this.toPixel(x, y + h); const [d, e] = this.toPixel(x + w, y);
    if (fill) this.ctx.fillRect(a, b, d - a, e - b); else this.ctx.strokeRect(a, b, d - a, e - b);
  }
  // Disk at world (x,y) with radius in world units (x scale).
  disk(x, y, r, fill = true) {
    const [a, b] = this.toPixel(x, y);
    const pr = r / (this.xmax - this.xmin) * this.plotW;
    this.ctx.beginPath(); this.ctx.arc(a, b, pr, 0, 2 * Math.PI);
    if (fill) this.ctx.fill(); else this.ctx.stroke();
  }
  // Pixel-sized square (for lattice nodes). Size in CSS pixels.
  pixel(x, y, size = 1) {
    const [a, b] = this.toPixel(x, y);
    this.ctx.fillRect(a, b, size, size);
  }
  text(x, y, str, { align = 'left', baseline = 'alphabetic', font = '12px system-ui, sans-serif' } = {}) {
    const [a, b] = this.toPixel(x, y);
    this.ctx.font = font; this.ctx.textAlign = align; this.ctx.textBaseline = baseline;
    this.ctx.fillText(str, a, b);
  }
  // Text at a pixel offset from the plot's top-left corner (for annotations).
  label(px, py, str, opts = {}) {
    this.ctx.font = opts.font ?? '12px system-ui, sans-serif';
    this.ctx.textAlign = opts.align ?? 'left'; this.ctx.textBaseline = 'top';
    this.ctx.fillText(str, this.margin.l + px, this.margin.t + py);
  }
  drawImage(img, x, y, w, h) {
    const [a, b] = this.toPixel(x, y + h); const [d, e] = this.toPixel(x + w, y);
    this.ctx.drawImage(img, a, b, d - a, e - b);
  }
  drawAxes() {
    const c = this.ctx;
    c.save();
    c.strokeStyle = this.fg; c.fillStyle = this.fg; c.lineWidth = 1;
    c.font = '11px system-ui, sans-serif';
    const { l, t } = this.margin; const W = this.plotW, H = this.plotH;
    c.strokeRect(l + 0.5, t + 0.5, W, H);
    c.textAlign = 'center'; c.textBaseline = 'top';
    for (let i = 0; i <= this.xTicks; i++) {
      const x = this.xmin + (this.xmax - this.xmin) * i / this.xTicks;
      const [px] = this.toPixel(x, 0);
      c.beginPath(); c.moveTo(px, t + H); c.lineTo(px, t + H + 4); c.stroke();
      c.fillText(fmt(x), px, t + H + 6);
    }
    c.textAlign = 'right'; c.textBaseline = 'middle';
    for (let i = 0; i <= this.yTicks; i++) {
      const y = this.ymin + (this.ymax - this.ymin) * i / this.yTicks;
      const [, py] = this.toPixel(0, y);
      c.beginPath(); c.moveTo(l - 4, py); c.lineTo(l, py); c.stroke();
      c.fillText(fmt(y), l - 6, py);
    }
    if (this.xlabel) { c.textAlign = 'right'; c.textBaseline = 'bottom'; c.fillText(this.xlabel, l + W, t + H - 2); }
    if (this.ylabel) { c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText(this.ylabel, l + 4, t + 2); }
    c.restore();
  }
}

export function fmt(v) {
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1e5 || a < 1e-3) return v.toExponential(1);
  if (Number.isInteger(v)) return String(v);
  return a >= 100 ? v.toFixed(0) : a >= 10 ? v.toFixed(1) : v.toFixed(2);
}
