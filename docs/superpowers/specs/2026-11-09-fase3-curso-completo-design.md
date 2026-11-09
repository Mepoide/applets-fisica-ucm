# Fase 3: el curso completo *Experimentos Interactivos en Sistemas Físicos Complejos*

Fecha: 2026-11-09. Decisión de Mario Encinar: "la siguiente fase es la web completa con esa imagen
de entrada que tienen ellos pero siguiendo nuestro diseño". Ejecución autónoma.

## 1. Objetivo

Reconstruir las cuatro secciones del curso original (42 experimentos) en el mismo shell de la
fase 2, con una portada propia (imagen de entrada con las cinco entradas del original:
Presentación, Experimentos, Bibliografía, Enlaces, Contactar/Créditos), páginas estáticas de
presentación, bibliografía y enlaces, y cada experimento con simulación o cálculo, ecuación viva y
ficha de teoría propia. El contenido de los textos originales (R. Brito, F. Domínguez-Adame) se
usa como fuente y se cita; las fichas son textos nuevos.

## 2. Secciones y rutas

| id | Sección | Nº | Estado al empezar |
|---|---|---|---|
| `sfe` | Sistemas fuera del Equilibrio | 9 (+3 TAD) | hecho (fase 2) |
| `fises` | Física Estadística | 11 | 2 compartidos con `sfe` (Kac, fluctuaciones); 9 nuevos |
| `fes` | Física del Estado Sólido | 12 | 0 |
| `dc` | Dispositivos Cuánticos | 10 | 0 |

Rutas: `#/` portada · `#/presentacion` · `#/bibliografia` · `#/enlaces` · `#/creditos` ·
`#/s/<id>` índice de sección con tarjetas · `#/<slug>` experimento. Un experimento puede aparecer
en varias secciones (`sections: ['sfe','fises']`) con numeración por sección.

## 3. Portada

Cabecera con el título del curso; **imagen de entrada**: un canvas animado generativo (red de
espines de Ising a T≈T_c en tonos del tema) sobre el que se colocan las cinco entradas como en
el mapa original, pero con la tipografía y colores del sitio; debajo, las cuatro secciones como
tarjetas con su número de experimentos y un enlace. Sin imágenes del sitio original.

## 4. Páginas estáticas

Markdown ES/EN en `docs/<lang>/curso/{presentacion,bibliografia,enlaces,creditos}.md` renderizado
con `lib/docs.js`. Bibliografía: la del curso original (Huang, Pathria, Reif, Koonin, Ashcroft–
Mermin, Kittel, Davies…) más las referencias usadas en las fichas. Créditos: autoría completa
(Brito, Domínguez-Adame, Parrondo, Castro, Hidalgo, Encinar) y enlace al original.

## 5. Experimentos nuevos: Física Estadística

| # | slug | Simulación/cálculo | Ecuación viva | Test clave |
|---|---|---|---|---|
| 1 | `tlc` | Suma de N variables (dado, uniforme [0,1], 0/1), histograma vs gaussiana | $P(S)=\frac{e^{-(S-N\mu)^2/2N\sigma^2}}{\sqrt{2\pi N\sigma^2}}$, χ² | χ² p>0.01 para N=12 dado |
| 2 | `kac` | compartido | | |
| 3 | `baker` | Panadero y gato de Arnold sobre nube/círculo/figura; iteración paso a paso | matriz $T$, det=1, autovalores $\lambda_\pm$, entropía de Kolmogorov $\ln\lambda_+$ | det=1, área conservada, puntos uniformes tras k iteraciones (χ² en cajas) |
| 4 | `osciladores` | N fases $\theta_i=\omega_i t$, M sectores, entropía $S=-\sum f_k\ln f_k$ | $S/\ln M$, recurrencia para frecuencias conmensurables | S→ln M para ω aleatorias; periódica para equiespaciadas |
| 5 | `cvising` | Calor específico exacto por matriz de transferencia en $N_x\times N_y$ (periódica), curvas exactas 1D y 2D (Onsager) | $c_v=\frac{\partial\langle E\rangle}{\partial T}$, $T_c=2/\ln(1+\sqrt2)$ | $N_x=1$ coincide con 1D exacto; máximo se acerca a $T_c$ al crecer |
| 6 | `diatom` | $c_v(T)$ traslación+rotación+vibración con $\Theta_r,\Theta_v$ | las tres contribuciones | límites 3/2, 5/2, 7/2 |
| 7 | `debye` | $c_v(T/\Theta_D)$ por integral de Debye | ec. (10), ley $T^3$, Dulong–Petit | límites |
| 8 | `fluctuaciones` | compartido (irreversibilidad) | | |
| 9 | `macro` | alias de `fluctuaciones` con la ventana pequeña y Poisson destacada | $P(N)=e^{-\lambda}\lambda^N/N!$, $\lambda=\langle N\rangle$ | existente |
| 10 | `bosefermi` | Monte Carlo de N bosones y N fermiones en niveles equiespaciados a kT | $\langle n_i\rangle=1/(z^{-1}e^{\beta\epsilon_i}\mp1)$ con $z$ de $\sum n_i=N$ | ocupaciones MC vs exactas, Pauli |
| 11 | `ising` | Metrópolis 2D L≤128, magnetización vs t, barrido en J/kT | $T_c$, $m$ de Onsager $(1-\sinh^{-4}2K)^{1/8}$ | $m$ MC vs Onsager a K=0.6; m≈0 a K=0.3 |

## 6. Estado Sólido y Dispositivos Cuánticos

Se especifican en la siguiente iteración a partir de los textos descargados (`docs/contexto`),
tras completar Física Estadística. Son cálculos numéricos 1D (cadenas, matrices de transferencia,
Schrödinger en pozos, Kronig–Penney, enlace fuerte, Thomas–Fermi, absorción) sin componente de
simulación estocástica; el panel de ecuación viva muestra el espectro/coeficiente calculado.

## 7. Verificación

Como en fase 2: tests por modelo, humo de navegador sobre todas las rutas (portada, 4 índices,
páginas estáticas, cada experimento) y sobre el sitio desplegado.
