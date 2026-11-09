# Fase 2: curso "Sistemas fuera del Equilibrio" (9 experimentos) con ecuación viva

Fecha: 2026-11-09. Aprobado por Mario Encinar en conversación (alcance, convivencia
ecuación/simulación, estructura de navegación).

## 1. Objetivo

Convertir el repo en la versión moderna de la sección *Sistemas fuera del Equilibrio* del
curso UCM *Experimentos Interactivos en Sistemas Físicos Complejos* (R. Brito, 2002; ver
`docs/contexto/README.md`): nueve experimentos en una sola página con navegación lateral
persistente, cada uno con simulación, **panel de ecuación viva** (la ecuación que gobierna el
sistema con sus símbolos sustituidos por los valores actuales) y **curva teórica superpuesta**
a la medida, y la teoría integrada debajo en secciones desplegables. Los seis applets de la
fase 1 se reutilizan; se añaden siete.

## 2. Decisiones heredadas y nuevas

- Sin build, sin dependencias de ejecución salvo KaTeX y marked desde cdnjs (ya en uso).
  ES modules, Canvas 2D, `node:test`, Playwright para humo. Bilingüe ES/EN. Commits a `main`.
- Una página `index.html` como curso (shell). Las páginas `applets/<slug>/index.html` siguen
  existiendo como vista "sin marco" para incrustar.
- La teoría de Brito se **reescribe** en nuestras palabras y se cita como fuente; no se copia.
- Fidelidad: parámetros y controles tomados del bytecode de los applets originales
  (`docs/contexto/README.md`, sección 2) y de sus textos; las diferencias se documentan en
  cada ficha ("Cambios respecto al original").

## 3. Arquitectura

### 3.1 Shell (`index.html` + `lib/shell.js`)

- Layout: cabecera (título del curso, idioma, tema claro/oscuro), barra lateral con la lista
  numerada de experimentos y una segunda lista "Material adicional", área de contenido.
- Enrutado por hash: `#/kac`, `#/irreversibilidad`, … Sin hash → portada (texto breve del
  curso, créditos y la misma lista). Cambiar de experimento destruye el anterior (`destroy()`),
  importa el módulo del nuevo con `import()` y lo monta. `?lang=` y `prefers-color-scheme`
  como hasta ahora; el tema se guarda en `localStorage` (`theme`).
- Responsive: barra lateral colapsable bajo 900 px (botón ☰), gutter de 16 px.
- La barra marca el experimento activo y conserva el scroll.

### 3.2 Contrato de applet (`applets/<slug>/applet.js`)

Cada experimento exporta:

```js
export const meta = { slug, number, titleKey, legacyPath, docs: slug, extra?: boolean };
export function mount(root, { i18n }) -> { destroy(), loop }   // construye DOM dentro de root
```

`mount` crea: `.params`, `#loopctl`, `.stage` (canvases + panel de ecuación), `.readout`,
`.hint` y `.theory` (secciones desplegables cargadas por `lib/docs.js`). La página sin marco
`applets/<slug>/index.html` solo contiene `<main id="app">` y `view.js`, que llama a
`setupPage` y luego a `mount`. Los seis applets actuales se adaptan a este contrato (el código
de `view.js` pasa a `applet.js`; `view.js` queda como arranque de la página suelta).

### 3.3 Ecuación viva (`lib/liveeq.js`)

```js
liveEquation(container, { tex, slots: { kT: {fmt}, ... }, i18n }) -> { update(values), el }
```

- `tex` es KaTeX con marcadores `\htmlId{kT}{\,kT\,}`; `update` escribe el valor formateado en
  los nodos `#kT` sin volver a renderizar (KaTeX `trust: true`). Si KaTeX no carga, degrada a
  texto plano con los valores.
- Un panel puede tener varias ecuaciones y una fila de **indicadores de convergencia**
  (`χ²/dof`, `|Δ|`, error relativo) con semáforo verde/ámbar.
- La curva teórica se dibuja en el mismo `Plot` que la medida con color y leyenda fijos
  (teoría azul `#1f4e9c`, medida rojo `rgba(181,40,30,.75)` como en fase 1).

### 3.4 Teoría integrada

`lib/docs.js` gana `mountSections(container, slug, root)`: parte el Markdown por `##` y genera
`<details>` por sección (primera abierta). Cada ficha añade la sección "Fuente" con el enlace al
experimento original de valbuena y la bibliografía del curso.

## 4. Los nueve experimentos

Numeración y títulos del curso original. "Orig." = controles del applet Java recuperados del
bytecode. Todas las simulaciones tienen `rng` inyectable y `step()` puro en `model.js`.

### 1. Anillo de Kac (`kac`, nuevo; orig. `KACApplet`)
- Modelo: N casillas (≤ 1000) con bola azul/roja; M marcas (≤ N) en aristas; a cada paso todas
  las bolas avanzan una casilla y cambian de color al cruzar una marca. Inicial: aleatorio 50/50,
  70/30, todos azules, alternado (orig.). Panel: anillo exterior (estado inicial) e interior
  (actual), marcas en verde; gráfica Δ(t) = N_A − N_R.
- Ecuación viva: Δ(t) = (1 − 2M/N)^t Δ(0) con M, N, t; recurrencia T = 2N marcada en el eje.
- Tests: periodo exacto 2N (Δ(2N) = Δ(0) y configuración idéntica); a t pequeño y N grande la
  solución de campo medio está dentro de 3√N de Δ medido; con M = N/2 Δ(1) = 0 exactamente
  para "todos azules".

### 2. Irreversibilidad y fluctuaciones (`irreversibilidad`, nuevo + `fluctuaciones` existente)
- Vista A (nueva, orig. `HardDisksApplet`/`GasApplet`): N ≤ 100 discos duros en la mitad
  izquierda, tabique retirado en t = 0; gráfica n_izq − n_dcha vs t con bandas ±σ y ±3σ, σ =
  √N (orig. dibuja ±1/√N relativo). Botón Histograma: distribución de la diferencia vs binomial.
  Modelo cinético reutiliza `applets/maxwell/model.js` (dinámica por eventos).
- Vista B (orig. `IrreversibilidadApplet`, "modelo aleatorio"): cada paso elige una partícula al
  azar y la cambia de lado (Ehrenfest). Misma gráfica.
- Vista C: el `fluctuaciones` actual (ventana, Poisson/binomial, autocorrelación).
- Ecuación viva: P(n) = C(N,n)/2^N, σ = √N/2 en n, P(todas a un lado) = 2^{1−N} con N vivo;
  tiempo medio de retorno.
- Tests: Ehrenfest media y varianza estacionarias (N/2, N/4) con tolerancia 5σ sobre 10⁵
  pasos; histograma de Ehrenfest vs binomial χ² p > 0.01.

### 3. Conductividad térmica (`conductividad`, nuevo; orig. `ejerc4`)
- Modelo: N < 100 discos duros en caja L×L; paredes izquierda/derecha son focos a T₁, T₂:
  al chocar, la partícula sale con velocidad muestreada de la distribución de flujo térmico
  (v_x ∝ Rayleigh de kT_i, v_y gaussiana). Paredes superior/inferior especulares. Se acumula
  energía intercambiada con cada foco. Histograma de energía cinética por franjas en x (perfil
  T(x)) y densidad ρ(x).
- Ecuación viva: κ = (ΔE/Δt)/(L·(T₁−T₂)/L) = Q/ΔT, con Q medido y ΔT; teoría κ ≈ (1/(3√2)) c v̄/σ
  → κ ∝ √T; se muestra κ·(T̄)^{−1/2} para comparar entre temperaturas. Presión uniforme:
  ρ(x)T(x) ≈ const dibujado.
- Tests: con T₁ = T₂ el flujo neto promedio es 0 (|Q| < 3σ); con T₁ > T₂, Q > 0 y T(x) decrece
  monótonamente en promedio sobre 5 franjas; energía conservada entre choques con focos.

### 4. Ondas sonoras en un fluido (`ondas`, existentes `onda-lgca` + `modos-lineales`)
- Vista A: `onda-lgca` (simulación FHP). Vista B: `modos-lineales` (solución analítica).
- Nuevo: en la Vista A, sobre el perfil radial medido se superpone la solución lineal de
  Landau–Placzek con c_s = √(3/7) y los coeficientes de transporte FHP-III (ν de `fhp.js`,
  D_T = ν para FHP a esta aproximación; Γ = (d−1)/d·ν + ... según `docs/es/modos-lineales.md`),
  escalada por el ajuste de amplitud inicial.
- Ecuación viva: δn(k,t) = [(c_v/c_p) cos(c_s k t) e^{−Γ k²t} + (1 − c_v/c_p) e^{−κ k² t/(n c_p)}] δn(k,0)
  con c_s, Γ, k del tamaño del pulso, vivos.
- Tests: ya existentes; añadir que la posición del máximo del frente medido avanza a c_s ± 10 %.

### 5. Reacciones químicas: modelo de Maginu (`maginu`, nuevo; orig. `ejerc5`)
- Modelo macroscópico: ∂c₁ = c₁ − c₁³/3 − c₂ + D∇²c₁ ; ∂c₂ = (c₁ − k c₂)/c + D∇²c₂, con k, c
  fijos (orig. k = 0.9, c = 0.53 probables; se fijan k = 0.9, c = 2.0 si el ciclo no es
  estable con los primeros, y se documenta). Parámetro s (escala, 1 < s < 20) controla D/reacción.
- Microscópico: autómata en red nx×ny (orig. ~100×100) con número entero de partículas de cada
  especie por celda (≤ 5 bits, orig. `maxrot`), difusión por redistribución aleatoria entre
  vecinos y reacción estocástica con probabilidades proporcionales a los términos de la ODE
  (τ-leaping con Poisson). Visualiza especie 1, 2 o diferencia (orig. `especie`), con control de
  tono (orig. `tono`).
- Ecuación viva: las dos ODEs con s, D, k, c; plano (c₁, c₂): ciclo límite de la ODE homogénea
  (integrado con RK4) y trayectoria de la media espacial medida encima.
- Tests: ODE homogénea converge a ciclo límite (amplitud estable tras 200 unidades); con s grande
  la media espacial sigue el ciclo con error RMS < 0.1; conservación: sin reacción, el número total
  de partículas se conserva bajo difusión.

### 6. Movimiento browniano (`browniano`, nuevo; el original era el applet de M. Fowler)
- Modelo: un disco grande (masa ratio M/m = 20, radio 5× orig. `massratio`, `nballs` 40) en gas
  de N discos duros, dinámica por eventos (reutiliza `maxwell/model.js` generalizado a masas y
  radios por partícula). Vista "microscopio": solo la traza del disco grande ampliada ×5. Vista
  atómica: todo el gas.
- Ecuación viva: ⟨Δx²⟩ = 2 D t ajustado por mínimos cuadrados sobre la traza; D_teórico de
  Einstein con fricción de Enskog 2D indicado como orden de magnitud; equipartición
  ½M⟨V²⟩ = kT (medido vs. kT del gas).
- Tests: equipartición del disco grande a 10 % tras 2·10⁴ colisiones; ⟨Δx²⟩ lineal en t
  (R² > 0.9) para t grande.

### 7. Difusión en un potencial externo (`potencial`, nuevo; orig. `ejerc1`)
- Modelo: N caminantes (orig. `Nbolas`) en red 1D de L sitios con dinámica de Metrópolis:
  salto a vecino con prob. ½ si baja la energía, ½ e^{−ΔV/kT} si sube. Potenciales (orig.):
  parabólico, diente de sierra simétrico, asimétrico (constantes del bytecode: pendientes 1.732,
  0.577). kT por deslizador (orig. `Scrollbar`). Histograma acumulado sobre 200 pasos.
- Ecuación viva: p_i = e^{−V_i/kT}/Z con kT vivo, Z calculado; barra "kT" dibujada en la escala
  del potencial; χ²/dof histograma vs Boltzmann.
- Tests: histograma estacionario vs Boltzmann χ² p > 0.01 para los tres potenciales; a kT → 0
  todas las partículas acaban en el mínimo; a kT grande distribución plana (χ² vs uniforme).

### 8. Activación: ley de Arrhenius (`arrhenius`, nuevo; orig. `ejerc6`)
- Modelo: caminantes Metrópolis en doble pozo V(x) = (x²−1)² + A·x sobre red con Δx (orig.:
  amplitud A, kT, N; constantes 1.25, 0.75); todos empiezan en el pozo metaestable (el de mayor
  energía). Gráfica N_meta(t).
- Ecuación viva: N_meta(t) = N₀ e^{−kt}; k_discreto = e^{−V(x_max)/kT} / (2Δt Σ_{x≤x_max} e^{−V(x)/kT})
  (ec. 2 del curso) y k_Arrhenius = (ω/2π) e^{−ΔE/kT} con ω = √V''(x_meta); ambas curvas
  superpuestas, ΔE, ω, k vivos.
- Tests: con kT ≪ ΔE el k ajustado (regresión de ln N_meta) coincide con k_discreto al 20 %;
  k crece con kT; con A = 0 el estado final reparte ½/½.

### 9. Resonancia estocástica (`resonancia`, nuevo; orig. `ejerc3`)
- Modelo: una partícula Metrópolis en doble pozo V(x,t) = (x²−1)² + A x cos(ωt); controles
  frecuencia (×0.01), amplitud, kT (orig.). Gráfica: x(t) y posición del mínimo global del
  potencial (orig. "Posición Bola / Mínimo Potencial").
- Ecuación viva: tiempo de Kramers τ_K = (2π/ω₀) e^{ΔE/kT} vs periodo T = 2π/ω; condición de
  resonancia τ_K ≈ T/2; cociente señal/ruido estimado como |⟨x(t) cos ωt⟩|/σ_x en ventana
  deslizante; gráfica SNR vs kT acumulada al barrer kT (botón "barrer").
- Tests: con A = 0 la tasa de saltos sigue Arrhenius (reutiliza test 8); con forzamiento y kT en
  torno al óptimo la correlación x–señal supera la de kT/4 y 4kT.

### Material adicional (sección aparte en la barra lateral)
`maxwell`, `pila-arena`, `von-karman`, adaptados al contrato y con panel de ecuación viva:
Maxwell f(v) con kT medido y χ²; Oslo P(s) ∝ s^{−τ} con τ ajustado; Von Kármán Re, g(f), ν, Ma.

## 5. Ficheros

```
index.html                     shell del curso
lib/shell.js                   enrutado, barra lateral, tema, montaje/desmontaje
lib/liveeq.js                  ecuación viva (KaTeX) + indicadores
lib/docs.js                    + mountSections()
lib/theme.css? → assets/style.css  variables :root, modo oscuro, layout de curso
applets/<slug>/{model.js,applet.js,view.js,index.html}   9 + 3 applets
applets/_kinetic/disks.js      dinámica de discos duros por eventos generalizada (masas, radios,
                               paredes térmicas) extraída de maxwell/model.js
applets/_walkers/metropolis.js caminantes Metrópolis 1D compartidos por 7, 8, 9
docs/{es,en}/<slug>.md         fichas (nuevas: kac, irreversibilidad, conductividad, ondas,
                               maginu, browniano, potencial, arrhenius, resonancia)
tests/*.test.js                uno por modelo nuevo + liveeq + shell (routing con jsdom-less
                               pruebas de parseo de hash)
tests/browser/smoke.mjs        recorre los 12 destinos del shell además de las páginas sueltas
```

## 6. Pruebas y verificación

- `npm test` verde en cada tarea; cobertura mínima descrita en cada experimento.
- `npm run test:browser` local y `BASE_URL=https://mepoide.github.io/applets-fisica-ucm` tras
  cada despliegue: sin errores de consola, canvas cambia, panel de ecuación renderizado
  (`.liveeq .katex` presente o fallback), teoría montada.
- Capturas en `docs/screenshots/` regeneradas.

## 7. Fuera de alcance

Secciones de Física Estadística, Estado Sólido y Dispositivos Cuánticos del curso; cuentas de
usuario, guardado de resultados; traducción de los textos originales de Brito (se escriben
fichas propias).
