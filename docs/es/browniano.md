# Movimiento browniano

## Qué se observa

Un disco grande y pesado (el grano de polen) en un baño de discos duros pequeños y ligeros (las moléculas del fluido). La vista atómica muestra los choques; el "microscopio" muestra solo el grano y su traza, ampliados, como los vio Brown en 1827. La gráfica de desplazamiento cuadrático medio $\langle\Delta r^2\rangle(t)$ permite medir el coeficiente de difusión $D$, y el panel comprueba la equipartición: la energía cinética media del grano tiende a $kT$ aunque pese veinte veces más que una molécula.

## Modelo físico

El grano recibe en cada instante muchos impactos de moléculas desde todas las direcciones. El número de impactos por lado fluctúa, y esas fluctuaciones son la fuerza aleatoria que lo mueve: ese es el argumento de Einstein (1905) y Smoluchowski. Entre choques el movimiento es balístico; a tiempos largos, cuando el grano ha olvidado su velocidad, es difusivo:

$$\langle \Delta r^2 \rangle = 4 D t \quad (\text{en dos dimensiones}),$$

con $D = kT/\zeta$ (relación de Einstein) y $\zeta$ el coeficiente de fricción. Para discos duros la teoría de Enskog da $\zeta = \tfrac83\, n\,\sigma_{12}\sqrt{2\pi\mu kT}$, con $n$ la densidad del baño, $\sigma_{12} = R + r$ y $\mu$ la masa reducida; se dibuja como orden de magnitud. En equilibrio, además, $\tfrac12 M\langle V^2\rangle = kT$ (dos grados de libertad): el grano pesado tiene la misma energía cinética media que una molécula pero velocidad $\sqrt{M/m}$ veces menor, y por eso su movimiento parece lento y errático.

La caja es finita y el grano no puede alejarse más de $\sim L$: a tiempos largos el MSD satura. El ajuste de $D$ se hace en la ventana intermedia, pasado el régimen balístico y mientras $(L/8)^2 < \langle\Delta r^2\rangle < (L/3)^2$ (líneas grises claras).

## Algoritmo

Motor de discos duros por eventos (`applets/_kinetic/disks.js`) con masas y radios por partícula: el disco 0 tiene masa $M$ y radio $R$; el baño, masa 1 y radio 3, velocidades maxwellianas a $kT$. La traza del grano se guarda cada paso; el MSD se promedia sobre orígenes temporales; $D$ por mínimos cuadrados de $\langle\Delta r^2\rangle$ frente a $4t$ en la ventana difusiva. La energía cinética del grano se promedia con una ventana móvil de 2000 pasos.

## Preguntas

1. Mide D a partir de la pendiente de ⟨Δr²⟩ para dos masas M del grano. ¿Cómo depende D de M? ¿Y de la temperatura del baño?
2. Comprueba la equipartición ½M⟨V²⟩ = k_BT para el grano pesado. ¿Cuánto tiempo de promedio hace falta para un 5 % de precisión?
3. A tiempos cortos ⟨Δr²⟩ no es lineal sino cuadrática. Estima el tiempo de cruce y relaciónalo con el tiempo entre colisiones.

## Cambios respecto al applet original

| Original (`BrownianApplet`, M. Fowler, U. Virginia) | Aquí | Motivo |
|---|---|---|
| Applet externo, código no disponible | Implementación propia sobre el motor de la fase 1 | Misma física, verificable |
| Solo visualización | MSD, ajuste de $D$, equipartición y estimación de Enskog | Medir, no solo mirar |
| Parámetros: `nballs`, `massratio`, `averagevelocity` | Moléculas, cociente de masas, cociente de radios y $kT$ | Explorar los dos límites (balístico y difusivo) |

## Pruebas

`tests/browniano.test.js`: con $M/m = 20$, $R/r = 4$ y 40 moléculas la energía cinética media del grano iguala $kT$ dentro del 20 % tras $2\cdot10^4$ pasos; el MSD es creciente y su ajuste en la ventana difusiva da $D > 0$ con $R^2 > 0.9$; la estimación de Enskog es finita y positiva. Motor: `tests/disks.test.js` (colisiones de masas distintas conservan momento y energía).

## Evaluación didáctica

Hace visible la conexión entre fluctuaciones microscópicas y difusión macroscópica, y da una medida cuantitativa ($D$, equipartición) accesible al estudiante. Fuente: curso *Experimentos Interactivos* (UCM), experimento 6 de Sistemas fuera del Equilibrio, R. Brito y J. M. R. Parrondo.
