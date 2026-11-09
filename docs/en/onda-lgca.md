# FHP lattice gas: sound wave and density profile

## What you see

A lattice-gas cellular automaton (LGCA) on a periodic hexagonal lattice. Each node can hold
up to 7 particles: one at rest and one per each of the six directions. Initially the gas is
uniform except for an empty **circular hole** in the centre. The gas rushes into the hole
and the perturbation propagates outward as a **cylindrical sound wave**: the radial density
profile shows a minimum (rarefaction) moving at constant speed, the lattice sound speed.

## Physical model

**The FHP model** (Frisch, Hasslacher and Pomeau, 1986) is the simplest lattice-gas
automaton whose macroscopic behaviour is the Navier–Stokes equations: hexagonal symmetry is
enough for the momentum-flux tensor to be isotropic, which fails on the square lattice
(HPP). The rules: at every step particles hop to the neighbouring node along their direction
(propagation), then at every node the state is transformed by a collision table that
**conserves particle number and momentum**. With a rest particle (FHP-II/III) kinetic
energy is not separately conserved, which is not needed for isothermal hydrodynamics, and
one gains an extra density variable and a lower viscosity.

The collisions used (those of the 2003 applet) are:

- two-body head-on $\{k, k+3\} \to \{k\pm1, k+4\pm1\}$, alternating chirality ($+60°$ on
  even steps, $-60°$ on odd ones) so as not to break mirror symmetry;
- symmetric three-body $\{1,3,5\}\leftrightarrow\{2,4,6\}$;
- rest + mover $k \to \{k-1, k+1\}$ and its inverse;
- the same with a spectator rest particle, and the particle–hole **duals** ($s \to 127 - s$).

The test `tests/fhp.test.js` checks that all 128 entries of both tables conserve mass and
momentum and are permutations: the original table was correct.

**Sound speed.** In a lattice gas with $b$ states, $b_m$ of them moving at speed $c$, in
$D=2$ the pressure at rest is $p = \frac{b_m}{b}\frac{c^2}{D}\rho$, hence

$$ c_s^2 = \frac{b_m}{b}\,\frac{c^2}{D} = \frac{6}{7}\cdot\frac12 = \frac37,\qquad c_s \simeq 0.655 $$

nodes per step, **independent of density**. (Without rest particle, FHP-I,
$c_s = 1/\sqrt2$.) This is what the applet tests: the measured front must follow
$r(t) = r_0 + c_s t$ for any $f$.

**Density profile.** The mean occupation $\langle n\rangle$ of a node is $7f$ with $f$ the
occupation probability of each channel. The wave emitted by a cylindrical hole is a
rarefaction decaying as $r^{-1/2}$ (energy-flux conservation in 2D) and broadened by the
lattice-gas viscosity; behind the front the hole fills up.

## Simulation algorithm

Lattice of $L\times L$ nodes in skewed coordinates: node $(i_x,i_y)$ sits at
$x = i_x - i_y/2$, $y = i_y\sqrt3/2$. One step = propagation (each node collects the
particle arriving from each neighbour) + collision (table). Radial profile: mean occupation
in rings of width 1 around the centre, with Euclidean distances in physical coordinates.
Strip profile: mean over $\pm20$ rows, binned by physical $x$. The front is located as the
minimum of the radial profile outside the hole.

## Questions

1. Measure the wave-front speed from two instants and compare it with c_s = √(3/7) in lattice units. Does it depend on the gas density?
2. Increase the amplitude of the initial perturbation: does the linear prediction still hold? What sign of nonlinearity appears?
3. Why does the wave damp? Relate the amplitude decay to the viscosity of the FHP gas.

## Changes with respect to the original applet

| Original | Here | Reason |
|---|---|---|
| "Elliptical" hole: the condition used $\tfrac32(i_y-y_c)^2$ instead of $\tfrac34$ | Disk in physical coordinates | The original was a 2:1 squashed ellipse |
| Strip profile summing 41 rows without dividing, fixed axes 25–75 (v4: 25–65), mixing rows shifted in $x$ | Mean occupation per node (0–7), correct axes, binning by physical $x$ | The original scale did not match the plotted quantity |
| Strip profile only (v4) or ring profile in index space only (v2) | Both profiles selectable, optional time averaging | |
| No theoretical reference | Circle and blue line at $r_0+c_s t$, readout of the measured front | Turns the animation into a measurement |
| Fixed 250×250 lattice, density 0.7 | Adjustable size, density and radius | |

## Tests

`tests/fhp.test.js`: mass and momentum conservation over all 128 entries of both tables;
periodic streaming conserving particles and momentum; single-particle trajectories;
reflection at solid nodes (for the Von Kármán applet); box averaging.
`tests/onda.test.js`: empty hole and correct outside density; particle conservation; front
speed within 15 % of $\sqrt{3/7}$ (measured 0.61–0.73 for $f$ = 0.3–0.7); strip profile
with the hole at the centre.

## Didactic evaluation

**What it delivers.** It shows that a set of local Boolean rules produces a macroscopic
wave phenomenon with an analytically predicted speed, and that this speed does not depend on
density. A good introduction to lattice gases and, by extension, to lattice Boltzmann
methods.

**Proposed improvements.** Measure the attenuation and from it the viscosity; emit a plane
wave (retreating wall) to see dispersion; compare FHP-I (no rest particle) with FHP-II to
illustrate the change in $c_s$. Also visualise the local velocity (arrows) as in the Von
Kármán applet.
