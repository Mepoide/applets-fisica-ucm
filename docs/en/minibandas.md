# Minibands in a semiconductor superlattice

## What you see

The allowed energy minibands of a GaAs/Al_xGa_{1−x}As superlattice (wells of thickness $d_p$ separated by barriers of thickness $d_b$) and their dispersion relation $E(K)$ in the mini Brillouin zone. The Kronig–Penney model with effective masses is compared with δ barriers of the same area.

## Physical model

With Bloch's theorem, $\chi(z + L) = e^{iKL}\chi(z)$, $L = d_p + d_b$, and continuity of $\chi$ and $\chi'/m$, the dispersion relation for $0 < E < V_0$ is

$$\cos KL = \cos kd_p\cosh\kappa d_b + \frac12\left(\frac{\kappa m_A}{k m_B} - \frac{k m_B}{\kappa m_A}\right)\sin kd_p\sinh\kappa d_b,$$

with $k = \sqrt{2m_AE}/\hbar$, $\kappa = \sqrt{2m_B(V_0 - E)}/\hbar$ (and $\kappa \to ik_B$ above the barrier). Energies with $|\cos KL| \le 1$ form minibands, centred near the isolated-well levels and with a width that grows exponentially as the barriers get thinner. If $d_b \ll d_p$ the barrier can be replaced by a δ of area $V_0d_b$: $\cos KL = \cos kL + (m_AV_0d_b/\hbar^2k)\sin kL$.

## Algorithm

The right-hand side is evaluated on a fine energy grid and the crossings of $|{\rm rhs}| = 1$ detected; $K = \arccos({\rm rhs})/L$. Start to sweep $d_b$ and build the miniband diagram.

## Changes with respect to the original applet

| Original (2002) | Here | Reason |
|---|---|---|
| Minibands and dispersion of both models | Same, plus the animated miniband–thickness diagram and the isolated level as reference | Watch levels broaden into bands |

## Tests

`tests/dc.test.js`: the Kronig–Penney function agrees (10⁻⁹) with the half-trace of the one-period transfer matrix built from the mass boundary conditions; the first miniband contains the isolated-well level; with 4 Å barriers the band edges of both models differ by less than 4 meV.

## Didactic assessment

An artificial crystal with tailored periodicity: it connects the Kronig–Penney model of Solid State Physics directly with real devices. Source: *Experimentos Interactivos* course (UCM), Quantum Devices experiment 7, F. Domínguez-Adame.
