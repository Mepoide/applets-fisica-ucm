// Landing-page hero: a live 2D Ising model near its critical temperature drawn on a
// canvas, in the theme colours. startHero(canvas, opts) returns a stop() function.
export function createIsing(nx, ny, K, rng = Math.random) {
  const s = new Int8Array(nx * ny);
  for (let i = 0; i < s.length; i++) s[i] = rng() < 0.5 ? 1 : -1;
  return { nx, ny, K, s, rng };
}
// One checkerboard Metropolis sweep (both sublattices), periodic boundaries.
export function sweep(st) {
  const { nx, ny, K, s, rng } = st;
  const w = new Float64Array(9); // exp(-2K·s·h) for h = -4..4 → index h+4
  for (let h = -4; h <= 4; h++) w[h + 4] = Math.exp(-2 * K * h);
  for (let parity = 0; parity < 2; parity++) {
    for (let y = 0; y < ny; y++) {
      const up = ((y + ny - 1) % ny) * nx, dn = ((y + 1) % ny) * nx, row = y * nx;
      for (let x = (y + parity) & 1; x < nx; x += 2) {
        const i = row + x;
        const h = s[up + x] + s[dn + x] + s[row + (x + 1) % nx] + s[row + (x + nx - 1) % nx];
        const dE = s[i] * h; // ΔE/(2J) = s·h ; accept if dE <= 0 or rng < exp(-2K s h)
        if (dE <= 0 || rng() < w[dE + 4]) s[i] = -s[i];
      }
    }
  }
}
export function magnetization(st) { let m = 0; for (const v of st.s) m += v; return m / st.s.length; }

function parseColor(c) {
  const m = /^#([0-9a-f]{6})$/i.exec(c.trim());
  if (m) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
  const r = /rgba?\(([^)]+)\)/.exec(c); if (r) return r[1].split(',').slice(0, 3).map((v) => Math.round(Number(v)));
  return [200, 200, 200];
}

export function startHero(canvas, { nx = 192, ny = 108, K = 0.4407, sweepsPerFrame = 1 } = {}) {
  const st = createIsing(nx, ny, K);
  for (let i = 0; i < 40; i++) sweep(st); // start with critical-looking clusters
  const ctx = canvas.getContext('2d');
  const off = new OffscreenCanvas(nx, ny), octx = off.getContext('2d'), img = octx.createImageData(nx, ny);
  let raf = 0, alive = true;
  const colours = () => {
    const cs = getComputedStyle(document.documentElement);
    return [parseColor(cs.getPropertyValue('--hero-a') || '#1f4e9c'), parseColor(cs.getPropertyValue('--hero-b') || '#f7f7f5')];
  };
  let [ca, cb] = colours(), frame = 0;
  const draw = () => {
    if (!alive) return;
    for (let k = 0; k < sweepsPerFrame; k++) sweep(st);
    if (frame++ % 60 === 0) [ca, cb] = colours();
    const px = img.data;
    for (let i = 0; i < st.s.length; i++) { const c = st.s[i] > 0 ? ca : cb; const o = i * 4; px[o] = c[0]; px[o + 1] = c[1]; px[o + 2] = c[2]; px[o + 3] = 255; }
    octx.putImageData(img, 0, 0);
    const W = canvas.clientWidth || 800, H = canvas.clientHeight || 450;
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, W, H);
    raf = requestAnimationFrame(draw);
  };
  raf = requestAnimationFrame(draw);
  return () => { alive = false; cancelAnimationFrame(raf); };
}
