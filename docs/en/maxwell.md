# Hard disks and the Maxwell distribution

## What you see

N rigid disks move in a square box and collide elastically with each other and with the
walls. On the right, the speed histogram $N(v)$ is compared with the two-dimensional
Maxwell distribution with the same total energy. Whatever the initial distribution (even
all particles with the same velocity), the histogram ends up fluctuating around the
Maxwell curve: deterministic, reversible microscopic dynamics drives the system to
equilibrium.

## Physical model

Particles of mass $m$ and radius $R$ with hard-sphere interaction. In equilibrium the
velocity distribution is Maxwell–Boltzmann. In **two dimensions** the probability density
of the speed $v$ is

$$ f(v)\,dv = \frac{m v}{k_B T}\, e^{-m v^2/2k_BT}\, dv , $$

obtained by integrating the Gaussian $\propto e^{-m(v_x^2+v_y^2)/2k_BT}$ over the angle
($2\pi v\,dv$). Compared with the 3D formula (which carries $v^2$), the 2D curve starts
linearly at $v=0$ and peaks at $v_p=\sqrt{k_BT/m}$. Useful moments:

$$ \langle v\rangle = \sqrt{\frac{\pi k_BT}{2m}},\qquad \langle v^2\rangle = \frac{2k_BT}{m}. $$

Temperature is defined through equipartition: two quadratic degrees of freedom, each with
$\tfrac12 k_BT$, hence

$$ k_BT = \frac{1}{N}\sum_i \tfrac12 m v_i^2 . $$

Energy is conserved exactly in collisions, so $k_BT$ is fixed by the initial condition and
the blue curve never changes.

The expected number of particles in $[v_1,v_2]$ is
$N\,[e^{-mv_1^2/2k_BT}-e^{-mv_2^2/2k_BT}]$; that is what is drawn (not the midpoint density
times the bin width).

## Simulation algorithm

The 2003 original advanced every particle by $\Delta t = 1$ and then looked for pairs that
had crossed during the step, moving them back to the contact instant. Here the dynamics is
**event-driven** within each step: for each disk the time of its next collision (with a disk
or a wall) is computed, the system is advanced to the earliest event, the collision is
applied and only the affected disks' event times are recomputed, until $\Delta t$ is used
up. For hard spheres this is exact: energy is conserved to round-off, there are no overlaps
and no fast particle can tunnel through another.

Elastic collision of equal masses: with $\hat n$ the unit vector joining the centres, only
the normal velocity component is exchanged,
$\vec v_i' = \vec v_i - (\Delta\vec v\cdot\hat n)\hat n$, $\vec v_k' = \vec v_k + (\Delta\vec v\cdot\hat n)\hat n$.

Contact time: with $\vec r = \vec r_k-\vec r_i$ and $\vec u=\vec v_k-\vec v_i$, a collision
occurs if $\vec r\cdot\vec u<0$ and the discriminant $(\vec r\cdot\vec u)^2 - u^2 (r^2-4R^2)$
is positive; then $t_c = \left[-\vec r\cdot\vec u - \sqrt{\cdot}\right]/u^2$.

Initial positions are drawn without overlap (rejection sampling; at high packing fraction a
hexagonal grid is used instead).

## Changes with respect to the original applet

| Original | Here | Reason |
|---|---|---|
| Collisions detected after the step, sequential pairwise resolution, remainder of the step after a collision not completed | Event-driven dynamics | Exact energy conservation, no overlaps or tunnelling |
| "Collisions per particle" = $N_{col}/2N$ | $2N_{col}/N$ | Each collision involves two particles; the original was off by a factor 4 |
| Random initial positions possibly overlapping (and the $y$ coordinate used the $x$ margin) | Non-overlapping | Overlapping disks produce spurious collisions |
| Histogram $v_{max}$ fixed per distribution type | $v_{max}=4\sqrt{k_BT/m}$ | Negligible tail ($e^{-8}$) for any $k_BT$ |
| Inclusive bin edges (`>=` and `<=`) | Half-open | Avoids double counting at edges |
| Theoretical curve $N\Delta v f(v)$ evaluated at edges | Exact per-bin integral | Matches what the histogram measures |
| — | Optional time-averaged histogram | Shows convergence even with few disks |

## Tests

`tests/maxwell.test.js`: energy conservation to $10^{-9}$ relative over 500 steps with 60
disks and no overlaps; momentum conservation in the binary collision; 150 disks over 1000
steps with no NaN and all inside the box; 300 disks placed without overlap; convergence of
the time-averaged histogram to 2D Maxwell from the "all with $v_x=v_y=1$" initial
condition ($\chi^2$ with $p>10^{-3}$ and mean speed within 5 % of $\sqrt{\pi k_BT/2m}$).

## Didactic evaluation

**What it delivers.** The central idea (emergent equilibrium from any initial condition
and the 2D Maxwell shape) is visible within seconds. The "all with the same velocity" case
is especially instructive: there are no collisions until the walls break the symmetry.

**Controls.** N, radius, initial distribution, time averaging, animation speed. Readouts:
time, $k_BT$, collisions per particle, wall collisions.

**Limitations and proposed improvements.** There is no quantitative measure of
convergence (for instance the Boltzmann entropy $H(t)=-\sum_b p_b\ln p_b$ of the histogram,
which should grow and saturate); that would be the most valuable addition. Also: a
histogram of $v_x$ (Gaussian) next to that of $v$, and a measurement of the mean free path
against the 2D prediction $\lambda = 1/(2\sqrt2\, n R)$. Each is an afternoon of work.
