# Quantum-confined Stark effect

## What you see

An infinite-barrier quantum well under a perpendicular electric field: the wave function shifts to one side, the ground-state energy drops quadratically with the field and the oscillator strength of the 1→2 transition decreases. The numerical calculation is compared with perturbation theory.

## Physical model

With $u = z/a$, $E_0 = \hbar^2/2m^*a^2$ and $v = eFa/E_0$,

$$-\chi''(u) - v\,u\,\chi(u) = \varepsilon\chi(u),\qquad \chi(\pm\tfrac12) = 0.$$

At zero field $\varepsilon_n = n^2\pi^2$. The first-order correction vanishes by parity; the second-order one sums $\sum_{n\,\rm even}|v\,u_{1n}|^2/(\varepsilon_1 - \varepsilon_n)$ with $u_{1n} = \int\chi_1 u\chi_n du$ and gives

$$\varepsilon_1 \simeq \pi^2 - \frac{15 - \pi^2}{48\pi^4}v^2 \approx \pi^2 - 1.10\times10^{-3}v^2$$

(the original sheet approximates it as $\pi^2 - (v/10\pi)^2$, 8 % smaller). Perturbation theory holds while $v \ll 3\pi^2$. The oscillator strength $f_{12} = (\varepsilon_2 - \varepsilon_1)|u_{12}|^2$ equals $3\pi^2(16/9\pi^2)^2 = 0.9607$ at zero field and decreases with it.

## Algorithm

Finite differences with $N + 1$ segments: tridiagonal matrix with diagonal $2/s^2 - vu_n$; eigenvalues by Sturm and eigenvectors by inverse iteration; $u_{12}$ by direct summation. Start to sweep the field.

## Questions

1. For a = 150 Å, up to which field do the numerical calculation and second-order perturbation theory agree to 1 %? Express it in v = eFa/E₀.
2. Check that the Stark shift scales as a⁴ by comparing a = 100 and 200 Å at the same field.
3. Measure f₁₂ versus field: at which field has it dropped to half? Where does the missing oscillator strength go?

## Changes with respect to the original applet

| Original (2002) | Here | Reason |
|---|---|---|
| Numerical and perturbative E₁(F), f₁₂ | Same, with the exact second-order coefficient and the f₁₂(F) curve | Quantify the range of validity |

## Tests

`tests/dc.test.js`: at zero field ε₁ = π² and f₁₂ = 0.9607 (error < 2·10⁻³); for v = 5, 15 and 30 the numerical result agrees with second-order perturbation theory within 2 % of the shift; f₁₂ decreases with field.

## Didactic assessment

The basis of quantum-well electro-optic modulators; it shows perturbation theory against an exact calculation. Source: *Experimentos Interactivos* course (UCM), Quantum Devices experiment 5, F. Domínguez-Adame.
