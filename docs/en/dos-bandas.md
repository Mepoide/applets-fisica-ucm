# Quantum wells in a two-band model

## What you see

The levels of a quantum well computed with the one-band model (Ben Daniel–Duke) and with the two-band (Kane) model, in which the effective mass grows with energy. GaAs-AlAs (wide gap) and InAs-GaSb (narrow gap) are compared and the error of the parabolic model is measured.

## Physical model

Coupling the conduction and valence bands with a velocity parameter $v$, the conduction envelope obeys a Ben Daniel–Duke-type equation with mass $m(z, E) = [E - E_v(z)]/2v^2$. Measuring $E$ from the well bottom and requiring the right parabolic limit in each material,

$$m_A(E) = m_A\left(1 + \frac{E}{E_{gA}}\right),\qquad m_B(E) = m_B\left(1 + \frac{E}{E_{gB}}\right),$$

which are substituted into the transcendental equations of Exercise 1. Non-parabolicity lowers every level and the one-band error grows with $E/E_g$. Parameters: GaAs ($0.067m$, 1.52 eV), AlAs ($0.150m$, 3.02 eV), $V_c = 1.12$ eV; InAs ($0.023m$, 0.36 eV), GaSb ($0.041m$, 0.67 eV), $V_c = 0.82$ eV.

Note: the original sheet writes $m_B(E) = m_A(1 + E/E_{gB})$, which does not reproduce the parabolic barrier mass; here $m_B$ is used as prefactor.

## Algorithm

The same phase equations of Exercise 1 with masses evaluated at $E$, solved by bisection in $E$. Start to sweep the width and trace $E(a)$ in both models.

## Changes with respect to the original applet

| Original (2002) | Here | Reason |
|---|---|---|
| One- and two-band levels and error | Same, plus the full E(a) curve and the drawn mass m(E) | See where non-parabolicity matters |

## Tests

`tests/dc.test.js`: every two-band level lies below the one-band one and the relative ground-state error is larger in InAs-GaSb than in GaAs-AlAs.

## Didactic assessment

It shows the limits of the parabolic effective-mass approximation with a minimal change in the calculation. Source: *Experimentos Interactivos* course (UCM), Quantum Devices experiment 4, F. Domínguez-Adame.
