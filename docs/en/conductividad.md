# Thermal conductivity

## What you see

A hard-disk gas in a channel whose left wall is a thermal reservoir at $T_1$ and whose right wall is a reservoir at $T_2$. Every disk touching a reservoir is re-emitted with a Maxwellian velocity at that reservoir's temperature; top and bottom walls are specular. The energy entering through the hot wall and leaving through the cold one is accumulated, giving the heat current $Q$ and the conductivity $\kappa$. On the right, the time-averaged temperature profile $T(x)$ (or density profile) against the Fourier straight line between $T_1$ and $T_2$. Each disk's colour encodes its kinetic energy.

## Physical model

Fourier's law defines $\kappa$ through $Q = -\kappa\,\partial T/\partial x$, with $Q$ the heat flux per unit transverse length (in 2D). If $\kappa$ does not depend on $T$ the steady profile is linear and

$$\kappa = \frac{Q/L_y}{(T_1 - T_2)/L_x}.$$

A mean-field estimate for a dilute gas gives $\kappa \simeq \tfrac{1}{3\sqrt2}\,c\,\bar v/\sigma$, with $c$ the specific heat per particle, $\bar v$ the mean speed and $\sigma$ the cross section; since $\bar v \propto \sqrt T$, $\kappa \propto \sqrt T$. The numerical factor is only approximate (it assumes all particles share one speed), but the $T$ dependence is a testable prediction: the panel shows $\kappa/\sqrt{\bar T}$, which should stay the same when the temperatures change.

A second effect, visible with a large $\Delta T$, is the density gradient: on the cold side particles are slow and pile up, on the hot side they are fast and sparse, so that the pressure $p = \rho k T$ is uniform. The "variation of $\rho T$" indicator checks it.

**Thermal walls.** For the reservoir to really be at $T_i$ the re-emitted velocity is not sampled from the Maxwellian but from the flux distribution: the normal component follows a Rayleigh distribution, $f(v_n) \propto v_n e^{-m v_n^2/2kT}$, and the tangential one a Gaussian. Sampling the plain Maxwellian would make the wall cool the gas.

## Algorithm

Event-driven hard-disk engine (`applets/_kinetic/disks.js`) with `walls.left = {thermal: T1}` and `walls.right = {thermal: T2}`. At every contact with a reservoir $\tfrac12 m(v'^2 - v^2)$ is added to `heat[side]`. The slab profile accumulates, at every step, the kinetic energy and the particle number of each slab; $T(x)$ is the mean energy per particle (two degrees of freedom, $k_B = 1$). "Reset statistics" zeroes the counters without touching positions, to measure only in the steady state.

## Changes with respect to the original applet

| Original (`ejerc4`, 2002) | Here | Reason |
|---|---|---|
| Exchanged energy and "conductivity" not normalised by $L_y$ nor by the time since reset | $\kappa = (Q/L_y)/(\Delta T/L_x)$ with $Q$ per unit time | Correct units; comparable values |
| Energy histogram in a separate window | Averaged $T(x)$ profile against the Fourier line, and $\rho(x)$ with $\rho T$ | Direct comparison with Fourier's law and uniform pressure |
| Fixed-step dynamics | Event-driven engine | Phase-1 correction |
| No steady-state indication | $Q_{\rm in}/Q_{\rm out}$ indicator | Avoid reading $\kappa$ during the transient |

## Tests

`tests/conductividad.test.js`: with $T_1 = T_2$ the net current is below 20 % of that of a gas with $\Delta T = 1.5$; with $T_1 = 2$, $T_2 = 0.5$ energy enters on the left and leaves on the right with currents of the same order, the $T(x)$ profile decreases and $\rho T$ varies by less than 45 % between slabs; $\kappa$ is finite and positive. Thermal walls and conservation: `tests/disks.test.js`.

## Didactic assessment

It introduces a transport coefficient measured "as in the lab", with its problems: transient, statistical noise, steady state. The two checks (κ ∝ √T and uniform pressure) are experiments the student can design by changing $T_1$, $T_2$ and $N$. Source: *Experimentos Interactivos* course (UCM), experiment 3 of Non-equilibrium Systems, R. Brito.
