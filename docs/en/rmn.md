# Nuclear magnetic resonance

## What you see

The dynamics of the nuclear magnetisation $\mathbf m = \mathbf M/M_0$ according to the Bloch equations: in a static field $B_0\hat z$ it precesses at the Larmor frequency $\omega_0 = \gamma B_0$ and is damped with the times $T_2$ (transverse) and $T_1$ (longitudinal); with a rotating field $B_1$ at the right frequency the magnetisation tips and absorbs energy: resonance. The trajectory in the transverse plane, the components versus time, the analytic decay $e^{-t/T_2}$ and the Lorentzian absorption line are drawn.

## Physical model

A spin-$1/2$ nucleus in a field $B_0$ has two levels separated by $\hbar\omega_0 = \hbar\gamma B_0$. Semiclassically, the torque on the magnetic moment gives $\dot{\mathbf M} = \gamma\mathbf M\times\mathbf B$; interactions with the lattice (phonons, other spins) are added phenomenologically:

$$\dot m_x = \gamma(\mathbf m\times\mathbf B)_x - \frac{m_x}{T_2},\quad \dot m_y = \gamma(\mathbf m\times\mathbf B)_y - \frac{m_y}{T_2},\quad \dot m_z = \gamma(\mathbf m\times\mathbf B)_z - \frac{m_z - 1}{T_1}.$$

With $B_1 = 0$ and $m_z$ at equilibrium, in reduced time $\tau = t/T_2$ and $\alpha = \omega_0 T_2$: $m_x = e^{-\tau}\cos\alpha\tau$, $m_y = -e^{-\tau}\sin\alpha\tau$, $|m_\perp| = e^{-\tau}$, the **free induction decay** (FID), whose Fourier transform is a Lorentzian of half-width $1/T_2$ centred at $\omega_0$: the absorption line. A field $B_1$ rotating in the same sense as the precession and at its frequency is static in the rotating frame and makes the magnetisation nutate at the Rabi frequency $\omega_1 = \gamma B_1$; detuned, its effect averages out.

## Algorithm

Full Bloch equations (with co-rotating $B_1$) integrated by 4th-order Runge–Kutta with step $0.005\,T_2$; the Lorentzian is drawn normalised in an inset. Controls: $\alpha$, $\omega_1T_2$, $\omega/\omega_0$, $T_1/T_2$ and initial state (after a $\pi/2$ pulse or at equilibrium).

## Questions

1. Without B₁, check that |m_⊥| follows e^{−t/T₂} and that the number of turns per unit time is α/2π. What does a spectrometer measure from this signal?
2. Switch B₁ on at resonance from equilibrium: how long until m_z crosses zero? Compare with π/(2ω₁).
3. Detune ω/ω₀ to 1.1 and 1.2: what fraction of the absorption remains? Compare with the Lorentzian of width 1/T₂.

## Changes with respect to the original applet

| Original (2002) | Here | Reason |
|---|---|---|
| $m_x(t)$, $m_y(t)$ and modulus for a given $\alpha$, no $B_1$ | Same, plus the rotating field with detuning, $T_1$, the trajectory and the absorption line | Show the *resonance*, not only the precession |

## Tests

`tests/fes3.test.js`: the integration reproduces the analytic FID within $10^{-6}$; a resonant $B_1$ brings $m_z$ below 0.3 at $\omega_1 t = 1.6$ and a 50 % detuned one reduces it less; the Lorentzian equals 1 at $\omega_0$ and 0.2 two widths away.

## Didactic assessment

The basis of NMR and magnetic resonance imaging; here the relation between time signal and spectrum is visible. Source: *Experimentos Interactivos* course (UCM), Solid State Physics experiment 9, F. Domínguez-Adame.
