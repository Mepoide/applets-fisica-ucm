# Puerto de los applets de física UCM a navegadores actuales — diseño

Fecha: 2026-11-09. Decisiones del autor (Mario): JS vanilla + Canvas sin build, las 6
familias, interfaz y documentación bilingüe ES/EN, commits directos a `main` con push.

## 1. Objetivo

Recuperar seis applets Java AWT (2002-2003, docencia UCM, Mario Encinar sobre base de Mario Castro; física estadística y
sistemas complejos) como páginas web estáticas que funcionen hoy, auditar su física,
corregir y documentar, y evaluar su valor didáctico. El código original queda congelado en
la rama `legacy-java`. Fuera de alcance en esta fase: applets nuevos.

## 2. Familias y versión de referencia

| Slug | Original de referencia | Modelo |
|---|---|---|
| `maxwell` | `HDA_Maxwell_final` | Discos duros 2D, colisiones elásticas por pares, histograma de módulo de velocidad frente a Maxwell 2D. |
| `pila-arena` | `Pila_arena` | Pila de arena 1D con pendiente crítica `hc`; granos añadidos en la columna 0, salen por la derecha. |
| `fluctuaciones` | `Autocor` (= `CanonicaApplet` + botón vacío) | Gas ideal 2D maxwelliano sin colisiones; recuento N(t) en un rectángulo elegido con el ratón; histograma frente a Poisson. |
| `onda-lgca` | `Perfildens4` (perfil en franja, promediado) + `Perfildens2` (perfil radial por coronas) | Gas reticular FHP con partícula en reposo (7 bits), red hexagonal periódica 250×250, hueco elíptico inicial: onda sonora cilíndrica. |
| `modos-lineales` | `Lineal` | Solución analítica de la hidrodinámica linealizada 1D: modos sonoros (Brillouin) y térmico (Rayleigh) para δρ, u, δT. |
| `von-karman` | `VKfinal` (y `VK8final`) | FHP con inyección de flujo, placa plana perpendicular con reglas de pared, campo de velocidad promediado en cajas. |

Utilidades Java `CuadroMath*`, `VentanaAuxiliar`, `GraficoAuxiliar` se sustituyen por una
librería propia (`lib/`).

## 3. Arquitectura

Sitio estático, módulos ES nativos, sin bundler. Se sirve con cualquier servidor estático
(GitHub Pages, `python3 -m http.server`); también abre desde `file://` salvo el renderizado
de Markdown, que necesita `fetch` y por tanto servidor.

```
index.html                     portada: lista de applets, selector ES/EN
assets/style.css               estilos comunes (claro/oscuro, responsive)
lib/i18n.js                    diccionarios ES/EN, t(key), persistencia en localStorage, ?lang=
lib/plot.js                    Plot: ejes, escalas, línea, barras, texto, imagen; sustituye CuadroMath
lib/loop.js                    bucle requestAnimationFrame con start/pause/reset y pasos por frame
lib/ui.js                      constructores de controles (número, select, botón, checkbox, slider)
lib/stats.js                   histograma, lgamma, Poisson, binomial, medias móviles
lib/rng.js                     PRNG con semilla (mulberry32) para tests reproducibles
lib/docs.js                    carga docs/<lang>/<slug>.md y lo renderiza (marked + KaTeX desde cdnjs, versiones fijas)
applets/<slug>/index.html      página del applet: controles, canvas, pestaña Teoría
applets/<slug>/model.js        física pura, sin DOM, importable desde Node
applets/<slug>/view.js         dibujo en canvas y cableado de controles
docs/es/<slug>.md, docs/en/<slug>.md   teoría, simulación, auditoría, evaluación didáctica
docs/audit/README.md           resumen de hallazgos y correcciones, por familia
tests/*.test.js                node:test sobre model.js (conservación, convergencia, tablas)
tests/browser/smoke.mjs        Playwright: cada página carga sin errores de consola y pinta
package.json                   solo scripts: test, test:browser, serve (sin dependencias de runtime)
```

Regla de separación: `model.js` expone `create(params, rng)`, `step(state)`, y
observables puros. `view.js` es el único que toca `document`. Esto permite tests
numéricos sin navegador y que cada applet quepa en un fichero legible.

## 4. Interfaz común de cada applet

Controles: Iniciar/Reiniciar, Pausa/Continuar, velocidad (pasos por frame), parámetros
propios en una barra superior, pestaña "Teoría" con el Markdown bilingüe, pie con enlace
al código Java original en `legacy-java`. Canvas responsive con `devicePixelRatio`.
Texto siempre vía `i18n.t()`. Sin dependencias en tiempo de ejecución salvo marked y KaTeX
para la pestaña de teoría (si fallan, se muestra el Markdown en bruto).

## 5. Física: hallazgos preliminares a auditar y corregir

Detectados en la lectura del código; cada uno se confirma con un test o cálculo antes de
corregir, y se documenta en `docs/audit/`.

- `maxwell`: "colisiones por partícula" calcula `N_col/(2N)`; lo correcto es `2·N_col/N`.
  Tras una colisión no se completa el resto del paso temporal. Posiciones iniciales pueden
  solaparse. `vmax` fijo por distribución en vez de derivado de `kT`. Histograma con
  bordes inclusivos (doble conteo). Fórmula Maxwell 2D y definición `kT = <½mv²>` correctas.
- `pila-arena`: el modelo 1D con umbral de pendiente fijo es trivial (estado estacionario en
  escalera, sin avalanchas de tamaño variable): no muestra criticalidad autoorganizada. La
  gráfica "tiempo/#" nunca se dibuja. Propuesta: mantener el modelo original y añadir la
  variante de Oslo (umbral aleatorio 1 ó 2), que sí da SOC en 1D, con histograma de
  tamaños de avalancha en ejes log-log.
- `fluctuaciones`: con N fijo en la caja, el recuento en un subvolumen es binomial(N, p),
  no Poisson; Poisson es el límite p≪1. Mostrar ambas. Botón "Autocorrelación" vacío:
  implementar C(τ) del recuento. `FileWriter` eliminado. `lnfactorial` con Stirling:
  sustituir por `lgamma`.
- `onda-lgca`: tablas de colisión FHP con reposo: verificar conservación de masa y momento
  en las 128 entradas por test exhaustivo. Escala del perfil (25-75 / 25-65) incoherente
  con la suma de 41 filas: recalcular como densidad media por nodo (0-7) o fracción (0-1).
- `modos-lineales`: peso del modo térmico `(cp−cv)/cv` hace que la suma de pesos sea 1.5;
  el peso correcto del pico de Rayleigh es `(cp−cv)/cp` (cociente de Landau-Placzek
  `(cp−cv)/cv` es Rayleigh/Brillouin, no la fracción). Rederivar δρ, u, δT con la
  normalización correcta y documentar. Singularidad en t=0. Botones D/Ux/T sin función:
  usarlos para mostrar/ocultar curvas.
- `von-karman`: la tabla de velocidades usa aritmética entera (`(1/2)` = 0 y `vy*=√3/2`
  truncado), por lo que el campo de velocidad ignora las componentes diagonales.
  `densidadsuma` nunca se reinicia. En `iteration2` los nodos de pared leen `n1` y escriben
  `n2` (copia-pega), así que la pared absorbe partículas cada dos pasos: no conserva masa.
  La fila 0 nunca se actualiza y actúa como fuente aleatoria constante. Reescribir el
  obstáculo como nodos sólidos con reflexión (especular o bounce-back, seleccionable)
  aplicada en ambos subpasos, flujo de entrada arriba y salida abajo explícitos, y campo de
  velocidad coarse-grained con flotantes.

## 6. Pruebas

- `node --test`: tablas de colisión (masa y momento en las 128 entradas), conservación de
  energía y momento en discos duros, convergencia del histograma a Maxwell (χ² o KS con
  semilla fija), conservación de granos en la pila, binomial/Poisson exactas, normalización
  de los modos lineales, conservación de masa en el canal de Von Kármán con paredes.
- Playwright (ya instalado en la máquina): abre cada `applets/*/index.html` servido por
  `python3 -m http.server`, pulsa Iniciar, avanza, comprueba que no hay errores de consola y
  que el canvas cambia; captura una imagen por applet en `docs/screenshots/`.

## 7. Documentación por applet (`docs/es`, `docs/en`)

Secciones fijas: Qué se observa · Modelo físico (ecuaciones) · Algoritmo de simulación ·
Qué hemos cambiado respecto al original y por qué · Pruebas · Evaluación didáctica
(controles, qué aprende el estudiante, limitaciones, mejoras propuestas).

## 8. Entregable final de la fase

`docs/audit/README.md` con la tabla de hallazgos/correcciones y `docs/evaluacion-didactica.md`
(ES/EN) con la valoración de interactividad y aprendizaje por applet y la lista de
candidatos a crear nuevos. Ahí se detiene esta fase.
