# Applets de Física · UCM / UCM Physics Applets

**ES.** Simulaciones interactivas de física estadística y sistemas complejos, escritas
originalmente como applets Java (2002-2005, Mario Castro Ponce, UCM) y portadas a
HTML + JavaScript + Canvas para navegadores actuales. Sin dependencias ni paso de
compilación: basta servir la carpeta.

**EN.** Interactive simulations in statistical physics and complex systems, originally
written as Java applets (2002-2005, Mario Castro Ponce, UCM) and ported to
HTML + JavaScript + Canvas for modern browsers. No dependencies and no build step: just
serve the folder.

## Uso / Usage

```bash
npm run serve          # http://localhost:8080
npm test               # physics tests (node:test)
npm run test:browser   # Playwright smoke tests + screenshots
```

## Applets

| | ES | EN |
|---|---|---|
| `applets/maxwell` | Discos duros y distribución de Maxwell | Hard disks and the Maxwell distribution |
| `applets/pila-arena` | Pila de arena y criticalidad autoorganizada | Sandpile and self-organized criticality |
| `applets/fluctuaciones` | Fluctuaciones de ocupación: Poisson, binomial, autocorrelación | Occupation fluctuations: Poisson, binomial, autocorrelation |
| `applets/onda-lgca` | Gas reticular FHP: onda sonora y perfil de densidad | FHP lattice gas: sound wave and density profile |
| `applets/modos-lineales` | Modos de la hidrodinámica linealizada | Linearized hydrodynamics modes |
| `applets/von-karman` | Gas reticular con obstáculo: calle de Von Kármán | Lattice gas with obstacle: Von Kármán street |

## Documentación / Documentation

- Teoría, algoritmo, cambios y evaluación por applet / per-applet theory, algorithm, changes
  and evaluation: [`docs/es/`](docs/es/), [`docs/en/`](docs/en/) (también en la pestaña
  "Teoría" de cada página / also in each page's "Theory" tab).
- Auditoría física de los originales / physics audit: [`docs/audit/README.md`](docs/audit/README.md).
- Evaluación didáctica y propuestas / didactic evaluation and proposals:
  [`docs/evaluacion-didactica.md`](docs/evaluacion-didactica.md).
- Diseño y plan de esta fase / design and plan: [`docs/superpowers/`](docs/superpowers/).
- Capturas / screenshots: [`docs/screenshots/`](docs/screenshots/).

El código Java original (2002-2005) está congelado, sin modificar, en la rama
[`legacy-java`](https://github.com/Mepoide/applets-fisica-ucm/tree/legacy-java). The original
Java code is frozen, untouched, on the `legacy-java` branch.

## Estructura / Layout

```
index.html            portada / landing
lib/                  plot, loop, ui, i18n, stats, rng, docs, page (sin dependencias / no deps)
applets/<slug>/       model.js (física pura / pure physics) · view.js (canvas + controles) · index.html
applets/_fhp/fhp.js   gas reticular FHP compartido / shared FHP lattice gas
docs/es, docs/en      Markdown con LaTeX (KaTeX) / Markdown with LaTeX
tests/*.test.js       node:test · tests/browser/smoke.mjs Playwright
```

Requisitos / requirements: cualquier servidor estático para la web; Node ≥ 20 para los tests;
Chrome o Chromium para `test:browser` (usa `playwright-core` como dependencia de desarrollo).
