# Discos duros y distribución de Maxwell

## Qué se observa

N discos rígidos se mueven en una caja cuadrada y chocan elásticamente entre sí y con las
paredes. A la derecha, el histograma del módulo de la velocidad $N(v)$ se compara con la
distribución de Maxwell bidimensional que tiene la misma energía total. Sea cual sea la
distribución inicial (incluso todas las partículas con la misma velocidad), el histograma
acaba fluctuando alrededor de la curva de Maxwell: la dinámica microscópica, determinista y
reversible, lleva al estado de equilibrio.

## Modelo físico

Partículas de masa $m$ y radio $R$ con interacción de esfera dura. En equilibrio, la
distribución de velocidades es la de Maxwell–Boltzmann. En **dos dimensiones** la densidad de
probabilidad del módulo $v$ es

$$ f(v)\,dv = \frac{m v}{k_B T}\, e^{-m v^2/2k_BT}\, dv , $$

que se obtiene integrando la gaussiana $\propto e^{-m(v_x^2+v_y^2)/2k_BT}$ sobre el ángulo
($2\pi v\,dv$). Comparada con la fórmula 3D (que lleva $v^2$), la curva 2D arranca
linealmente en $v=0$ y tiene su máximo en $v_p=\sqrt{k_BT/m}$. Momentos útiles:

$$ \langle v\rangle = \sqrt{\frac{\pi k_BT}{2m}},\qquad \langle v^2\rangle = \frac{2k_BT}{m}. $$

La temperatura se define por equipartición: dos grados de libertad cuadráticos, cada uno
con $\tfrac12 k_BT$, de modo que

$$ k_BT = \frac{1}{N}\sum_i \tfrac12 m v_i^2 . $$

La energía se conserva exactamente en las colisiones, así que $k_BT$ queda fijada por la
condición inicial y la curva azul no cambia con el tiempo.

El número esperado de partículas en el intervalo $[v_1,v_2]$ es
$N\,[e^{-mv_1^2/2k_BT}-e^{-mv_2^2/2k_BT}]$; eso es lo que se dibuja (no la densidad en el
punto medio multiplicada por el ancho).

## Algoritmo de simulación

El original (2003) avanzaba todas las partículas un paso $\Delta t = 1$ y después buscaba
pares que se hubieran cruzado durante ese paso, retrocediéndolos al instante de contacto.
Aquí la dinámica es **dirigida por eventos** dentro de cada paso: se calcula para cada disco
el tiempo del próximo choque (con otro disco o con una pared), se avanza el sistema hasta el
evento más próximo, se aplica la colisión y se recalculan sólo los tiempos de los discos
afectados. Se repite hasta agotar $\Delta t$. Para esferas duras esto es exacto: la energía
se conserva al redondeo, no hay solapamientos y no hay "túneles" de partículas rápidas.

Colisión elástica entre masas iguales: con $\hat n$ el vector unitario que une los centros,
sólo se intercambia la componente normal de la velocidad,
$\vec v_i' = \vec v_i - (\Delta\vec v\cdot\hat n)\hat n$, $\vec v_k' = \vec v_k + (\Delta\vec v\cdot\hat n)\hat n$.

Tiempo de contacto: con $\vec r = \vec r_k-\vec r_i$ y $\vec u=\vec v_k-\vec v_i$, hay choque si
$\vec r\cdot\vec u<0$ y el discriminante $(\vec r\cdot\vec u)^2 - u^2 (r^2-4R^2)$ es positivo;
entonces $t_c = \left[-\vec r\cdot\vec u - \sqrt{\cdot}\right]/u^2$.

Las posiciones iniciales se sortean sin solapamiento (muestreo por rechazo; si la fracción
de empaquetamiento es alta se recurre a una red hexagonal).

## Cambios respecto al applet original

| Original | Aquí | Motivo |
|---|---|---|
| Colisiones detectadas tras el paso, resolución secuencial por pares, y el resto del paso tras la colisión no se completaba | Dinámica por eventos | Conservación exacta de energía, sin solapamientos ni túneles |
| "Colisiones por partícula" = $N_{col}/2N$ | $2N_{col}/N$ | Cada colisión involucra a dos partículas; el original estaba dividido por 4 |
| Posiciones iniciales aleatorias posiblemente solapadas (y la coordenada $y$ usaba el margen de $x$) | Sin solapamiento | Discos solapados dan colisiones espurias |
| $v_{max}$ del histograma fijo por tipo de distribución | $v_{max}=4\sqrt{k_BT/m}$ | Cola despreciable ($e^{-8}$) para cualquier $k_BT$ |
| Bins con bordes inclusivos (`>=` y `<=`) | Semiabiertos | Evita contar dos veces en los bordes |
| Curva teórica $N\Delta v f(v)$ evaluada en los bordes | Integral exacta por bin | Coincide con lo que mide el histograma |
| — | Histograma promediado en el tiempo (opcional) | Permite ver la convergencia con pocos discos |

## Pruebas

`tests/maxwell.test.js`: conservación de energía a $10^{-9}$ relativo en 500 pasos con 60
discos y ausencia de solapamientos; conservación de momento en la colisión binaria; 150
discos durante 1000 pasos sin NaN ni salirse de la caja; 300 discos colocados sin
solapamiento; convergencia del histograma promediado a Maxwell 2D desde la condición
"todas con $v_x=v_y=1$" ($\chi^2$ con $p>10^{-3}$ y velocidad media dentro del 5 % de
$\sqrt{\pi k_BT/2m}$).

## Evaluación didáctica

**Qué aporta.** La idea central (equilibrio emergente desde cualquier condición inicial y
forma 2D de Maxwell) se ve en segundos. El caso "todas con la misma velocidad" es
especialmente instructivo: no hay colisiones hasta que las paredes rompen la simetría.

**Controles.** N, radio, distribución inicial, promedio temporal, velocidad de animación.
Lecturas: tiempo, $k_BT$, colisiones por partícula, choques con paredes.

**Limitaciones y mejoras propuestas.** No hay medida cuantitativa de la convergencia (por
ejemplo la entropía de Boltzmann $H(t)=-\sum_b p_b\ln p_b$ del histograma, que debería
crecer hasta saturar); sería la mejora más valiosa. También: histograma de $v_x$ (gaussiana)
junto al de $v$, y medir el recorrido libre medio frente a la predicción
$\lambda = 1/(2\sqrt2\, n R)$ en 2D. Cada una es una tarde de trabajo.
