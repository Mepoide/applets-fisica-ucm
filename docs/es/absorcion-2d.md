# Absorción óptica en sistemas bidimensionales

## Qué se observa

El espectro de absorción de un pozo cuántico a baja temperatura: la línea excitónica 1s, las líneas excitadas y el continuo realzado por el factor de Sommerfeld, todo ensanchado por una anchura γ. Se ajusta γ a un espectro "medido" para determinar la anchura de línea.

## Modelo físico

Para excitones fuertemente confinados (bidimensionales), con $\varepsilon = (\hbar\omega - E_g)/{\rm Ry}^*$,

$$\alpha(\hbar\omega) \sim \sum_{n=1}^\infty\frac{4}{(n - \frac12)^3}\,\frac{\gamma}{[\varepsilon + (n - \frac12)^{-2}]^2 + \gamma^2} + \int_0^\infty\frac{S_{2D}(\varepsilon')\,\gamma}{(\varepsilon' - \varepsilon)^2 + \gamma^2}\,d\varepsilon',$$

con energías de ligadura $E_n = -{\rm Ry}^*/(n - \frac12)^2$ (4 Ry* para el 1s, cuatro veces la 3D) y factor de Sommerfeld $S_{2D} = 2/(1 + e^{-2\pi/\sqrt\varepsilon})$, que vale 2 en el umbral y tiende a 1 lejos de él. La anchura $\gamma = \Gamma_0 + \Gamma_{\rm fon}/(e^{\hbar\omega_{LO}/k_BT} - 1)$ suma el ensanchamiento inhomogéneo (desorden) y el de fonones LO (34 meV), despreciable a baja temperatura. Para In₀.₅₃Ga₀.₄₇As, Ry* ≈ 2.5 meV y $E_g$ ≈ 0.81 eV a 12 K.

## Algoritmo

Lorentzianas de área π para ambos términos; la integral del continuo se hace con el cambio $\varepsilon' = t^2$ (1200 puntos hasta 60 Ry*). El espectro "medido" se genera con el propio modelo con parámetros ocultos (γ = 0.42 Ry*) más ruido reproducible; no son datos experimentales, que no se conservan del applet original. Inicia para barrer Γ₀ y trazar el error del ajuste.

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| Ajuste de γ a los datos de InGaAs-InAlAs a 12 K | Ajuste a un espectro sintético, con las contribuciones separadas, la dependencia térmica y la curva de error | Los datos originales no están disponibles |

## Pruebas

`tests/dc.test.js`: S₂D → 2 en el umbral y → 1 lejos; el máximo del espectro está en ε = −4; el error del ajuste al espectro sintético sin ruido es mínimo (< 10⁻⁶) exactamente en el γ oculto.

## Evaluación didáctica

Espectroscopía de pozos cuánticos: enseña a leer un espectro de absorción (excitones, continuo, anchura) y la lógica del ajuste de parámetros. Fuente: curso *Experimentos Interactivos* (UCM), experimento 10 de Dispositivos Cuánticos, F. Domínguez-Adame.
