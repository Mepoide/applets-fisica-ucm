# Sound waves in a fluid

## What you see

Two views. **A**: an FHP lattice gas with a circular density hole at the centre. The surrounding matter rushes into the hole, overshoots and creates a rarefaction ring that moves away at the lattice sound speed, $c_s = \sqrt{3/7} \approx 0.655$ nodes per step. The linear acoustic prediction for that same hole is drawn over the measured radial profile. **B**: the analytic solution of linearized hydrodynamics for a density perturbation in a real fluid, with its two sound pulses and its thermal peak. This is the physics of the `onda-lgca` and `modos-lineales` sheets, brought together as experiment 4 of the original course.

## Physical model

Linearizing the Navier–Stokes equations around rest and Fourier-transforming, the density obeys

$$n(k,t) = \Big[\tfrac{c_v}{c_p}\cos(c_s k t)\,e^{-\Gamma_s k^2 t} + \tfrac{c_p - c_v}{c_p}\,e^{-\kappa k^2 t/(n c_p)}\Big]\,n(k,0),$$

two damped sound modes (weight $1/\gamma$) and one diffusive thermal mode (weight $1 - 1/\gamma$): the Landau–Placzek weights. View B shows them in real space: $\delta\rho$, the velocity $u$ (from continuity) and $\delta T$, which vanishes at $t = 0$ because sound is adiabatic and the thermal mode isobaric.

The FHP lattice gas conserves mass and momentum but has no independent energy (all moving particles share one speed): it is **athermal**. There is no thermal mode, $c_p = c_v$, and the equation above reduces to $n(k,t) = \cos(c_s k t)\,e^{-\Gamma k^2 t}\,n(k,0)$. For a hole of radius $R$ in a gas of occupation $n_0 = 7f$, the Hankel transform of the initial condition is $-n_0\,2\pi R\,J_1(kR)/k$ and

$$\delta n(r,t) = -n_0 R \int_0^\infty J_1(kR)\,J_0(kr)\,\cos(c_s k t)\,e^{-\Gamma k^2 t}\,dk,$$

which is the blue curve. The FHP-III sound speed is exact, $c_s^2 = 3/7$; the attenuation $\Gamma$ is taken equal to the Boltzmann kinematic viscosity $\nu(f)$, its correct order of magnitude (the bulk viscosity of the rest-particle model is comparable to $\nu$). The hole is a 100 % perturbation, so linear theory gets the position and shape of the front right but only approximates its amplitude; the discrepancy measures the nonlinear effect.

## Algorithm

View A: `applets/onda-lgca` (FHP automaton with rest particle, radial profile by rings, front as the profile minimum). The linear prediction is integrated numerically in $k$ with rational Bessel approximations (`lib/bessel.js`), 600 nodes up to $k_{\max} = 40/R$. View B: `applets/modos-lineales` (analytic solution, Gaussians of variance $\sigma^2 + 2\Gamma t$ and $\sigma^2 + 2 D_T t$).

## Questions

1. In the FHP view measure the front speed and compare it with the overlaid acoustic prediction. Why does the FHP have no thermal mode while a real fluid does?
2. In the linear view, identify the two Brillouin peaks and the Rayleigh one. Which parameter controls the relative height of the central one?
3. Reduce the radius of the initial perturbation in the FHP: how does the relative noise change? Which average improves the comparison with theory?

## Changes with respect to the original applet

| Original (`ejerc2`/`ejerc23`, 2003) | Here | Reason |
|---|---|---|
| Density in a fixed "small red square" vs time | Full radial profile and front position vs $c_s t$ | The quantity theory predicts is the profile |
| No quantitative comparison with eq. (1) of the course | Linear prediction overlaid, $c_s$, $\nu$ and $\Gamma$ in the panel | See the equation and the simulation together |
| Theory with a thermal mode applied to an athermal model | The difference is explained and view B shows the thermal mode where it exists | Physical consistency |
| Elliptical hole (condition $\tfrac32(i_y - y_c)^2$) | Disk in physical coordinates | Phase-1 correction |

## Tests

`tests/ondas.test.js`: $J_0$, $J_1$ against tabulated values; the linear prediction reproduces the hole at $t = 0$ and its minimum advances at $c_s$ between $t = 15$ and $t = 30$; the simulated front ($N = 160^2$, $f = 0.3$) advances at $c_s$ within 15 %. Plus the phase-1 `tests/onda.test.js` and `tests/modos.test.js`.

## Didactic assessment

It joins the "numerical experiment" with the theory describing it on the same plot, and makes explicit a limitation of the model (athermal) that usually goes unnoticed. View B lets you play with $\gamma$, $\Gamma$ and $D_T$ and see the Landau–Placzek weights. Source: *Experimentos Interactivos* course (UCM), experiment 4 of Non-equilibrium Systems, R. Brito; FHP applet by Mario Encinar (TAD 2003).
