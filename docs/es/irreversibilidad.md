# Irreversibilidad y fluctuaciones en equilibrio

## Qué se observa

Tres vistas del mismo fenómeno. **A**: $N$ discos duros empiezan en la mitad izquierda de una caja; al iniciar se retira el tabique y el gas se expande. Se dibuja $\Delta(t) = n_{\rm izq} - n_{\rm dcha}$ con las bandas $\pm\sigma$ y $\pm 3\sigma$ del equilibrio. **B**: el "modelo aleatorio" de Ehrenfest, sin dinámica: cada paso se elige una partícula al azar y se cambia de lado. **C**: las fluctuaciones del número de partículas dentro de una ventana arbitraria de un gas ideal (Poisson, binomial y autocorrelación). Con pocas partículas la expansión se invierte sola de vez en cuando; con cien, nunca.

## Modelo físico

Si las partículas son independientes y las dos mitades tienen el mismo volumen, la probabilidad de encontrar $n$ a la izquierda es binomial,

$$P(n) = \binom{N}{n} 2^{-N},$$

con máximo en $n = N/2$ y mínimo en $n = 0$ y $n = N$. El cociente entre ambos extremos, con Stirling, es $P(N/2)/P(0) \approx 2^N\sqrt{2/(\pi N)}$: la probabilidad de ver todo el gas a un lado decae exponencialmente con $N$. Para $N = 6$ es $2^{-5} \approx 3\%$, para $N = 20$ es $2 \cdot 10^{-6}$ y para $N = 100$, $10^{-30}$. En la variable $\Delta = 2n - N$ la binomial es, para $N$ grande, una gaussiana de dispersión $\sigma_\Delta = \sqrt N$; en la desviación relativa $x = \Delta/N$, $\sigma_x = 1/\sqrt N$: las fluctuaciones relativas se hacen invisibles a escala macroscópica.

La irreversibilidad no está en la dinámica (la de los discos duros es reversible) sino en el número de grados de libertad: el estado inicial es uno entre $2^N$ igualmente probables en equilibrio. El modelo B lo demuestra reproduciendo exactamente las mismas estadísticas sin mecánica alguna: es la cadena de Markov de Ehrenfest, cuyo estado estacionario es la binomial anterior.

## Algoritmo

A: motor de discos duros por eventos (`applets/_kinetic/disks.js`) con tabique en $x = L/2$ que se abre en el primer paso; velocidades iniciales maxwellianas a la temperatura elegida. B: `left -= 1` con probabilidad `left/N`, si no `left += 1`. La serie $\Delta(t)$ se guarda (hasta 20 000 valores) y el histograma descarta el transitorio inicial (100 pasos en A, $5N$ en B). C: el applet `fluctuaciones` de la fase 1, incrustado.

## Cambios respecto al applet original

| Original (`HardDisksApplet`, `GasApplet`, `IrreversibilidadApplet`, 2002) | Aquí | Motivo |
|---|---|---|
| Bandas en $\pm 1/\sqrt N$ sobre la desviación relativa | Bandas $\pm\sqrt N$ y $\pm 3\sqrt N$ sobre $\Delta$ | Misma física, en la variable que se dibuja |
| Histograma en ventana aparte | Histograma de $\Delta$ frente a la binomial exacta en la misma gráfica, con $\chi^2$ implícito en el indicador $\sigma$ | Comparación directa |
| Dinámica de discos con paso fijo | Motor por eventos, sin solapamientos ni pérdida de energía | Corrección de la fase 1 |
| Tres applets separados | Tres vistas en un experimento, con la misma ecuación viva | Ver que la estadística no depende del modelo |

## Pruebas

`tests/irreversibilidad.test.js`: Ehrenfest con $N = 50$ y $10^5$ pasos tiene media $\approx 0$ y varianza $\approx N$, y su histograma (diezmado) no se distingue de la binomial ($\chi^2$, $p > 0.01$); el gas empieza con $\Delta = N$ y tras abrir el tabique pasa más de un sexto a la derecha; `binomialDiff` está normalizada, es simétrica, tiene $\sigma = \sqrt N$ y $P(|\Delta| = N) = 2^{1-N}$. Motor de discos: `tests/disks.test.js`.

## Evaluación didáctica

Permite "ver" el argumento de Boltzmann: cambiar $N$ de 6 a 100 y observar cómo desaparecen las recurrencias. La vista B aísla el argumento combinatorio de la mecánica. Interactividad alta: $N$, temperatura, tipo de gráfica, y la ventana libre de la vista C. Fuente: curso *Experimentos Interactivos* (UCM), experimento 2 de Sistemas fuera del Equilibrio, R. Brito.
