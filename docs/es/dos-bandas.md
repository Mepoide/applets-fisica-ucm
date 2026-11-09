# Pozos cuánticos en un modelo de dos bandas

## Qué se observa

Los niveles de un pozo cuántico calculados con el modelo de una banda (Ben Daniel–Duke) y con el modelo de dos bandas (Kane), en el que la masa efectiva crece con la energía. Se comparan GaAs-AlAs (gap ancho) e InAs-GaSb (gap estrecho) y se mide el error del modelo parabólico.

## Modelo físico

Acoplando las bandas de conducción y valencia con un parámetro de velocidad $v$, la función envolvente de conducción obedece una ecuación de tipo Ben Daniel–Duke con masa $m(z, E) = [E - E_v(z)]/2v^2$. Midiendo $E$ desde el fondo del pozo y exigiendo el límite parabólico correcto en cada material,

$$m_A(E) = m_A\left(1 + \frac{E}{E_{gA}}\right),\qquad m_B(E) = m_B\left(1 + \frac{E}{E_{gB}}\right),$$

que se sustituyen en las ecuaciones trascendentes del Ejercicio 1. La no parabolicidad baja todos los niveles y el error del modelo de una banda crece con $E/E_g$. Parámetros: GaAs ($0.067m$, 1.52 eV), AlAs ($0.150m$, 3.02 eV), $V_c = 1.12$ eV; InAs ($0.023m$, 0.36 eV), GaSb ($0.041m$, 0.67 eV), $V_c = 0.82$ eV.

Nota: la hoja original escribe $m_B(E) = m_A(1 + E/E_{gB})$, lo que no reproduce la masa parabólica de la barrera; aquí se usa $m_B$ como prefactor.

## Algoritmo

Las mismas ecuaciones de fase del Ejercicio 1 con masas evaluadas en $E$, resueltas por bisección en $E$. Inicia para barrer el espesor y trazar $E(a)$ en ambos modelos.

## Preguntas

1. Para InAs-GaSb con a = 60 Å, ¿cuánto baja el nivel fundamental al incluir la no parabolicidad? ¿Y para GaAs-AlAs?
2. ¿En qué espesor el error del modelo de una banda supera el 10 % en cada sistema? Relaciónalo con E/E_g.
3. ¿Por qué los niveles altos se corrigen más que el fundamental?

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| Niveles de uno y dos bandas y error | Igual, más la curva E(a) completa y la masa m(E) dibujada | Ver dónde importa la no parabolicidad |

## Pruebas

`tests/dc.test.js`: todo nivel de dos bandas está por debajo del de una banda y el error relativo del fundamental es mayor en InAs-GaSb que en GaAs-AlAs.

## Evaluación didáctica

Muestra los límites de la aproximación de masa efectiva parabólica con un cambio mínimo en el cálculo. Fuente: curso *Experimentos Interactivos* (UCM), experimento 4 de Dispositivos Cuánticos, F. Domínguez-Adame.
