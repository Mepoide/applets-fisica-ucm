# Electronic states at a doped heterojunction

## What you see

The nearly triangular well formed at a modulation-doped heterojunction and the two-dimensional electron gas it hosts. The universal infinite-barrier problem (Si-SiO₂) is solved exactly and variationally, and the GaAs-Al_xGa_{1−x}As heterojunction with a finite barrier.

## Physical model

Electrons transferred from the barrier donors create, by Gauss's law, a field $K = eF = e^2n_{2D}/\varepsilon_0\varepsilon_r$ ($K = 1.37\,n_{2D}$ meV/nm for GaAs with $n_{2D}$ in $10^{11}$ cm⁻²). With an infinite barrier and $u = \alpha z$, $\alpha = (2m^*K/\hbar^2)^{1/3}$, the problem is universal:

$$-\chi'' + u\chi = \varepsilon\chi,\qquad \chi(0) = 0,$$

with exact Airy solution, $\varepsilon_1 = 2.3381$. The Gaussian trial function $\chi = N u\,e^{-b^2u^2/2}$ gives $E(b) = \tfrac32 b^2 + 2/\sqrt\pi\,b$, minimal at $b = (2/3\sqrt\pi)^{1/3} = 0.722$ with $\varepsilon = 2.3448$, 0.3 % above the exact value as the variational principle demands. In GaAs-AlGaAs the barrier $V_0 = 0.773x$ is finite and comparable to $E_1 \sim 2.34(\hbar^2K^2/2m^*)^{1/3}$: the function penetrates the barrier and the level drops.

## Algorithm

Finite differences in both cases (`applets/_dc/schrod.js`): the universal one on $[0, 12]$ with a wall at the origin; the GaAs one with masses $m_A$, $m_B$ on a 1500-point grid from $-15$ nm to $60$ nm. Start to sweep $n_{2D}$.

## Questions

1. Move the variational parameter b and check that E(b) never drops below 2.3381. Why is the variational minimum always above the exact value?
2. For n₂D = 5 × 10¹¹ cm⁻² and x = 0.3, how much does the level drop due to the finite barrier? What fraction of the wave function is in the AlGaAs?
3. Double n₂D: how does the level energy scale? Check with the (ħ²K²/2m)^{1/3} law.

## Changes with respect to the original applet

| Original (2002) | Here | Reason |
|---|---|---|
| Exact vs variational (Si-SiO₂) and exact with finite barrier (GaAs) | Same, plus the adjustable variational parameter b with its E(b) curve and the barrier penetration | See the variational principle at work |

## Tests

`tests/dc.test.js`: the universal problem gives ε₁ = 2.338 (error < 2·10⁻³); E(b) at the minimum is 2.3448; in GaAs the finite-barrier level lies between half and the full infinite-barrier value and rises with x.

## Didactic assessment

The origin of the high-mobility two-dimensional electron gas (HEMT, quantum Hall effect), with a two-line variational calculation. Source: *Experimentos Interactivos* course (UCM), Quantum Devices experiment 6, F. Domínguez-Adame.
