# Irreversibility and fluctuations in equilibrium

## What you see

Three views of the same phenomenon. **A**: $N$ hard disks start in the left half of a box; on start the partition is removed and the gas expands. $\Delta(t) = n_{\rm left} - n_{\rm right}$ is plotted with the equilibrium $\pm\sigma$ and $\pm 3\sigma$ bands. **B**: Ehrenfest's "random model", with no dynamics: each step a particle is picked at random and moved to the other side. **C**: fluctuations of the particle number inside an arbitrary window of an ideal gas (Poisson, binomial and autocorrelation). With few particles the expansion reverses by itself now and then; with a hundred, never.

## Physical model

If the particles are independent and both halves have the same volume, the probability of finding $n$ on the left is binomial,

$$P(n) = \binom{N}{n} 2^{-N},$$

maximal at $n = N/2$ and minimal at $n = 0$ and $n = N$. The ratio of the two, with Stirling, is $P(N/2)/P(0) \approx 2^N\sqrt{2/(\pi N)}$: the probability of seeing the whole gas on one side decays exponentially with $N$. For $N = 6$ it is $2^{-5} \approx 3\%$, for $N = 20$ it is $2 \cdot 10^{-6}$ and for $N = 100$, $10^{-30}$. In the variable $\Delta = 2n - N$ the binomial is, for large $N$, a Gaussian of width $\sigma_\Delta = \sqrt N$; in the relative deviation $x = \Delta/N$, $\sigma_x = 1/\sqrt N$: relative fluctuations become invisible at the macroscopic scale.

Irreversibility is not in the dynamics (hard-disk dynamics is reversible) but in the number of degrees of freedom: the initial state is one among $2^N$ equally probable equilibrium states. Model B proves it by reproducing exactly the same statistics with no mechanics at all: it is the Ehrenfest Markov chain, whose stationary state is the binomial above.

## Algorithm

A: event-driven hard-disk engine (`applets/_kinetic/disks.js`) with a partition at $x = L/2$ that opens on the first step; Maxwellian initial velocities at the chosen temperature. B: `left -= 1` with probability `left/N`, otherwise `left += 1`. The series $\Delta(t)$ is stored (up to 20 000 values) and the histogram drops the initial transient (100 steps in A, $5N$ in B). C: the phase-1 `fluctuaciones` applet, embedded.

## Changes with respect to the original applet

| Original (`HardDisksApplet`, `GasApplet`, `IrreversibilidadApplet`, 2002) | Here | Reason |
|---|---|---|
| Bands at $\pm 1/\sqrt N$ on the relative deviation | Bands $\pm\sqrt N$ and $\pm 3\sqrt N$ on $\Delta$ | Same physics, in the plotted variable |
| Histogram in a separate window | Histogram of $\Delta$ against the exact binomial on the same plot, with the $\sigma$ indicator | Direct comparison |
| Fixed-step disk dynamics | Event-driven engine, no overlaps or energy loss | Phase-1 correction |
| Three separate applets | Three views in one experiment sharing the live equation | See that the statistics do not depend on the model |

## Tests

`tests/irreversibilidad.test.js`: Ehrenfest with $N = 50$ and $10^5$ steps has mean $\approx 0$ and variance $\approx N$, and its (thinned) histogram is indistinguishable from the binomial ($\chi^2$, $p > 0.01$); the gas starts with $\Delta = N$ and after opening the partition more than a sixth crosses to the right; `binomialDiff` is normalised, symmetric, has $\sigma = \sqrt N$ and $P(|\Delta| = N) = 2^{1-N}$. Disk engine: `tests/disks.test.js`.

## Didactic assessment

It lets you "see" Boltzmann's argument: change $N$ from 6 to 100 and watch the recurrences vanish. View B isolates the combinatorial argument from mechanics. High interactivity: $N$, temperature, plot type, and the free window of view C. Source: *Experimentos Interactivos* course (UCM), experiment 2 of Non-equilibrium Systems, R. Brito.
