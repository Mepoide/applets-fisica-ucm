# Electronic states in quantum wells

## What you see

The confined levels of an electron in a GaAs layer between Al_xGa_{1−x}As barriers, solved graphically: the curves tan θ and −cot θ against the root function (m_A/m_B)κ/k, whose intersections are the levels. On the right, the well with its levels and envelope functions, together with the infinite-well levels for comparison.

## Physical model

In the effective-mass approximation (Ben Daniel–Duke model) the envelope function obeys

$$-\frac{\hbar^2}{2}\frac{d}{dz}\left[\frac{1}{m(z)}\frac{d\chi}{dz}\right] + V(z)\chi = E\chi,$$

with $V = 0$, $m = m_A$ in the well and $V = V_0$, $m = m_B$ in the barriers. Integrating across the interface shows that $\chi$ and $\chi'/m$ are continuous: the mass discontinuity produces a jump in the derivative. With $k^2 = 2m_AE/\hbar^2$, $\kappa^2 = 2m_B(V_0 - E)/\hbar^2$ and $\theta = ka/2$, even states satisfy $\tan\theta = (m_A/m_B)\kappa/k$ and odd ones $-\cot\theta = (m_A/m_B)\kappa/k$. The number of levels is $\lceil 2\theta_0/\pi\rceil$ with $\theta_0 = (a/2)\sqrt{2m_AV_0}/\hbar$: there is always at least one. Parameters: $m_A = 0.067m$, $m_B = m_A(1 + 1.24x)$, $V_0 = 0.773x$ eV.

## Algorithm

The transcendental equations are written in phase form, $\theta - \arctan g(\theta) = n\pi$ (even) or $n\pi + \pi/2$ (odd), monotonic in $\theta$, and solved by bisection branch by branch. Envelopes are $\cos kz$ / $\sin kz$ inside and exponentials $e^{-\kappa(|z| - a/2)}$ outside. Start to sweep the well width.

## Questions

1. For x = 0.3, from which width does the second level appear? And the third? Compare with the condition θ₀ = π/2, π.
2. Compare the ground level with the infinite-well one for a = 50, 100, 200 Å. When is the error below 10 %?
3. How does the penetration of the envelope into the barrier change as the level approaches V₀? Relate it to κ.

## Changes with respect to the original applet

| Original (2002) | Here | Reason |
|---|---|---|
| Graphical solution and envelopes for given x and a | Same, plus infinite-well levels, state count and width sweep | Watch levels being born |

## Tests

`tests/dc.test.js`: levels lie below the infinite-well ones and below V₀, agree with the finite-difference diagonalisation of the same well with different masses within 1 meV, and a 20 Å well has exactly one state.

## Didactic assessment

The basic problem of the whole section: how confinement quantises energy and how the different barrier mass enters the boundary conditions. Source: *Experimentos Interactivos* course (UCM), Quantum Devices experiment 1, F. Domínguez-Adame.
