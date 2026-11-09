# Occupation fluctuations: Poisson, binomial and autocorrelation

## What you see

An ideal gas of $N$ particles with Maxwellian velocities bounces inside a box. You draw a
rectangular window with the mouse and the number of particles inside it, $N_V(t)$, is
counted at every instant. The time series fluctuates around $\langle N_V\rangle = Np$, with
$p$ the window's area fraction. The histogram of $N_V$ is compared with two theoretical
distributions and the autocorrelation shows the memory time of the fluctuations.

## Physical model

**Open subsystem of a closed system.** If the $N$ particles are independent and uniformly
distributed, each one is inside the window with probability $p$. The number inside then
follows a **binomial**:

$$ P(n) = \binom{N}{n} p^n (1-p)^{N-n},\qquad \langle n\rangle = Np,\qquad \sigma^2 = Np(1-p). $$

This is the exact result for the **canonical** ensemble (fixed N) of the ideal gas. In the
limit $p\to 0$, $N\to\infty$ with $\lambda = Np$ fixed one gets the **Poisson**
distribution

$$ P(n) = \frac{\lambda^n e^{-\lambda}}{n!},\qquad \sigma^2 = \lambda, $$

which is the occupation distribution of a small volume in contact with an infinite particle
reservoir (**grand canonical** ensemble). The difference between the two is the factor
$(1-p)$ in the variance: when the window covers half the box, fluctuations are half of what
Poisson predicts, because every particle entering the window is one missing outside. The
relative fluctuations decrease as $\sigma/\langle n\rangle = \sqrt{(1-p)/Np}\sim N^{-1/2}$:
the origin of the equivalence of ensembles in the thermodynamic limit.

**Autocorrelation.** With $\delta N(t) = N_V(t)-\langle N_V\rangle$,

$$ C(\tau) = \frac{\langle \delta N(t)\,\delta N(t+\tau)\rangle}{\langle \delta N^2\rangle}. $$

For free particles the correlation is lost once a typical particle has travelled the size
of the window: $\tau_c \sim L_V / v_{th}$ with $v_{th}=\sqrt{k_BT/m}$. The applet shows this
estimate next to the measured curve, so one can check that $\tau_c$ grows with the window
size and decreases as $\sqrt{T}$. Note that the ideal gas has no collision time: the memory
is set by geometry, not by interactions.

## Simulation algorithm

Free flight with specular wall reflection; Gaussian initial velocities (Box–Muller) with
variance $k_BT$ per component ($m=1$). Time step $dt = 0.1$ (or 1 in fast mode). The count
is recorded at every step; histogram, mean, variance and $C(\tau)$ (up to 300 lags) are
recomputed from the stored series. Changing the window clears the series.

## Changes with respect to the original applet

| Original | Here | Reason |
|---|---|---|
| Comparison with Poisson only, $\lambda$ computed with the total area including margins | Poisson **and** binomial, $p$ computed over the area accessible to the centres | The binomial is the exact answer; for large windows Poisson visibly fails |
| $\ln n!$ by Stirling's formula (inaccurate for small $n$) | $\ln\Gamma(n+1)$ (Lanczos) | Accuracy at $n = 0,1,2$ where Stirling fails |
| "Autocorrelation" button not implemented; writing to a local file that failed in the browser | $C(\tau)$ computed and drawn, estimate of $\tau_c$ | Complete the original's intent |
| Mouse window via canvas globals | Pointer events, mouse and touch | |
| Histogram in a separate pop-up window | Selectable plot tab | Pop-ups are blocked nowadays |

## Tests

`tests/fluctuaciones.test.js`: a window equal to the whole box always gives $N$, binomial
variance 0 and a constant autocorrelation equal to 1 with no NaN; mean within statistical
error of $Np$ and variance closer to binomial than to Poisson at $p\approx 0.4$; $1/e$ decay
lag of $C(\tau)$ compatible with $L_V/v_{th}$; initial kinetic temperature equal to $k_BT$.

## Didactic evaluation

**What it delivers.** A clean demonstration of the difference between ensembles and of
the origin of $N^{-1/2}$. The draggable window lets the student control $p$ intuitively.
The autocorrelation introduces the notion of correlation time in a system where it can be
predicted.

**Proposed improvements.** Add interacting particles (the hard disks of the Maxwell applet)
to see that the occupation distribution stops being binomial at high density (excluded
volume suppresses fluctuations: compressibility), connecting with the
fluctuation–compressibility relation $\sigma^2/\langle n\rangle = n k_BT\,\kappa_T$. Also plot $\sigma^2$ against $p$ for several windows
on one chart.
