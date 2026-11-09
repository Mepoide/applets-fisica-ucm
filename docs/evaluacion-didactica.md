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
