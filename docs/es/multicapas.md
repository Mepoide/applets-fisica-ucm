# Reflexión de rayos X en multicapas metálicas

## Qué se observa

La reflectividad en incidencia normal de una multicapa de $N$ pares de capas alternas (índices $n = 1 - \delta + i\beta$, espesores $d_1$, $d_2$) frente a la longitud de onda de los rayos X. Aparece un pico de Bragg en $\lambda_B = 2(n_1d_1 + n_2d_2)$ que crece y se estrecha al añadir capas, acompañado de franjas de interferencia; la absorción limita la reflectividad máxima.

## Modelo físico

Para rayos X blandos la permitividad es $\varepsilon = 1 - 2\delta + 2i\beta$ con $\delta, \beta \ll 1$ (el índice es ligeramente menor que 1). La reflectividad de una pila de láminas se calcula exactamente con el método recursivo de **Rouard**: con el coeficiente de Fresnel en cada intercara $r_k = (n_{k-1} - n_k)/(n_{k-1} + n_k)$ y la fase óptica $\mu_k = 2\pi n_k d_k/\lambda$,

$$f_{k-1} = \frac{r_{k-1} + f_k\,e^{2i\mu_k}}{1 + r_{k-1}f_k\,e^{2i\mu_k}},\qquad R = |f_1|^2,$$

empezando por la última intercara. Cada intercara refleja muy poco ($|r| \sim \delta/2 \sim 10^{-2}$), pero las $2N$ reflexiones interfieren constructivamente cuando el camino óptico de ida y vuelta por un periodo es un número entero de longitudes de onda: condición de Bragg $m\lambda = 2\bar n\Lambda$. El pico tiene anchura $\sim \lambda_B/N$ y satura cuando $N\,|r| \sim 1$ o cuando la absorción ($\beta$) extingue el haz antes de llegar al fondo.

## Algoritmo

Aritmética compleja explícita en `applets/multicapas/model.js`; 500 longitudes de onda alrededor de $\lambda_B$; el número de pares aumenta progresivamente al iniciar. Controles: $N$, $d_1$, $d_2$, $\delta_1$, $\delta_2$, $\beta$.

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| Reflectancia para espesor y constantes dieléctricas dados | Igual, con $\lambda_B$ marcada, espesores independientes, absorción y crecimiento del pico con $N$ | Ver la interferencia constructiva formarse |

## Pruebas

`tests/fes3.test.js`: una pila de 40 pares con $\delta = 0.1/0$ y $d = 10$ Å tiene su máximo en $\lambda_B$ al 3 % con $R > 0.9$ y $0 \le R \le 1$ en todo el espectro; una lámina muy gruesa sobre un sustrato del mismo índice reproduce el coeficiente de Fresnel $((1-n)/(1+n))^2$.

## Evaluación didáctica

Óptica de rayos X y espejos multicapa (litografía EUV, telescopios) con un algoritmo de cinco líneas. Fuente: curso *Experimentos Interactivos* (UCM), experimento 12 de Física del Estado Sólido, F. Domínguez-Adame.
