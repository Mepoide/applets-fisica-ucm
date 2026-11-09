# Evaluación didáctica y propuestas / Didactic evaluation and proposals

Fecha / date: 2026-11-09. Conclusión de la primera fase (puerto + auditoría). Aquí paramos y
decidimos qué crear nuevo. End of phase one (port + audit); the next phase is decided from here.

## ES — Evaluación por applet

| Applet | Interactividad | Qué aprende el estudiante | Valor | Limitación principal |
|---|---|---|---|---|
| maxwell | N, radio, 4 distribuciones iniciales, promedio temporal, velocidad | Equilibrio emergente desde cualquier condición inicial; forma 2D de Maxwell; equipartición; papel de las paredes | Alto | Falta medida cuantitativa de la convergencia (entropía $H(t)$) |
| pila-arena | Columnas, umbral, modelo fijo/Oslo, animación o no, dos gráficas | Diferencia entre un modelo con umbral trivial y uno crítico; leyes de potencias y cortes de tamaño finito | Alto (tras añadir Oslo) | Sin colapso de datos con $L$; 1D es menos visual que BTW 2D |
| fluctuaciones | Ventana arrastrable, N, T, tres gráficas | Colectividades canónica vs gran canónica, $N^{-1/2}$, tiempo de correlación | Alto | Gas ideal: no conecta con compresibilidad |
| onda-lgca | Tamaño, densidad, radio, suavizado, dos perfiles, promedio | Hidrodinámica emergente de reglas booleanas; $c_s$ predicha e independiente de la densidad | Medio-alto | Ruido estadístico; la red periódica limita el tiempo útil |
| modos-lineales | 5 parámetros, deslizador de tiempo, paneles activables, modos separados | Espectro de Rayleigh–Brillouin, pesos de Landau–Placzek, sonido adiabático vs modo térmico isobaro | Medio-alto | Es una fórmula animada: sin componente de "simulación" |
| von-karman | Geometría, $f$, $u$, placa, regla de pared, cuatro modos de visualización | Factor galileano, viscosidad de red, Re efectivo, compresibilidad; estela | Medio | Ruido y coste: la calle de vórtices clara exige Re y tiempos difíciles en JS con FHP |

### Valoración global

El conjunto cubre tres hilos coherentes: (1) gases de partículas y equilibrio (maxwell,
fluctuaciones), (2) gases reticulares e hidrodinámica (onda-lgca, modos-lineales, von-karman),
(3) sistemas complejos (pila-arena). Tras el puerto todos funcionan en navegadores actuales,
tienen controles reales y comparación con teoría en pantalla, que era lo que más faltaba en los
originales (varios tenían gráficas vacías, botones sin función o escalas incoherentes).

### Propuestas para la fase siguiente (ordenadas por relación valor/esfuerzo)

1. **Boltzmann en red D2Q9** para el canal con obstáculo, reutilizando la vista de von-karman:
   sin ruido, Re arbitrario, calle de Von Kármán en segundos, número de Strouhal medible.
   Reutiliza `lib/` y el coarse-graining. Esfuerzo medio.
2. **Pila de arena BTW 2D** con visualización de avalanchas y exponentes: la imagen clásica de
   la SOC, complementa el 1D. Esfuerzo bajo-medio.
3. **Entropía $H(t)$ y recorrido libre medio** en maxwell; **colapso de datos** en pila-arena.
   Esfuerzo bajo cada uno.
4. **Modelo de Ising 2D** (Metropolis / Wolff) con magnetización, susceptibilidad y Binder:
   el applet de física estadística que falta en la colección. Esfuerzo medio.
5. **Fluctuaciones con discos duros**: enlaza fluctuaciones con compresibilidad usando el motor
   de maxwell. Esfuerzo bajo.
6. **Camino aleatorio y difusión** (1D/2D, histograma vs gaussiana, $\langle x^2\rangle = 2Dt$):
   puente natural entre partículas y el modo térmico de modos-lineales. Esfuerzo bajo.

## EN — Per-applet evaluation

| Applet | Interactivity | What the student learns | Value | Main limitation |
|---|---|---|---|---|
| maxwell | N, radius, 4 initial distributions, time averaging, speed | Emergent equilibrium from any initial condition; 2D Maxwell shape; equipartition; role of walls | High | No quantitative convergence measure (entropy $H(t)$) |
| pila-arena | Columns, threshold, fixed/Oslo model, animation on/off, two plots | Trivial threshold model vs critical one; power laws and finite-size cutoffs | High (after adding Oslo) | No data collapse in $L$; 1D is less visual than 2D BTW |
| fluctuaciones | Draggable window, N, T, three plots | Canonical vs grand canonical ensembles, $N^{-1/2}$, correlation time | High | Ideal gas: no link to compressibility |
| onda-lgca | Size, density, radius, smoothing, two profiles, averaging | Hydrodynamics emerging from Boolean rules; predicted, density-independent $c_s$ | Medium-high | Statistical noise; periodic lattice limits useful time |
| modos-lineales | 5 parameters, time slider, toggleable panels, separate modes | Rayleigh–Brillouin spectrum, Landau–Placzek weights, adiabatic sound vs isobaric thermal mode | Medium-high | An animated formula: no "simulation" component |
| von-karman | Geometry, $f$, $u$, plate, wall rule, four display modes | Galilean factor, lattice viscosity, effective Re, compressibility; wake | Medium | Noise and cost: a clear vortex street needs Re and times hard to reach with FHP in JS |

### Overall

The set covers three coherent threads: (1) particle gases and equilibrium (maxwell,
fluctuaciones), (2) lattice gases and hydrodynamics (onda-lgca, modos-lineales, von-karman),
(3) complex systems (pila-arena). After the port they all run in current browsers, have real
controls and on-screen comparison with theory, which is what the originals lacked most (several
had empty plots, dead buttons or inconsistent scales).

### Proposals for the next phase (by value/effort)

1. **D2Q9 lattice Boltzmann** channel with obstacle, reusing the von-karman view: no noise,
   arbitrary Re, vortex street in seconds, measurable Strouhal number. Medium effort.
2. **2D BTW sandpile** with avalanche visualisation and exponents. Low-medium effort.
3. **Entropy $H(t)$ and mean free path** in maxwell; **data collapse** in pila-arena. Low effort each.
4. **2D Ising model** (Metropolis / Wolff) with magnetisation, susceptibility and Binder cumulant:
   the missing statistical-physics applet. Medium effort.
5. **Fluctuations with hard disks**: links fluctuations to compressibility using the maxwell
   engine. Low effort.
6. **Random walk and diffusion** (1D/2D, histogram vs Gaussian, $\langle x^2\rangle = 2Dt$): a
   natural bridge between particles and the thermal mode of modos-lineales. Low effort.


---

## Fase 2 (2026-11-09): curso de 9 experimentos con ecuación viva / Phase 2: 9-experiment course with live equations

**ES.** Tras encontrar el contexto del TAD (ver `docs/contexto/`), el alcance pasó de "seis applets"
a la sección completa *Sistemas fuera del Equilibrio* del curso original. De las seis propuestas
de la fase 1 se descartaron por ahora las ajenas a esa sección (D2Q9, BTW 2D, Ising); la entropía
$H(t)$ y el camino aleatorio quedaron absorbidos por los experimentos 1–2 y 6–7. Lo construido:

| # | Experimento | Interactividad | Qué aprende el estudiante | Comparación teoría ↔ simulación |
|---|---|---|---|---|
| 1 | Anillo de Kac | N, M, 4 condiciones iniciales | Caos molecular como cierre, su validez a tiempos cortos, recurrencia de Poincaré | Δ(t) de campo medio superpuesta; cuenta atrás a T = 2N |
| 2 | Irreversibilidad y fluctuaciones | 3 vistas (gas, Ehrenfest, ventana), N, kT, histograma | La irreversibilidad es cuestión de N, no de la dinámica | Binomial exacta, bandas σ y 3σ, P(todas a un lado) |
| 3 | Conductividad térmica | N, T₁, T₂, perfiles T y ρ | Coeficiente de transporte medido como en el laboratorio; estado estacionario; presión uniforme | Recta de Fourier, κ ∝ √T, Q_in/Q_out |
| 4 | Ondas sonoras | FHP + solución lineal, f, R, γ, Γ, D_T | Hidrodinámica emergente; modelo atérmico vs fluido real; Landau–Placzek | Predicción acústica (Hankel) sobre el perfil radial; frente c_s |
| 5 | Maginu | s, n_max, red, especie, estado inicial | Reacción-difusión; sincronización por difusión; ruido de número finito | Ciclo límite RK4 vs media espacial |
| 6 | Browniano | N, M/m, R/r, kT, microscopio/MSD | Fluctuaciones → difusión; equipartición | ⟨Δr²⟩ = 4Dt ajustado; ½M⟨V²⟩ = kT; Enskog |
| 7 | Difusión en potencial | 3 potenciales, kT logarítmico en vivo | Metrópolis y estado de Boltzmann; relajación | p_i Boltzmann, χ²/dof, barra kT |
| 8 | Arrhenius | N, kT, asimetría A | Ley exponencial emergente; cada factor de Kramers; una aproximación habitual que falla | Tres tasas (Kramers red, armónica, curso) vs ajuste |
| 9 | Resonancia estocástica | N, kT, A, T, barrido automático | El ruido puede mejorar la respuesta; condición τ_K = T/2 | Amplitud de respuesta A_ω vs kT, kT_res predicho |

Valoración: la sección queda completa y cada experimento tiene al menos una comprobación
cuantitativa en pantalla. Pendiente para una fase 3, si se habla con R. Brito: las secciones
*Física Estadística* (11 experimentos, de las que `fluctuaciones` y `maxwell` ya cubren dos) y, con
F. Domínguez-Adame, *Estado Sólido* y *Dispositivos Cuánticos*.

**EN.** After the TAD context was found (`docs/contexto/`), the scope moved from "six applets" to
the whole *Non-equilibrium Systems* section of the original course. Of the six phase-1 proposals,
those outside that section (D2Q9, 2D BTW, Ising) were set aside; entropy $H(t)$ and the random
walk were absorbed by experiments 1–2 and 6–7. Every experiment now has at least one quantitative
check on screen (table above). A phase 3, if agreed with R. Brito, would cover *Statistical
Physics* (11 experiments, two already covered) and, with F. Domínguez-Adame, *Solid State* and
*Quantum Devices*.
