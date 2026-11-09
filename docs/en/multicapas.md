# X-ray reflection in metallic multilayers

## What you see

The normal-incidence reflectivity of a multilayer of $N$ pairs of alternating layers (indices $n = 1 - \delta + i\beta$, thicknesses $d_1$, $d_2$) versus the X-ray wavelength. A Bragg peak appears at $\lambda_B = 2(n_1d_1 + n_2d_2)$ that grows and narrows as layers are added, accompanied by interference fringes; absorption limits the maximum reflectivity.

## Physical model

For soft X-rays the permittivity is $\varepsilon = 1 - 2\delta + 2i\beta$ with $\delta, \beta \ll 1$ (the index is slightly below 1). The reflectivity of a stack of films is computed exactly with **Rouard's** recursive method: with the Fresnel coefficient at each interface $r_k = (n_{k-1} - n_k)/(n_{k-1} + n_k)$ and the optical phase $\mu_k = 2\pi n_k d_k/\lambda$,

$$f_{k-1} = \frac{r_{k-1} + f_k\,e^{2i\mu_k}}{1 + r_{k-1}f_k\,e^{2i\mu_k}},\qquad R = |f_1|^2,$$

starting from the last interface. Each interface reflects very little ($|r| \sim \delta/2 \sim 10^{-2}$), but the $2N$ reflections interfere constructively when the round-trip optical path through one period is an integer number of wavelengths: Bragg condition $m\lambda = 2\bar n\Lambda$. The peak has width $\sim \lambda_B/N$ and saturates when $N\,|r| \sim 1$ or when absorption ($\beta$) extinguishes the beam before it reaches the bottom.

## Algorithm

Explicit complex arithmetic in `applets/multicapas/model.js`; 500 wavelengths around $\lambda_B$; the number of pairs grows progressively on start. Controls: $N$, $d_1$, $d_2$, $\delta_1$, $\delta_2$, $\beta$.

## Questions

1. Measure the Bragg peak width for N = 10, 20, 40 pairs. Does it scale as 1/N? Up to which N?
2. Increase the absorption β: what is the maximum attainable reflectivity? How many pairs does the beam really 'see'?
3. Make d₁ ≠ d₂ keeping the period: does the Bragg peak move? What happens to the second order when d₁ = d₂?

## Changes with respect to the original applet

| Original (2002) | Here | Reason |
|---|---|---|
| Reflectance for given thickness and dielectric constants | Same, with $\lambda_B$ marked, independent thicknesses, absorption and peak growth with $N$ | Watch the constructive interference build up |

## Tests

`tests/fes3.test.js`: a 40-pair stack with $\delta = 0.1/0$ and $d = 10$ Å peaks at $\lambda_B$ within 3 % with $R > 0.9$ and $0 \le R \le 1$ over the spectrum; a very thick film on a substrate of the same index reproduces the Fresnel coefficient $((1-n)/(1+n))^2$.

## Didactic assessment

X-ray optics and multilayer mirrors (EUV lithography, telescopes) with a five-line algorithm. Source: *Experimentos Interactivos* course (UCM), Solid State Physics experiment 12, F. Domínguez-Adame.
