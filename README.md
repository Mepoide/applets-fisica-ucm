# Sistemas fuera del Equilibrio · Experimentos interactivos / Non-equilibrium Systems · Interactive experiments

**ES.** Versión actual del bloque *Sistemas fuera del Equilibrio* del curso **Experimentos
Interactivos en Sistemas Físicos Complejos** (UCM, 2002; R. Brito y F. Domínguez-Adame):
nueve experimentos de física estadística de no equilibrio reescritos en HTML + JavaScript +
Canvas, en una sola página con navegación lateral. En cada experimento la **ecuación que gobierna
el sistema se muestra junto a la simulación con sus símbolos sustituidos por los valores medidos**
en tiempo real, y la predicción teórica se dibuja sobre los datos. Sin dependencias ni paso de
compilación: basta servir la carpeta.

**EN.** Current version of the *Non-equilibrium Systems* block of the course **Interactive
Experiments in Complex Physical Systems** (UCM, 2002; R. Brito and F. Domínguez-Adame): nine
non-equilibrium statistical-physics experiments rewritten in HTML + JavaScript + Canvas, on one
page with a persistent sidebar. In every experiment the **governing equation is shown next to the
simulation with its symbols replaced by the measured values** in real time, and the theoretical
prediction is drawn over the data. No dependencies, no build step: just serve the folder.

**Sitio / live site:** <https://mepoide.github.io/applets-fisica-ucm/>
(GitHub Pages desde `main`; `.nojekyll` evita que Jekyll descarte las carpetas `applets/_*`).

## Uso / Usage

```bash
npm run serve          # http://localhost:8080  (python3 -m http.server)
npm test               # 85 physics/unit tests (node:test)
npm run test:browser   # Playwright smoke: standalone pages, course routes, mobile nav; screenshots
BASE_URL=https://mepoide.github.io/applets-fisica-ucm node tests/browser/smoke.mjs   # deployed site
```

Cada experimento también existe como página suelta para incrustar (`applets/<slug>/index.html`),
sin barra lateral. Every experiment also exists as a standalone page to embed, without the sidebar.

## Experimentos / Experiments

| # | Ruta / route | ES | EN | Ecuación viva / live equation |
|---|---|---|---|---|
| 1 | `#/kac` | Anillo de Kac | Kac ring | Δ(t) = (1 − 2M/N)^t Δ(0); recurrencia T = 2N |
| 2 | `#/irreversibilidad` | Irreversibilidad y fluctuaciones en equilibrio (expansión libre, modelo de Ehrenfest, ventana) | Irreversibility and equilibrium fluctuations | P(n) = C(N,n) 2^{−N}; σ_Δ = √N; P(todas a un lado) = 2^{1−N} |
| 3 | `#/conductividad` | Conductividad térmica | Thermal conductivity | κ = (Q/L_y)/(ΔT/L_x); κ ∝ √T; ρT uniforme |
| 4 | `#/ondas` | Ondas sonoras en un fluido (FHP + hidrodinámica lineal) | Sound waves in a fluid | δn(k,t) = δn(k,0) cos(c_s k t) e^{−Γk²t}; pesos de Landau–Placzek |
| 5 | `#/maginu` | Reacciones químicas: modelo de Maginu | Chemical reactions: Maginu model | ∂c₁ = c₁ − c₁³/3 − c₂ + D∇²c₁, ∂c₂ = (c₁ − kc₂)/c + D∇²c₂; ciclo límite |
| 6 | `#/browniano` | Movimiento browniano | Brownian motion | ⟨Δr²⟩ = 4Dt; ½M⟨V²⟩ = kT |
| 7 | `#/potencial` | Difusión en un potencial externo | Diffusion in an external potential | p_i = e^{−V_i/kT}/Z; regla de Metrópolis |
| 8 | `#/arrhenius` | Procesos de activación: ley de Arrhenius | Activation processes: Arrhenius law | N(t) = N₀e^{−kt}; k de Kramers (red), Arrhenius y la estimación del curso |
| 9 | `#/resonancia` | Resonancia estocástica | Stochastic resonance | τ_K(kT) = T/2; amplitud de respuesta A_ω; barrido en kT |
| + | `#/maxwell`, `#/pila-arena`, `#/von-karman` | Material adicional del TAD de 2003 | Additional material from the 2003 TAD | Maxwell 2D y χ²; P(s) ∝ s^{−τ}; Re = g u L/ν |

Las páginas `applets/onda-lgca`, `applets/modos-lineales` y `applets/fluctuaciones` siguen
existiendo como applets independientes; el curso las incrusta dentro de los experimentos 4 y 2.

## Estructura / Layout

```
index.html                 shell del curso: barra lateral, tema claro/oscuro, idioma, rutas #/slug
lib/shell.js               enrutado por hash, import() dinámico de cada applet, montaje/desmontaje
lib/registry.js            lista de experimentos (número, título ES/EN, ruta del módulo)
lib/liveeq.js              panel de ecuación viva (KaTeX con huecos \htmlId actualizables; fallback texto)
lib/page.js                esqueleto de applet, página suelta, redimensionado
lib/docs.js                teoría en secciones desplegables (marked + KaTeX)
lib/{plot,loop,ui,i18n,stats,rng,bessel}.js
applets/<slug>/model.js    física pura, rng inyectable, sin DOM
applets/<slug>/applet.js   export meta + mount(root) → { loop, destroy }
applets/<slug>/{view.js,index.html}   página suelta
applets/_kinetic/disks.js  discos duros por eventos: masas y radios por disco, paredes térmicas, tabique
applets/_walkers/metropolis.js  caminantes Metrópolis 1D (experimentos 7, 8, 9)
applets/_fhp/fhp.js        autómata FHP-III: tablas de colisión, coeficientes de transporte
docs/{es,en}/<slug>.md     ficha por experimento: qué se observa · modelo · algoritmo · cambios · pruebas · evaluación
docs/contexto/             el TAD de 2003, inventario del curso original, referencias de R. Brito
docs/audit/README.md       auditoría física de los applets originales (fases 1 y 2)
docs/evaluacion-didactica.md
tests/*.test.js, tests/browser/smoke.mjs
```

## Autoría / Authorship

**ES.** Contenidos y experimentos originales del curso: Ricardo Brito (UCM), con J. M. R.
Parrondo en *Sistemas fuera del Equilibrio*; programación Java del curso: Mario Castro (U.
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
| Este repositorio: shell, 12 applets JavaScript, motor de discos, caminantes, fichas, tests | Mario Encinar, con Claude (Anthropic) | 2026 |

**EN.** Original course contents: Ricardo Brito (UCM), with J. M. R. Parrondo for
*Non-equilibrium Systems*; Java programming of the course: Mario Castro and Pedro Hidalgo. 2003
TAD applets (supervised by R. Brito): Mario Encinar, on a 2002 base by Mario Castro. JavaScript
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
- Especificaciones y planes / specs and plans: [`docs/superpowers/`](docs/superpowers/).
- Capturas / screenshots: [`docs/screenshots/`](docs/screenshots/).
