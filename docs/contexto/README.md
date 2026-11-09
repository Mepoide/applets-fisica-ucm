# Contexto: el TAD de 2003 y el curso *Experimentos Interactivos* de la UCM

Documento de referencia reconstruido el 2026-11-09 a partir del disco de Mario Encinar y de
la web pública de la UCM. Sirve para situar los seis applets de este repo en el proyecto
docente del que salieron y para decidir qué se construye a continuación.

## 1. El Trabajo Académicamente Dirigido (TAD), 2002-2003

- **Título** (según el CV de Mario Encinar, octubre de 2004): *Trabajo Académico sobre
  Simulaciones y Experimentos Interactivos en Sistemas Complejos (programado en Java)*,
  a cargo del Prof. D. Ricardo Brito, Departamento de Física Aplicada I (Termología),
  Facultad de CC. Físicas, UCM. Curso 2002-03, último curso de la licenciatura.
- **Materiales conservados** (carpeta `Trabajo_Academico_Dirigido_Brito` del disco, copias
  convertidas en [`tad/`](tad/)):
  - [`experimentos-interactivos-2003.pdf`](tad/experimentos-interactivos-2003.pdf): presentación
    "Experimentos interactivos", 10 diapositivas. Bloques: (1) *Acercamiento al equilibrio: la
    Maxwelliana*, ecuación de Boltzmann, linealización, autovalores del operador de colisión y
    tiempo de relajación, simulación con discos duros; (2) *Modos normales hidrodinámicos y
    coeficientes de transporte*, Navier–Stokes linealizadas, autovalores sonoros, de cizalla y
    térmico, solución 1D para una perturbación inicial de densidad; (3) *Un modelo de fluido
    discreto: lattice gas FHP7*. La [`v2`](tad/experimentos-interactivos-2003-v2.pdf) es un recorte
    con solo el bloque hidrodinámico.
  - [`acercamiento-al-equilibrio.txt`](tad/acercamiento-al-equilibrio.txt) y
    [`perfil-de-densidad-fhp7.txt`](tad/perfil-de-densidad-fhp7.txt): los dos textos de teoría
    (las fórmulas eran objetos de Word y no sobreviven a la conversión; están en el PDF).
  - [`tabla-colisiones-fhp.png`](tad/tabla-colisiones-fhp.png): tabla de colisiones FHP dibujada a
    mano, con los pares de estados en decimal (3↔68, 5↔10, 9↔20, 17↔40, 33↔80, 65↔34, 42↔84,
    124↔59, 122↔117, 118↔107, 110↔87, 94↔47, 62↔93, 85↔43). Coincide con `TABLES` de
    `applets/_fhp/fhp.js`.
  - [`red-y-nodo-fhp.png`](tad/red-y-nodo-fhp.png), [`von-karman-captura-2003.png`](tad/von-karman-captura-2003.png).
  - [`Ising1d.cpp`](tad/Ising1d.cpp): Metrópolis 1D en C++ Builder (mayo 2003), un ensayo no
    continuado. Es un indicio de que Ising estaba en el guion del TAD.
  - Un worksheet Maple `FliudSolid.mws` y `VK2_newcollp.java` (26-abr-2003), ya en `legacy-java`.
- **Cronología de código**: ver la tabla del README de la rama `legacy-java`.

## 2. El curso *Experimentos Interactivos en Sistemas Físicos Complejos*

Web viva en <http://valbuena.fis.ucm.es/expint/html/frame.html> (R. Brito y F. Domínguez-Adame,
2002; financiada por dos Proyectos de Innovación Educativa UCM 2000/01 y 2001/02; última
actualización 2016). Copias locales de las páginas clave en [`expint/`](expint/).

**Créditos** ([`expint/desarrollado.html`](expint/desarrollado.html)): coordinación R. Brito
(Física Estadística, Sistemas fuera del Equilibrio) y F. Domínguez-Adame (Estado Sólido,
Dispositivos Cuánticos, diseño web); participación de J. M. R. Parrondo; programación Java de
Mario Castro Ponce (U. Comillas) y Pedro Hidalgo; "agradecer también a Mario Encinar su
colaboración en las prácticas de Física Estadística".

**Inventario** (42 experimentos; cada uno = página de teoría + bibliografía + `<applet>`):

| Sección | Nº | Experimentos | Applets (`.class` en servidor) |
|---|---|---|---|
| Física Estadística | 11 | Teorema del límite central · Anillo de Kac · Panadero y Arnold · Ergodicidad y entropía en osciladores · Dimensionalidad y límite termodinámico en Ising · Moléculas diatómicas · Debye · Irreversibilidad y fluctuaciones · Macrocanónica · Bosones y fermiones · Ising | `TLCApplet`, `KACApplet`, `BakerApplet`/`ArnoldApplet`, `OsciladoresApplet`, `CalorEspecificoApplet`, `DiatomicApplet`, `DebyeApplet`, `HardDisksApplet`, `CanonicaApplet`, `BEFDApplet`, `IsingApplet` |
| Sistemas fuera del Equilibrio | 9 | Anillo de Kac · Irreversibilidad y fluctuaciones (+ gas ideal, modelo aleatorio) · Conductividad térmica · **Ondas sonoras en un fluido** · Maginu · Browniano (applet de M. Fowler) · Difusión en potencial · Arrhenius · Resonancia estocástica | `KACApplet`, `HardDisksApplet`/`GasApplet`/`IrreversibilidadApplet`, `ejerc4`, **`ejerc2` + `ejerc23`**, `ejerc5`, `BrownianApplet`, `ejerc1`, `ejerc6`, `ejerc3` |
| Física del Estado Sólido | 12 | Madelung, vibraciones en red desordenada y cuasicristal, conductividad térmica de cadena, dispersión de electrones, aleación desordenada, ondas planas/bandas, estados superficiales, RMN, absorción en agregados, electrones bajo campo, rayos X en multicapas | (Domínguez-Adame / Hidalgo) |
| Dispositivos Cuánticos | 10 | Pozos cuánticos, dopado delta, diodo túnel resonante, dos bandas, Stark confinado, heterounión, minibandas, enlace fuerte, superredes gaussianas, absorción 2D | (Domínguez-Adame / Hidalgo) |

**Relación con este repo**:

- `sistemas/lgca/ejerc23.class` ("material adicional del experimento 4") es la compilación de
  `EJERC23.JAVA` de Mario Encinar: los identificadores del bytecode (`coll1`, `coll2`, `dosk`,
  `contx`, `conty`, `contr`, `TLIMITE`, `f_val`, `num_val`) son los de ese fuente. Es el único
  applet de Encinar publicado en la web; corresponde a `applets/onda-lgca`.
- `HardDisksApplet` / `CanonicaApplet` (Castro, 2002) son la base de `applets/maxwell` y
  `applets/fluctuaciones`.
- Maxwell, pila de arena, modos lineales y Von Kármán no llegaron a la web.
- Solo hay bytecode en el servidor; no se publicaron fuentes `.java`. Está todo archivado en
  Wayback desde 2003 (`web.archive.org/web/*/valbuena.fis.ucm.es/expint*`).
- Roturas actuales: `sfe/sfe.html` da 404; ningún navegador ejecuta `<applet>` desde 2017.

## 3. Ricardo Brito López

- Catedrático, Dpto. Estructura de la Materia, Física Térmica y Electrónica (EMFTEL), UCM.
  Codirige el Grupo Interdisciplinar de Sistemas Complejos (GISC) con F. Domínguez-Adame.
  CV 2022: <https://fisicas.ucm.es/data/cont/docs/18-2022-12-03-CV_2022_Brito.pdf>.
- ORCID 0000-0002-8488-6472 · Scopus 7005511456 · Google Scholar `dJR4FY4AAAAJ` ·
  Portal UCM <https://produccioncientifica.ucm.es/investigadores/141506/detalle>.
- Tesis: *Teoría cinética de gases de red* (UCM 1993, dir. C. F. Tejero; colaboración con
  M. H. Ernst, Utrecht). Líneas: física estadística de no equilibrio, gases de red, gases
  granulares, bibliometría.
- Docencia actual: Física Estadística (grado), Transiciones de fase y fenómenos críticos,
  Sistemas Complejos (máster). Antigua: Física Estadística y *Sistemas fuera del Equilibrio*
  (optativa de 5º, la asignatura del TAD). Páginas antiguas en `seneca.fis.ucm.es/brito`
  (hoy 403; archivadas en Wayback 2004-2013) con problemas de ecuación de Boltzmann, modos
  hidrodinámicos y browniano.
- Sin repositorios de código públicos (GitHub/GitLab) ni del GISC. Proyecto de innovación
  docente 2020-21: "prácticas de laboratorio virtuales mediante medios audiovisuales y
  simuladores". CD *Desarrollo de simuladores interactivos para el campus virtual* (UCM 2009).

**Publicaciones directamente relevantes para la física de los applets**:

- Grosfils, Boon, Brito, Ernst, *Statistical hydrodynamics of lattice-gas automata*, Phys.
  Rev. E 48, 2655 (1993). Factor de estructura dinámico y Landau–Placzek en FHP: base de
  `onda-lgca` y `modos-lineales`.
- Brito, Ernst, Kirkpatrick, *Staggered diffusivities in lattice gas cellular automata*,
  J. Stat. Phys. 62, 283 (1991); Brito & Ernst, *Propagating staggered waves in cellular
  automata fluids*, J. Phys. A 24, 3331 (1991); Ernst & Brito, *Lattice gases in slab
  geometries*, Phys. Rev. A 44, 8384 (1991). Invariantes espurios y geometrías confinadas:
  relevantes para los artefactos de `von-karman`.
- *A fluctuation formula for the non-Galilean factor in lattice gas automata* (portal UCM):
  el factor g(f) que usa `von-karman`.
- Gases granulares (van Noije, Ernst, Brito 1997-98; Ernst & Brito 2002): colas no
  maxwellianas, candidato natural a extensión de `maxwell` con discos inelásticos.

## 4. Qué implica para la siguiente fase

1. Los seis applets de este repo son la parte de Mario Encinar del curso de Brito. Lo que ya
   está portado cubre "Ondas sonoras en un fluido" y, parcialmente, "Irreversibilidad y
   fluctuaciones" de la web original.
2. Modernizar la web completa (42 experimentos) es un proyecto de otro orden: solo hay
   bytecode de los otros 36 applets, y los textos de teoría y bibliografía son de Brito y
   Domínguez-Adame. Requiere hablar con ellos. La sección natural para proponer es *Sistemas
   fuera del Equilibrio* (9 experimentos), de la que ya hay 2 hechos.
3. Fuentes públicas de autoría para el README: `desarrollado.html` del curso y el CV de 2004.
