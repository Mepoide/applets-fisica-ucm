# Anillo de Kac

## Qué se observa

Un anillo con $N$ casillas, cada una ocupada por una bola azul o roja, y $M$ aristas marcadas. A cada paso todas las bolas avanzan una casilla en el sentido de las agujas del reloj, y la que cruza una arista marcada cambia de color. El anillo exterior conserva la configuración inicial; el interior muestra el estado actual. A la derecha se dibuja $\Delta(t) = N_A - N_R$ junto con la predicción de campo medio. El sistema es determinista y reversible, y sin embargo $\Delta(t)$ decae hacia cero… hasta que en $t = 2N$ la configuración inicial reaparece exactamente.

## Modelo físico

Marc Kac propuso este modelo para discutir la ecuación de Boltzmann y la paradoja de la irreversibilidad. Si $n_A(t)$ y $n_R(t)$ son las bolas azules y rojas que tienen delante una marca, las ecuaciones exactas son

$$N_A(t+1) = N_A(t) - n_A(t) + n_R(t),\qquad N_R(t+1) = N_R(t) - n_R(t) + n_A(t).$$

No se pueden cerrar sin una hipótesis sobre $n_A$ y $n_R$. La hipótesis de **caos molecular** (Stosszahlansatz) supone que la fracción de bolas de cada color que está frente a una marca es la fracción global de marcas,

$$\frac{n_A}{N_A} = \frac{n_R}{N_R} = \frac{M}{N},$$

y entonces

$$\Delta(t) = \Big(1 - \frac{2M}{N}\Big)^{t}\,\Delta(0),$$

que decae monótonamente para $0 < M < N/2$ y oscila decayendo para $M > N/2$. Esta es la predicción "irreversible". La dinámica real es periódica: cada bola da dos vueltas en $2N$ pasos, cruza $2M$ marcas y vuelve a su color. El tiempo de recurrencia de Poincaré es exactamente $T = 2N$.

La discrepancia nace de las correlaciones que la propia dinámica crea entre colores y marcas, que la hipótesis de caos molecular ignora. Para $N$ grande y $t \ll N$ la hipótesis funciona bien; el campo medio describe la relajación inicial, no la recurrencia.

## Algoritmo

Vectores `colors` ($\pm 1$) y `marks` (0/1, la arista $i$ une las casillas $i$ e $i+1$). Un paso: `next[(i+1) % N] = marks[i] ? -colors[i] : colors[i]`. Las marcas se eligen sin repetición barajando los índices. Condiciones iniciales: aleatorio 50/50, aleatorio 70/30, todos azules, alternados. La gráfica guarda $\Delta$ hasta $4N$ pasos y el panel compara $\Delta$ con el campo medio.

## Preguntas

1. Con todas las bolas azules y M = 10 marcas, ¿durante cuántos pasos coincide la predicción de campo medio con la simulación? ¿Por qué deja de hacerlo?
2. Pon M = N/2. ¿Qué predice el campo medio desde t = 1? ¿Qué hace la simulación? ¿Y con M = N?
3. Deja correr hasta t = 2N. ¿Por qué el campo medio no puede predecir la recurrencia? ¿Qué hipótesis del caos molecular se rompe en un sistema finito?

## Cambios respecto al applet original

| Original (`KACApplet`, 2002) | Aquí | Motivo |
|---|---|---|
| Ecuación de campo medio solo para "70/30" y "todos azules" | Siempre dibujada; con 50/50 aleatorio $\Delta(0) \approx 0$ y la curva es casi plana | Mostrar también el caso en que el campo medio no dice nada |
| Sin indicación del tiempo de recurrencia | Línea en $T = 2N$ y contador de pasos hasta la recurrencia | Es el punto central del modelo |
| $N$ y $M$ limitados a `Nmax`, `Mmax` | $N \le 1000$, $M \le N$ | Poder ver que el campo medio mejora con $N$ |

## Pruebas

`tests/kac.test.js`: periodicidad exacta en $2N$ (configuración y $\Delta$); "todos azules" con $M = N/2$ da $\Delta(1) = 0$; para $N = 1000$, $M = 100$ el campo medio está dentro de $3\sqrt N$ de $\Delta$ en los cinco primeros pasos; $M = 0$ y $M = N$ como casos límite.

## Evaluación didáctica

Ilustra en un sistema trivialmente pequeño tres ideas que cuestan en la ecuación de Boltzmann: la hipótesis de caos molecular como cierre, su validez a tiempos cortos, y la recurrencia de Poincaré. Interactividad: elegir $M$ cerca de $N/2$ muestra oscilaciones de signo; "alternados" con $M$ par o impar da dinámicas muy distintas. Fuente del experimento original: curso *Experimentos Interactivos* (UCM), experimento 1 de Sistemas fuera del Equilibrio, R. Brito.
