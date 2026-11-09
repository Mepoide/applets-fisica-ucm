# Colectividad macrocanónica

## Qué se observa

Un gas ideal en una caja; con el ratón se dibuja una región que hace de *sistema*, mientras el resto de la caja actúa de foco de partículas y de energía. Se cuenta el número de partículas dentro de la región en cada instante y su histograma se compara con la distribución de Poisson, que es la predicción de la colectividad macrocanónica para un gas ideal, y con la binomial exacta. Es el mismo applet que la vista C del experimento 2 de *Sistemas fuera del Equilibrio*, con el acento puesto aquí en la colectividad.

## Modelo físico

Un sistema que intercambia energía y partículas con un foco mucho mayor se describe con la colectividad **macrocanónica**: la probabilidad de un estado con $N$ partículas y energía $E$ es proporcional a $z^N e^{-\beta E}$, con $\beta = 1/k_BT$ y la fugacidad $z = e^{\beta\mu}$. Integrando sobre la energía, la probabilidad de tener $N$ partículas es $P(N) \propto z^N Z_N(T,V)/\Xi$. Para un gas ideal $Z_N = (V/\lambda^3)^N/N!$ y

$$P(N) = e^{-\bar N}\,\frac{\bar N^N}{N!},\qquad \bar N = zV/\lambda^3,$$

la distribución de **Poisson**, cuya varianza es igual a su media. La deducción supone $N \ll N_{\rm total}$; cuando la región ocupa una fracción $p$ apreciable de la caja la distribución exacta es la binomial $B(N_{\rm total},p)$, de varianza $\bar N(1-p)$: en el límite $p \to 1$ el número de partículas deja de fluctuar.

## Algoritmo y pruebas

Ver la ficha de *Fluctuaciones de ocupación* (`fluctuaciones`): gas ideal con velocidades maxwellianas, ventana arrastrable, histograma, Poisson, binomial y autocorrelación. Tests en `tests/fluctuaciones.test.js`.

## Cambios respecto al applet original

| Original (`CanonicaApplet`, M. Castro 2002) | Aquí | Motivo |
|---|---|---|
| Histograma frente a Poisson en ventana aparte | Poisson y binomial sobre el histograma, varianzas medidas en el panel | Ver cuándo falla la hipótesis macrocanónica |
| Hay que reiniciar el histograma manualmente al cambiar la región | Se reinicia al soltar el ratón | Evitar mezclar estadísticas |

## Evaluación didáctica

Da una imagen concreta de "sistema más foco" y de por qué la colectividad macrocanónica es una aproximación. Fuente: curso *Experimentos Interactivos* (UCM), experimento 9 de Física Estadística, R. Brito; applet base de Mario Castro (2002).
