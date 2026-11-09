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

Documentación por applet en `docs/es/` y `docs/en/`; auditoría física en `docs/audit/`.
El código Java original está congelado en la rama `legacy-java`.

Per-applet docs in `docs/es/` and `docs/en/`; physics audit in `docs/audit/`. The original
Java code is frozen on the `legacy-java` branch.
