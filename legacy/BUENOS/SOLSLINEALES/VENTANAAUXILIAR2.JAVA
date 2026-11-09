/** 
 *  Mario Castro Ponce                                                  
 */

import java.awt.*;
import java.awt.event.*;
import java.text.DecimalFormat;


public class VentanaAuxiliar2 extends Frame implements WindowListener {
	int altura,anchura;
	Image img;

	public VentanaAuxiliar2(int anchura,int altura,String texto,Image img) {
		this.anchura=anchura;
		this.altura=altura;
		this.img=img;
		setBounds(100,50,anchura+10,altura+80);
		

		addWindowListener(this);
	}

	public void paint(Graphics g) {
		g.drawImage(img,0,40,Color.red,new Panel());
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









