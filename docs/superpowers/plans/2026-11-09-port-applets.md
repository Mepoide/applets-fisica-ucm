# Port Applets UCM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Six Java applets become static bilingual web pages with audited, tested physics and per-applet theory/didactic docs.

**Architecture:** Each applet is `model.js` (pure physics, Node-testable) + `view.js` (canvas/controls) + `index.html`, on top of a tiny shared `lib/` (plot, loop, ui, i18n, stats, rng, docs). Tests: `node --test` for physics, Playwright smoke for pages.

**Tech Stack:** ES modules, Canvas 2D, node:test (Node 22), Playwright (preinstalled chromium), marked + KaTeX via cdnjs for theory tab.

**Spec:** `docs/superpowers/specs/2026-11-09-port-applets-design.md`

## Global Constraints

- No build step, no runtime npm dependencies; `package.json` has scripts only.
- All user-visible text through `i18n.t(key)`, ES and EN both present.
- `model.js` never imports DOM; takes an `rng()` function returning [0,1).
- Commit after each task; push after each applet task.
- Document every physics change in `docs/audit/README.md` (table: applet, finding, evidence, fix).

## Review Focus

1. Non-numeric or out-of-range inputs in parameter fields must fall back to defaults, not NaN the simulation (Task 2 ui test + each view).
2. Pause then Reset must give a fresh state, not resume the old loop (Task 2 loop test).
3. Maxwell with N near max and overlapping initial disks must not spin forever in collision resolution (Task 3 test: 150 disks, 1000 steps, finite).
4. Fluctuaciones with a window that covers the whole box (p=1) must show a delta histogram and binomial variance 0 without division by zero (Task 5 test).
5. Von Kármán wall nodes must conserve particle count in both sub-steps (Task 8 test).

---

### Task 1: Repo skeleton and shared lib core (rng, stats, i18n)

**Files:** Create `package.json`, `.gitignore`, `README.md`, `lib/rng.js`, `lib/stats.js`, `lib/i18n.js`, `tests/stats.test.js`, `tests/i18n.test.js`.

**Produces:** `rng.mulberry32(seed) -> () => number`; `stats.histogram(values, min, max, bins) -> Uint32Array`; `stats.lgamma(x)`; `stats.poissonPmf(k, lambda)`; `stats.binomialPmf(k, n, p)`; `stats.mean(arr)`, `stats.variance(arr)`; `i18n.setLang('es'|'en')`, `i18n.t(key)`, `i18n.lang`, `i18n.register({es:{}, en:{}})`, `i18n.apply(root)` for `[data-i18n]`.

- [ ] Tests: `lgamma(5) ≈ ln 24`, `Σ poissonPmf(k,3) ≈ 1`, `Σ binomialPmf(k,10,0.3) ≈ 1`, histogram bin edges half-open, `t()` falls back to key and to ES when EN missing.
- [ ] Implement; `npm test` passes; commit.

### Task 2: plot, loop, ui, docs tab, site shell

**Files:** Create `lib/plot.js`, `lib/loop.js`, `lib/ui.js`, `lib/docs.js`, `assets/style.css`, `index.html`, `tests/loop.test.js`, `tests/ui.test.js`.

**Produces:** `new Plot(canvas, {xmin,xmax,ymin,ymax, xlabel, ylabel, axes:true})` with `setScales()`, `clear()`, `line(x1,y1,x2,y2)`, `polyline(xs,ys)`, `bar(x1,x2,h)`, `rect(x,y,w,h)`, `text(x,y,str)`, `color(c)`, `toPixel(x,y)`, `fromPixel(px,py)`, and `resize()` honoring devicePixelRatio. `new Loop({step, draw, stepsPerFrame})` with `start()`, `pause()`, `toggle()`, `reset()`, `running`; uses injectable `raf` for tests. `ui.numberField({label,value,min,max,step,parse})` returns `{el, get()}` where `get()` clamps and falls back to default on NaN. `docs.mount(container, slug)` fetches `docs/<lang>/<slug>.md` and renders; raw text fallback.

- [ ] Tests: loop with fake raf runs `stepsPerFrame` steps per tick; `pause()` then `reset()` calls the reset callback and `running===false`; numberField get() on "abc" returns default, on 1e9 returns max.
- [ ] Implement; landing `index.html` lists six applets with ES/EN toggle; commit.

### Task 3: Applet `maxwell`

**Files:** `applets/maxwell/{model.js,view.js,index.html}`, `tests/maxwell.test.js`, `docs/{es,en}/maxwell.md`.

**Model:** `create({N, L, radius, dist, rng})` with `dist ∈ {'angle','vxvy','vyRandomVxFixed','fixed'}`; `step(state)` does event-aware pair collisions within the time step (complete the remaining `1-deltat` of motion after a collision, resolve initial overlaps by rejection sampling at placement); `kineticTemperature(state) = Σ½mv²/N` (2D: kT); `speedHistogram(state, bins, vmax)`; `maxwell2D(v, kT, m)`; `collisionsPerParticle(state) = 2·Ncol/N`; `vmax = 4·sqrt(2kT/m)`.

- [ ] Tests (seed fixed): energy and total momentum conserved to 1e-9 over 500 steps with N=60; N=150 in a 200×200 box terminates 1000 steps with no NaN; after 3000 steps from `'fixed'` the speed histogram vs `maxwell2D` passes χ² at p>0.001 with 12 bins (document threshold).
- [ ] View: box + histogram with analytic curve, counter of collisions per particle, distribution select; commit; push.
- [ ] Docs (ES/EN): Maxwell 2D derivation, equipartition in 2D, algorithm, changes vs original (factor 4 in counter, time-step completion, overlaps, vmax), didactic evaluation.

### Task 4: Applet `pila-arena`

**Model:** `create({columns, hc, mode:'fixed'|'oslo', rng})`; `addGrain(state)` drops at column 0 then relaxes fully, returning avalanche size (number of topplings) and duration; `heights`; grains leaving at the right boundary counted in `state.out`; Oslo mode draws threshold ∈{1,2} per site after each toppling.
- [ ] Tests: grain conservation `added = Σh + out`; fixed mode reaches stationary staircase where every avalanche size after transient equals a constant; Oslo mode over 20000 grains yields avalanche-size histogram spanning ≥2 decades.
- [ ] View: animated grains (one toppling per frame, speed control), right plot switchable: height profile / avalanche size vs time / log-log size distribution. Commit, push, docs (BTW vs Oslo, why 1D fixed threshold is trivial, SOC, exponents).

### Task 5: Applet `fluctuaciones`

**Model:** `create({N, kT, box:{w,h}, rng})` ideal gas, specular walls, Box–Muller Maxwellian; `step(state, dt)`; `countInWindow(state, win)`; `occupationStats(history) -> {mean, variance, histogram}`; `autocorrelation(series, maxLag) -> Float64Array` normalized C(0)=1; `expectedPmf(N, p) -> {poisson, binomial}` with `p = winArea/boxArea`.
- [ ] Tests: window = whole box gives count N always, binomial variance 0, no NaN; mean count over 20000 steps within 3σ of Np; autocorrelation of a constant is all 1s, of white noise decays below 0.1 by lag 2.
- [ ] View: drag rectangle on canvas (pointer events), N(t) strip chart, histogram with Poisson and binomial overlays, autocorrelation panel. Commit, push, docs (canonical vs grand canonical, binomial→Poisson limit, correlation time ~ window size / thermal speed).

### Task 6: Applet `onda-lgca` (FHP with rest particle)

**Files:** shared `applets/_fhp/fhp.js` (used by Task 8 too), `applets/onda-lgca/*`, `tests/fhp.test.js`, `tests/onda.test.js`.

**fhp.js:** `DIRS` (6 unit vectors + rest), `buildTables() -> {coll1, coll2, dens, vx:Float64Array, vy:Float64Array}` from the original rule set; `createLattice(nx, ny)`; `streamCollide(src, dst, table, nx, ny, opts)` with periodic y optional and `solid` mask; `coarseGrain(lattice, box) -> {rho, ux, uy}` with float velocities.
- [ ] Tests: for all 128 states, `dens[coll1[s]]===dens[s]` and momentum (float vx,vy) equal to 1e-12; same for coll2; streaming on a periodic lattice conserves total particles over 100 steps; a single particle moving in direction k returns to start after nx steps.
- [ ] Onda model: elliptical hole radius param, measure `radialProfile(state, nRings)` and `stripProfile(state, halfWidth)` as mean occupation per node (0–7); view shows lattice greyscale + profile (radial or strip, toggle), time-average toggle. Commit, push, docs (FHP, sound speed c_s = 1/√2 in lattice units for FHP-I; measure wavefront speed vs t in the test: front position grows linearly, slope within 15% of expected).

### Task 7: Applet `modos-lineales`

**Model:** `fields(x, t, {cs, gammaS, DT, gamma}) -> {drho, u, dT}` from a rederived solution of linearized hydrodynamics for an initial δρ Gaussian of width σ (regularizes t=0): Brillouin weight `1/γ` split in two, Rayleigh weight `1−1/γ`, with `γ = cp/cv`; `DT = κ/(ρ cp)`.
- [ ] Tests: `∫ drho dx` conserved in t (mass); weights sum to 1; at t→0 drho equals the initial Gaussian; `u` antisymmetric in x; when `γ=1` the thermal part vanishes.
- [ ] View: three stacked curves with toggles D/Ux/T (buttons now functional), sliders cs, Γs, κ, γ, σ, time scrub. Commit, push, docs with the derivation (Landau–Placzek), clarifying the (cp−cv)/cv vs (cp−cv)/cp issue.

### Task 8: Applet `von-karman`

**Model:** uses `fhp.js`; `create({nx, ny, inflowProb, obstacle:{x0,len,y}, wallRule:'specular'|'bounceback', rng})`; inflow row at top injects state 97 with prob `inflowProb`, outflow row at bottom emptied each step; obstacle = solid mask handled in `streamCollide` on both sub-steps; `velocityField(state, box)` via `coarseGrain`.
- [ ] Tests: with inflow 0 and periodic x, closed top/bottom and the plate present, particle count constant over 200 steps for both wall rules; velocity field of a uniform rightward beam gives ux>0, uy≈0 (checks the diagonal-components bug is gone).
- [ ] View: density greyscale + velocity arrows, controls inflow, plate length, wall rule, box size; commit, push; docs (why original lost mass and had integer velocities, slip vs no-slip, Reynolds in LGCA, what you can and cannot expect to see).

### Task 9: Browser smoke tests and screenshots

**Files:** `tests/browser/smoke.mjs`, `docs/screenshots/*.png`, `package.json` script `test:browser`.
- [ ] Script serves repo with `python3 -m http.server`, loads each applet in both languages, clicks Start, waits 1 s, asserts no console errors and canvas pixel checksum changed; saves screenshots. Run; fix failures; commit.

### Task 10: Audit report and didactic evaluation

**Files:** `docs/audit/README.md`, `docs/evaluacion-didactica.md` (ES then EN).
- [ ] Consolidate the findings table (from docs per applet) with evidence (test names) and fixes; didactic evaluation per applet: interactivity, learning outcome, limits, proposed improvements, candidates for new applets. Update README links. Commit, push.
