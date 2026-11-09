# Optical absorption in two-dimensional systems

## What you see

The absorption spectrum of a quantum well at low temperature: the 1s excitonic line, the excited lines and the continuum enhanced by the Sommerfeld factor, all broadened by a width γ. γ is fitted to a "measured" spectrum to determine the linewidth.

## Physical model

For strongly confined (two-dimensional) excitons, with $\varepsilon = (\hbar\omega - E_g)/{\rm Ry}^*$,

$$\alpha(\hbar\omega) \sim \sum_{n=1}^\infty\frac{4}{(n - \frac12)^3}\,\frac{\gamma}{[\varepsilon + (n - \frac12)^{-2}]^2 + \gamma^2} + \int_0^\infty\frac{S_{2D}(\varepsilon')\,\gamma}{(\varepsilon' - \varepsilon)^2 + \gamma^2}\,d\varepsilon',$$

with binding energies $E_n = -{\rm Ry}^*/(n - \frac12)^2$ (4 Ry* for 1s, four times the 3D value) and Sommerfeld factor $S_{2D} = 2/(1 + e^{-2\pi/\sqrt\varepsilon})$, equal to 2 at threshold and tending to 1 far from it. The width $\gamma = \Gamma_0 + \Gamma_{\rm ph}/(e^{\hbar\omega_{LO}/k_BT} - 1)$ adds the inhomogeneous (disorder) and LO-phonon (34 meV) broadening, negligible at low temperature. For In₀.₅₃Ga₀.₄₇As, Ry* ≈ 2.5 meV and $E_g$ ≈ 0.81 eV at 12 K.

## Algorithm

Lorentzians of area π for both terms; the continuum integral uses the substitution $\varepsilon' = t^2$ (1200 points up to 60 Ry*). The "measured" spectrum is generated with the model itself with hidden parameters (γ = 0.42 Ry*) plus reproducible noise; it is not experimental data, which did not survive from the original applet. Start to sweep Γ₀ and trace the fit error.

## Changes with respect to the original applet

| Original (2002) | Here | Reason |
|---|---|---|
| Fit of γ to InGaAs-InAlAs data at 12 K | Fit to a synthetic spectrum, with separated contributions, thermal dependence and error curve | The original data are not available |

## Tests

`tests/dc.test.js`: S₂D → 2 at threshold and → 1 far away; the spectrum maximum is at ε = −4; the fit error to the noiseless synthetic spectrum is minimal (< 10⁻⁶) exactly at the hidden γ.

## Didactic assessment

Quantum-well spectroscopy: it teaches how to read an absorption spectrum (excitons, continuum, width) and the logic of parameter fitting. Source: *Experimentos Interactivos* course (UCM), Quantum Devices experiment 10, F. Domínguez-Adame.
