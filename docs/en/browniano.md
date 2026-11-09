# Brownian motion

## What you see

A large, heavy disk (the pollen grain) in a bath of small, light hard disks (the fluid molecules). The atomic view shows the collisions; the "microscope" shows only the grain and its trace, magnified, as Brown saw them in 1827. The mean-squared displacement plot $\langle\Delta r^2\rangle(t)$ lets you measure the diffusion coefficient $D$, and the panel checks equipartition: the mean kinetic energy of the grain tends to $kT$ even though it weighs twenty times more than a molecule.

## Physical model

At every instant the grain receives many molecular impacts from all directions. The number of impacts per side fluctuates, and those fluctuations are the random force that moves it: this is Einstein's (1905) and Smoluchowski's argument. Between collisions the motion is ballistic; at long times, once the grain has forgotten its velocity, it is diffusive:

$$\langle \Delta r^2 \rangle = 4 D t \quad (\text{in two dimensions}),$$

with $D = kT/\zeta$ (Einstein relation) and $\zeta$ the friction coefficient. For hard disks Enskog theory gives $\zeta = \tfrac83\, n\,\sigma_{12}\sqrt{2\pi\mu kT}$, with $n$ the bath density, $\sigma_{12} = R + r$ and $\mu$ the reduced mass; it is drawn as an order of magnitude. In equilibrium, moreover, $\tfrac12 M\langle V^2\rangle = kT$ (two degrees of freedom): the heavy grain has the same mean kinetic energy as a molecule but a velocity $\sqrt{M/m}$ times smaller, which is why its motion looks slow and erratic.

The box is finite and the grain cannot wander farther than $\sim L$: at long times the MSD saturates. $D$ is fitted in the intermediate window, past the ballistic regime and while $(L/8)^2 < \langle\Delta r^2\rangle < (L/3)^2$ (light grey lines).

## Algorithm

Event-driven hard-disk engine (`applets/_kinetic/disks.js`) with per-particle masses and radii: disk 0 has mass $M$ and radius $R$; the bath has mass 1 and radius 3, Maxwellian velocities at $kT$. The grain's trace is stored every step; the MSD is averaged over time origins; $D$ by least squares of $\langle\Delta r^2\rangle$ against $4t$ in the diffusive window. The grain's kinetic energy is averaged with a 2000-step moving window.

## Changes with respect to the original applet

| Original (`BrownianApplet`, M. Fowler, U. Virginia) | Here | Reason |
|---|---|---|
| External applet, code unavailable | Own implementation on the phase-1 engine | Same physics, verifiable |
| Visualisation only | MSD, $D$ fit, equipartition and Enskog estimate | Measure, not just watch |
| Parameters: `nballs`, `massratio`, `averagevelocity` | Molecules, mass ratio, radius ratio and $kT$ | Explore both limits (ballistic and diffusive) |

## Tests

`tests/browniano.test.js`: with $M/m = 20$, $R/r = 4$ and 40 molecules the grain's mean kinetic energy equals $kT$ within 20 % after $2\cdot10^4$ steps; the MSD grows and its fit in the diffusive window gives $D > 0$ with $R^2 > 0.9$; the Enskog estimate is finite and positive. Engine: `tests/disks.test.js` (collisions of unequal masses conserve momentum and energy).

## Didactic assessment

It makes the connection between microscopic fluctuations and macroscopic diffusion visible, and gives a quantitative measurement ($D$, equipartition) accessible to the student. Source: *Experimentos Interactivos* course (UCM), experiment 6 of Non-equilibrium Systems, R. Brito and J. M. R. Parrondo.
