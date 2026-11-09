# Auditoría física de los applets originales / Physics audit of the original applets

Fecha / date: 2026-11-09. Código auditado / audited code: rama `legacy-java`, carpeta
`legacy/BUENOS`. Cada hallazgo indica la evidencia (test o cálculo) y la corrección aplicada en
`main`. Each finding lists the evidence (test or calculation) and the fix applied on `main`.

Gravedad / severity: **A** = resultado físico incorrecto · **B** = algoritmo impreciso o
incompleto · **C** = presentación o usabilidad.

| Applet | Hallazgo / Finding | Grav. | Evidencia / Evidence | Corrección / Fix |
|---|---|---|---|---|
| maxwell | "Colisiones por partícula" = $N_{col}/2N$; lo correcto es $2N_{col}/N$ (factor 4). / Counter off by a factor 4. | A | Lectura de `HDA_MAXWELL_FINAL.JAVA:248` | `collisionsPerParticle = 2·ncol/N` |
| maxwell | Colisiones detectadas tras avanzar el paso, resueltas secuencialmente por pares; el resto del paso tras la colisión estaba comentado; discos pueden quedar solapados. / Post-step pair detection, remainder of step not completed, overlaps possible. | B | Código; test `energy conserved, no overlaps` | Dinámica dirigida por eventos dentro de cada paso; energía conservada a $10^{-9}$, sin solapamientos |
| maxwell | Posiciones iniciales aleatorias con solapamientos; coordenada $y$ usaba el margen de $x$. / Overlapping initial positions; y used the x margin. | B | `HDA_MAXWELL_FINAL.JAVA:318-319` | Muestreo por rechazo con red hexagonal de respaldo |
| maxwell | Bins con bordes inclusivos; curva teórica evaluada en los bordes; $v_{max}$ fijo por distribución. / Inclusive bin edges; curve at edges; fixed vmax. | C | Código | Bins semiabiertos, integral exacta por bin, $v_{max}=4\sqrt{kT/m}$ |
| maxwell | Fórmula de Maxwell 2D y definición $k_BT=\langle\tfrac12 mv^2\rangle$: **correctas**. / 2D Maxwell and kT definition correct. | ✓ | Test χ² `relaxes to the 2D Maxwell distribution` | — |
| pila-arena | Modelo 1D con umbral fijo: estado estacionario trivial (escalera), todas las avalanchas de tamaño $L$; **no hay criticalidad autoorganizada**. / 1D fixed-threshold model is trivial: no SOC. | A | Test `fixed threshold is trivial` | Se mantiene como referencia y se añade el modelo de Oslo (umbral aleatorio), crítico en 1D; test `Oslo model gives a broad avalanche distribution` |
| pila-arena | Gráfica "tiempo / #" creada pero nunca dibujada; resultados impresos por consola. / Plot never drawn. | C | `PILA_ARENA.JAVA` | Serie temporal y $P(s)$ log-log |
| fluctuaciones | Comparación sólo con Poisson; con $N$ fijo la distribución exacta es binomial $(N,p)$, con varianza $Np(1-p)$. / Only Poisson; exact answer is binomial. | A | Test `variance is closer to binomial than to Poisson` | Se dibujan Poisson y binomial; lectura de ambas varianzas |
| fluctuaciones | $\lambda$ calculado con el área total incluyendo márgenes no accesibles. / λ used total area incl. margins. | B | `AUTOCOR.JAVA:164` | $p$ sobre el área accesible a los centros |
| fluctuaciones | $\ln n!$ por Stirling (error grande en $n\le 2$). / Stirling for small n. | B | Cálculo | $\ln\Gamma(n+1)$ Lanczos, test `lgamma matches factorials` |
| fluctuaciones | Botón "Autocorrelación" vacío; `FileWriter` a ruta local (falla en navegador). / Empty button, local file write. | C | `AUTOCOR.JAVA:71,175` | $C(\tau)$ implementada y comparada con $L_V/v_{th}$; test `autocorrelation decays` |
| onda-lgca | Tablas de colisión FHP con reposo: **correctas** (masa y momento conservados en las 128 entradas, permutaciones). / Collision tables correct. | ✓ | Test `collision tables conserve mass and momentum` | — |
| onda-lgca | Hueco "circular" definido con $\tfrac32(i_y-y_c)^2$ en vez de $\tfrac34$: elipse 2:1. / Hole was a 2:1 ellipse. | B | `PERFILDENS.JAVA:310` | Disco en coordenadas físicas |
| onda-lgca | Perfil = suma de 41 filas sin normalizar, ejes fijos 25–75 (v4: 25–65), filas mezcladas con desplazamiento en $x$. / Unnormalised sum, wrong axes, skew ignored. | B | `PERFILDENS.JAVA:203-209, 54` | Ocupación media por nodo, binning por $x$ físico; perfil radial |
| onda-lgca | Sin referencia teórica de $c_s$. / No theory reference. | C | — | $c_s=\sqrt{3/7}$ dibujada; test `front travels at sqrt(3/7) within 15%` (medido 0.61–0.73) |
| modos-lineales | Peso del modo térmico $(c_p-c_v)/c_v$ (con $c_v=1,c_p=2$ los pesos suman 1.5). El cociente de Landau–Placzek es Rayleigh/Brillouin; la fracción es $(c_p-c_v)/c_p$. / Thermal weight wrong; weights summed 1.5. | A | Test `original weight would not conserve the normalisation` | Pesos $1/\gamma$ y $1-1/\gamma$; test de conservación de masa |
| modos-lineales | Gaussianas $\sqrt{1/\Gamma t}\,e^{-x^2/\Gamma t}$: singulares en $t=0$, convención de varianza no estándar. / Singular at t=0. | B | `LINEAL.JAVA:128,133` | Varianza $\sigma^2+2Dt$ |
| modos-lineales | $u$ sin términos difusivos; $\delta T$ con pesos sin relación con los modos y $\delta T(x,0)\ne0$. / u, δT inconsistent. | A | Derivación en `docs/*/modos-lineales.md` | $u$ por continuidad exacta (test numérico); $\delta T$ de sonido adiabático + modo isobaro, $\delta T(x,0)=0$ |
| modos-lineales | Botones D/Ux/T sin función; curvas apiladas con desplazamientos arbitrarios. / Dead buttons. | C | `LINEAL.JAVA:158` | Paneles independientes, modos por separado, deslizador de tiempo |
| von-karman | Tabla de velocidades con aritmética entera: `(1/2)*…`=0 y `vy*=√3/2` truncado; el campo ignoraba las componentes diagonales. / Integer velocity tables. | A | `VKFINAL.JAVA:487-489` | Tablas en coma flotante; test `coarse-grained velocity of a uniform beam` |
| von-karman | `densidadsuma` nunca reiniciado; velocidades ×10⁶ y saturadas. / Accumulator never reset, saturated arrows. | A | `VKFINAL.JAVA:229-243, 336-343` | Promedio por caja correcto |
| von-karman | Nodos de pared en el 2º subpaso leían `n1` y escribían `n2` (copia-pega): la pared absorbía partículas cada dos pasos. / Wall absorbed mass every other step. | A | `VKFINAL.JAVA:670-717` | Reflexión en ambos subpasos; test `plate conserves mass for both wall rules` |
| von-karman | Fila 0 nunca actualizada (fuente aleatoria constante); inyección de estado 97 (Mach 1.3) con probabilidad `fvel`. / Row 0 frozen; supersonic injection. | B | `VKFINAL.JAVA:214-217, 590` | Zona de entrada en equilibrio a velocidad $u$ subsónica; test `driven channel reaches the inflow velocity` |
| von-karman | Densidad $f=0.5$: factor galileano $g(f)\propto(1-2f)=0$, sin advección no lineal; imposible la calle de vórtices. / f=0.5 kills advection. | A | Fórmula $g(f)$, test `Galilean factor vanishes at f=1/2` | $f$ ajustable, 0.25 por defecto; lectura de Re, $g$, $\nu$, Mach |
| von-karman | Reglas especulares de pared del original: **correctas** (reflejan $c_y$). / Specular wall rules correct. | ✓ | Lectura de `colision()` | Se ofrecen especular y rebote |

## Resumen / Summary

- 9 hallazgos de gravedad A (resultado físico incorrecto), 10 de gravedad B, 6 de gravedad C,
  y 3 confirmaciones de que el núcleo era correcto (Maxwell 2D, tablas FHP, reglas de pared).
- 9 severity-A findings, 10 B, 6 C, and 3 confirmations that the core was right (2D Maxwell,
  FHP tables, wall rules).
- Todos los applets tienen ahora tests numéricos reproducibles (`npm test`, 43 tests) y prueba de
  humo en navegador (`npm run test:browser`). / All applets now have reproducible numerical
  tests and a browser smoke test.


## Fase 2: experimentos del curso original recuperados del bytecode / Phase 2: course experiments recovered from bytecode

Los applets `KACApplet`, `HardDisksApplet`, `GasApplet`, `IrreversibilidadApplet`, `ejerc1`–`ejerc6`
solo existen como `.class` en valbuena.fis.ucm.es; se analizaron sus campos, constantes y cadenas
(`docs/contexto/README.md`) y se reimplementaron desde la física descrita en las páginas del curso.
Only bytecode exists for these applets; fields, constants and strings were analysed and the
experiments reimplemented from the physics in the course pages.

| Experimento | Hallazgo / Finding | Grav. | Evidencia | Corrección |
|---|---|---|---|---|
| 2 Irreversibilidad | Bandas de fluctuación en $\pm1/\sqrt N$ sobre la desviación relativa; tres applets separados para la misma estadística. | C | Texto del curso, `HardDisksApplet` | Bandas $\pm\sqrt N$, $\pm3\sqrt N$ sobre $\Delta$; una sola vista con tres modelos |
| 3 Conductividad | "Conductividad" = energía intercambiada sin normalizar por tiempo ni por $L_y$; pared térmica muestreando la maxwelliana (enfría el gas). | A | Campos `ET1, ET2, conduc` de `ejerc4`; cálculo | $\kappa = (Q/L_y)/(\Delta T/L_x)$ con $Q$ por unidad de tiempo; reemisión con distribución de flujo (Rayleigh); test `thermal wall heats` |
| 4 Ondas sonoras | La ecuación (1) del curso incluye el modo térmico, inexistente en el FHP (atérmico); comparación solo cualitativa (densidad en un cuadrado). | B | Texto del curso; `ejerc2` | Predicción acústica atérmica por transformada de Hankel superpuesta al perfil radial; vista B con el modo térmico donde sí existe; test `front advances at c_s` |
| 5 Maginu | Tablas de transición precalculadas sin relación visible con las ecuaciones; ciclo límite como figura estática. | B | Campos `trans[][][][]`, `differ` de `ejerc5` | Reacción estocástica (Poisson) sobre las ecuaciones de Maginu; ciclo RK4 y trayectoria media en vivo; test de conservación y sincronización |
| 6 Browniano | Applet externo (M. Fowler) sin medida. | C | Página del curso | Implementación propia con MSD, $D$, equipartición y Enskog; tests |
| 7 Potencial | Histograma sobre 200 pasos fijos. | C | Texto del curso | Media móvil exponencial y $\chi^2$; test χ² vs Boltzmann para 3 potenciales |
| 8 Arrhenius | La tasa de la ec. (2) del curso cuenta como escape toda llegada a la barrera: sobreestima $k$ en una red fina (factor ~25 con $\Delta x = 0.025$). | A | Test `lattice Kramers rate fits the measured decay`: $k_{\rm fit}/k_{\rm Kramers} = 0.94$, $k_{\rm curso}/k_{\rm Kramers} \approx 25$ | Tasa de Kramers exacta en la red (flujo sobre población) y aproximación armónica; la del curso se muestra punteada y se explica |
| 9 Resonancia | Solo traza $x(t)$ frente al mínimo; sin medida de la resonancia. | C | Campos de `ejerc3` | Amplitud de respuesta $A_\omega$, $\tau_K$, $kT_{\rm res}$ y barrido; test de máximo en $kT_{\rm res}$ |
| 1 Kac | Correcto. Solo se añaden la recurrencia explícita y campo medio para todas las condiciones iniciales. | ✓ | Test de periodicidad exacta $2N$ | — |


## Fase 3: Física Estadística, Estado Sólido y Dispositivos Cuánticos / Phase 3

Solo se conservan las páginas de teoría del curso original (los applets Java de estas secciones no
están disponibles ni como bytecode); los experimentos se reimplementaron desde la física de esas
páginas y se contrastaron con resultados analíticos. Hallazgos sobre los textos originales:

| Experimento | Hallazgo / Finding | Grav. | Evidencia | Corrección |
|---|---|---|---|---|
| FE 5 cvising | El pico de $c_V$ en redes finitas se compara con Onsager sin aviso de que $N_x \le 7$ es lo accesible por matriz de transferencia exacta. | C | Coste $2^{N_x}$ | Límite explícito y comparación con $c$ de Onsager; test con red 6×32 |
| FE 10 bosefermi | Comparar un Monte Carlo de $N$ partículas con ocupaciones gran canónicas da desacuerdos sistemáticos para $N$ pequeño. | B | Test `canonical occupations` | Ocupaciones canónicas exactas por programación dinámica; factor de aceptación $(n_j+1)/n_i$ |
| ES 2–3 cadenas | La densidad de modos por conteo de nodos requiere el signo correcto de la recurrencia; el cuasicristal de Fibonacci tenía las letras pesada/ligera intercambiadas en el texto. | B | Tests de conteo frente a diagonalización | Recurrencia de Sturm; convención documentada |
| ES 8 superficiales | El estado de Tamm solo existe en el modelo δ con potenciales atractivos ($P<0$); el texto sugiere que aparece en general. | B | Test de existencia | Valor por defecto $P=-3$ y nota en la ficha |
| ES 11 Bloch | Para un estado inicial localizado en un sitio el centroide no oscila: el paquete "respira"; el texto habla de oscilación del centro. | B | Test `centroid stays` | Ficha y lectura de $r(t)$ frente a $T_B$ |
| DC 4 dos bandas | $m_B(E) = m_A(1 + E/E_{gB})$ en la hoja no reproduce la masa parabólica de la barrera. | B | Límite $E\to0$ | $m_B(E) = m_B(1 + E/E_{gB})$, documentado |
| DC 5 Stark | La corrección de segundo orden se aproxima por $(v/10\pi)^2$; el coeficiente exacto es $(15-\pi^2)/48\pi^4$, un 8 % mayor. | B | Suma de la serie perturbativa; test frente a diferencias finitas | Coeficiente exacto, con la aproximación citada en la ficha |
| DC 6 heterounión | $K = 1.37\,n_{2D}$ "eV nm" en la hoja: son meV/nm. | B | Ley de Gauss con $\varepsilon_r = 13.2$ | Unidades corregidas |
| DC 7 minibandas | El término de masas de la relación de dispersión aparece como $\kappa m_B/k m_A$; la continuidad de $\chi'/m$ da $\kappa m_A/k m_B$. | A | Test frente a la matriz de transferencia de un periodo construida con las condiciones de contorno | Fórmula corregida |
| DC 10 absorción | Los datos experimentales de In₀.₅₃Ga₀.₄₇As no se conservan. | C | — | Espectro sintético declarado como tal |

Todos los experimentos de la fase 3 tienen tests numéricos (`tests/fises*.test.js`,
`tests/fes*.test.js`, `tests/dc.test.js`; 127 tests en total) y prueba de humo en navegador. All
phase-3 experiments have numerical tests and a browser smoke test.
