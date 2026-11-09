# Kac ring

## What you see

A ring with $N$ sites, each holding a blue or a red ball, and $M$ marked edges. At every step all balls move one site clockwise, and a ball that crosses a marked edge changes colour. The outer ring keeps the initial configuration; the inner one shows the current state. On the right, $\Delta(t) = N_A - N_R$ is plotted together with the mean-field prediction. The system is deterministic and reversible, yet $\Delta(t)$ decays towards zero… until at $t = 2N$ the initial configuration reappears exactly.

## Physical model

Marc Kac proposed this model to discuss the Boltzmann equation and the irreversibility paradox. If $n_A(t)$ and $n_R(t)$ are the blue and red balls that have a mark in front of them, the exact equations are

$$N_A(t+1) = N_A(t) - n_A(t) + n_R(t),\qquad N_R(t+1) = N_R(t) - n_R(t) + n_A(t).$$

They cannot be closed without an assumption about $n_A$ and $n_R$. The **molecular chaos** hypothesis (Stosszahlansatz) assumes that the fraction of balls of each colour facing a mark equals the global fraction of marks,

$$\frac{n_A}{N_A} = \frac{n_R}{N_R} = \frac{M}{N},$$

and then

$$\Delta(t) = \Big(1 - \frac{2M}{N}\Big)^{t}\,\Delta(0),$$

which decays monotonically for $0 < M < N/2$ and decays with alternating sign for $M > N/2$. This is the "irreversible" prediction. The actual dynamics is periodic: every ball goes twice around in $2N$ steps, crosses $2M$ marks and recovers its colour. The Poincaré recurrence time is exactly $T = 2N$.

The discrepancy comes from the correlations between colours and marks that the dynamics itself builds, which molecular chaos ignores. For large $N$ and $t \ll N$ the hypothesis works well; mean field describes the initial relaxation, not the recurrence.

## Algorithm

Arrays `colors` ($\pm 1$) and `marks` (0/1, edge $i$ joins sites $i$ and $i+1$). One step: `next[(i+1) % N] = marks[i] ? -colors[i] : colors[i]`. Marks are chosen without repetition by shuffling indices. Initial conditions: random 50/50, random 70/30, all blue, alternating. The plot keeps $\Delta$ for up to $4N$ steps and the panel compares $\Delta$ with mean field.

## Changes with respect to the original applet

| Original (`KACApplet`, 2002) | Here | Reason |
|---|---|---|
| Mean-field curve only for "70/30" and "all blue" | Always drawn; with random 50/50 $\Delta(0) \approx 0$ and the curve is nearly flat | Show also the case where mean field says nothing |
| No indication of the recurrence time | Line at $T = 2N$ and countdown to recurrence | It is the central point of the model |
| $N$, $M$ limited by `Nmax`, `Mmax` | $N \le 1000$, $M \le N$ | See mean field improve with $N$ |

## Tests

`tests/kac.test.js`: exact periodicity at $2N$ (configuration and $\Delta$); "all blue" with $M = N/2$ gives $\Delta(1) = 0$; for $N = 1000$, $M = 100$ mean field is within $3\sqrt N$ of $\Delta$ over the first five steps; $M = 0$ and $M = N$ as limiting cases.

## Didactic assessment

It illustrates, in a trivially small system, three ideas that are hard in the Boltzmann equation: molecular chaos as a closure, its short-time validity, and Poincaré recurrence. Interactivity: choosing $M$ near $N/2$ shows sign oscillations; "alternating" with even or odd $M$ gives very different dynamics. Source of the original experiment: *Experimentos Interactivos* course (UCM), experiment 1 of Non-equilibrium Systems, R. Brito.
