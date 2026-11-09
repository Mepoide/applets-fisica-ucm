# Vibraciones atómicas de un cuasicristal

## Qué se observa

La misma cadena armónica del experimento anterior, pero con las dos masas ordenadas según la **secuencia de Fibonacci** ABAABABA…, que no es periódica ni aleatoria: es el modelo unidimensional más sencillo de un cuasicristal. La densidad acumulada de modos muestra una jerarquía de mesetas (gaps) que se subdivide al aumentar la generación: el espectro es un conjunto de Cantor.

## Modelo físico

La secuencia se genera con la regla de sustitución A → B, B → AB (o equivalentemente $m_n = M$ cuando $\lfloor (n+2)/\tau\rfloor - \lfloor (n+1)/\tau\rfloor = 0$, con $\tau = (1+\sqrt5)/2$); tras $n$ pasos tiene $F_n$ elementos, con $F_n = F_{n-1} + F_{n-2}$, y la fracción de masas pesadas tiende a $1/\tau^2 \approx 0.382$. La ecuación de movimiento es la del experimento 2 y se resuelve igual por recuento de nodos. A diferencia del caso aleatorio, aquí los autoestados son **críticos** (ni extendidos ni exponencialmente localizados) y el espectro es singular continuo: en cada generación aparecen nuevos gaps dentro de las bandas de la generación anterior, con una estructura autosemejante gobernada por $\tau$.

## Algoritmo

`fibonacciMasses(F_n, α)` y `integratedDOS` de `applets/_chain/chain.js`; generaciones $8 \le n \le 17$ ($F_{17} = 2584$ átomos).

## Preguntas

1. Compara la densidad de modos de la cadena de Fibonacci con la de la aleación aleatoria de la misma composición. ¿Qué estructura jerárquica de gaps aparece solo en la cuasiperiódica?
2. Cambia la razón de masas: ¿cómo se abren y cierran los gaps? ¿Qué pasa cuando las masas son iguales?
3. Aumenta la longitud de la cadena: ¿los gaps se mantienen en la misma frecuencia? ¿Qué indica eso sobre el espectro del cuasicristal infinito?

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| Densidad acumulada para $\alpha$ dado | Selector de generación y recuento de gaps | Ver la autosemejanza al crecer $n$ |

## Pruebas

`tests/fes1.test.js`: la fracción de masas pesadas de la cadena de Fibonacci es $0.382 \pm 0.01$ y $F_{10} = 89$; recuento de nodos validado en la cadena monoatómica.

## Evaluación didáctica

Muestra que entre orden y desorden hay un tercer tipo de estructura con su propia física. Fuente: curso *Experimentos Interactivos* (UCM), experimento 3 de Física del Estado Sólido, F. Domínguez-Adame; E. Maciá y F. Domínguez-Adame, *Electrons, Phonons and Excitons in Low-dimensional Aperiodic Systems* (2000).
