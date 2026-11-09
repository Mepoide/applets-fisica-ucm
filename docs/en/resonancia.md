# Stochastic resonance

## What you see

A Brownian particle (or a few) in a double well whose tilt oscillates in time, $V(x,t) = (x^2-1)^2 + A\,x\cos\omega t$. The signal is too weak to remove one of the wells, so the particle can only change wells by thermal activation. On the right, its position against that of the global minimum of the potential, which jumps between $-1$ and $+1$ with the signal. At low temperature the particle never leaves its well; at high temperature it hops at random; at an intermediate temperature it hops **in synchrony** with the signal. The "Sweep kT" button measures the response amplitude at $\omega$ for a range of temperatures and draws the resonance curve.

## Physical model

Without a signal, the mean time between hops is Kramers', $\tau_K(kT) = 1/k$ (experiment 8), which grows exponentially as the temperature drops. With the signal, the favourable well changes every half period $T/2$. If $\tau_K \gg T/2$ the particle does not get to hop; if $\tau_K \ll T/2$ it hops many times per half period and the average follows the minimum adiabatically with small amplitude. When

$$\tau_K(kT) \approx \frac{T}{2}$$

hops occur, statistically, once per half period and in phase with the signal: the component of $x(t)$ at frequency $\omega$ is maximal. That maximum of the response **as a function of noise** is stochastic resonance. Here it is quantified by the amplitude of the first Fourier component, $A_\omega = 2|\langle x(t) e^{-i\omega t}\rangle|$, which is $\approx 2$ if the particle hops from $-1$ to $+1$ in phase and $\approx A/V''$ if it only oscillates inside the well. The phenomenon has been proposed as a mechanism in climate (glacial cycles), neurons and perception.

## Algorithm

Lattice of 41 sites on $[-2, 2]$ ($\Delta x = 0.1$) so that the diffusion time is short compared with the periods; at every step $V$ is recomputed and Metropolis applied (`applets/_walkers/metropolis.js`). $\tau_K$ is evaluated with the lattice Kramers rate of experiment 8 on the untilted well, and the resonant temperature by solving $\tau_K(kT) = T/2$ by bisection. The sweep simulates 20 particles for 8 periods at 15 temperatures and computes $A_\omega$ discarding the first two periods.

## Changes with respect to the original applet

| Original (`ejerc3`, 2002) | Here | Reason |
|---|---|---|
| Only the trace $x(t)$ against the minimum | Also the response amplitude at $\omega$ and an automatic sweep in $kT$ | Make the "maximum vs noise" measurable |
| No prediction of the resonant temperature | $\tau_K(kT)$, $T/2$ and $kT_{\rm res}$ in the panel | Connect with experiment 8 |
| Frequency in ×0.01 units | Period $T$ in steps, logarithmic slider | Direct interpretation |

## Tests

`tests/resonancia.test.js`: the global minimum follows the sign of $-\cos\omega t$; the response of a perfect cosine has amplitude 1 and the right phase, that of white noise is small; $\tau_K$ decreases with $kT$ and the resonant temperature inverts $\tau_K = T/2$ to 5 %; in a fixed-seed sweep the amplitude at $kT_{\rm res}$ exceeds those at $kT_{\rm res}/4$ and $4kT_{\rm res}$.

## Didactic assessment

It closes the 7–8–9 sequence: Boltzmann, Kramers and its least intuitive consequence, that noise can improve the response to a signal. The sweep turns a qualitative observation into a measured curve. Source: *Experimentos Interactivos* course (UCM), experiment 9 of Non-equilibrium Systems, R. Brito and J. M. R. Parrondo.
