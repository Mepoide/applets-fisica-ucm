# Atomic vibrations of a disordered lattice

## What you see

A chain of $N$ atoms joined by equal springs, with masses $m$ or $M = \alpha m$ placed at random with fraction $C$: a minimal model of an amorphous solid or alloy. The plot shows the **integrated density of modes** per atom, $N(\omega)/N$, computed by node counting, against that of the monatomic chain. Heavy masses lower the frequencies and open forbidden intervals (plateaus of the curve); above the band edge of the heavy chain, modes localised on clusters of light atoms appear.

## Physical model

In the harmonic approximation, $m_n\ddot U_n = k(U_{n+1} + U_{n-1} - 2U_n)$; seeking $U_n e^{i\omega t}$,

$$m_n\omega^2 U_n = k\,(2U_n - U_{n-1} - U_{n+1}).$$

For the monatomic chain, $\omega = 2\sqrt{k/m}\,|\sin(qa/2)|$ and $N(\omega)/N = (2/\pi)\arcsin(\omega/2\sqrt{k/m})$. With random masses there is no analytic solution, but the **node theorem** (Sturm) counts the modes without diagonalising: integrating the equation from one end with $U_0 = 0$, the number of sign changes of $U_n$ along the chain equals the number of normal modes with frequency below $\omega$. With $R_n = U_{n+1}/U_n$,

$$R_n = 2 - \frac{m_n\omega^2}{k} - \frac{1}{R_{n-1}},$$

and one just counts the negative $R_n$. The curve is self-averaging: it hardly depends on the disorder realisation for large $N$.

## Algorithm

`applets/_chain/chain.js`: $R_n$ recursion for 241 frequencies between 0 and 2.2 (units $\sqrt{k/m}$), computed in chunks so the curve appears progressively. $N \le 20000$.

## Questions

1. Compare the density of modes of the ordered chain with the analytic van Hove one. Where is the singularity and why?
2. Add mass disorder: what happens to the upper band edge? Do modes appear above the maximum ordered frequency?
3. Check with node counting that the total number of modes is N regardless of disorder.

## Changes with respect to the original applet

| Original (2002) | Here | Reason |
|---|---|---|
| Integrated density for given $\alpha$ and $C$ | Same, with the monatomic reference, gap count and chain visualisation | Compare and understand the plateaus |

## Tests

`tests/fes1.test.js`: the monatomic chain reproduces $(2/\pi)\arcsin(\omega/2)$ within 0.02 and saturates at $\omega = 2$; with $\alpha = 3$, $C = 0.5$ the integrated density at $\omega = 1$ exceeds the monatomic one by more than 0.1.

## Didactic assessment

It introduces node counting, an elegant numerical tool, and the idea of disorder-localised modes developed in experiments 4 and 6. Source: *Experimentos Interactivos* course (UCM), Solid State Physics experiment 2, F. Domínguez-Adame.
