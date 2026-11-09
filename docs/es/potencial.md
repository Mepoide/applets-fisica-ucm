# Difusión en un potencial externo

## Qué se observa

Muchas partículas brownianas independientes se mueven en una red unidimensional bajo un potencial $V(x)$ que puede ser una parábola o un diente de sierra simétrico o asimétrico. A la izquierda se ven las partículas sobre el potencial y una barra que mide $kT$ en la misma escala de energía. A la derecha, el histograma de posiciones acumulado en el tiempo frente al estado de Boltzmann $p_i \propto e^{-V_i/kT}$. Al bajar la temperatura las partículas se concentran en el mínimo; al subirla mucho, dejan de sentir el potencial.

## Modelo físico

Un caminante aleatorio que salta a izquierda o derecha con probabilidad $1/2$ es el modelo mínimo del movimiento browniano libre. En un potencial, las probabilidades de salto de $i$ a $i \pm 1$ se modifican con la regla de **Metrópolis**:

$$P(i \to i\pm1) = \tfrac12 \min\!\big(1,\, e^{-[V(i\pm1)-V(i)]/kT}\big).$$

Bajar en energía siempre se acepta; subir, con la probabilidad de Boltzmann del salto. La regla satisface balance detallado con el estado

$$p_i^{\rm st} = \frac{e^{-V_i/kT}}{Z},\qquad Z = \sum_j e^{-V_j/kT},$$

que es por tanto la distribución estacionaria, y la dinámica describe la relajación al equilibrio térmico. Con $N$ partículas independientes, el número medio en el sitio $i$ es $N p_i$. Las fluctuaciones térmicas permiten a una partícula ganar energías del orden de $kT$, y muy pocas superan ese valor: la barra de $kT$ junto al potencial lo hace visible.

## Algoritmo

`applets/_walkers/metropolis.js`: `L = 81` sitios en $x \in [-1, 1]$, $V_{\max} = 4$ en los bordes; cada paso cada partícula propone $\pm1$ al azar y acepta según Metrópolis; los extremos son reflectantes (el salto fuera se rechaza). El histograma acumula la ocupación instantánea en cada paso y se normaliza. $\chi^2/{\rm dof}$ se calcula sobre los sitios con cuenta esperada $\ge 5$ y, como las muestras consecutivas están correlacionadas, solo es orientativo (verde si $< 3$).

## Cambios respecto al applet original

| Original (`ejerc1`, 2002) | Aquí | Motivo |
|---|---|---|
| Histograma sobre 200 pasos | Acumulado sin límite, con botón para borrarlo | Estadística arbitraria y control del transitorio |
| Eje vertical ajustado al máximo de Boltzmann | Igual, más $\chi^2/{\rm dof}$ y $Z$ en el panel | Comparación cuantitativa |
| $kT$ por barra de desplazamiento lineal | Deslizador logarítmico ($10^{-2}$ a $16$) | Explorar los límites $kT \to 0$ y $kT \gg V$ |

## Pruebas

`tests/metropolis.test.js`: Boltzmann normalizado y delta en el mínimo para $kT = 0$; con $kT = 0$ todas las partículas acaban en el mínimo de la parábola; para los tres potenciales con $kT = 1$ el histograma acumulado no se distingue del estado de Boltzmann ($\chi^2$, $p > 0.01$ con muestras diezmadas); con $kT = 10^6$ la ocupación es uniforme.

## Evaluación didáctica

Es la base de los experimentos 8 (Arrhenius) y 9 (resonancia estocástica), que usan el mismo módulo. La interactividad principal es la temperatura en tiempo real: ver el histograma reconstruirse al moverla enseña qué significa "estado de equilibrio". Fuente: curso *Experimentos Interactivos* (UCM), experimento 7 de Sistemas fuera del Equilibrio, R. Brito y J. M. R. Parrondo.
