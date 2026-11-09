# Lattice gas with an obstacle: the Von Kármán street

## What you see

An FHP lattice-gas stream hits a flat plate perpendicular to the flow. A wake forms behind
the plate; if the Reynolds number is large enough the wake becomes unstable and sheds
alternating vortices: the **Von Kármán vortex street**. The velocity field is averaged over
boxes of nodes and drawn with arrows; colour shows density, speed or vorticity.

## Physical model

The FHP automaton with a rest particle (7 bits per node; see the sound-wave applet) has as
macroscopic limit the **modified** Navier–Stokes equations

$$ \partial_t(\rho\,\vec u) + g(\rho)\,\nabla\!\cdot(\rho\,\vec u\vec u) = -\nabla p + \nu\,\nabla^2(\rho\vec u) , $$

with two peculiarities compared with a real fluid:

1. **Galilean factor** $g(\rho)$: the advection term carries a prefactor which, for 7-bit
   models with Fermi–Dirac equilibrium, is
   $$ g(f) = \frac{7}{12}\,\frac{1-2f}{1-f}, $$
   where $f = \rho/7$ is the mean occupation per channel. **At $f = 1/2$, $g = 0$**: the flow
   is linear (Stokes) and no vortex shedding is possible. Hence one must work at low
   density, $f \approx 0.2$–$0.3$. The effective Reynolds number is
   $$ \mathrm{Re} = \frac{g(f)\,u\,L}{\nu(f)} . $$
2. **Density-dependent viscosity.** For FHP-III (all collisions)
   $$ \nu(f) = \frac{1}{28}\,\frac{1}{f(1-f)^3\,[1-8f(1-f)/7]} - \frac18 , $$
   in lattice units. Our collision set is a subset (extended FHP-II), so the actual
   viscosity is somewhat larger; the displayed value is a reference.

The lattice gas is moreover compressible with $c_s = \sqrt{3/7} \approx 0.655$: keep
$u/c_s \lesssim 0.4$ for nearly incompressible flow. With $L = 40$, $f=0.25$, $u = 0.25$:
$g \approx 0.39$, $\nu \approx 0.36$, Re $\approx 11$. The Von Kármán street appears behind a
cylinder for Re $\gtrsim 47$; for a flat plate the threshold is somewhat lower but still
needs long plates ($L \sim 100$–$200$) or large lattices: in the browser this takes
patience (high speed, several thousand steps) and the time-averaged field, which removes the
lattice gas statistical noise. With modest parameters what one sees is the symmetric wake
with two recirculating vortices, already a qualitative check of emergent hydrodynamics.

**Boundary conditions.** The channel is periodic in both directions. In three inlet rows
the channel occupations are re-sampled every step from the equilibrium at density $f$ and
velocity $u$: $f_k = f\,[1 + a\,\hat c_k\cdot\hat u]$ with $a = 7u/3$, which gives a mean
velocity of exactly $u$. This zone drives the flow and, thanks to periodicity, also serves as
the downstream medium of the outlet, avoiding the suction an empty edge would produce. The
plate is a row of solid nodes: every arriving particle is reflected (bounce-back,
$\vec c\to-\vec c$, giving no-slip; or specular, giving slip) and re-enters the fluid on the
next step. Reflection is applied in both sub-steps of the cycle, so the wall conserves mass
exactly.

## Questions

1. With f = 0.5 the velocity does not transport momentum (g(f) = 0). What do you see in the wake? Lower f to 0.25 and compare.
2. Estimate the effective Reynolds number from u, the plate size and the gas viscosity. Is it enough for a clear vortex street?
3. Increase u towards the speed of sound: which artefacts appear? Why is the FHP unreliable at high Mach?

## Changes with respect to the original applet

| Original | Here | Reason |
|---|---|---|
| Velocity table in **integer** arithmetic: `(1/2)*…` is 0 and `vy *= √3/2` is truncated | Floating-point tables | The original velocity field ignored the diagonal components |
| `densidadsuma` accumulated without reset, velocities ×10⁶ and saturated | Correct box average (momentum/particles) | The original arrows were essentially saturated noise |
| In the second sub-step wall nodes read `n1` and wrote `n2` (copy-paste): the wall **absorbed** particles every other step | Reflection in both sub-steps | Mass conservation (tested) |
| Row 0 never updated: acted as a constant random source; injection of state 97 (rest + two downward movers: Mach 1.3) with probability `fvel` | Equilibrium inflow zone with adjustable, subsonic $u$ | Physical, controllable flow |
| Fixed density $f = 0.5$ | Adjustable $f$, default 0.25 | $g(0.5)=0$: without advection there is no vortex street |
| Arrows only | Density, speed or vorticity in colour, time averaging, relative arrows | Time-averaged vorticity is what makes the wake visible |
| No numbers | Readout of $g$, $\nu$, Re and Mach | |

The original collision tables and specular wall rules were correct (mass and momentum
conserved; checked over all 128 entries).

## Tests

`tests/vonkarman.test.js`: inflow-zone probabilities give exactly the requested velocity;
with the inflow disabled the plate conserves mass over 300 steps for both wall rules; the
channel without plate reaches the inflow velocity downstream within 20 %; the averaged field
points along the stream and a uniform beam has zero vorticity; $g(1/2)=0$ and $\nu(f)$
finite and positive. `tests/fhp.test.js` covers reflection, periodicity and conservation.

## Didactic evaluation

**What it delivers.** The most ambitious applet: it shows nonlinear hydrodynamics emerging
from Boolean rules and naturally introduces concepts absent from textbook fluids (Galilean
factor, lattice viscosity, compressibility). The Re and Mach readouts let one reason about
what should be seen and why it is not.

**Limitations.** A lattice gas in JavaScript with $160\times400$ nodes is noisy and slow to
reach Re $\sim 50$–$100$ cleanly. Clear alternating shedding requires long plates and tens
of thousands of steps.

**Improvements.** (1) Replace FHP with a **lattice Boltzmann** (D2Q9, BGK) with the same
controls: no noise, arbitrary Re, Von Kármán street in seconds; FHP would remain as an
optional "microscope". (2) Measure the Strouhal number of the shedding
($\mathrm{St} = fL/u \approx 0.2$) by recording the transverse velocity at a point in the
wake. (3) Circular obstacle in addition to the plate.
