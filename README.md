# Applets de Física · UCM / UCM Physics Applets

**ES.** Simulaciones interactivas de física estadística y sistemas complejos, escritas
originalmente como applets Java en la UCM (2002-2003, Mario Encinar sobre una base de
Mario Castro; ver [Autoría](#autoría--authorship)) y portadas a
HTML + JavaScript + Canvas para navegadores actuales. Sin dependencias ni paso de
compilación: basta servir la carpeta.

**EN.** Interactive simulations in statistical physics and complex systems, originally
written as Java applets at UCM (2002-2003, Mario Encinar on a base by Mario Castro; see
[Authorship](#autoría--authorship)) and ported to
HTML + JavaScript + Canvas for modern browsers. No dependencies and no build step: just
serve the folder.

## Uso / Usage

Sitio publicado / live site: <https://mepoide.github.io/applets-fisica-ucm/> (GitHub Pages
desde `main`; `.nojekyll` evita que Jekyll descarte `applets/_fhp/`).

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

El código Java original (2002-2003) está congelado, sin modificar, en la rama
[`legacy-java`](https://github.com/Mepoide/applets-fisica-ucm/tree/legacy-java). The original
Java code is frozen, untouched, on the `legacy-java` branch.

## Autoría / Authorship

**ES.** Los fuentes no tienen control de versiones; la atribución sale de las fechas de
modificación, la codificación y el estilo de cada fichero (ver el README de la rama
`legacy-java`).

| Código | Autor | Fecha |
|---|---|---|
| Base: `CanonicaApplet` (discos duros, colectivo canónico) y librería de dibujo `CuadroMath`, `GraficoAuxiliar`, `VentanaAuxiliar` | Mario Castro | jul. 2002 |
| Applets de pila de arena, Maxwell, modos lineales (`Lineal`) y autocorrelación (`Autocor`), dentro del Trabajo Académicamente Dirigido supervisado por Ricardo Brito (UCM) | Mario Encinar | feb.–jun. 2003 |
| Familia de gas reticular FHP: Von Kármán (`VK*`) y perfil de densidad (`Perfildens*`) | Mario Encinar | abr.–jun. 2003 |
| Puerto a JavaScript, auditoría de física, documentación y pruebas | Mario Encinar, con Claude (Anthropic) | 2026 |

Contexto completo (el TAD de 2003, el curso *Experimentos Interactivos* de la UCM del que
forman parte, referencias de R. Brito): [`docs/contexto/`](docs/contexto/). Fuente pública de la
autoría: créditos del curso, <http://valbuena.fis.ucm.es/expint/html/desarrollado.html>.

**EN.** The sources were never under version control; attribution comes from file
modification dates, encoding and coding style (see the `legacy-java` README). Base
hard-disk applet and plotting library: Mario Castro (July 2002). All simulation applets
(sandpile, Maxwell, linear modes, autocorrelation, FHP lattice gas family): Mario Encinar
(February–June 2003). JavaScript port, physics audit, docs and tests: Mario Encinar with
Claude (Anthropic), 2026.

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
