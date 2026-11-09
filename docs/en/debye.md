# Vibrations in crystalline solids: Debye theory

## What you see

The specific heat per atom of a solid in the Debye model, versus $T/\Theta_D$, for real solids (K, Cu, Al, Fe, diamond…) or a Debye temperature of your choice. It is compared with the Dulong–Petit law (3 at high temperature), the low-temperature $T^3$ law and the Einstein model. On the right, the density of modes $g(\omega) \propto \omega^2$ and, shaded, the modes excited at the cursor temperature.

## Physical model

In the harmonic approximation a solid of $N$ atoms is equivalent to $3N$ independent oscillators (the normal modes or phonons) with $\ln Z = -\sum_k \ln(2\sinh\hbar\omega_k/2k_BT)$. Debye replaces the real spectrum by that of an elastic continuum, $\omega = v k$, giving $g(\omega) = 9N\omega^2/\omega_D^3$ up to a cutoff frequency $\omega_D$ fixed by the total number of modes, $\int g = 3N$. With $\Theta_D = \hbar\omega_D/k_B$,

$$\frac{c}{k_B} = 9\Big(\frac{T}{\Theta_D}\Big)^3\int_0^{\Theta_D/T}\frac{x^4e^x}{(e^x-1)^2}\,dx,$$

a universal function of $T/\Theta_D$. For $T \gg \Theta_D$ it tends to 3 (Dulong–Petit law, equipartition); for $T \ll \Theta_D$ the integral tends to $4\pi^4/15$ and $c \to (12\pi^4/5)(T/\Theta_D)^3$: only low-frequency acoustic phonons are excited, and their number grows as $T^3$. The Einstein model (all modes at one frequency) is right at high temperature but predicts an exponential drop at low temperature, in disagreement with experiments: it was the first evidence of quantisation in a macroscopic system (1907) and Debye's theory (1912) corrected it.

## Algorithm

Debye integral by composite Simpson with a step adapted to $\Theta_D/T$; for $\Theta_D/T > 60$ the analytic limit is used. Tabulated Debye temperatures (Kittel). Excited modes are drawn as $g(\omega)\min(1,\langle n\rangle)$ with $\langle n\rangle = 1/(e^{\hbar\omega/k_BT}-1)$.

## Questions

1. Compare Einstein and Debye at low temperature: which gives the T³ law? Why does the Einstein model fall exponentially?
2. Fit θ_D so that the curve passes through the copper data. What value do you get and how does it compare with the tabulated 343 K?
3. At what temperature, in units of θ_D, does the specific heat reach 90 % of the Dulong–Petit value?

## Changes with respect to the original applet

| Original (`DebyeApplet`, 2002) | Here | Reason |
|---|---|---|
| $c(T)$ curve for a typed $\Theta_D$ (10-point Gaussian quadrature) | Universal curve in $T/\Theta_D$ with cursor, limiting laws, Einstein and density of modes | See why Einstein fails and where the $T^3$ comes from |

## Tests

`tests/fises2.test.js`: $c \to 3$ for $T = 50\,\Theta_D$; ratio to the $T^3$ law equal to 1 within 1 % for $T = 0.02\,\Theta_D$; $c(\Theta_D) = 2.856$.

## Didactic assessment

It connects phonon quantisation with a classic macroscopic measurement and shows the role of the density of states. Source: *Experimentos Interactivos* course (UCM), Statistical Physics experiment 7, R. Brito.
