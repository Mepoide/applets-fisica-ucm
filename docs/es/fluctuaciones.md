# Fluctuaciones de ocupación: Poisson, binomial y autocorrelación

## Qué se observa

Un gas ideal de $N$ partículas con velocidades maxwellianas rebota en una caja. Se dibuja
una ventana rectangular con el ratón y se cuenta cuántas partículas hay dentro en cada
instante, $N_V(t)$. La serie temporal fluctúa alrededor de $\langle N_V\rangle = Np$, con
$p$ la fracción de área de la ventana. El histograma de $N_V$ se compara con dos
distribuciones teóricas y la autocorrelación muestra el tiempo de memoria de las
fluctuaciones.

## Modelo físico

**Subsistema abierto de un sistema cerrado.** Si las $N$ partículas son independientes y
están uniformemente distribuidas, cada una está en la ventana con probabilidad $p$. El
número dentro sigue entonces una **binomial**:

$$ P(n) = \binom{N}{n} p^n (1-p)^{N-n},\qquad \langle n\rangle = Np,\qquad \sigma^2 = Np(1-p). $$

Éste es el resultado exacto para la colectividad **canónica** (N fijo) del gas ideal. En
el límite $p\to 0$, $N\to\infty$ con $\lambda = Np$ fijo se obtiene la **Poisson**

$$ P(n) = \frac{\lambda^n e^{-\lambda}}{n!},\qquad \sigma^2 = \lambda, $$

que es la distribución de ocupación de un volumen pequeño en contacto con un baño de
partículas infinito (colectividad **gran canónica**). La diferencia entre ambas es el
factor $(1-p)$ en la varianza: cuando la ventana ocupa la mitad de la caja, las
fluctuaciones son la mitad de lo que predice Poisson, porque cada partícula que entra en
la ventana es una que falta fuera. Las fluctuaciones relativas decrecen como
$\sigma/\langle n\rangle = \sqrt{(1-p)/Np}\sim N^{-1/2}$: el origen de la equivalencia de
colectividades en el límite termodinámico.

**Autocorrelación.** Con $\delta N(t) = N_V(t)-\langle N_V\rangle$,

$$ C(\tau) = \frac{\langle \delta N(t)\,\delta N(t+\tau)\rangle}{\langle \delta N^2\rangle}. $$

Para partículas libres la correlación se pierde cuando una partícula típica ha recorrido
el tamaño de la ventana: $\tau_c \sim L_V / v_{th}$ con $v_{th}=\sqrt{k_BT/m}$. El applet
muestra esa estimación junto al valor medido, y permite comprobar que $\tau_c$ crece con
el tamaño de la ventana y decrece con $\sqrt{T}$. Nótese que el gas ideal no tiene tiempo
de colisión: la memoria la fija la geometría, no las interacciones.

## Algoritmo de simulación

Movimiento libre con reflexión especular en las paredes; velocidades iniciales gaussianas
(Box–Muller) de varianza $k_BT$ por componente ($m=1$). Paso temporal $dt = 0.1$ (o 1 en
modo rápido). En cada paso se registra el recuento; el histograma, la media, la varianza y
$C(\tau)$ (hasta 300 retardos) se recalculan sobre la serie almacenada. Cambiar la ventana
borra la serie.

## Preguntas

1. Mide la varianza de N en la ventana para dos tamaños de ventana. ¿Cuándo se acerca más a Poisson y cuándo a la binomial? ¿Por qué?
2. Comprueba que la fluctuación relativa σ/⟨N⟩ decrece como 1/√⟨N⟩. ¿Qué tamaño de ventana haría la fluctuación menor del 1 %?
3. Estima el tiempo de correlación de la ocupación y compáralo con el tiempo que tarda un disco en cruzar la ventana a la velocidad térmica.

## Cambios respecto al applet original

| Original | Aquí | Motivo |
|---|---|---|
| Sólo comparación con Poisson, $\lambda$ calculado con el área total incluyendo márgenes | Poisson **y** binomial, $p$ calculado sobre el área accesible a los centros | La binomial es la respuesta exacta; con ventanas grandes Poisson falla visiblemente |
| $\ln n!$ por la fórmula de Stirling (imprecisa para $n$ pequeño) | $\ln\Gamma(n+1)$ (Lanczos) | Exactitud en $n = 0,1,2$ donde Stirling falla |
| Botón "Autocorrelación" sin implementar; escritura a un fichero local que fallaba en el navegador | $C(\tau)$ calculada y dibujada, estimación de $\tau_c$ | Completar la intención del original |
| Ventana por ratón con variables globales del canvas | Eventos de puntero, válidos con ratón y táctil | |
| Histograma en una ventana emergente separada | Pestaña de gráfica seleccionable | Las ventanas emergentes se bloquean hoy |

## Pruebas

`tests/fluctuaciones.test.js`: ventana igual a toda la caja da siempre $N$, varianza
binomial 0 y autocorrelación constante igual a 1 sin NaN; media dentro del error
estadístico de $Np$ y varianza más cercana a la binomial que a la de Poisson con $p\approx
0.4$; retardo de decaimiento a $1/e$ de $C(\tau)$ compatible con $L_V/v_{th}$; temperatura
cinética inicial igual a $k_BT$.

## Evaluación didáctica

**Qué aporta.** Es una demostración limpia de la diferencia entre colectividades y del
origen del $N^{-1/2}$. La ventana arrastrable hace que el estudiante controle $p$ de forma
intuitiva. La autocorrelación introduce la noción de tiempo de correlación con un sistema
donde se puede predecir.

**Mejoras propuestas.** Añadir partículas interaccionantes (discos duros del applet de
Maxwell) para ver que la distribución de ocupación deja de ser binomial a densidad alta
(volumen excluido reduce las fluctuaciones: compresibilidad), conectando con
$\sigma^2/\langle n\rangle = k_BT\,(\partial n/\partial \mu)/n \cdot ...$, la relación
fluctuación-compresibilidad. También mostrar $\sigma^2$ frente a $p$ para varias ventanas en
una misma gráfica.
