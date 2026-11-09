# Electrons in a disordered alloy

## What you see

The δ-potential chain of the previous experiment, but with two atomic species, $\lambda_A$ (host) and $\lambda_B$ (impurity), placed at random with concentration $c$: a binary substitutional alloy. $\langle\ln T\rangle$, the disorder average of the log-transmission, is plotted versus energy or versus chain length. Where the pure crystal had bands with $T \approx 1$, the alloy has negative $\langle\ln T\rangle$ proportional to $-N$: all states are localised.

## Physical model

With random $\lambda_n$ Bloch's theorem no longer holds. In one dimension any disorder, however weak, produces **Anderson localisation**: wave functions decay exponentially, $|\psi| \sim e^{-|x|/\xi}$, and the transmission of a chain of length $N$ behaves as

$$\langle\ln T\rangle \simeq -\frac{N}{\xi(E)},$$

where $\xi(E)$ is the localisation length (larger at the centre of the former bands and for weak disorder). $\ln T$ is averaged, a self-averaging variable with an approximately Gaussian distribution, not $T$, whose mean is dominated by rare, almost transparent realisations. In three dimensions there is a metal–insulator transition; in one, there is not.

## Algorithm

Same transfer matrix as experiment 5 with $\lambda_n$ drawn per realisation; "versus $E$" mode (300 energies) and "versus $N$" mode (40 lengths at fixed energy, with a linear fit whose slope gives $-1/\xi$). The pure-crystal bands are shaded as reference.

## Changes with respect to the original applet

| Original (2002) | Here | Reason |
|---|---|---|
| $\langle\ln T\rangle(E)$ and $\langle\ln T\rangle(N)$ | Same, plus live $\xi$ estimate, linear fit and pure-crystal bands | Quantify localisation |

## Tests

`tests/fes2.test.js`: for $\lambda \in \{1, 3\}$ at 50 % and $E = 4$, $\langle\ln T\rangle$ decreases monotonically with $N = 50, 100, 200$ at a rate above 0.005 per site.

## Didactic assessment

A first contact with Anderson localisation, with the statistical message of why the logarithm is averaged. Source: *Experimentos Interactivos* course (UCM), Solid State Physics experiment 6, F. Domínguez-Adame.
