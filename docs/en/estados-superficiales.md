# Electronic surface states

## What you see

A semi-infinite one-dimensional crystal ending at a surface: δ potentials of strength $P$ at $z = -a, -2a, \dots$ and a step of height $V_0$ (the vacuum) for $z > 0$. The levels of the system are computed and drawn over the bands of the infinite crystal. Levels inside the bands are extended states; when a level appears in a gap, its wave function decays both into the crystal and into the vacuum: a **surface (Tamm) state**.

## Physical model

Without a surface, Bloch's theorem demands a real crystal momentum and the Kronig–Penney relation $\cos ka = \cos qa + (P/2q)\sin qa$ (with $q = \sqrt E$, $\hbar^2/2m = 1$) defines bands and gaps. The surface breaks periodicity and admits solutions with complex $k = n\pi/a + i\mu$: inside the crystal the wave function grows towards the surface as $e^{\mu z}$ and in the vacuum decays as $e^{-\kappa z}$ with $\kappa = \sqrt{V_0 - E}$. Imposing continuity of $\psi$ and $\psi'$ at $z = 0$ gives a transcendental equation whose real roots in the gaps are the surface-state energies, subject moreover to the **existence condition** $\mu > 0$ (decay into the bulk). Depending on the sign of $P$, on $a$ and on $V_0$ the state exists or not; with attractive wells ($P < 0$) there is one in the first gap for a wide range of $V_0$.

## Algorithm

Instead of solving the transcendental equation of the semi-infinite crystal, a long but finite crystal ($N$ cells, hard wall at the far end) is diagonalised by shooting: integrate from the wall with $\psi = 0$, $\psi' = 1$ through the δ's ($\psi'$ jumps by $P\psi$) up to $z = 0$ and require $\psi'(0)/\psi(0) = -\kappa$. Roots are found by scanning and bisection. Band levels get denser as $N$ grows; the surface one does not depend on $N$. The wave function is drawn normalised and the weight of $|\psi|^2$ near the surface is measured.

## Questions

1. With P = −3 and V₀ = 12, locate the Tamm state in the gap and draw its wave function. How many cells does it penetrate into the crystal? And into the vacuum?
2. Raise V₀ until the level leaves the gap: what does the state become?
3. Change the sign of P: why does the surface state disappear in this model? Which termination would recover it?

## Changes with respect to the original applet

| Original (2002) | Here | Reason |
|---|---|---|
| Roots of eq. (8) and existence condition | Full spectrum of the finite crystal with gap states highlighted and their wave function | See bands, gaps and surface state together |

## Tests

`tests/fes2.test.js`: with $P = -3$, $a = 1$, $V_0 = 12$, $N = 30$ more than $N$ levels appear, at least one in a gap with over 30 % of $|\psi|^2$ within $2a$ of the surface, while a band state has less than 30 %.

## Didactic assessment

It explains why surfaces have states of their own, relevant in catalysis and epitaxial growth, and shows the use of complex crystal momentum. Source: *Experimentos Interactivos* course (UCM), Solid State Physics experiment 8, F. Domínguez-Adame.
