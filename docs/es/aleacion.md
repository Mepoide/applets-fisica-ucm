# Electrones en una aleación desordenada

## Qué se observa

La cadena de potenciales δ del experimento anterior, pero con dos especies atómicas, $\lambda_A$ (huésped) y $\lambda_B$ (impureza), colocadas al azar con concentración $c$: una aleación sustitucional binaria. Se dibuja $\langle\ln T\rangle$, el promedio sobre realizaciones del desorden del logaritmo de la transmisión, frente a la energía o frente a la longitud de la cadena. Donde el cristal puro tenía bandas con $T \approx 1$, la aleación tiene $\langle\ln T\rangle$ negativo y proporcional a $-N$: todos los estados están localizados.

## Modelo físico

Con $\lambda_n$ aleatorio el teorema de Bloch deja de valer. En una dimensión cualquier desorden, por débil que sea, produce **localización de Anderson**: las funciones de onda decaen exponencialmente, $|\psi| \sim e^{-|x|/\xi}$, y la transmisión de una cadena de longitud $N$ se comporta como

$$\langle\ln T\rangle \simeq -\frac{N}{\xi(E)},$$

donde $\xi(E)$ es la longitud de localización (mayor en el centro de las antiguas bandas y para desorden débil). Se promedia $\ln T$, que es una variable autopromediante con distribución aproximadamente gaussiana, y no $T$, cuya media está dominada por las realizaciones raras casi transparentes. En tres dimensiones existe una transición metal–aislante; en una, no.

## Algoritmo

Misma matriz de transferencia que el experimento 5 con $\lambda_n$ sorteadas por realización; modo "frente a $E$" (300 energías) y modo "frente a $N$" (40 longitudes a energía fija, con ajuste lineal cuya pendiente da $-1/\xi$). Las bandas del cristal puro se sombrean como referencia.

## Preguntas

1. Con desorden débil, ¿cómo cambia la transmisión al duplicar la longitud? Extrae la longitud de localización.
2. Compara la energía del centro de banda con la del borde: ¿dónde se localizan antes los estados?
3. ¿Existe en 1D una transición metal-aislante al variar el desorden, o todos los estados están localizados? Compruébalo con desorden muy pequeño y cadenas muy largas.

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| $\langle\ln T\rangle(E)$ y $\langle\ln T\rangle(N)$ | Igual, más $\xi$ estimada en vivo, ajuste lineal y bandas del cristal puro | Cuantificar la localización |

## Pruebas

`tests/fes2.test.js`: para $\lambda \in \{1, 3\}$ al 50 % y $E = 4$, $\langle\ln T\rangle$ decrece monótonamente con $N = 50, 100, 200$ con ritmo mayor que 0.005 por sitio.

## Evaluación didáctica

Primer contacto con la localización de Anderson, con el mensaje estadístico de por qué se promedia el logaritmo. Fuente: curso *Experimentos Interactivos* (UCM), experimento 6 de Física del Estado Sólido, F. Domínguez-Adame.
