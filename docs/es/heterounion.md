# Estados electrónicos en una heterounión dopada

## Qué se observa

El pozo casi triangular que se forma en una heterounión con dopado selectivo y el gas de electrones bidimensional que aloja. Se resuelve el problema universal de barrera infinita (Si-SiO₂) de forma exacta y variacional, y la heterounión GaAs-Al_xGa_{1−x}As con barrera finita.

## Modelo físico

Los electrones transferidos desde los donadores de la barrera crean, por la ley de Gauss, un campo $K = eF = e^2n_{2D}/\varepsilon_0\varepsilon_r$ ($K = 1.37\,n_{2D}$ meV/nm para GaAs con $n_{2D}$ en $10^{11}$ cm⁻²). Con barrera infinita y $u = \alpha z$, $\alpha = (2m^*K/\hbar^2)^{1/3}$, el problema es universal:

$$-\chi'' + u\chi = \varepsilon\chi,\qquad \chi(0) = 0,$$

con solución exacta de Airy, $\varepsilon_1 = 2.3381$. La función de prueba gaussiana $\chi = N u\,e^{-b^2u^2/2}$ da $E(b) = \tfrac32 b^2 + 2/\sqrt\pi\,b$, mínima en $b = (2/3\sqrt\pi)^{1/3} = 0.722$ con $\varepsilon = 2.3448$, un 0.3 % por encima del valor exacto como exige el principio variacional. En GaAs-AlGaAs la barrera $V_0 = 0.773x$ es finita y comparable a $E_1 \sim 2.34(\hbar^2K^2/2m^*)^{1/3}$: la función penetra en la barrera y el nivel baja.

## Algoritmo

Diferencias finitas en ambos casos (`applets/_dc/schrod.js`): el universal en $[0, 12]$ con pared en el origen; el de GaAs con masas $m_A$, $m_B$ en una malla de 1500 puntos de $-15$ nm a $60$ nm. Inicia para barrer $n_{2D}$.

## Preguntas

1. Mueve el parámetro variacional b y comprueba que E(b) nunca baja de 2.3381. ¿Por qué el mínimo variacional está siempre por encima del exacto?
2. Para n₂D = 5 × 10¹¹ cm⁻² y x = 0.3, ¿cuánto baja el nivel por la barrera finita? ¿Qué fracción de la función de onda está en el AlGaAs?
3. Dobla n₂D: ¿cómo escala la energía del nivel? Compruébalo con la ley (ħ²K²/2m)^{1/3}.

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| Exacta vs variacional (Si-SiO₂) y exacta con barrera finita (GaAs) | Igual, más el parámetro variacional b ajustable con su curva E(b) y la penetración en la barrera | Ver el principio variacional en acción |

## Pruebas

`tests/dc.test.js`: el problema universal da ε₁ = 2.338 (error < 2·10⁻³); E(b) en el mínimo vale 2.3448; en GaAs el nivel con barrera finita está entre la mitad y la totalidad del valor de barrera infinita y sube al aumentar x.

## Evaluación didáctica

El origen del gas de electrones bidimensional de alta movilidad (HEMT, efecto Hall cuántico), con un cálculo variacional de dos líneas. Fuente: curso *Experimentos Interactivos* (UCM), experimento 6 de Dispositivos Cuánticos, F. Domínguez-Adame.
