# Central limit theorem

## What you see

$N$ independent random variables with the same distribution (a die 1–6, a uniform number in $[0,1]$ or a 0/1 coin) are generated and added. Left: the last draw, the $N$ values and their sum $S$. Right: the histogram of accumulated sums against the Gaussian predicted by the central limit theorem. With $N = 1$ the histogram is the parent distribution; as $N$ grows it looks more and more like a bell, whatever the original variable.

## Physical model

If $x_1,\dots,x_N$ are independent, with mean $\mu$ and variance $\sigma^2$, the sum $S = \sum_i x_i$ has mean $N\mu$ and variance $N\sigma^2$ exactly, and the **central limit theorem** states that its distribution tends, for $N \to \infty$, to the Gaussian

$$P(S) = \frac{1}{\sqrt{2\pi N\sigma^2}}\,\exp\!\left[-\frac{(S-N\mu)^2}{2N\sigma^2}\right],$$

regardless of the shape of the distribution of the $x_i$ (finite variance suffices). The relative width $\sigma_S/\langle S\rangle = (\sigma/\mu)/\sqrt N$ decreases with $N$: this is where the $1/\sqrt N$ of relative fluctuations in every macroscopic system comes from. For discrete variables the Gaussian envelopes the probabilities of the integer values; for small $N$ the corrections are visible (the triangle at $N = 2$, the skew of a biased binomial).

## Algorithm

Each step draws $N$ samples with the pseudo-random generator, adds them and accumulates a histogram: integer bins for die and coin, 60 bins on $[\mu_S - 5\sigma_S, \mu_S + 5\sigma_S]$ for the uniform. Sample mean and variance and a $\chi^2/{\rm dof}$ over bins with expected count $\ge 5$ are computed.

## Questions

1. With N = 1 the sum is the variable itself: what distribution do you see? How many terms are needed for the uniform-distribution histogram to be indistinguishable from the Gaussian by eye? And for the exponential, which is asymmetric?
2. Measure the histogram width for N = 1, 4, 16 and check that it grows as √N. What happens to the width of the mean instead of the sum?
3. Find a starting distribution for which the theorem fails (infinite variance). Which condition of the theorem is violated?

## Changes with respect to the original applet

| Original (`TLCApplet`, 2002; inspired by one by T. Ogden) | Here | Reason |
|---|---|---|
| Histogram and Gaussian | Same, plus the last-draw view and measured mean/variance/χ² | See where each sum comes from and quantify convergence |
| $N \le N_{\max}$ | $N$ up to 200 | See the $1/\sqrt N$ |

## Tests

`tests/fises1.test.js`: sums of 12 dice have the predicted mean and variance and pass the $\chi^2$ against the Gaussian; with $N = 1$ the uniform is flat; sums of 4 coins are binomial-shaped.

## Didactic assessment

First experiment of the block: it introduces the histogram, the comparison with a prediction and the idea that the collective erases microscopic details. Source: *Experimentos Interactivos* course (UCM), Statistical Physics experiment 1, R. Brito.
