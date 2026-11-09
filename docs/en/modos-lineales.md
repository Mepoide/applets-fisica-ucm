# Linearized hydrodynamics modes

## What you see

The analytic evolution of a small density perturbation in a fluid at rest. An initial
Gaussian pulse splits into **two sound pulses** travelling in opposite directions at the
sound speed $c_s$ while being damped, and **one thermal pulse** that stays put and
diffuses. Density $\delta\rho(x,t)$, velocity $u(x,t)$ and temperature $\delta T(x,t)$ are
shown. Time can be dragged back and forth because the solution is closed-form.

## Physical model

The hydrodynamic equations (continuity, Navier–Stokes, energy) linearized around
equilibrium $\rho,\,T,\,u=0$ admit, for wavenumber $k$, five modes: two sound modes with
$\omega = \pm c_s k - i\Gamma k^2$, one thermal mode with $\omega = -iD_T k^2$ and two
shear modes (which do not couple to density in 1D). Here

- $c_s$ is the adiabatic sound speed,
- $\Gamma = \tfrac12\left[\nu_\ell + (\gamma-1)D_T\right]$ is the sound attenuation
  coefficient ($\nu_\ell$ the longitudinal kinematic viscosity),
- $D_T = \kappa/(\rho c_p)$ is the thermal diffusivity,
- $\gamma = c_p/c_v$.

For the **isothermal** initial condition $\delta\rho(x,0) = G_\sigma(x)$, $u=0$,
$\delta T=0$, the solution to hydrodynamic order is

$$ \delta\rho(x,t) = \frac{1}{2\gamma}\Big[G_s(x-c_st,t)+G_s(x+c_st,t)\Big] + \Big(1-\frac1\gamma\Big)\,G_T(x,t), $$

with $G_s$ and $G_T$ normalised Gaussians of variances $\sigma^2 + 2\Gamma t$ and
$\sigma^2 + 2D_Tt$. The weights are those of **Landau and Placzek**: the sound (Brillouin)
fraction is $1/\gamma = c_v/c_p$ and the thermal (Rayleigh) fraction is
$1-1/\gamma = (c_p-c_v)/c_p$, so the Rayleigh/Brillouin **ratio** is $(c_p-c_v)/c_v = \gamma-1$.
The weights sum to 1: mass is conserved.

Where do the weights come from? Sound is adiabatic, $\delta T_s = (\gamma-1)(T/\rho)\,\delta\rho_s$
(ideal gas), whereas the thermal mode is isobaric, $\delta T_T = -(T/\rho)\,\delta\rho_T$.
Requiring $\delta T(x,0) = 0$ with $\delta\rho_s + \delta\rho_T = G_\sigma$ gives exactly
$\delta\rho_s = G_\sigma/\gamma$ and $\delta\rho_T = (1-1/\gamma)G_\sigma$. The temperature is

$$ \delta T(x,t) = \frac{T}{\rho}\Big[(\gamma-1)\,\delta\rho_s - \delta\rho_T\Big], $$

which vanishes at $t=0$ and later shows warm pulses travelling with the sound and a cold
well diffusing at the centre.

The velocity follows from continuity, $\partial_t\delta\rho + \rho\,\partial_x u = 0$,
integrated in $x$:

$$ u(x,t) = \frac{1}{\rho}\left\{\frac{1}{2\gamma}\Big[c_s\,(G_s^- - G_s^+) - \Gamma\,\partial_x(G_s^-+G_s^+)\Big] - \Big(1-\frac1\gamma\Big)D_T\,\partial_xG_T\right\}, $$

with $G_s^\mp = G_s(x\mp c_st,t)$. The first term dominates: the fluid moves outward with
each pulse. The $\Gamma$ and $D_T$ terms are small diffusive corrections (of order
$\Gamma/c_s\sigma$) that guarantee exact mass conservation; the price is that $u(x,0)$ is
not strictly zero but of that order. This is the usual limitation of the hydrodynamic-mode
ansatz with spreading Gaussians.

## Algorithm

No numerical integration: the three functions are evaluated at 601 points every frame. The
animation loop only advances $t$.

## Questions

1. Separate the thermal mode from the acoustic ones: what fraction of the initial density perturbation stays put? Compare with 1 − 1/γ (Landau–Placzek).
2. Set γ = 1: what happens to the thermal mode? Which fluid has γ = 1?
3. Increase the thermal diffusivity D_T: which mode broadens faster? And when Γ is increased?

## Changes with respect to the original applet

| Original | Here | Reason |
|---|---|---|
| Thermal weight $(c_p-c_v)/c_v$ with $c_v=1,\,c_p=2$: weights summing to 1.5 | $(c_p-c_v)/c_p = 1-1/\gamma$; sum to 1 | The Landau–Placzek ratio is Rayleigh/Brillouin, not the Rayleigh fraction |
| Gaussians $\propto \sqrt{1/\Gamma t}\,e^{-x^2/\Gamma t}$: variance $\Gamma t/2$, singular at $t=0$ | Variance $\sigma^2 + 2\Gamma t$, normalised | Finite initial width and the standard convention $\langle x^2\rangle = 2Dt$ |
| $u$ without the diffusive terms | Exact $u$ from continuity | Verifiable mass conservation |
| $\delta T$ with weights $1/(2\rho c_p)$ and $(c_p-c_v)/c_v$ unrelated to the modes | $\delta T$ derived from adiabatic sound and isobaric thermal mode (ideal gas); $\delta T(x,0)=0$ | Consistency with the initial condition |
| D(x), Ux(x), T(x) buttons without function; three curves stacked in one frame with arbitrary offsets | Three panels with their own axes, toggleable; separate modes dotted | |
| $\kappa$ as parameter with $\rho=1,\,c_p=2$ | $D_T$ and $\Gamma$ directly, plus $\gamma$ and $\sigma$ | These are the combinations that enter the physics |
| Forward animation only | Time slider | The solution is analytic |

## Tests

`tests/modos.test.js`: weights sum to 1 and the thermal mode vanishes for $\gamma=1$;
conservation of $\int\delta\rho\,dx$ in time and Gaussian initial profile;
$\delta T(x,0)=0$, $u(x,0)$ equal to the predicted diffusive residual and small compared
with the sound amplitude; antisymmetry of $u$; continuity equation satisfied numerically;
check that the original weights summed to 1.5.

## Didactic evaluation

**What it delivers.** It shows at once the Rayleigh–Brillouin spectrum of light scattering:
the central (thermal) peak and the two side (sound) peaks, their widths ($D_Tk^2$ and
$\Gamma k^2$) and their relative weights $\gamma-1$. Seeing $\delta T$ helps understand why
sound is adiabatic and the thermal mode isobaric.

**Improvements.** Add the spatial Fourier transform to literally show the spectrum
$S(k,\omega)$; allow temperature (heat pulse) and velocity (piston) initial conditions,
which distribute the weights differently; and a numerical nonlinear version (Lax–Wendroff
scheme) to watch shock formation when the amplitude is no longer small.
