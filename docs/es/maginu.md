# Reacciones químicas: modelo de Maginu

## Qué se observa

Un autómata celular estocástico de dos especies químicas que reaccionan y difunden. A la izquierda, el mapa de concentración local de una especie (o de la diferencia entre ambas); a la derecha, el plano de fases $(c_1, c_2)$ con el ciclo límite de las ecuaciones macroscópicas y, encima, la trayectoria de la concentración media de la red. El parámetro de escala $s$ fija cuánta difusión hay por cada paso de reacción: con $s$ grande la red oscila al unísono y la media recorre el ciclo; con $s$ pequeño las celdas oscilan desfasadas, el mapa se llena de parches y la media se queda cerca del centro.

## Modelo físico

Las concentraciones $c_i(\mathbf x, t)$ de un sistema de reacción-difusión obedecen $\partial_t c_i = \phi_i(\{c\}) + D_i\nabla^2 c_i$. Si la difusión es rápida frente a la reacción el sistema permanece homogéneo y los estados estacionarios son las soluciones de $\phi_i = 0$; según la forma de $\phi_i$ puede haber varios, oscilaciones periódicas o caos. Si la difusión es lenta, las fluctuaciones locales no se promedian y aparecen anillos, espirales, turbulencia química o, con $D_1 \ne D_2$, patrones de Turing.

El modelo de Maginu es

$$\partial_t c_1 = c_1 - \tfrac13 c_1^3 - c_2 + D\nabla^2 c_1,\qquad \partial_t c_2 = \frac{c_1 - k\,c_2}{c} + D\nabla^2 c_2,$$

con $c > 0$ y $0 < k < 1$ (aquí $k = 0.9$, $c = 2$, $D_1 = D_2$). Es un oscilador de relajación tipo FitzHugh–Nagumo: el sistema homogéneo tiene un único punto fijo inestable rodeado de un ciclo límite estable, que es la curva azul.

El autómata trata cada celda como un pequeño reactor con un número entero de partículas $n_i \le n_{\max}$ de cada especie ($c_i$ es una función lineal de $n_i$). La **difusión** intercambia partículas entre celdas vecinas al azar, conservando el total; la **reacción** cambia $n_i$ en una cantidad aleatoria de media $\phi_i\,\Delta t$ en unidades de partículas (muestreo de Poisson, *τ-leaping*). El ruido es el de un número finito de moléculas por celda: con $n_{\max}$ pequeño las fluctuaciones son grandes y el ciclo medio se difumina.

## Algoritmo

Red periódica de $n\times n$ celdas (20–120). Cada paso: $s$ barridos de difusión (cada celda cede a un vecino aleatorio hasta la mitad de su exceso) y una reacción con $\Delta t = 0.1$. Ciclo límite por Runge–Kutta 4 del sistema homogéneo (descartando $t < 300$); periodo medido por los cruces por cero de $c_1$. El indicador compara la amplitud de $\langle c_1\rangle$ en el último periodo con la del ciclo.

## Cambios respecto al applet original

| Original (`ejerc5`, 2002) | Aquí | Motivo |
|---|---|---|
| Autómata con tablas de transición precalculadas (`trans[][][][]`) | Reacción estocástica por Poisson sobre las ecuaciones de Maginu | Trazabilidad directa entre ecuación y simulación |
| Ciclo límite dibujado como figura fija | Ciclo integrado con los mismos $k$, $c$ y la trayectoria de la media en vivo | Ver la convergencia (o no) al ciclo |
| Escala $s$ 1–20 y selector de especie y tono | Igual, más $n_{\max}$ (nivel de ruido) y red variable | Explorar el papel de las fluctuaciones |

## Pruebas

`tests/maginu.test.js`: el sistema homogéneo converge a un ciclo límite de amplitud estable (< 2 % de deriva) y periodo entre 2 y 40; la difusión conserva exactamente el número de partículas; el muestreador de Poisson tiene la media correcta; con $s = 15$ la media espacial oscila con amplitud > 0.8 y sigue la ODE integrada desde el mismo estado inicial.

## Evaluación didáctica

Es el único experimento del bloque con estructura espacial emergente, y conecta la cinética química con las fluctuaciones (el número de moléculas por celda). Fuente: curso *Experimentos Interactivos* (UCM), experimento 5 de Sistemas fuera del Equilibrio, R. Brito y J. M. R. Parrondo.
