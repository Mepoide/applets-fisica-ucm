# Conductividad térmica

## Qué se observa

Un gas de discos duros en un canal cuya pared izquierda es un foco térmico a $T_1$ y la derecha un foco a $T_2$. Cada disco que toca un foco sale reemitido con una velocidad maxwelliana a la temperatura de ese foco; arriba y abajo las paredes son especulares. Se acumula la energía que entra por el foco caliente y la que sale por el frío, y de ahí se obtiene la corriente de calor $Q$ y la conductividad $\kappa$. A la derecha, el perfil de temperatura $T(x)$ (o de densidad) promediado en el tiempo, frente a la recta de Fourier entre $T_1$ y $T_2$. El color de cada disco codifica su energía cinética.

## Modelo físico

La ley de Fourier define $\kappa$ por $Q = -\kappa\,\partial T/\partial x$, con $Q$ el flujo de calor por unidad de longitud transversal (en 2D). Si $\kappa$ no depende de $T$ el perfil estacionario es lineal y

$$\kappa = \frac{Q/L_y}{(T_1 - T_2)/L_x}.$$

Un cálculo de campo medio para un gas diluido da $\kappa \simeq \tfrac{1}{3\sqrt2}\,c\,\bar v/\sigma$, con $c$ el calor específico por partícula, $\bar v$ la velocidad media y $\sigma$ la sección eficaz; como $\bar v \propto \sqrt T$, $\kappa \propto \sqrt T$. El coeficiente numérico es solo aproximado (supone todas las partículas con la misma velocidad), pero la dependencia con $T$ es una predicción comprobable: el panel muestra $\kappa/\sqrt{\bar T}$, que debe ser el mismo al cambiar las temperaturas.

Un segundo efecto, visible con $\Delta T$ grande, es el gradiente de densidad: en el lado frío las partículas son lentas y se acumulan, en el caliente son rápidas y escasas, de forma que la presión $p = \rho k T$ es uniforme. El indicador "variación de $\rho T$" lo comprueba.

**Paredes térmicas.** Para que el foco esté realmente a $T_i$ la velocidad reemitida no se muestrea de la maxwelliana sino de la distribución de flujo: la componente normal sigue una distribución de Rayleigh, $f(v_n) \propto v_n e^{-m v_n^2/2kT}$, y la tangencial una gaussiana. Muestrear la maxwelliana simple haría que la pared enfriara el gas.

## Algoritmo

Motor de discos duros por eventos (`applets/_kinetic/disks.js`) con `walls.left = {thermal: T1}` y `walls.right = {thermal: T2}`. En cada contacto con un foco se acumula $\tfrac12 m(v'^2 - v^2)$ en `heat[lado]`. El perfil por franjas acumula en cada paso la energía cinética y el número de partículas de cada franja; $T(x)$ es la energía media por partícula (dos grados de libertad, $k_B = 1$). "Reiniciar estadística" pone a cero los contadores sin tocar las posiciones, para medir solo en el estado estacionario.

## Cambios respecto al applet original

| Original (`ejerc4`, 2002) | Aquí | Motivo |
|---|---|---|
| Energía intercambiada y "conductividad" sin normalizar por $L_y$ ni por el tiempo transcurrido desde el reinicio | $\kappa = (Q/L_y)/(\Delta T/L_x)$ con $Q$ por unidad de tiempo | Unidades correctas; permite comparar valores |
| Histograma de energía en ventana aparte | Perfil $T(x)$ promediado frente a la recta de Fourier, y perfil $\rho(x)$ con $\rho T$ | Comparación directa con la ley de Fourier y con la presión uniforme |
| Dinámica con paso fijo | Motor por eventos | Corrección de la fase 1 |
| Sin indicación del estado estacionario | Indicador $Q_{\rm in}/Q_{\rm out}$ | Evitar leer $\kappa$ durante el transitorio |

## Pruebas

`tests/conductividad.test.js`: con $T_1 = T_2$ la corriente neta es menos del 20 % de la de un gas con $\Delta T = 1.5$; con $T_1 = 2$, $T_2 = 0.5$ la energía entra por la izquierda y sale por la derecha con corrientes del mismo orden, el perfil $T(x)$ decrece y $\rho T$ varía menos del 45 % entre franjas; $\kappa$ es finita y positiva. Paredes térmicas y conservación: `tests/disks.test.js`.

## Evaluación didáctica

Introduce un coeficiente de transporte medido "como en el laboratorio", con sus problemas: transitorio, ruido estadístico, estado estacionario. Las dos comprobaciones (κ ∝ √T y presión uniforme) son experimentos que el estudiante puede diseñar cambiando $T_1$, $T_2$ y $N$. Fuente: curso *Experimentos Interactivos* (UCM), experimento 3 de Sistemas fuera del Equilibrio, R. Brito.
