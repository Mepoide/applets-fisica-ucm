# Código Java original (2002-2003) / Original Java applets (2002-2003)

**ES.** Copia literal de los applets Java AWT de docencia de física estadística / sistemas
complejos en la UCM. Autoría (ver tabla abajo): base de 2002 de Mario Castro; applets de
2003 de Mario Encinar. Se conservan las fuentes
`.java`, las páginas `.html` de lanzamiento y los `.gif`; se han omitido los `.class`
compilados y `Thumbs.db`. Codificación original: ISO-8859-1 con finales de línea CRLF.
Esta rama (`legacy-java`) queda congelada como referencia. El puerto a navegadores
actuales vive en `main`.

**EN.** Verbatim copy of the Java AWT teaching applets (statistical physics / complex
systems, UCM). Authorship (table below): 2002 base by Mario Castro; 2003 applets by Mario
Encinar. Sources `.java`, launcher
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

## Autoría y cronología / Authorship and timeline

Los fuentes nunca estuvieron bajo control de versiones. La atribución se reconstruyó en
2026 a partir de las fechas de modificación de los ficheros en el disco original, su
codificación y su estilo de código, y fue confirmada por Mario Encinar. The sources were
never under version control; attribution was reconstructed in 2026 from file modification
dates, encoding and coding style, and confirmed by Mario Encinar.

| Fecha / date | Ficheros / files | Autor / author | Marcas / evidence |
|---|---|---|---|
| 2002-07-23 | `CanonicaApplet`, `CuadroMath`, `GraficoAuxiliar`, `VentanaAuxiliar`, `bolaazul.gif`, `marco.gif` | Mario Castro | Cabecera `/** Mario Castro Ponce */`, LF, ASCII, tabuladores |
| 2003-02-25 → 03-08 | Copias de la librería, `CuadroMath2`, `CuadroMath3` | Mario Castro (código), reorganizado por Mario Encinar | Mismo código, guardado con CRLF |
| 2003-03-13 → 03-16 | `Pila_arena_ant`, `P_A_ant_2`, `Pila_arena` | Mario Encinar | CRLF, ISO-8859-1, tabuladores, comentarios en castellano |
| 2003-04-01 → 04-11 | `HardDisksApplet_base`, `HDA_Maxwell`, `HDA_Maxwell_final` | Mario Encinar, sobre `CanonicaApplet` | ídem; rutina de colisión con comentarios en inglés de otra fuente |
| 2003-04-15 → 06-25 | Familia FHP: `VK_base`, `VK_flujo*`, `Von_Karman*`, `VK2*`, `VK3`–`VK8`, `VKfinal`, `VK8final` | Mario Encinar | Sangría de 4 espacios, CRLF, ISO-8859-1 |
| 2003-05-31 → 06-10 | `Lineal_base*`, `Lineal`, `CuadroMath5`, `VentanaAuxiliar2`, `Perfildens`–`Perfildens4`, `Ejerc23`, `Autocor` | Mario Encinar | `Lineal`/`Autocor` con tabuladores; `Perfildens*` con 4 espacios |
| 2003-06-28 → 06-29 | Últimos `.html` de lanzamiento | Mario Encinar | — |
| 2004-10-30 → 11-20 | Sólo `.class` en la raíz (no incluidos aquí) | — | Recompilaciones sin cambios de fuente |
