# Gaussian GaAs-AlGaAs superlattices

## What you see

The transmission coefficient of a superlattice whose barrier heights are modulated by a Gaussian centred on the central barrier, compared with the uniform superlattice. The modulation turns the resonance-filled miniband into a smooth transmission window.

## Physical model

In the tight-binding approximation the superlattice is equivalent to a chain whose even nodes (wells) have energy 0 and odd nodes (barriers) $E_n = E_0\exp(-n^2/2S^2)$, with $n$ the number of periods from the central barrier. Connected to two contacts (semi-infinite chains with $\varepsilon = 0$, $E = -2T\cos k$), the transmission follows from the transfer matrix

$$\begin{pmatrix} C_{n+1} \\ C_n \end{pmatrix} = \begin{pmatrix} E_n - E & -1 \\ 1 & 0 \end{pmatrix}\begin{pmatrix} C_n \\ C_{n-1} \end{pmatrix}.$$

In the uniform superlattice each well contributes a resonance and the transmission drops between them, which degrades the peak-to-valley ratio of the I–V; with $S$ of the order of a quarter of the length the outer barriers are low, act as an adiabatic coupling to the contacts and the transmission window flattens.

## Algorithm

Amplitude recursion from a pure outgoing wave in the right contact to the left one, where incident and reflected amplitudes are separated; $T = 1/|A|^2$. Start to reduce $S$ from the uniform case.

## Changes with respect to the original applet

| Original (2002) | Here | Reason |
|---|---|---|
| T(E) of the Gaussian superlattice | Same, overlaid on the uniform one, with the barrier profile, the equivalent lattice and the count of minima in the window | Measure the Gaussian improvement |

## Tests

`tests/dc.test.js`: a chain without barriers transmits 1; 0 ≤ T ≤ 1 across the band; the uniform 9-barrier superlattice has more transmission minima than the Gaussian one with S = N_b/4, and both reach T > 0.9.

## Didactic assessment

Device design with wave physics: Gaussian apodisation from optics applied to electrons. Gaussian superlattices were a research topic of the UCM group. Source: *Experimentos Interactivos* course (UCM), Quantum Devices experiment 9, F. Domínguez-Adame.
