# Grand canonical ensemble

## What you see

An ideal gas in a box; with the mouse you draw a region that plays the role of the *system*, while the rest of the box acts as a reservoir of particles and energy. The number of particles inside the region is counted at every instant and its histogram is compared with the Poisson distribution, the grand-canonical prediction for an ideal gas, and with the exact binomial. It is the same applet as view C of experiment 2 of *Non-equilibrium Systems*, here with the emphasis on the ensemble.

## Physical model

A system exchanging energy and particles with a much larger reservoir is described by the **grand canonical** ensemble: the probability of a state with $N$ particles and energy $E$ is proportional to $z^N e^{-\beta E}$, with $\beta = 1/k_BT$ and the fugacity $z = e^{\beta\mu}$. Integrating over energy, the probability of having $N$ particles is $P(N) \propto z^N Z_N(T,V)/\Xi$. For an ideal gas $Z_N = (V/\lambda^3)^N/N!$ and

$$P(N) = e^{-\bar N}\,\frac{\bar N^N}{N!},\qquad \bar N = zV/\lambda^3,$$

the **Poisson** distribution, whose variance equals its mean. The derivation assumes $N \ll N_{\rm total}$; when the region takes an appreciable fraction $p$ of the box the exact distribution is the binomial $B(N_{\rm total},p)$, of variance $\bar N(1-p)$: in the limit $p \to 1$ the particle number stops fluctuating.

## Algorithm and tests

See the *Occupation fluctuations* sheet (`fluctuaciones`): ideal gas with Maxwellian velocities, draggable window, histogram, Poisson, binomial and autocorrelation. Tests in `tests/fluctuaciones.test.js`.

## Questions

1. For how many particles in the window does the relative fluctuation drop below 10 %? And 1 %? Extrapolate to a mole.
2. Why is the occupation distribution binomial rather than Poisson when the total particle number is fixed? In which limit do they coincide?
3. Relate the density fluctuation to compressibility: what would you expect in an interacting gas near a critical point?

## Changes with respect to the original applet

| Original (`CanonicaApplet`, M. Castro 2002) | Here | Reason |
|---|---|---|
| Histogram vs Poisson in a separate window | Poisson and binomial over the histogram, measured variances in the panel | See when the grand-canonical hypothesis fails |
| Histogram must be reset by hand after changing the region | Reset on mouse release | Avoid mixing statistics |

## Didactic assessment

It gives a concrete picture of "system plus reservoir" and of why the grand canonical ensemble is an approximation. Source: *Experimentos Interactivos* course (UCM), Statistical Physics experiment 9, R. Brito; base applet by Mario Castro (2002).
