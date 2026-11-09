# Gas reticular con obstáculo: la calle de Von Kármán

## Qué se observa

Un flujo de gas reticular FHP incide sobre una placa plana perpendicular. Detrás de la
placa se forma una estela; si el número de Reynolds es suficiente, la estela se vuelve
inestable y desprende vórtices alternos: la **calle de vórtices de Von Kármán**. El campo de
velocidad se promedia en cajas de nodos y se dibuja con flechas; el color muestra la
densidad, el módulo de la velocidad o la vorticidad.

## Modelo físico

El autómata FHP con partícula en reposo (7 bits por nodo; véase el applet de la onda
sonora) tiene como límite macroscópico las ecuaciones de Navier–Stokes **modificadas**:

$$ \partial_t(\rho\,\vec u) + g(\rho)\,\nabla\!\cdot(\rho\,\vec u\vec u) = -\nabla p + \nu\,\nabla^2(\rho\vec u) , $$

con dos peculiaridades frente a un fluido real:

1. **Factor galileano** $g(\rho)$: el término de advección lleva un prefactor que, para los
   modelos de 7 bits con equilibrio de Fermi–Dirac, vale
   $$ g(f) = \frac{7}{12}\,\frac{1-2f}{1-f}, $$
   donde $f = \rho/7$ es la ocupación media por canal. **En $f = 1/2$, $g = 0$**: el flujo es
   lineal (Stokes) y no puede haber desprendimiento de vórtices. Por eso hay que trabajar a
   densidad baja, $f \approx 0.2$–$0.3$. El número de Reynolds efectivo es
   $$ \mathrm{Re} = \frac{g(f)\,u\,L}{\nu(f)} . $$
2. **Viscosidad** dependiente de la densidad. Para FHP-III (todas las colisiones)
   $$ \nu(f) = \frac{1}{28}\,\frac{1}{f(1-f)^3\,[1-8f(1-f)/7]} - \frac18 , $$
   en unidades de red. Nuestro conjunto de colisiones es un subconjunto (FHP-II ampliado),
   así que la viscosidad real es algo mayor; el valor mostrado es una referencia.

Además, el gas reticular es compresible con $c_s = \sqrt{3/7} \approx 0.655$: hay que mantener
$u/c_s \lesssim 0.4$ para que el flujo sea casi incompresible. Con $L = 40$, $f=0.25$,
$u = 0.25$: $g \approx 0.39$, $\nu \approx 0.36$, Re $\approx 11$. La calle de Von Kármán
aparece en un cilindro para Re $\gtrsim 47$; para una placa plana el umbral es algo menor
pero sigue requiriendo placas largas ($L \sim 100$–$200$) o redes grandes: en el
navegador se consigue con paciencia (velocidad alta, varios miles de pasos) y el promedio
temporal del campo, que elimina el ruido estadístico del gas reticular. Con parámetros
modestos lo que se observa es la estela simétrica con dos vórtices de recirculación, que ya
es una comprobación cualitativa de la hidrodinámica emergente.

**Condiciones de contorno.** El canal es periódico en las dos direcciones. En tres filas
de la entrada se vuelve a sortear cada paso la ocupación de los canales según el
equilibrio a densidad $f$ y velocidad $u$: $f_k = f\,[1 + a\,\hat c_k\cdot\hat u]$ con
$a = 7u/3$, que da velocidad media exactamente $u$. Esa zona impone el flujo y, gracias a la
periodicidad, actúa también como medio aguas abajo de la salida, evitando la succión que
produciría un borde vacío. La placa es una fila de nodos sólidos: cada partícula que llega
se refleja (rebote, $\vec c\to-\vec c$, que da no deslizamiento; o especular, que da
deslizamiento) y vuelve al fluido en el paso siguiente. La reflexión se aplica en los dos
subpasos del ciclo, de modo que la pared conserva la masa exactamente.

## Preguntas

1. Con f = 0.5 la velocidad no transporta momento (g(f) = 0). ¿Qué ves en la estela? Baja f a 0.25 y compara.
2. Estima el número de Reynolds efectivo a partir de u, el tamaño de la placa y la viscosidad del gas. ¿Es suficiente para una calle de vórtices clara?
3. Aumenta u hasta acercarte a la velocidad del sonido: ¿qué artefactos aparecen? ¿Por qué el FHP es poco fiable a Mach alto?

## Cambios respecto al applet original

| Original | Aquí | Motivo |
|---|---|---|
| Tabla de velocidades con aritmética **entera**: `(1/2)*…` vale 0 y `vy *= √3/2` se trunca | Tablas en coma flotante | El campo de velocidad del original ignoraba las componentes diagonales |
| `densidadsuma` acumulado sin reiniciar, velocidades ×10⁶ y saturadas | Promedio por caja correcto (momento/partículas) | Las flechas originales eran esencialmente ruido saturado |
| En el segundo subpaso los nodos de pared leían `n1` y escribían `n2` (copia-pega): la pared **absorbía** partículas cada dos pasos | Reflexión en ambos subpasos | Conservación de masa (test) |
| Fila 0 nunca actualizada: actuaba como fuente aleatoria constante; inyección de estado 97 (reposo + dos movers hacia abajo: Mach 1.3) con probabilidad `fvel` | Zona de entrada en equilibrio con $u$ ajustable y subsónica | Flujo físico y controlable |
| Densidad $f = 0.5$ fija | $f$ ajustable, 0.25 por defecto | $g(0.5)=0$: sin advección no hay calle de vórtices |
| Sólo flechas | Densidad, velocidad o vorticidad en color, promedio temporal, flechas relativas | La vorticidad promediada es lo que hace visible la estela |
| Sin números | Lectura de $g$, $\nu$, Re y Mach | |

Las tablas de colisión y las reglas de reflexión especular del original eran correctas
(masa y momento conservados; comprobado para las 128 entradas).

## Pruebas

`tests/vonkarman.test.js`: las probabilidades de la zona de entrada dan exactamente la
velocidad pedida; con la entrada desactivada la placa conserva la masa durante 300 pasos
con ambas reglas de pared; el canal sin placa alcanza aguas abajo la velocidad de entrada
dentro del 20 %; el campo promediado apunta en la dirección del flujo y un haz uniforme
tiene vorticidad nula; $g(1/2)=0$ y $\nu(f)$ finita y positiva.
`tests/fhp.test.js` cubre reflexión, periodicidad y conservación.

## Evaluación didáctica

**Qué aporta.** Es el applet más ambicioso: muestra que de reglas booleanas emerge
hidrodinámica no lineal, e introduce con naturalidad conceptos que no aparecen en los
fluidos de libro de texto (factor galileano, viscosidad de red, compresibilidad). Las
lecturas de Re y Mach permiten razonar sobre qué se debería ver y por qué no se ve.

**Limitaciones.** Un gas reticular en JavaScript con $160\times400$ nodos es ruidoso y lento
para alcanzar Re $\sim 50$–$100$ con claridad. El desprendimiento alterno claro requiere
placas largas y decenas de miles de pasos.

**Mejoras.** (1) Sustituir el FHP por un **Boltzmann en red** (D2Q9, BGK) con los mismos
controles: sin ruido, Re arbitrario, calle de Von Kármán en segundos; el FHP quedaría como
"microscopio" opcional. (2) Medir el número de Strouhal del desprendimiento
($\mathrm{St} = fL/u \approx 0.2$) registrando la velocidad transversal en un punto de la
estela. (3) Obstáculo circular además de la placa.
