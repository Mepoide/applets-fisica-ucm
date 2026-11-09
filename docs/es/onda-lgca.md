# Gas reticular FHP: onda sonora y perfil de densidad

## Qué se observa

Un autómata celular de gas reticular (LGCA) en una red hexagonal periódica. Cada nodo
puede alojar hasta 7 partículas: una en reposo y una por cada una de las seis direcciones.
Al inicio el gas es uniforme salvo un **hueco circular** vacío en el centro. El gas se
precipita hacia el hueco y la perturbación se propaga hacia fuera como una **onda sonora
cilíndrica**: en el perfil radial de densidad se ve un mínimo (rarefacción) que avanza a
velocidad constante, la velocidad del sonido de la red.

## Modelo físico

**El modelo FHP** (Frisch, Hasslacher y Pomeau, 1986) es el autómata de gas reticular más
simple cuyo comportamiento macroscópico son las ecuaciones de Navier–Stokes: la simetría
hexagonal basta para que el tensor de flujo de momento sea isótropo, cosa que falla en la
red cuadrada (HPP). Las reglas son: en cada paso las partículas saltan al nodo vecino en su
dirección (propagación) y después, en cada nodo, el estado se transforma según una tabla
de colisión que **conserva el número de partículas y el momento**. Con partícula en reposo
(modelos FHP-II/III) la energía cinética no se conserva por separado —no hace falta para la
hidrodinámica isoterma— y se gana una variable de densidad más y menor viscosidad.

Las colisiones usadas (las del applet de 2003) son:

- frontales de dos cuerpos $\{k, k+3\} \to \{k\pm1, k+4\pm1\}$, alternando la quiralidad
  ($+60°$ en los pasos pares, $-60°$ en los impares) para no romper la simetría especular;
- simétrica de tres cuerpos $\{1,3,5\}\leftrightarrow\{2,4,6\}$;
- reposo + móvil $k \to \{k-1, k+1\}$ y su inversa;
- las mismas con partícula en reposo espectadora y las **duales** partícula-hueco
  ($s \to 127 - s$).

La prueba `tests/fhp.test.js` comprueba que las 128 entradas de ambas tablas conservan masa
y momento y son permutaciones: la tabla original era correcta.

**Velocidad del sonido.** En un gas reticular de $b$ estados, $b_m$ de ellos móviles con
velocidad $c$, en $D=2$ dimensiones la presión en reposo es $p = \frac{b_m}{b}\frac{c^2}{D}\rho$,
de donde

$$ c_s^2 = \frac{b_m}{b}\,\frac{c^2}{D} = \frac{6}{7}\cdot\frac12 = \frac37,\qquad c_s \simeq 0.655 $$

nodos por paso, **independiente de la densidad**. (Sin partícula en reposo, FHP-I,
$c_s = 1/\sqrt2$.) Es lo que el applet pone a prueba: el frente medido debe seguir
$r(t) = r_0 + c_s t$ para cualquier $f$.

**Perfil de densidad.** La ocupación media $\langle n\rangle$ de un nodo es $7f$ con $f$ la
probabilidad de ocupación de cada canal. La onda emitida por un hueco cilíndrico es una
rarefacción que decae como $r^{-1/2}$ (conservación del flujo de energía en 2D) y se
ensancha por la viscosidad del gas reticular; detrás del frente el hueco se rellena.

## Algoritmo de simulación

Red de $L\times L$ nodos en coordenadas sesgadas: el nodo $(i_x,i_y)$ está en
$x = i_x - i_y/2$, $y = i_y\sqrt3/2$. Un paso = propagación (cada nodo recoge la partícula
que le llega de cada vecino) + colisión (tabla). Perfil radial: media de la ocupación en
anillos de anchura 1 alrededor del centro, con distancias euclídeas en coordenadas físicas.
Perfil en franja: media en $\pm20$ filas, binned por $x$ físico. El frente se localiza como
el mínimo del perfil radial fuera del hueco.

## Cambios respecto al applet original

| Original | Aquí | Motivo |
|---|---|---|
| Hueco "elíptico": la condición usaba $\tfrac32(i_y-y_c)^2$ en lugar de $\tfrac34$ | Disco en coordenadas físicas | El original era una elipse achatada 2:1 |
| Perfil en franja sumando 41 filas sin dividir, con ejes fijos 25–75 (versión 4: 25–65) y mezclando filas desplazadas en $x$ | Ocupación media por nodo (0–7), ejes correctos, binning por $x$ físico | La escala original no correspondía a la magnitud dibujada |
| Sólo perfil en franja (v4) o sólo radial por coronas en índices (v2) | Ambos perfiles seleccionables, con promedio temporal opcional | |
| Sin referencia teórica | Círculo y línea azul con $r_0+c_s t$, lectura del frente medido | Convierte la animación en una medida |
| Red 250×250 fija, densidad 0.7 | Tamaño, densidad y radio ajustables | |

## Pruebas

`tests/fhp.test.js`: conservación de masa y momento en las 128 entradas de las dos tablas;
propagación periódica que conserva partículas y momento; trayectorias de partículas
aislada; reflexión en nodos sólidos (para el applet de Von Kármán); promediado en cajas.
`tests/onda.test.js`: hueco vacío y densidad exterior correcta; conservación de partículas;
velocidad del frente dentro del 15 % de $\sqrt{3/7}$ (medido: 0.61–0.73 para $f$ = 0.3–0.7);
perfil en franja con el hueco en el centro.

## Evaluación didáctica

**Qué aporta.** Muestra que un conjunto de reglas booleanas locales produce un fenómeno
ondulatorio macroscópico con una velocidad predicha analíticamente, y que esa velocidad no
depende de la densidad. Es una buena introducción a los gases reticulares y, por extensión,
a los métodos de Boltzmann en red.

**Mejoras propuestas.** Medir la atenuación y de ahí la viscosidad; emitir una onda plana
(pared que se retira) para ver la dispersión; comparar FHP-I (sin reposo) y FHP-II para
ilustrar el cambio de $c_s$. Visualizar también la velocidad local (flechas) como en el
applet de Von Kármán.
