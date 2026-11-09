# Tight-binding approximation to superlattices

## What you see

The eigenstates of a superlattice described by its amplitudes $C_n$ in each well: extended waves in the periodic superlattice, localised states when the well levels are disordered and a Wannier–Stark ladder when an electric field is applied.

## Physical model

Taking the isolated-well envelope functions as "orbitals" and neglecting their overlap, the Ben Daniel–Duke equation reduces to the recurrence

$$E_nC_n - TC_{n+1} - TC_{n-1} = EC_n,$$

with $T$ the transfer integral (energy unit). For $E_n = 0$ the Bloch solution gives the miniband $E = -2T\cos k$ (in an open chain of $N$ wells, $k = j\pi/(N+1)$). With random $E_n = W(r_n - \tfrac12)$ the states localise (Anderson) and the participation ratio $P = 1/\sum|C_n|^4$ drops below $N$. With $E_n = -Fn$ the spectrum is the Wannier–Stark ladder $E_j = Fj$ and each state spans about $4T/F$ wells.

## Algorithm

$N \times N$ tridiagonal matrix (diagonal $E_n$, off-diagonal $-1$): eigenvalues by Sturm bisection, eigenvector of the chosen state by inverse iteration. Start to scan the eigenstates in order of energy.

## Changes with respect to the original applet

| Original (2002) | Here | Reason |
|---|---|---|
| C_n of the chosen eigenstate with disorder and field | Same, plus the full spectrum against the −2cos k band, the participation ratio and the Stark length | Quantify localisation |

## Tests

`tests/dc.test.js`: the ordered chain reproduces −2cos[jπ/(N+1)] (10⁻⁸); disorder W = 4 reduces the participation of the central state below 0.4N; with F = 0.5 the central levels are spaced exactly F and the state spans fewer than 1.5·4T/F + 2 wells.

## Didactic assessment

A bridge between Solid State Physics (tight binding, Anderson, Bloch) and devices; the same Hamiltonian as Solid State experiment 11 in stationary form. Source: *Experimentos Interactivos* course (UCM), Quantum Devices experiment 8, F. Domínguez-Adame.
