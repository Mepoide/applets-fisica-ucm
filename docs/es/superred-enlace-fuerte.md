# Aproximación de enlace fuerte a las superredes

## Qué se observa

Los autoestados de una superred descrita por sus amplitudes $C_n$ en cada pozo: ondas extendidas en la superred periódica, estados localizados cuando hay desorden en los niveles de los pozos y escalera de Wannier–Stark cuando se aplica un campo eléctrico.

## Modelo físico

Tomando como "orbitales" las funciones envolventes de los pozos aislados y despreciando su solapamiento, la ecuación de Ben Daniel–Duke se reduce a la recurrencia

$$E_nC_n - TC_{n+1} - TC_{n-1} = EC_n,$$

con $T$ la integral de transferencia (unidad de energía). Para $E_n = 0$ la solución de Bloch da la minibanda $E = -2T\cos k$ (en una cadena abierta de $N$ pozos, $k = j\pi/(N+1)$). Con $E_n = W(r_n - \tfrac12)$ aleatorio, los estados se localizan (Anderson) y la razón de participación $P = 1/\sum|C_n|^4$ cae por debajo de $N$. Con $E_n = -Fn$ el espectro es la escalera de Wannier–Stark $E_j = Fj$ y cada estado ocupa unos $4T/F$ pozos.

## Algoritmo

Matriz tridiagonal $N \times N$ (diagonal $E_n$, codiagonal $-1$): autovalores por bisección de Sturm, autovector del estado elegido por iteración inversa. Inicia para recorrer los autoestados en orden de energía.

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| C_n del autoestado elegido con desorden y campo | Igual, más el espectro completo frente a la banda −2cos k, la razón de participación y la longitud de Stark | Cuantificar la localización |

## Pruebas

`tests/dc.test.js`: la cadena ordenada reproduce −2cos[jπ/(N+1)] (10⁻⁸); el desorden W = 4 reduce la participación del estado central por debajo de 0.4N; con F = 0.5 los niveles centrales están espaciados exactamente F y el estado ocupa menos de 1.5·4T/F + 2 pozos.

## Evaluación didáctica

Puente entre la Física del Estado Sólido (enlace fuerte, Anderson, Bloch) y los dispositivos; el mismo hamiltoniano del experimento 11 de Estado Sólido en versión estacionaria. Fuente: curso *Experimentos Interactivos* (UCM), experimento 8 de Dispositivos Cuánticos, F. Domínguez-Adame.
