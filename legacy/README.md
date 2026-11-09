# Código Java original (2002-2005) / Original Java applets (2002-2005)

**ES.** Copia literal de los applets Java AWT escritos por Mario Castro Ponce en la UCM
(tesis y docencia de física estadística / sistemas complejos). Se conservan las fuentes
`.java`, las páginas `.html` de lanzamiento y los `.gif`; se han omitido los `.class`
compilados y `Thumbs.db`. Codificación original: ISO-8859-1 con finales de línea CRLF.
Esta rama (`legacy-java`) queda congelada como referencia. El puerto a navegadores
actuales vive en `main`.

**EN.** Verbatim copy of the Java AWT applets written by Mario Castro Ponce at UCM
(thesis and teaching of statistical physics / complex systems). Sources `.java`, launcher
`.html` pages and `.gif` images are kept; compiled `.class` files and `Thumbs.db` were
dropped. Original encoding: ISO-8859-1, CRLF line endings. This branch (`legacy-java`)
is frozen as a reference. The port to modern browsers lives on `main`.

## Mapa / Map

La carpeta `BUENOS/` contiene las versiones consideradas buenas. The `BUENOS/` folder
holds the versions considered good.

| Carpeta / folder | Applet principal | Física / physics |
|---|---|---|
| `BUENOS/HDA_MAXWELL`, `BUENOS/HDA_MAXWELL_FINAL.JAVA` | `HDA_Maxwell_final` | Discos duros 2D, colisiones elásticas, histograma de velocidades vs. Maxwell-Boltzmann. Hard disks, velocity histogram vs. Maxwell-Boltzmann. |
| `BUENOS/PILA_ARENA*.JAVA`, `P_A_ANT_2.JAVA` | `Pila_arena` | Pila de arena, criticalidad autoorganizada. Sandpile, self-organized criticality. |
| `BUENOS/CORRELACION` | `Autocor`, `CanonicaApplet` | Gas de discos, fluctuaciones de ocupación en un subvolumen vs. Poisson, autocorrelación. Occupation fluctuations vs. Poisson, autocorrelation. |
| `BUENOS/PERFILDENSIDAD` | `Perfildens` (ver `LA_VERSI_N_BUENA_ES_PERFILD.TXT`) | Gas reticular FHP (LGCA), onda sonora y perfil de densidad. FHP lattice gas, sound wave and density profile. |
| `BUENOS/SOLSLINEALES` | `Lineal` | Soluciones lineales de la hidrodinámica: modos sonoro y térmico, perfiles D(x), Ux(x), T(x). Linearized hydrodynamics modes. |
| `BUENOS/VON_KARMAN`, `BUENOS/VK_SG` | `VKfinal`, `VK8final` | Gas reticular FHP con flujo, paredes y obstáculo: calle de vórtices de Von Kármán. FHP lattice gas with flow and obstacle: Von Kármán vortex street. |
| `BUENOS/CUADROMATH*.JAVA`, `VENTANAAUXILIAR*.JAVA`, `GRAFICOAUXILIAR.JAVA` | — | Utilidades de dibujo compartidas (ejes, histogramas, ventanas auxiliares). Shared plotting utilities. |

Los ficheros en la raíz de `legacy/` (fuera de `BUENOS/`) son copias de trabajo
anteriores. Files at the root of `legacy/` are earlier working copies.
