# Ergodicity and entropy in a set of oscillators

## What you see

$N$ independent oscillators, each a point on the circle with phase $\theta_i(t) = \theta_i(0) + \omega_i t$. The circle is split in $M$ sectors and the fraction of oscillators in each sector defines the macrostate; its entropy $S = -\sum_k f_k\ln f_k$ is plotted against time. With random frequencies and equal phases the entropy rises to its maximum and stays; with equispaced frequencies it rises the same way but returns exactly to zero at the recurrence time.

## Physical model

The phase space of the $N$ oscillators is the $N$-dimensional torus of phases. If the ratios $\omega_i/\omega_j$ are irrational (**incommensurable** frequencies) the trajectory is dense on the torus: the system is ergodic and the microcanonical distribution is uniform on the torus. The macrostate $\{f_k\}$ (fraction in each sector) has entropy

$$S = -\sum_{k=1}^{M} f_k \ln f_k,\qquad S_{\max} = \ln M \ \text{ for } f_k = 1/M,$$

and statistical physics predicts that an ergodic system reaches that maximum (with the finite-$N$ correction $S_{\rm eq} \simeq \ln M - (M-1)/2N$, due to the fluctuations of $N$ balls in $M$ boxes). If the frequencies are **commensurable**, e.g. $\omega_i = \omega_0 i/N$, the system is periodic with period $T = 2\pi N/\omega_0$: the entropy grows but returns to its initial value; it is not ergodic. Starting from random phases (already at the maximum) the entropy does not drop appreciably in either case: the time asymmetry we see comes from having started in a very ordered state, which was Boltzmann's argument.

## Algorithm

Phases advanced exactly, $\theta_i = \theta_i(0) + \omega_i t \bmod 2\pi$, with $\Delta t = 0.05$. Frequencies: uniform random in $[0.5\omega_0, 1.5\omega_0]$, nearly equal ($\omega_0(1 \pm 0.01)$) or equispaced $\omega_0 i/N$. Radial bars show the occupation of each sector.

## Questions

1. Compare the time average of one oscillator's energy with the ensemble average. For how many oscillators and how long do they agree to 5 %?
2. Check that the oscillator energy distribution tends to the Boltzmann exponential. Which temperature does it correspond to? Relate it to the total energy.
3. Compute the entropy from the histogram and watch it grow until saturation. What limits its maximum value in the finite system?

## Changes with respect to the original applet

| Original (`OsciladoresApplet`, 2002; idea by J. M. R. Parrondo) | Here | Reason |
|---|---|---|
| "Histogram of the logarithm of the frequencies" button (Einstein formula) | Replaced by the marked recurrence $T = 2\pi N/\omega_0$ and the finite-$N$ equilibrium value | Recurrence is the didactic point; the $(M-1)/2N$ correction explains why $S$ does not reach $\ln M$ |
| Entropy normalised to 1 | Same, with $S_{\rm eq}/\ln M$ as reference | Quantitative comparison |

## Tests

`tests/fises1.test.js`: with 400 oscillators of random frequencies and 12 sectors the long-time mean entropy matches $\ln M - (M-1)/2N$ within 0.03; with equispaced frequencies the entropy rises above 1 and returns below 0.05 at $T = 2\pi N/\omega_0$.

## Didactic assessment

It makes the ergodic hypothesis and its failure tangible, and the origin of irreversibility in the initial condition. Source: *Experimentos Interactivos* course (UCM), Statistical Physics experiment 4, R. Brito and J. M. R. Parrondo.
