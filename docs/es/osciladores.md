# Ergodicidad y entropía en un conjunto de osciladores

## Qué se observa

$N$ osciladores independientes, cada uno un punto en la circunferencia con fase $\theta_i(t) = \theta_i(0) + \omega_i t$. La circunferencia se divide en $M$ sectores y la fracción de osciladores en cada sector define el macroestado; su entropía $S = -\sum_k f_k\ln f_k$ se dibuja frente al tiempo. Con frecuencias aleatorias y fases iguales la entropía sube hasta su máximo y se queda; con frecuencias equiespaciadas sube igual pero vuelve exactamente a cero en el tiempo de recurrencia.

## Modelo físico

El espacio de fases de los $N$ osciladores es el toro $N$-dimensional de las fases. Si los cocientes $\omega_i/\omega_j$ son irracionales (frecuencias **inconmensurables**) la trayectoria es densa en el toro: el sistema es ergódico y la distribución microcanónica es la uniforme sobre el toro. El macroestado $\{f_k\}$ (fracción en cada sector) tiene entropía

$$S = -\sum_{k=1}^{M} f_k \ln f_k,\qquad S_{\max} = \ln M \ \text{ para } f_k = 1/M,$$

y la Física Estadística predice que un sistema ergódico alcanza ese máximo (con la corrección de $N$ finito, $S_{\rm eq} \simeq \ln M - (M-1)/2N$, debida a las fluctuaciones de $N$ bolas en $M$ cajas). Si las frecuencias son **conmensurables**, por ejemplo $\omega_i = \omega_0 i/N$, el sistema es periódico con periodo $T = 2\pi N/\omega_0$: la entropía crece, pero vuelve a su valor inicial; no es ergódico. Partiendo de fases aleatorias (ya en el máximo) la entropía no baja apreciablemente sea cual sea el caso: la asimetría temporal que vemos nace de haber empezado en un estado muy ordenado, que era el argumento de Boltzmann.

## Algoritmo

Fases avanzadas exactamente, $\theta_i = \theta_i(0) + \omega_i t \bmod 2\pi$, con $\Delta t = 0.05$. Frecuencias: aleatorias uniformes en $[0.5\omega_0, 1.5\omega_0]$, casi iguales ($\omega_0(1 \pm 0.01)$) o equiespaciadas $\omega_0 i/N$. Las barras radiales muestran la ocupación de cada sector.

## Preguntas

1. Compara la media temporal de la energía de un oscilador con la media sobre el conjunto. ¿Para qué número de osciladores y qué tiempo coinciden al 5 %?
2. Comprueba que la distribución de energías de los osciladores tiende a la exponencial de Boltzmann. ¿Qué temperatura le corresponde? Relaciónala con la energía total.
3. Calcula la entropía a partir del histograma y observa cómo crece hasta saturar. ¿Qué limita su valor máximo en el sistema finito?

## Cambios respecto al applet original

| Original (`OsciladoresApplet`, 2002; idea de J. M. R. Parrondo) | Aquí | Motivo |
|---|---|---|
| Botón "histograma del logaritmo de las frecuencias" (fórmula de Einstein) | Sustituido por la recurrencia $T = 2\pi N/\omega_0$ marcada y el valor de equilibrio con $N$ finito | La recurrencia es el punto didáctico; la corrección $(M-1)/2N$ explica por qué $S$ no llega a $\ln M$ |
| Entropía normalizada a 1 | Igual, con $S_{\rm eq}/\ln M$ como referencia | Comparación cuantitativa |

## Pruebas

`tests/fises1.test.js`: con 400 osciladores de frecuencias aleatorias y 12 sectores la entropía media a tiempos largos coincide con $\ln M - (M-1)/2N$ en 0.03; con frecuencias equiespaciadas la entropía sube por encima de 1 y vuelve por debajo de 0.05 en $T = 2\pi N/\omega_0$.

## Evaluación didáctica

Hace tangible la hipótesis ergódica y su fallo, y el origen de la irreversibilidad en la condición inicial. Fuente: curso *Experimentos Interactivos* (UCM), experimento 4 de Física Estadística, R. Brito y J. M. R. Parrondo.
