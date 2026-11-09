# Experimentos Interactivos en Sistemas Físicos Complejos, versión web

## Análisis didáctico y propuestas de nuevas simulaciones

Mario Encinar · 9 de noviembre de 2026 · Sitio: <https://mepoide.github.io/applets-fisica-ucm/> · Código: <https://github.com/Mepoide/applets-fisica-ucm>

Este documento resume qué es hoy la versión web del curso, qué aporta y qué no desde el punto de vista didáctico, y qué simulaciones nuevas podrían desarrollarse a continuación. Está pensado para decidir, no para describir: cada propuesta lleva una estimación de esfuerzo y de valor.

---

## 1. Estado actual (AS IS)

**Alcance.** Los 42 experimentos del curso original (Física Estadística 11, Sistemas fuera del Equilibrio 9, Física del Estado Sólido 12, Dispositivos Cuánticos 10) más 3 experimentos de 2003 (discos duros y Maxwell, pila de arena, calle de Von Kármán), en total 43 simulaciones distintas. Portada con el mapa de entrada original sobre un modelo de Ising en vivo, páginas de presentación, bibliografía, enlaces y créditos, y versión en inglés de todo el contenido.

**Qué tiene cada experimento.**

- La simulación con sus controles, animada y reiniciable, con velocidad regulable.
- Un panel de "ecuación viva": la ecuación que gobierna el sistema escrita con KaTeX, con los símbolos sustituidos en tiempo real por los valores que se están midiendo, la definición de cada magnitud debajo y uno o dos indicadores numéricos de acuerdo con la teoría.
- La predicción teórica dibujada sobre los datos de la simulación.
- Una ficha de teoría en secciones desplegables: qué se observa, modelo físico, algoritmo, cambios respecto al applet original, pruebas y evaluación didáctica.
- Una página independiente para incrustar la simulación en otro sitio.

**Tecnología.** HTML, JavaScript y Canvas sin dependencias ni compilación; funciona en cualquier navegador actual, también en móvil, y se puede servir desde cualquier carpeta. La única carga externa son las librerías KaTeX y marked desde un CDN.

**Verificación (comprobada hoy).**

| Comprobación | Resultado |
|---|---|
| Tests de física y unidad (`npm test`) | 127 de 127 correctos |
| Prueba de humo en navegador (todas las rutas, dos idiomas, móvil) | 145 de 145 rutas correctas, en local y contra el sitio desplegado |
| Acceso al sitio desplegado (portada, registro, applets, fichas, estilos) | HTTP 200 en todas las rutas probadas, 0.2 s por recurso |
| GitHub Pages | Publicado desde `main`, HTTPS forzado, repositorio público |

Cada test comprueba un resultado físico, no solo que el código no falle: la distribución de Maxwell con χ², el calor específico de Ising frente a Onsager, el pozo cuántico analítico frente a diferencias finitas, el cero de Airy en la heterounión, la escalera de Wannier–Stark, la transmisión por una barrera frente a la fórmula exacta, etc.

**Auditoría de los originales.** En la reescritura se encontraron y corrigieron errores físicos en varios applets y hojas originales. Están documentados en `docs/audit/README.md`; los más relevantes son el contador de colisiones de Maxwell (factor 4), la pila de arena 1D sin criticalidad (se añadió el modelo de Oslo), los pesos de Landau–Placzek en los modos lineales, la pared que absorbía masa en Von Kármán, la tasa de Arrhenius de la ecuación (2) (sobreestima k unas 25 veces en la red usada), el término de masas de la relación de dispersión de las minibandas y el coeficiente de segundo orden del efecto Stark.

---

## 2. Análisis didáctico

### 2.1 Lo que aporta frente al curso de 2002

1. **Comparación cuantitativa en pantalla.** Los applets originales mostraban la simulación; la teoría estaba en la página de al lado. Ahora el estudiante ve la curva teórica sobre los datos y un número que dice cuánto se parecen. Esto convierte "mirar una animación" en "comprobar una predicción", que es el gesto central del método científico y lo que más cuesta transmitir en un laboratorio.
2. **Controles que importan.** Cada parámetro expuesto cambia algo físico observable (temperatura, desorden, campo, espesor), y el botón de inicio suele lanzar un barrido de ese parámetro que construye una curva (I–V, niveles frente a espesor, minibandas frente a barrera).
3. **Texto propio, breve y por capas.** La ficha va de lo observable a lo técnico; el estudiante decide hasta dónde baja.
4. **Funciona.** Los applets Java llevan más de una década sin poder ejecutarse en un navegador normal. La barrera de entrada ahora es cero: un enlace.

### 2.2 La ecuación viva: ¿aporta o es tautológica?

Es la pregunta correcta, y la respuesta depende del experimento. Conviene distinguir tres situaciones, que conviven en el curso:

**Tipo A: la ecuación mostrada es la que se integra.** Ejemplos: ecuaciones de Bloch en RMN, Maginu, Rouard en multicapas, el hamiltoniano de enlace fuerte. Aquí sustituir los símbolos por valores **es tautológico** en sentido estricto: la simulación no puede desobedecer la ecuación. Lo que aporta el panel es otra cosa, más modesta pero real: enlaza cada control con su símbolo (el estudiante ve que "subir el deslizador W" es "hacer crecer esa W de la fórmula"), fija la notación y las unidades, y baja la barrera de lectura de la fórmula. Es una ayuda de lectura, no una comprobación. No debería presentarse como validación.

**Tipo B: la ecuación es una predicción independiente de lo que se simula.** Ejemplos: la maxwelliana frente a discos duros que chocan; la binomial frente a la ocupación de una ventana; Onsager frente a Metrópolis; la tasa de Kramers frente al decaimiento medido de caminantes; Kronig–Penney frente a la transmisión por una cadena finita; el cero de Airy frente a diferencias finitas; la ley balística √2·T·t frente a la expansión del paquete. Aquí el panel **sí aporta**: la simulación podría discrepar (y en los applets originales a veces discrepaba por errores), el acuerdo es un resultado y el desacuerdo enseña algo (tamaño finito, tiempo de correlación, aproximaciones del modelo). Es la situación mayoritaria en Física Estadística y Sistemas fuera del Equilibrio.

**Tipo C: dos métodos para el mismo problema.** Ejemplos: perturbación frente a numérico en el efecto Stark, variacional frente a exacto en la heterounión, una banda frente a dos bandas, modelo δ frente a Kronig–Penney completo, Evjen frente a sumas directas de Madelung. El panel muestra el error de una aproximación y su rango de validez. Esto es valioso y poco habitual en material docente, porque enseña a desconfiar de las fórmulas con criterio.

Recuento aproximado sobre los 43 experimentos: unos 10 de tipo A, unos 20 de tipo B y unos 13 de tipo C. La conclusión es que la ecuación viva es un buen formato, pero **su valor no es uniforme** y la interfaz hoy no distingue los tres casos: el mismo panel rojo con valores sustituidos aparece en RMN (tipo A) y en Ising frente a Onsager (tipo B). Esa indistinción es la crítica más seria que le haría a la versión actual.

### 2.3 Otras limitaciones

- **No hay preguntas.** El curso original planteaba cuestiones al alumno en cada hoja; la versión web explica pero no pregunta. Una simulación sin tarea tiende a usarse como vídeo.
- **No hay predicción previa.** El estudiante ve la curva teórica desde el primer segundo. La investigación en enseñanza de la física es bastante unánime en que el beneficio de una simulación crece mucho cuando el alumno predice antes de ver.
- **Ruido estadístico sin tratar.** Varios experimentos de Monte Carlo muestran una curva ruidosa frente a una teórica lisa sin barras de error. Un indicador de "acuerdo" sin incertidumbre es medio indicador.
- **Un espectro sintético.** En Absorción óptica 2D los datos "medidos" se generan con el propio modelo porque los datos experimentales del applet original no se conservan. Está declarado en la ficha, pero debería sustituirse por datos reales si existen.
- **Decisiones físicas que necesitan el visto bueno de los autores.** Están listadas en `docs/evaluacion-didactica.md` (fase 3): la masa de barrera en el modelo de dos bandas, el coeficiente exacto de Stark, el término de masas de las minibandas, la ecuación (2) de Arrhenius, el carácter atérmico del FHP en las ondas sonoras.

---

## 3. Hacia dónde ir (TO BE)

Ordenado por relación valor/esfuerzo. Lo primero no requiere nueva física.

1. **Etiquetar el tipo de comparación en cada panel** (A: "la ecuación del modelo", B: "predicción teórica frente a medida", C: "dos métodos"). Un día de trabajo; corrige la crítica principal de 2.2.
2. **Modo "predice primero".** La curva teórica y los indicadores quedan ocultos hasta que el alumno introduce su predicción (un número o un boceto con el ratón) o pulsa "mostrar". Dos o tres días; afecta a todos los experimentos a través del panel común.
3. **Preguntas guiadas por experimento**, recuperando el espíritu de las hojas originales: tres o cuatro cuestiones con respuesta comprobable en la propia simulación ("¿a qué kT es máxima la respuesta? Compruébalo con el barrido"). Una semana de redacción para 43 experimentos; es trabajo de los autores más que de programación.
4. **Barras de error e incertidumbre** en los indicadores de tipo B (bloques, bootstrap). Dos o tres días.
5. **Exportación de datos** (CSV de la curva medida y la teórica) para que la simulación sirva de "instrumento" en prácticas con análisis posterior en hoja de cálculo o Python. Un día.
6. **Cuaderno de laboratorio**: guardar en el navegador los parámetros y resultados de cada sesión, con un informe imprimible. Una semana.
7. **Datos reales en Absorción 2D** y revisión de las decisiones físicas pendientes con los autores. Depende de la disponibilidad de los datos.

---

## 4. Propuestas de nuevas simulaciones

Criterios: que llenen un hueco conceptual del curso, que tengan una comparación teoría–simulación clara (tipo B o C) y que reutilicen los módulos ya escritos (discos duros por eventos, caminantes Metrópolis, autómata FHP, cadenas y matrices de transferencia, Schrödinger de masa efectiva, álgebra lineal). Esfuerzo: bajo (1–2 días), medio (3–5 días), alto (más de una semana).

### Física Estadística

| Propuesta | Física y comparación | Qué aprende el estudiante | Esfuerzo |
|---|---|---|---|
| **Teorema H de Boltzmann** | H(t) = ∫f ln f calculado sobre los discos duros de Maxwell, decreciente hasta el valor de equilibrio; inversión de velocidades para mostrar la recurrencia | Irreversibilidad desde una dinámica reversible; sensibilidad a las condiciones iniciales | Bajo (reutiliza el motor de discos) |
| **Percolación 2D** | Probabilidad de percolar frente a p, p_c = 0.5927, exponentes de tamaño finito | Transición de fase geométrica, escalado de tamaño finito, colapso de datos | Medio |
| **Algoritmo de Wolff y ralentización crítica** | Tiempo de autocorrelación de m frente a T con Metrópolis y con Wolff; exponente dinámico z | Por qué Metrópolis falla en T_c; algoritmos de cúmulos | Medio (reutiliza Ising) |
| **Modelo XY y transición de Kosterlitz–Thouless** | Vórtices, rigidez de espín, salto universal 2/π | Transiciones sin parámetro de orden; defectos topológicos | Alto |
| **Pila de arena BTW 2D** | Avalanchas sobre una red cuadrada, P(s) y P(t), colapso con L | La imagen clásica de la criticalidad autoorganizada, que el 1D no da | Medio |
| **Gas de Lorentz** | Partícula entre dispersores fijos; coeficiente de difusión frente a densidad y comparación con Boltzmann | Difusión determinista, caos, límite de Boltzmann–Grad | Bajo-medio (motor de discos) |

### Sistemas fuera del Equilibrio

| Propuesta | Física y comparación | Qué aprende el estudiante | Esfuerzo |
|---|---|---|---|
| **Trinquete browniano intermitente y juegos de Parrondo** | Potencial de dientes de sierra que se enciende y apaga; corriente neta frente a frecuencia; juegos A y B con capital frente al tiempo | Cómo el ruido más una asimetría producen transporte sin fuerza neta; segundo principio a salvo. Conecta con la línea de investigación de J. M. R. Parrondo | Medio (reutiliza los caminantes) |
| **Igualdad de Jarzynski y teorema de fluctuación de Crooks** | Partícula en trampa armónica arrastrada; histograma del trabajo; ⟨e^{−βW}⟩ = e^{−βΔF} | Termodinámica estocástica, relaciones exactas lejos del equilibrio | Medio |
| **Boltzmann en red D2Q9 con obstáculo** | Canal con cilindro, calle de Von Kármán limpia, número de Strouhal frente a Reynolds (St ≈ 0.2) | Hidrodinámica sin ruido estadístico, lo que el FHP no puede dar en un navegador | Medio-alto |
| **Modelo de tráfico de Nagel–Schreckenberg** | Diagrama fundamental flujo–densidad, atascos fantasma | Transición de fase dinámica en un sistema cotidiano | Bajo |
| **Modelo de votantes y consenso** | Tiempo de consenso frente a N, interfaces | Dinámica de opinión como modelo de física estadística | Bajo |
| **Fluctuaciones con discos duros y compresibilidad** | Varianza de N en una ventana frente a densidad; comparación con la ecuación de estado | Relación fluctuación–respuesta en un sistema con interacción | Bajo (une dos módulos existentes) |

### Física del Estado Sólido

| Propuesta | Física y comparación | Qué aprende el estudiante | Esfuerzo |
|---|---|---|---|
| **Enlace fuerte en grafeno** | Bandas sobre la red hexagonal, conos de Dirac, densidad de estados lineal | Estructura de bandas 2D, dispersión relativista efectiva | Medio |
| **Mariposa de Hofstadter** | Red cuadrada con flujo magnético por celda; espectro frente a flujo | Bandas de Landau, fractalidad, topología | Medio (reutiliza álgebra lineal) |
| **Localización de Anderson en 2D** | Razón de participación y escalado con L; comparación con la teoría de escala | Diferencia entre 1D (siempre localizado) y 2D (marginal) | Medio |
| **Transición de Peierls** | Cadena con dimerización; energía electrónica frente a distorsión; apertura del gap | Inestabilidad del metal 1D, acoplamiento electrón-red | Bajo-medio (reutiliza cadenas) |
| **Plasmones y función dieléctrica de Lindhard** | ε(q,ω) del gas de electrones, dispersión del plasmón, apantallamiento de Friedel | Respuesta colectiva del gas de electrones | Medio |
| **Dinámica molecular de un cristal de Lennard-Jones** | Fusión, factor de estructura, fonones por autocorrelación de velocidades | De los átomos a la termodinámica de un sólido | Alto |

### Dispositivos Cuánticos

| Propuesta | Física y comparación | Qué aprende el estudiante | Esfuerzo |
|---|---|---|---|
| **Paquete de ondas dependiente del tiempo** (Crank–Nicolson) | Un paquete gaussiano incide sobre barrera, doble barrera y superred; transmisión frente a la curva estacionaria T(E) ya calculada | El efecto túnel como proceso en el tiempo; el retardo en la resonancia | Medio (reutiliza el módulo de Schrödinger) |
| **Diodo túnel resonante autoconsistente** | Carga acumulada en el pozo (Poisson) y biestabilidad de la I–V | Por qué la I–V real tiene histéresis | Medio |
| **Bloqueo de Coulomb y transistor de un electrón** | Diamantes de Coulomb en el plano V_g–V_sd; escalera de Coulomb | Cuantización de la carga como recurso de dispositivo | Medio |
| **Punto cuántico 2D** | Niveles de un pozo 2D parabólico o cuadrado; capas; llenado con Hund | Átomos artificiales | Medio |
| **Anillo de Aharonov–Bohm** | Transmisión frente a flujo en un anillo de enlace fuerte con dos brazos | Interferencia cuántica controlada por un campo que la partícula no toca | Bajo-medio (reutiliza cadenas) |
| **Conductancia cuantizada en un contacto puntual** | Landauer–Büttiker con N canales; escalones de 2e²/h frente a anchura | De la transmisión a la conductancia medible | Medio |
| **Oscilaciones de Bloch en superred con emisión THz** | Enlaza el experimento 11 de Estado Sólido con el 8 de Dispositivos: corriente y espectro de la oscilación | El mismo hamiltoniano visto como dispositivo | Bajo (reutiliza dos módulos) |

### Transversal

| Propuesta | Descripción | Esfuerzo |
|---|---|---|
| **Itinerarios** | Secuencias guiadas de 4–6 experimentos con un hilo ("del caos molecular a la difusión", "de los niveles a las bandas", "transiciones de fase") y preguntas entre pasos | Bajo (es contenido) |
| **Modo examen o práctica evaluable** | Parámetros ocultos sorteados por estudiante, que debe medir y entregar (como ya hace el ajuste de γ en Absorción 2D) | Medio |
| **Versión descargable** | Un ZIP autocontenido para usar sin red en un aula | Bajo |

---

## 5. Recomendación

Si hubiera que elegir tres cosas para el próximo curso: (1) etiquetar los tipos de comparación y añadir el modo "predice primero", porque multiplican el valor de lo que ya existe sin escribir física nueva; (2) redactar las preguntas guiadas con los autores, que es donde el curso original tenía su fuerza; (3) desarrollar dos simulaciones nuevas de las que cierran huecos conceptuales y tienen tirón, el trinquete de Parrondo en Sistemas fuera del Equilibrio y el paquete de ondas dependiente del tiempo en Dispositivos Cuánticos.

Todo el material es abierto y está en el repositorio; cualquier cambio en los textos o en la física lo podemos hacer en horas, no en meses.
