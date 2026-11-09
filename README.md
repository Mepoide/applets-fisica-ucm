# Experimentos Interactivos en Sistemas Físicos Complejos · versión JavaScript

**ES.** Reescritura completa del curso **Experimentos Interactivos en Sistemas Físicos Complejos**
(UCM, 2002-2003; R. Brito y F. Domínguez-Adame): sus cuatro secciones y 42 experimentos, más los
3 applets del Trabajo Académicamente Dirigido de 2003, en HTML + JavaScript + Canvas, en una sola
página con portada, navegación lateral y páginas de presentación, bibliografía, enlaces y créditos.
En cada experimento la **ecuación que gobierna el sistema se muestra junto a la simulación con sus
símbolos sustituidos por los valores medidos** en tiempo real, con la definición de cada magnitud
debajo, y la predicción teórica se dibuja sobre los datos. Sin dependencias ni paso de compilación.

**EN.** Complete rewrite of the course **Interactive Experiments in Complex Physical Systems**
(UCM, 2002-2003; R. Brito and F. Domínguez-Adame): its four sections and 42 experiments, plus the
3 applets of the 2003 TAD, in HTML + JavaScript + Canvas, on one page with a landing hero, a
persistent sidebar and presentation, bibliography, links and credits pages. In every experiment the
**governing equation is shown next to the simulation with its symbols replaced by the measured
values** in real time, each quantity defined underneath, and the theoretical prediction is drawn
over the data. No dependencies, no build step: just serve the folder.

**Sitio / live site:** <https://mepoide.github.io/applets-fisica-ucm/>
(GitHub Pages desde `main`; `.nojekyll` evita que Jekyll descarte las carpetas `applets/_*`).

## Uso / Usage

```bash
npm run serve          # http://localhost:8080  (python3 -m http.server)
npm test               # 127 physics/unit tests (node:test)
npm run test:browser   # Playwright smoke: standalone pages, course home, sections, routes, mobile nav; screenshots
BASE_URL=https://mepoide.github.io/applets-fisica-ucm node tests/browser/smoke.mjs   # deployed site
node tests/browser/smoke.mjs kac ising            # only some slugs
```

Rutas / routes: `#/` portada · `#/presentacion`, `#/bibliografia`, `#/enlaces`, `#/creditos` ·
`#/s/<sección>` índice de sección · `#/<slug>` experimento. Cada experimento también existe como
página suelta para incrustar (`applets/<slug>/index.html`). Every experiment also exists as a
standalone page to embed.

## Experimentos / Experiments

### Física Estadística / Statistical Physics (`#/s/fises`)

| # | Ruta / route | ES | EN |
|---|---|---|---|
| 1 | `#/tlc` | Teorema del límite central | Central limit theorem |
| 2 | `#/kac` | Anillo de Kac | Kac ring |
| 3 | `#/baker` | Transformaciones del panadero y de Arnold | Baker and Arnold transformations |
| 4 | `#/osciladores` | Ergodicidad y entropía en un conjunto de osciladores | Ergodicity and entropy in a set of oscillators |
| 5 | `#/cvising` | Dimensionalidad y límite termodinámico en el modelo de Ising | Dimensionality and thermodynamic limit in the Ising model |
| 6 | `#/diatom` | Moléculas diatómicas | Diatomic molecules |
| 7 | `#/debye` | Vibraciones en sólidos cristalinos: teoría de Debye | Vibrations in crystalline solids: Debye theory |
| 8 | `#/irreversibilidad` | Irreversibilidad y fluctuaciones en equilibrio | Irreversibility and fluctuations in equilibrium |
| 9 | `#/macro` | Colectividad macrocanónica | Grand canonical ensemble |
| 10 | `#/bosefermi` | Estadísticas de bosones y fermiones | Boson and fermion statistics |
| 11 | `#/ising` | Modelo de Ising | Ising model |

### Sistemas fuera del Equilibrio / Non-equilibrium Systems (`#/s/sfe`)

| # | Ruta / route | ES | EN |
|---|---|---|---|
| 1 | `#/kac` | Anillo de Kac | Kac ring |
| 2 | `#/irreversibilidad` | Irreversibilidad y fluctuaciones en equilibrio | Irreversibility and fluctuations in equilibrium |
| 3 | `#/conductividad` | Conductividad térmica | Thermal conductivity |
| 4 | `#/ondas` | Ondas sonoras en un fluido | Sound waves in a fluid |
| 5 | `#/maginu` | Reacciones químicas: modelo de Maginu | Chemical reactions: Maginu model |
| 6 | `#/browniano` | Movimiento browniano | Brownian motion |
| 7 | `#/potencial` | Difusión en un potencial externo | Diffusion in an external potential |
| 8 | `#/arrhenius` | Procesos de activación: ley de Arrhenius | Activation processes: Arrhenius law |
| 9 | `#/resonancia` | Resonancia estocástica | Stochastic resonance |
| 10 | `#/maxwell` | Discos duros y distribución de Maxwell | Hard disks and the Maxwell distribution |
| 11 | `#/pila-arena` | Pila de arena y criticalidad autoorganizada | Sandpile and self-organized criticality |
| 12 | `#/von-karman` | Gas reticular con obstáculo: calle de Von Kármán | Lattice gas with an obstacle: Von Kármán street |

### Física del Estado Sólido / Solid State Physics (`#/s/fes`)

| # | Ruta / route | ES | EN |
|---|---|---|---|
| 1 | `#/madelung` | Evaluación de la constante de Madelung | Evaluation of the Madelung constant |
| 2 | `#/cadena-desordenada` | Vibraciones atómicas de una red desordenada | Atomic vibrations of a disordered lattice |
| 3 | `#/cuasicristal` | Vibraciones atómicas de un cuasicristal | Atomic vibrations of a quasicrystal |
| 4 | `#/conductividad-cadena` | Conductividad térmica de una cadena desordenada | Thermal conductivity of a disordered chain |
| 5 | `#/dispersion-red` | Dispersión de electrones en una red lineal | Electron scattering in a linear lattice |
| 6 | `#/aleacion` | Electrones en una aleación desordenada | Electrons in a disordered alloy |
| 7 | `#/ondas-planas` | Ondas planas para el cálculo de estructuras de bandas | Plane waves for band-structure calculations |
| 8 | `#/estados-superficiales` | Estados electrónicos superficiales | Electronic surface states |
| 9 | `#/rmn` | Resonancia magnética nuclear | Nuclear magnetic resonance |
| 10 | `#/agregados` | Absorción óptica en agregados moleculares | Optical absorption in molecular aggregates |
| 11 | `#/oscilaciones-bloch` | Evolución temporal de electrones bajo campos eléctricos | Time evolution of electrons under electric fields |
| 12 | `#/multicapas` | Reflexión de rayos X en multicapas metálicas | X-ray reflection in metallic multilayers |

### Dispositivos Cuánticos / Quantum Devices (`#/s/dc`)

| # | Ruta / route | ES | EN |
|---|---|---|---|
| 1 | `#/pozo-cuantico` | Estados electrónicos en pozos cuánticos | Electronic states in quantum wells |
| 2 | `#/dopado-delta` | Estados electrónicos en GaAs con dopado delta | Electronic states in δ-doped GaAs |
| 3 | `#/diodo-tunel` | Diodo túnel resonante | Resonant tunnelling diode |
| 4 | `#/dos-bandas` | Pozos cuánticos en un modelo de dos bandas | Quantum wells in a two-band model |
| 5 | `#/stark` | Efecto Stark confinado | Quantum-confined Stark effect |
| 6 | `#/heterounion` | Estados electrónicos en una heterounión dopada | Electronic states at a doped heterojunction |
| 7 | `#/minibandas` | Minibandas en una superred de semiconductores | Minibands in a semiconductor superlattice |
| 8 | `#/superred-enlace-fuerte` | Aproximación de enlace fuerte a las superredes | Tight-binding approximation to superlattices |
| 9 | `#/superred-gaussiana` | Superredes gaussianas de GaAs-AlGaAs | Gaussian GaAs-AlGaAs superlattices |
| 10 | `#/absorcion-2d` | Absorción óptica en sistemas bidimensionales | Optical absorption in two-dimensional systems |

Los experimentos 2 y 8 de Física Estadística son los mismos que 1 y 2 de Sistemas fuera del
Equilibrio (el curso original también los compartía); `macro` reutiliza la vista de ventana de
`irreversibilidad`. Las páginas `applets/onda-lgca`, `applets/modos-lineales` y
`applets/fluctuaciones` siguen existiendo como applets independientes incrustados en otros.

## Estructura / Layout

```
index.html                 shell del curso: portada (Ising en vivo), barra lateral por secciones, tema, idioma
lib/shell.js               enrutado por hash (#/, #/<page>, #/s/<sec>, #/<slug>), import() dinámico, montaje/desmontaje
lib/registry.js            SECTIONS, REGISTRY (número por sección, título ES/EN, ruta del módulo, marca TAD), PAGES
lib/hero.js                portada: Ising 2D Metrópolis a T_c sobre canvas
lib/liveeq.js              panel de ecuación viva (KaTeX con huecos \htmlId actualizables, definiciones, indicadores, etiqueta A/B/C del tipo de comparación)
lib/page.js                esqueleto de applet, página suelta, redimensionado
lib/docs.js                teoría en secciones desplegables (marked + KaTeX)
lib/linalg.js              autovalores simétricos (Jacobi), tridiagonales (Sturm) y autovectores (iteración inversa)
lib/{plot,loop,ui,i18n,stats,rng,bessel,loader}.js
applets/<slug>/model.js    física pura, rng inyectable, sin DOM
applets/<slug>/applet.js   export meta + mount(root) → { loop, destroy }
applets/<slug>/{view.js,index.html}   página suelta
applets/_kinetic/disks.js  discos duros por eventos (masas, radios, paredes térmicas, tabique)
applets/_walkers/metropolis.js  caminantes Metrópolis 1D
applets/_fhp/fhp.js        autómata FHP-III y coeficientes de transporte
applets/_chain/chain.js    cadenas armónicas: conteo de nodos, matriz de transferencia, Landauer
applets/_schrod/delta.js   potenciales δ: transmisión, Kronig–Penney, disparo
applets/_dc/schrod.js      Schrödinger de masa efectiva (Ben Daniel–Duke) en diferencias finitas, transmisión, corriente Tsu–Esaki
docs/{es,en}/<slug>.md     ficha por experimento: qué se observa · modelo · algoritmo · preguntas · pruebas · evaluación · cambios (nota para autores)
docs/{es,en}/curso/*.md    presentación, bibliografía, enlaces, créditos
docs/contexto/             el TAD de 2003, inventario del curso original, referencias de R. Brito
docs/audit/README.md       auditoría física de los applets originales (fases 1–3)
docs/evaluacion-didactica.md
tests/*.test.js, tests/browser/smoke.mjs
```

## Autoría / Authorship

**ES.** Contenidos y experimentos originales del curso: Ricardo Brito (UCM; *Física Estadística* y
*Sistemas fuera del Equilibrio*, con J. M. R. Parrondo) y Francisco Domínguez-Adame (UCM; *Física
del Estado Sólido* y *Dispositivos Cuánticos*); programación Java del curso: Mario Castro (U.
Comillas) y Pedro Hidalgo. Applets del Trabajo Académicamente Dirigido de 2003 (supervisado por
R. Brito): Mario Encinar, sobre una base de Mario Castro (2002). Reescritura en JavaScript,
auditoría física, textos de las fichas y pruebas: Mario Encinar, 2026. Las fichas de teoría son
textos propios que citan el curso original como fuente; no reproducen sus páginas. Fuente pública
de la autoría: <http://valbuena.fis.ucm.es/expint/html/desarrollado.html>. Contexto completo en
[`docs/contexto/`](docs/contexto/).

| Código | Autor | Fecha |
|---|---|---|
| Base: `CanonicaApplet` y librería de dibujo `CuadroMath`, `GraficoAuxiliar`, `VentanaAuxiliar` | Mario Castro | jul. 2002 |
| Applets Java del TAD: pila de arena, Maxwell, modos lineales, autocorrelación, familia FHP (onda sonora, Von Kármán) | Mario Encinar | feb.–jun. 2003 |
| Applets Java del curso (`KACApplet`, `HardDisksApplet`, `ejerc1`–`ejerc6`…), solo bytecode en el servidor | Mario Castro, Pedro Hidalgo | 2002 |
| Este repositorio: shell, 43 applets JavaScript, módulos compartidos, fichas, tests | Mario Encinar, con Claude (Anthropic) | 2026 |

**EN.** Original course contents: Ricardo Brito (UCM; *Statistical Physics* and *Non-equilibrium
Systems*, with J. M. R. Parrondo) and Francisco Domínguez-Adame (UCM; *Solid State Physics* and
*Quantum Devices*); Java programming of the course: Mario Castro and Pedro Hidalgo. 2003 TAD
applets (supervised by R. Brito): Mario Encinar, on a 2002 base by Mario Castro. JavaScript
rewrite, physics audit, texts and tests: Mario Encinar, 2026. The theory sheets are original texts
citing the course as their source.

El código Java original está congelado, sin modificar, en la rama
[`legacy-java`](https://github.com/Mepoide/applets-fisica-ucm/tree/legacy-java). The original
Java code is frozen on the `legacy-java` branch.

## Documentación / Documentation

- Fichas por experimento / per-experiment sheets: [`docs/es/`](docs/es/), [`docs/en/`](docs/en/) (también desplegadas bajo cada simulación / also expanded under each simulation).
- Contexto histórico (TAD 2003, curso original, R. Brito) / historical context: [`docs/contexto/README.md`](docs/contexto/README.md).
- Auditoría física / physics audit: [`docs/audit/README.md`](docs/audit/README.md).
- Evaluación didáctica / didactic evaluation: [`docs/evaluacion-didactica.md`](docs/evaluacion-didactica.md).
- Análisis didáctico final y propuestas de nuevas simulaciones / final didactic analysis and proposals: [`docs/analisis-didactico-y-propuestas.md`](docs/analisis-didactico-y-propuestas.md).
- Especificaciones y planes / specs and plans: [`docs/superpowers/`](docs/superpowers/).
- Capturas / screenshots: [`docs/screenshots/`](docs/screenshots/).
