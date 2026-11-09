/** 
 *  Mario Castro Ponce                                                  
 */

import java.awt.*;
import java.awt.event.*;
import java.text.DecimalFormat;


public class GraficoAuxiliar extends Frame implements WindowListener {
	int altura,anchura;
	CuadroMath cuadro;

	public GraficoAuxiliar(int anchura,int altura,double xmin,double xmax,double ymin,double ymax,String labelx,String labely) {
		this.anchura=anchura;
		this.altura=altura;
		cuadro=new CuadroMath(xmin,xmax,ymin,ymax,anchura,altura,labelx,labely);
		setBounds(100,50,anchura+10,altura+80);
		add(cuadro);
		setVisible(true);
		addWindowListener(this);
		paint(getGraphics());
	}

	public void init() {
	}

	public void paint(Graphics g) {
		cuadro.paint(g);
	}

	public void windowClosed(WindowEvent e) {;}
	public void windowActivated(WindowEvent e) {;}
	public void windowClosing(WindowEvent e) {
		dispose();
	}
	public void windowDeactivated(WindowEvent e) {;}
	public void windowDeiconified(WindowEvent e) {;}
	public void windowIconified(WindowEvent e) {; }
	public void windowOpened(WindowEvent e) {;}
}









