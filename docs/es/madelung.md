# Evaluación de la constante de Madelung

## Qué se observa

La energía electrostática de un ion en un cristal iónico como el NaCl es $-\alpha e^2/4\pi\varepsilon_0 R$, donde la **constante de Madelung** $\alpha$ resume la suma sobre todos los demás iones. El experimento suma la serie por cubos crecientes de lado $2kR$ alrededor del ion de referencia, de dos maneras: contando cada ion del cubo entero (suma directa) o con los pesos de Evjen (1/2 en caras, 1/4 en aristas, 1/8 en vértices). La primera oscila sin converger a la vista; la segunda converge en tres o cuatro cubos al valor exacto $\alpha = 1.747565$.

## Modelo físico

$$\alpha = \sum_{l,m,n}{}' \frac{(-1)^{l+m+n+1}}{\sqrt{l^2+m^2+n^2}},$$

con la prima excluyendo el origen. La serie es **condicionalmente convergente**: el resultado depende del orden de suma. Un cubo entero de lado $2k$ contiene una carga neta $\pm e$ (hay un ion más de un signo que del otro), y el potencial de esa carga superficial a distancia $\sim k$ produce un error $\sim 1/k$ que alterna de signo con $k$. El método de Evjen asigna a cada ion de la superficie la fracción que le corresponde al cubo (compartido con 2, 4 u 8 cubos vecinos), de modo que cada cubo es eléctricamente neutro y no tiene momento dipolar; el error decae entonces como una potencia alta de $1/k$.

## Algoritmo

Sumas directas sobre $(2k+1)^3 - 1$ términos para $k = 1,\dots,k_{\max} \le 14$, con y sin pesos de Evjen; la carga del cubo se calcula aparte. La vista del cubo muestra una cara con los iones y la opacidad proporcional a su peso de Evjen.

## Preguntas

1. Suma directa en esferas crecientes: ¿converge la constante de Madelung del NaCl? ¿Por qué oscila?
2. Con el método de Evjen, ¿cuántas capas hacen falta para tres cifras correctas (1.7476)? ¿Por qué converge tanto más deprisa?
3. Calcula la constante para el CsCl y compárala con el valor tabulado 1.7627. ¿Qué cambia en la asignación de cargas fraccionarias?

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| Sumas parciales de ambos métodos | Igual, más la carga neta del cubo y los errores relativos en el panel | Explicar la oscilación |

## Pruebas

`tests/fes1.test.js`: Evjen a $k = 6$ dista menos de $2\cdot10^{-4}$ del valor exacto y a $k = 2$ menos de 0.01; la suma directa a $k = 6$ dista más de 0.03 y alterna el signo del error; la carga de los cubos es $\pm1$.

## Evaluación didáctica

Ejemplo limpio de que "sumar hasta el infinito" exige decir cómo, y de por qué los cristales iónicos son estables. Fuente: curso *Experimentos Interactivos* (UCM), experimento 1 de Física del Estado Sólido, F. Domínguez-Adame.
