# Diatomic molecules

## What you see

The specific heat per molecule of an ideal diatomic gas versus temperature (log scale), split into translation, rotation and vibration, for real molecules (H₂, N₂, CO, O₂, Cl₂…) or for characteristic temperatures of your choice. A cursor sweeps the temperature and the panel shows the three contributions; on the right, the population of the rotational and vibrational levels at that temperature.

## Physical model

The molecular Hamiltonian separates into centre of mass (translation), rotation and vibration, and the partition function factorises: $Z = Z_{\rm tr}Z_{\rm rot}Z_{\rm vib}$, so $c_v = c_{\rm tr} + c_{\rm rot} + c_{\rm vib}$. Translation always gives $3/2$. Vibration, a harmonic oscillator of frequency $\omega$ with $\Theta_v = \hbar\omega/k_B$:

$$c_{\rm vib} = \frac{x^2e^x}{(e^x-1)^2},\quad x = \frac{\Theta_v}{T},$$

tends to 1 for $T \gg \Theta_v$ and freezes out exponentially for $T \ll \Theta_v$. Rotation, with levels $\varepsilon_J = J(J+1)k_B\Theta_r$ of degeneracy $2J+1$ and $\Theta_r = \hbar^2/2Ik_B$,

$$Z_{\rm rot} = \sum_J (2J+1)e^{-J(J+1)\Theta_r/T},\qquad c_{\rm rot} = \frac{\langle\varepsilon^2\rangle - \langle\varepsilon\rangle^2}{k_B^2T^2},$$

tends to 1 for $T \gg \Theta_r$ (classical equipartition of two degrees of freedom) with a small maximum near $0.8\,\Theta_r$ due to the degeneracy. The plateaus $3/2$, $5/2$ and $7/2$ are clear when $\Theta_r \ll \Theta_v$, as in every real diatomic molecule. (For H₂ at low temperature ortho- and para-hydrogen should be distinguished; this is ignored here.)

## Algorithm

$c_{\rm rot}$ by direct summation of the series until terms are negligible ($J_{\max} \sim 8\sqrt{T/\Theta_r}$); $c_{\rm vib}$ analytic. Characteristic temperatures from Lee, Sears and Turcotte (1963). Plotted populations are $p_J = (2J+1)e^{-\varepsilon_J/k_BT}/Z_{\rm rot}$ and $p_n = e^{-n\Theta_v/T}(1-e^{-\Theta_v/T})$.

## Questions

1. Identify the three plateaus (3/2, 5/2, 7/2 k_B) in the c_V curve. At what temperatures do the rotational and vibrational degrees of freedom of H₂ switch on? And of Cl₂?
2. Why do the characteristic rotational and vibrational temperatures differ by two orders of magnitude? Relate it to the moment of inertia and the force constant.
3. Compare the exact rotational c_V (sum over levels) with the classical limit. Below which temperature does the error exceed 10 %?

## Changes with respect to the original applet

| Original (`DiatomicApplet`, 2002) | Here | Reason |
|---|---|---|
| Total curve and reference lines | Same, plus the three separate contributions, the cursor with values and the level populations | See which degrees of freedom "unfreeze" and why |
| Typed temperatures | Selector of real molecules plus custom values | Compare molecules |

## Tests

`tests/fises2.test.js`: limits $3/2$, $5/2$, $7/2$ for N₂ at 0.05 K, 300 K and 10⁵ K; the rotational maximum lies between 1.05 and 1.15 and between $0.6$ and $1.0\,\Theta_r$.

## Didactic assessment

The canonical example of quantum freezing of degrees of freedom, and the one explaining why the specific heat of air is $5/2\,k_B$ per molecule. Source: *Experimentos Interactivos* course (UCM), Statistical Physics experiment 6, R. Brito.
