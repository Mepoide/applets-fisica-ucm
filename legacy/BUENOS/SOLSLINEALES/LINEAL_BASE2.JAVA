import java.awt.*;
import java.applet.*;
import java.awt.event.*;

public class Lineal_base2 extends Applet implements ActionListener,Runnable {		
	
	double cs=1,gammas=1,kappa=1;
	double cv=1,cp=2,rho=1;
	
	double xmin=-50,xmax=50,ymax=300;
	double x,deltax=0.1;
	double t;
	
	int anchura,altura;
	
	CuadroMath Campos;
	
	Button calc,pausa;
	TextField Cs,Gammas,Kappa;
	Thread runner;
	
		
	boolean corriendo=false,activo=true;

	public void init() {
		
	 	
	  	anchura=(getSize().width-20);
	   	altura=(getSize().height-60);  

		Campos=new CuadroMath(xmin,xmax,0.,ymax,anchura,altura,"","");
		

		calc=new Button("Inicia");
		pausa=new Button("Pausa ");
		calc.addActionListener(this);
		pausa.addActionListener(this);
 		Cs =new TextField(""+cs,5);
      	Gammas=new TextField(""+gammas,5);
      	Kappa=new TextField(""+kappa,5); 

		Panel norte=new Panel();
		norte.add(new Label("Cs:")); norte.add(Cs); 
		norte.add(new Label("GammaS:")); norte.add(Gammas);
		norte.add(new Label("Kappa:")); norte.add(Kappa);
		
		Panel centro=new Panel();
		centro.add(Campos);
		
		Panel sur=new Panel();
		sur.add(calc); sur.add(pausa);
		
		setLayout(new BorderLayout());
		add("North",norte );
		add("Center",centro);
		add("South",sur);
		
      
		paint(getGraphics());

		runner = new Thread(this,"Tarea1");  
		
	}

	public void run() {
		Thread me = Thread.currentThread();
      while (runner == me) {
			try {
				runner.sleep(30);
				 synchronized(this) {
					while(!activo) wait();
				 }
			} catch(InterruptedException e){}
		t+=0.1;	 
		repaint();
		}
	}
	public void paint(Graphics g) {
		
		Campos.paint(g);
		Campos.FG_BG(false);
		Campos.Limpia();
		Campos.Recta(xmin,ymax/3,xmax,ymax/3);
		Campos.Recta(xmin,2*ymax/3,xmax,2*ymax/3);
		
		
		if(corriendo){
		
			
					
			Campos.setCol(Color.green);
			for (x=xmin;x<=xmax;x+=deltax){
			Campos.Recta(x,200*((cv/(2*cp))*(gaussA(x+cs*t,t)+gaussA(x-cs*t,t))+((cp-cv)/cv)*gaussB(x,t)),x+deltax,200*((cv/(2*cp))*(gaussA(x+deltax+cs*t,t)+gaussA(x+deltax-cs*t,t))+((cp-cv)/cv)*gaussB(x+deltax,t)));	
			}
			Campos.setCol(Color.blue);
			for (x=xmin;x<=xmax;x+=deltax){
			Campos.Recta(x,200+200*(((cv*cs)/(2*rho*cp))*(gaussA(x+cs*t,t)-gaussA(x-cs*t,t))),x+deltax,200+200*(((cv*cs)/(2*rho*cp))*(gaussA(x+deltax+cs*t,t)-gaussA(x+deltax-cs*t,t))));	
			}
			Campos.setCol(Color.red);
			for (x=xmin;x<=xmax;x+=deltax){
			Campos.Recta(x,100+200*((1/(2*rho*cp))*(gaussA(x+cs*t,t)+gaussA(x-cs*t,t))+((cp-cv)/cv)*gaussB(x,t)),x+deltax,100+200*((1/(2*rho*cp))*(gaussA(x+deltax+cs*t,t)+gaussA(x+deltax-cs*t,t))+((cp-cv)/cv)*gaussB(x+deltax,t)));	
			}
			
		}
		Campos.FG_BG(true);
	}


	public double gaussA(double X,double T){
		
		return Math.sqrt(1/(gammas*T))*Math.exp(-X*X/(gammas*T));				
	}

	public double gaussB(double X,double T){
		
		return Math.sqrt(rho*cp/(kappa*T))*Math.exp(-rho*cp*X*X/(kappa*T));				
	}

	public synchronized void actionPerformed(ActionEvent e) {
		if(e.getSource()==calc) {
			
			t=0;
			LeeCampos();
			repaint();
			
			if(!corriendo) {
				runner.start();
				corriendo=true;
			}
			
		}
		else if(e.getSource()==pausa) {
			if(corriendo==false) return;
			activo=!activo;
			if(!activo) pausa.setLabel("Activa");
			if(activo) {
				pausa.setLabel("Pausa ");
				notify();
			}
		}
	}
	
	void LeeCampos() {
		try {
			cs=Double.valueOf(Cs.getText()).doubleValue();
			gammas=Double.valueOf(Gammas.getText()).doubleValue();
			kappa=Double.valueOf(Kappa.getText()).doubleValue();
			
		} catch(NumberFormatException exc) {
			cs=1; Cs.setText(""+cs);
			gammas=1; Gammas.setText(""+gammas);
			kappa=1; Kappa.setText(""+kappa);
		}
		
		Cs.setText(""+cs);
		Gammas.setText(""+gammas);
		Kappa.setText(""+kappa);
	}	

}
	