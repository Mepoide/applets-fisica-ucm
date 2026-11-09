# Diodo túnel resonante

## Qué se observa

El coeficiente de transmisión de un electrón a través de una doble barrera de Al_xGa_{1−x}As con un pozo de GaAs en medio, en función de la energía y del voltaje aplicado, y la característica corriente–voltaje resultante, con su máximo de resonancia y su región de resistencia diferencial negativa.

## Modelo físico

Con masa efectiva uniforme $m^*$ y una caída lineal de potencial $-Vz/L$ a lo largo de la estructura,

$$-\frac{\hbar^2}{2m^*}\chi'' + \left(V(z) - V\frac{z}{L}\right)\chi = E\chi.$$

Cada barrera aislada transmite poco, pero cuando la energía coincide con el nivel cuasi-ligado del pozo las ondas reflejadas interfieren destructivamente y $T \to 1$ (efecto túnel resonante). El nivel baja con el voltaje (aproximadamente $V/2$, pues el pozo está en el centro); la corriente a temperatura $T$ es (Tsu–Esaki)

$$I \propto \int_0^\infty T(E, V)\,\ln\frac{1 + e^{(E_F - E)/k_BT}}{1 + e^{(E_F - E - eV)/k_BT}}\,dE,$$

que crece mientras la resonancia recorre la ventana de energías ocupadas del emisor y se desploma cuando cae por debajo del fondo de su banda: resistencia diferencial negativa.

## Algoritmo

Versión discreta $\chi_{n+1} + \chi_{n-1} = [2 - (2m^*s^2/\hbar^2)(V_n - E)]\chi_n$ con $s = 1$ Å, recorrida desde el colector (onda saliente pura) hasta el emisor, donde se separan las amplitudes incidente y reflejada; $T$ incluye el cociente de velocidades de los dos contactos. La corriente se integra con la regla del trapecio. Inicia para barrer el voltaje y construir la I–V.

## Preguntas

1. A voltaje cero, compara la energía de la resonancia con el nivel del pozo aislado. ¿Por qué la transmisión llega a 1 si cada barrera transmite ~10⁻³?
2. Lanza el barrido de voltaje: ¿a qué V está el máximo de corriente? Compáralo con 2(E₀ − E_F) y explica el factor 2.
3. Dobla el espesor de las barreras: ¿cómo cambian la anchura de la resonancia y la corriente de pico? ¿Y al subir la temperatura a 300 K?

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| T(E) para un voltaje y curva I–V | Igual, con T en escala logarítmica sobre el perfil polarizado, el nivel del pozo aislado marcado y el barrido animado | Ver la resonancia moverse |

## Pruebas

`tests/dc.test.js`: la transmisión por una barrera simple coincide con la fórmula analítica al 0.2 %; a voltaje cero la resonancia tiene T > 0.9 y está a menos de 10 meV del nivel del pozo aislado; la I–V tiene un máximo interior y el valle está por debajo de la mitad del pico.

## Evaluación didáctica

El dispositivo cuántico por excelencia: enseña transmisión por efecto túnel, resonancias y la conexión entre transmisión y corriente. Fuente: curso *Experimentos Interactivos* (UCM), experimento 3 de Dispositivos Cuánticos, F. Domínguez-Adame.
