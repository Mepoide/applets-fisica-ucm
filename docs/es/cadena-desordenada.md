# Vibraciones atómicas de una red desordenada

## Qué se observa

Una cadena de $N$ átomos unidos por muelles iguales, con masas $m$ o $M = \alpha m$ repartidas al azar con fracción $C$: un modelo mínimo de sólido amorfo o aleación. La gráfica muestra la **densidad acumulada de modos** por átomo, $N(\omega)/N$, calculada contando nodos, frente a la de la cadena monoatómica. Las masas pesadas bajan las frecuencias y abren intervalos prohibidos (mesetas de la curva); por encima del borde de banda de la cadena pesada aparecen modos localizados en grupos de átomos ligeros.

## Modelo físico

En la aproximación armónica, $m_n\ddot U_n = k(U_{n+1} + U_{n-1} - 2U_n)$; buscando $U_n e^{i\omega t}$,

$$m_n\omega^2 U_n = k\,(2U_n - U_{n-1} - U_{n+1}).$$

Para la cadena monoatómica, $\omega = 2\sqrt{k/m}\,|\sin(qa/2)|$ y $N(\omega)/N = (2/\pi)\arcsin(\omega/2\sqrt{k/m})$. Con masas aleatorias no hay solución analítica, pero el **teorema de los nodos** (Sturm) permite contar los modos sin diagonalizar: integrando la ecuación desde un extremo con $U_0 = 0$, el número de cambios de signo de $U_n$ a lo largo de la cadena es el número de modos normales con frecuencia menor que $\omega$. Con la variable $R_n = U_{n+1}/U_n$,

$$R_n = 2 - \frac{m_n\omega^2}{k} - \frac{1}{R_{n-1}},$$

y basta contar los $R_n$ negativos. La curva es autopromediante: casi no depende de la realización del desorden para $N$ grande.

## Algoritmo

`applets/_chain/chain.js`: recursión de $R_n$ para 241 frecuencias entre 0 y 2.2 (unidades $\sqrt{k/m}$), calculada por tramos para que la curva aparezca progresivamente. $N \le 20000$.

## Preguntas

1. Compara la densidad de modos de la cadena ordenada con la de van Hove analítica. ¿Dónde está la singularidad y por qué?
2. Añade desorden de masas: ¿qué pasa con el borde superior de la banda? ¿Aparecen modos por encima de la frecuencia máxima ordenada?
3. Comprueba con el conteo de nodos que el número total de modos es N independientemente del desorden.

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| Densidad acumulada para $\alpha$ y $C$ dados | Igual, con la cadena monoatómica de referencia, el recuento de gaps y la visualización de la cadena | Comparar y entender las mesetas |

## Pruebas

`tests/fes1.test.js`: la cadena monoatómica reproduce $(2/\pi)\arcsin(\omega/2)$ con error $< 0.02$ y satura en $\omega = 2$; con $\alpha = 3$, $C = 0.5$ la densidad acumulada a $\omega = 1$ supera a la monoatómica en más de 0.1.

## Evaluación didáctica

Introduce el recuento de nodos, una herramienta numérica elegante, y la idea de modos localizados por desorden que se desarrolla en los experimentos 4 y 6. Fuente: curso *Experimentos Interactivos* (UCM), experimento 2 de Física del Estado Sólido, F. Domínguez-Adame.
