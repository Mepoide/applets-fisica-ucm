# Sandpile and self-organized criticality

## What you see

Grains fall one at a time onto the leftmost column of a narrow box. When the slope between
two neighbouring columns reaches a threshold, one grain rolls to the next column; that may
destabilise the neighbour and start an **avalanche**. Grains reaching the right edge leave
the system. The plot records the size $s$ of each avalanche (number of moves) and its
distribution $P(s)$.

Two models are available:

- **Fixed threshold** (the 2003 applet): every column has the same critical slope $h_c$.
- **Oslo**: after each move the site's threshold is redrawn from $\{h_c, h_c+1\}$. This is
  the Oslo rice-pile model (Christensen, Corral, Frette, Feder and Jøssang, 1996).

## Physical model

Let $h_i$ be the height of column $i=0,\dots,L-1$ and $z_i = h_i - h_{i+1}$ the local slope
(with $h_L \equiv 0$ outside the box). Rule: if $z_i \ge z_i^c$ then $h_i \to h_i - 1$ and
$h_{i+1} \to h_{i+1}+1$. The pile is driven by adding a grain at $i=0$ whenever it is
stable (separation of time scales: relaxation is infinitely fast compared with driving).

**A fixed threshold in 1D is not critical.** With constant $z_i^c = h_c$ the stationary
state is a perfect staircase of slope $h_c - 1$. Each new grain makes $z_0 = h_c$, rolls to
column 1, which then has $z_1 = h_c$, and so on until it leaves on the right: every
avalanche has exactly size $L$. No fluctuations, no power laws. This is the well-known
result that the Bak–Tang–Wiesenfeld (BTW) model is trivial in one dimension; BTW
self-organized criticality needs $d\ge 2$.

**The Oslo model is critical in 1D.** The dynamical disorder of the thresholds produces a
power-law avalanche-size distribution with a finite-size cutoff,

$$ P(s) \sim s^{-\tau_s}\, \mathcal G\!\left(\frac{s}{L^{D}}\right), \qquad \tau_s \simeq 1.55,\quad D \simeq 2.25, $$

with the scaling relation $D(2-\tau_s) = 1$, which follows from the fact that in the
stationary state the mean avalanche size is $\langle s\rangle = L$ (each grain must
eventually travel the whole system). The stationary mean slope is $\langle z\rangle \approx
1.7$ for thresholds $\{1,2\}$, i.e. $h_c = 1$ in our parametrisation; with $h_c=2$
(thresholds $\{2,3\}$) the mean slope lies between 2 and 3 and the phenomenology is the
same.

With $L=24$ columns the cutoff sits at $s \sim L^{2.25} \approx 1300$ and the power law
spans about two decades: enough to see it in the applet.

## Simulation algorithm

- One relaxation sweep runs over the columns from left to right and moves one grain at
  every unstable site (sequential update, as in the original). The avalanche ends when a
  sweep moves nothing; its size is the total number of moves and its duration the number of
  sweeps.
- The "no animation" mode adds one grain and relaxes completely per step.
- $P(s)$ is estimated with logarithmic bins (4 per decade), divided by the number of
  integers falling in each bin to get a density comparable with the power law.

## Questions

1. With the fixed threshold, what size are all avalanches in the steady state? Why is there no criticality?
2. With the Oslo model, measure the exponent τ of P(s) and compare it with 1.55. How many avalanches do you need for a stable fit?
3. Change the size L: where does the power law cut off? How does the maximum avalanche size scale with L?

## Changes with respect to the original applet

| Original | Here | Reason |
|---|---|---|
| Fixed threshold only, 12 columns, 300 grains, grain-by-grain animation | Fixed and Oslo, up to 200 columns, unlimited grains | The original cannot show criticality |
| The "time / #" plot was created but never drawn | Time series of $s$ and log-log $P(s)$ | It was unfinished |
| Pile heights measured in GIF pixels | Model free of graphics units | Separate physics from drawing |
| Heights printed to the console at the end | On-screen readouts: grains added, in pile, left, mean slope | |

## Tests

`tests/pila.test.js`: grain conservation (added = in pile + left) in both modes; with a
fixed threshold, after the transient every avalanche has size $L$ and the profile is a
staircase of slope $h_c-1$; in Oslo with $L=64$ and 20 000 grains the sizes span at least
two decades, the density decreases and the mean slope lies in the expected range;
normalisation of the $P(s)$ estimator.

## Didactic evaluation

**What it delivers.** The direct comparison between a trivial and a critical model sharing
the same basic rule is very instructive: it shows that self-organized criticality is not
guaranteed by "threshold + slow driving" but depends on dimension and disorder.

**Controls.** Columns, $h_c$, model, animation on/off, plot (time series or log-log
distribution with a reference slope of $-1.55$).

**Limitations and improvements.** Missing: the duration distribution and a data collapse
in $L$ (plot $P(s)L^{\tau D}$ against $s/L^D$ for several $L$), which would be the
quantitative demonstration of scaling. A natural next step is the 2D BTW pile with
avalanche visualisation, the classic SOC picture.
