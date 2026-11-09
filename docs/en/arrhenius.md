# Activation processes: Arrhenius law

## What you see

Brownian particles (Metropolis walkers) in a tilted double well, $V(x) = (x^2-1)^2 + A\,x$. All of them start in the **metastable** well, the higher one, and can only leave it thanks to the thermal fluctuations that lift them to the barrier. On the right, the number of particles left in the well, $N_{\rm meta}(t)$, against three exponential predictions $N_0 e^{-kt}$: the exact lattice Kramers rate (blue), its harmonic Arrhenius approximation (grey) and the estimate of the original course (dotted).

## Physical model

If every particle leaves the well with probability $k$ per unit time, $\dot N_{\rm meta} = -k N_{\rm meta}$ and $N_{\rm meta}(t) = N_0 e^{-kt}$. The problem is computing $k$. For an overdamped particle (diffusion with coefficient $D$ in the potential $V$), the mean first-passage time gives the exact **flux-over-population** result:

$$k = \frac{D}{\displaystyle\int_{\rm well} e^{-V/kT}\,dx\;\int_{\rm barrier} e^{+V/kT}\,dx}.$$

Approximating the well by a parabola of frequency $\omega_{\rm m} = \sqrt{V''(x_{\rm m})}$ and the barrier by an inverted parabola of curvature $\omega_{\rm M} = \sqrt{|V''(x_{\rm M})|}$ (valid if $kT \ll \Delta E$), both integrals are Gaussian and one obtains the **Kramers–Arrhenius** formula

$$k_{\rm Arr} = \frac{\omega_{\rm m}\,\omega_{\rm M}}{2\pi\gamma}\,e^{-\Delta E/kT},\qquad \gamma = \frac{kT}{D},$$

with $\Delta E = V(x_{\rm M}) - V(x_{\rm m})$: the Arrhenius factor $e^{-\Delta E/kT}$ governs the temperature dependence of countless chemical reactions and biological processes.

The Metropolis walker with step $\Delta x$ is a discretisation of that diffusion with $D = \Delta x^2/2$. The original course estimate, $k = e^{-V(x_{\rm M})/kT}/(2\Delta t \sum_{\rm well} e^{-V/kT})$, counts as escaped every particle that, sitting on top of the barrier, steps outward; on a fine lattice most of them fall back into the well, so that formula overestimates $k$. That is why all three are shown.

## Algorithm

Lattice of 161 sites on $[-2, 2]$ ($\Delta x = 0.025$), `applets/_walkers/metropolis.js`. $N_{\rm meta}$ counts the particles to the right of the maximum (for $A > 0$). The fitted rate is the slope of the regression of $\ln N_{\rm meta}$ against $t$ while $N_{\rm meta} > N_0 e^{-3}$. The Kramers integrals are evaluated as lattice sums.

## Questions

1. Measure the rate k at three temperatures and plot ln k versus 1/kT. Do you get a straight line? What barrier height comes from the slope?
2. Compare the three theoretical rates with the fit: which one is right? Why does the original sheet's estimate overestimate k so much?
3. Make the exit well asymmetric: does the rate change? What does Kramers' formula say about the curvature at the minimum?

## Changes with respect to the original applet

| Original (`ejerc6`, 2002) | Here | Reason |
|---|---|---|
| One theoretical curve, with the rate of eq. (2) of the course | Three curves: exact lattice Kramers, harmonic Arrhenius and the course's | Eq. (2) overestimates $k$ on a fine lattice; the comparison shows where each factor comes from |
| Temperature and amplitude as text fields | Logarithmic (kT) and linear (A) sliders with the theory recomputed on the fly | Explore $kT/\Delta E$ |
| No fit of the simulation | Fitted $k$ and ratio to Kramers in the panel | Quantitative comparison |

## Tests

`tests/arrhenius.test.js`: positions of the barrier and the minima; rates grow with $kT$ and the course's exceeds Kramers'; with $kT = 0.2$, $A = 0.5$ and 1000 particles the fitted rate matches Kramers within 30 %; with $A = 0$ the right well ends with half of the particles.

## Didactic assessment

It shows the exponential law emerging from a stochastic dynamics and the role of every factor in Kramers' formula, and warns about a common approximation (counting arrivals at the barrier as escapes). Source: *Experimentos Interactivos* course (UCM), experiment 8 of Non-equilibrium Systems, R. Brito and J. M. R. Parrondo.
