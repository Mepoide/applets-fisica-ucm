# Pila de arena y criticalidad autoorganizada

## Qué se observa

Granos que caen uno a uno sobre la columna izquierda de una caja estrecha. Cuando la
pendiente entre dos columnas vecinas alcanza un umbral, un grano rueda a la columna
siguiente; eso puede desestabilizar a la vecina y provocar una **avalancha**. Los granos que
llegan al borde derecho abandonan el sistema. La gráfica registra el tamaño $s$ de cada
avalancha (número de desplazamientos) y su distribución $P(s)$.

Hay dos modelos:

- **Umbral fijo** (el applet de 2003): todas las columnas tienen la misma pendiente
  crítica $h_c$.
- **Oslo**: después de cada desplazamiento, el umbral del sitio se vuelve a sortear entre
  $h_c$ y $h_c+1$. Es el modelo de la "pila de arroz" de Oslo (Christensen, Corral, Frette,
  Feder y Jøssang, 1996).

## Modelo físico

Sea $h_i$ la altura de la columna $i=0,\dots,L-1$ y $z_i = h_i - h_{i+1}$ la pendiente local
(con $h_L \equiv 0$ fuera de la caja). Regla: si $z_i \ge z_i^c$, entonces
$h_i \to h_i - 1$ y $h_{i+1} \to h_{i+1}+1$. La pila se "conduce" añadiendo un grano en
$i=0$ cada vez que está estable (separación de escalas temporales: la relajación es
infinitamente rápida comparada con la adición).

**Umbral fijo en 1D no es crítico.** Con $z_i^c = h_c$ constante, el estado estacionario es
una escalera perfecta de pendiente $h_c - 1$. Cada grano nuevo hace $z_0 = h_c$, rueda a la
columna 1, que pasa a tener $z_1 = h_c$, y así hasta salir por la derecha: todas las
avalanchas tienen exactamente tamaño $L$. No hay fluctuaciones ni leyes de potencias. Es el
resultado conocido de que el modelo de Bak–Tang–Wiesenfeld (BTW) en una dimensión es
trivial; la criticalidad autoorganizada del BTW aparece en $d\ge 2$.

**El modelo de Oslo sí es crítico en 1D.** El desorden dinámico de los umbrales genera
una distribución de tamaños de avalancha en ley de potencias con corte finito,

$$ P(s) \sim s^{-\tau_s}\, \mathcal G\!\left(\frac{s}{L^{D}}\right), \qquad \tau_s \simeq 1.55,\quad D \simeq 2.25, $$

con la relación de escala $D(2-\tau_s) = 1$, que se deduce de que en el estado
estacionario el tamaño medio de avalancha es $\langle s\rangle = L$ (cada grano debe
acabar recorriendo todo el sistema). La pendiente media estacionaria es $\langle z\rangle \approx 1.7$
para umbrales $\{1,2\}$, es decir, $h_c = 1$ en nuestra parametrización; con $h_c=2$
(umbrales $\{2,3\}$) la pendiente media está entre 2 y 3 y la fenomenología es la misma.

Con $L=24$ columnas el corte está en $s \sim L^{2.25} \approx 1300$ y la ley de potencias
se extiende sobre unas dos décadas: suficiente para verla en el applet.

## Algoritmo de simulación

- Un paso de relajación recorre las columnas de izquierda a derecha y desplaza un grano en
  cada sitio inestable (actualización secuencial, como el original). La avalancha termina
  cuando un recorrido no mueve nada; su tamaño es el total de desplazamientos y su duración
  el número de recorridos.
- El modo "sin animación" añade un grano y relaja por completo en cada paso.
- La distribución $P(s)$ se estima con bins logarítmicos (4 por década) y se divide por el
  número de enteros que caen en cada bin para obtener una densidad comparable con la ley de
  potencias.

## Cambios respecto al applet original

| Original | Aquí | Motivo |
|---|---|---|
| Sólo umbral fijo, 12 columnas, 300 granos, animación grano a grano | Umbral fijo y Oslo, hasta 200 columnas, sin límite de granos | El original no puede mostrar criticalidad |
| La gráfica "tiempo / #" se creaba pero nunca se dibujaba | Serie temporal de $s$ y $P(s)$ log-log | Estaba sin terminar |
| Altura de la gráfica medida en píxeles de imágenes GIF | Modelo sin unidades gráficas | Separar física de dibujo |
| Al final imprimía las alturas por consola | Lecturas en pantalla: granos añadidos, en la pila, salidos, pendiente media | |

## Pruebas

`tests/pila.test.js`: conservación de granos (añadidos = en la pila + salidos) en ambos
modos; en umbral fijo, tras el transitorio todas las avalanchas tienen tamaño $L$ y el
perfil es una escalera de pendiente $h_c-1$; en Oslo con $L=64$ y 20 000 granos los
tamaños abarcan al menos dos décadas, la densidad decrece y la pendiente media queda en
el rango esperado; normalización del estimador de $P(s)$.

## Evaluación didáctica

**Qué aporta.** La comparación directa entre un modelo trivial y uno crítico con la misma
regla básica es muy ilustrativa: enseña que la criticalidad autoorganizada no está
garantizada por "umbral + conducción lenta", sino que depende de la dimensión y del
desorden.

**Controles.** Columnas, $h_c$, modelo, animación o no, gráfica (serie temporal o
distribución log-log con pendiente de referencia $-1.55$).

**Limitaciones y mejoras.** Falta la distribución de duraciones y el colapso de datos con
$L$ (dibujar $P(s)L^{\tau D}$ frente a $s/L^D$ para varios $L$), que sería la demostración
cuantitativa de la ley de escala. Un segundo paso natural es la pila BTW en 2D con
visualización de avalanchas, que es la imagen clásica de la SOC.
