# Resonant tunnelling diode

## What you see

The transmission coefficient of an electron through an Al_xGa_{1−x}As double barrier with a GaAs well in between, as a function of energy and applied voltage, and the resulting current–voltage characteristic with its resonance maximum and negative-differential-resistance region.

## Physical model

With a uniform effective mass $m^*$ and a linear potential drop $-Vz/L$ along the structure,

$$-\frac{\hbar^2}{2m^*}\chi'' + \left(V(z) - V\frac{z}{L}\right)\chi = E\chi.$$

Each isolated barrier transmits little, but when the energy matches the quasi-bound level of the well the reflected waves interfere destructively and $T \to 1$ (resonant tunnelling). The level drops with voltage (about $V/2$, since the well sits at the centre); the current at temperature $T$ is (Tsu–Esaki)

$$I \propto \int_0^\infty T(E, V)\,\ln\frac{1 + e^{(E_F - E)/k_BT}}{1 + e^{(E_F - E - eV)/k_BT}}\,dE,$$

which grows while the resonance sweeps the window of occupied emitter energies and collapses when it falls below the emitter band bottom: negative differential resistance.

## Algorithm

Discrete version $\chi_{n+1} + \chi_{n-1} = [2 - (2m^*s^2/\hbar^2)(V_n - E)]\chi_n$ with $s = 1$ Å, run from the collector (pure outgoing wave) to the emitter, where incident and reflected amplitudes are separated; $T$ includes the velocity ratio of the two contacts. The current is integrated with the trapezoid rule. Start to sweep the voltage and build the I–V.

## Questions

1. At zero bias, compare the resonance energy with the isolated-well level. Why does the transmission reach 1 if each barrier transmits ~10⁻³?
2. Run the voltage sweep: at which V is the current maximum? Compare with 2(E₀ − E_F) and explain the factor 2.
3. Double the barrier thickness: how do the resonance width and the peak current change? And when raising the temperature to 300 K?

## Changes with respect to the original applet

| Original (2002) | Here | Reason |
|---|---|---|
| T(E) at one voltage and I–V curve | Same, with T on a log scale over the biased profile, the isolated-well level marked and the animated sweep | Watch the resonance move |

## Tests

`tests/dc.test.js`: single-barrier transmission matches the analytic formula to 0.2 %; at zero bias the resonance has T > 0.9 and lies within 10 meV of the isolated-well level; the I–V has an interior maximum and the valley is below half the peak.

## Didactic assessment

The quantum device par excellence: it teaches tunnelling transmission, resonances and the link between transmission and current. Source: *Experimentos Interactivos* course (UCM), Quantum Devices experiment 3, F. Domínguez-Adame.
