# Thermal conductivity of a disordered chain

## What you see

A segment of $N$ atoms with disordered masses (fraction $C$ of impurities of mass $\alpha m$) inserted between two semi-infinite perfect chains. For each frequency the **transmission coefficient** $T(\omega)$ of an incident phonon is computed, averaging $\ln T$ over several disorder realisations, and from it the **thermal conductivity** relative to the perfect chain as a function of temperature. As the segment grows the transmission collapses for every $\omega > 0$: the modes are localised and carry no heat.

## Physical model

The equation of motion in matrix form, $(U_{n+1}, U_n)^T = P_n (U_n, U_{n-1})^T$ with $P_n = \begin{pmatrix} 2 - m_n\omega^2/k & -1 \\ 1 & 0\end{pmatrix}$, gives the **transfer matrix** of the segment $T(N) = \prod_n P_n$. In the perfect chains the solutions are Bloch waves $e^{\pm iqn}$ with $\cos q = 1 - m\omega^2/2k$; imposing incident plus reflected wave on the left and only a transmitted one on the right yields $|t|^2 = T(\omega)$. For phonon heat transport (Landauer formula),

$$\kappa(T) \propto \int_0^{\omega_D} T(\omega)\,\hbar\omega\,\frac{\partial n_B}{\partial T}\,\omega\,d\omega \propto \int_0^{\omega_D} T(\omega)\,\frac{x^2e^x}{(e^x-1)^2}\,d\omega,\quad x = \frac{\hbar\omega}{k_BT},$$

with $\hbar\omega_D = k_B\Theta_D$ and $\omega_D = 2\sqrt{k/m}$; $\kappa/\kappa_0$, the ratio to the perfect chain ($T = 1$), is plotted. In one dimension any disorder produces **Anderson localisation**: $T(\omega) \sim e^{-N/\xi(\omega)}$ with localisation length $\xi \propto 1/\omega^2$ at low frequency, so only long-wavelength modes survive, the conductivity drops with $N$ and their relative weight grows at low temperature.

## Algorithm

`transmission` and `conductivity` in `applets/_chain/chain.js`: product of real $2\times2$ matrices with a cutoff when elements exceed $10^{150}$ (negligible transmission) and solution of the complex $2\times2$ system for $t$; Landauer integral by trapezoids over 161 frequencies and 60 temperatures. Average of $\ln T$, the self-averaging variable.

## Changes with respect to the original applet

| Original (2002) | Here | Reason |
|---|---|---|
| $T(\omega)$ and $\kappa(T)$ "slow to compute" | Visible realisation-by-realisation computation, $\ln T$ average, $\kappa$ normalised to the perfect chain | Direct interpretation |

## Tests

`tests/fes1.test.js`: the perfect segment transmits $T = 1$ inside the band and 0 outside; one impurity reduces $T$; 400 disordered masses give $T(1.5) < 0.05$ but $T(0.1) > 0.5$; $\kappa/\kappa_0 > 0.98$ for the perfect chain and $< 0.5$ for the disordered one at $T = 0.3\,\Theta_D$.

## Didactic assessment

It joins three ideas: transfer matrix, localisation and the Landauer formula for transport. Source: *Experimentos Interactivos* course (UCM), Solid State Physics experiment 4, F. Domínguez-Adame.
