import java.awt.*;
import java.applet.*;
import java.awt.event.*;

public class Lineal_base extends Applet implements ActionListener,Runnable {		
	
	double cs=1,gammas=1,kappa=1;
	double cv=1,cp=2,rho=1;
	
	double xmin=-10,xmax=10,ymax=20;
	double x,deltax=0.1;
	double t;
	
	int anchura=200,altura=200;
	
	CuadroMath densidad,campo,temperatura;
	
	Button calc,pausa;
	TextField Cs,Gammas,Kappa;
	Thread runner;
	
		
	boolean corriendo=false,activo=true;

	public void init() {
		
	 	
	  	anchura=(getSize().width-20);
	   	altura=(getSize().height);  

		densidad=new CuadroMath(xmin,xmax,0.,ymax,anchura,altura/3,"","den");
		campo=new CuadroMath(xmin,xmax,0.,ymax,anchura,altura/3,"","vel");
		temperatura=new CuadroMath(xmin,xmax,0.,ymax,anchura,altura/3,"posición","tem");

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
		centro.setLayout(new BorderLayout());
		centro.add("North",densidad);
		centro.add("Center",campo);
		centro.add("South",temperatura);

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
				runner.sleep(1);
				 synchronized(this) {
					while(!activo) wait();
				 }
			} catch(InterruptedException e){}
		t+=1;	 
		repaint();
		}
	}
	public void paint(Graphics g) {
		densidad.paint(g);
		campo.paint(g);
		temperatura.paint(g);
		
		if(corriendo){
		
			densidad.setCol(Color.green);
			campo.setCol(Color.green);
			temperatura.setCol(Color.green);
		
			for (x=xmin;x<=xmax;x+=deltax){
			
			densidad.Recta(x,1000*((cv/2*cp)*(gaussA(x+cs*t,t)+gaussA(x-cs*t,t))+((cp-cv)/cv)*gaussB(x,t)),x+deltax,1000*((cv/2*cp)*(gaussA(x+deltax+cs*t,t)+gaussA(x+deltax-cs*t,t))+((cp-cv)/cv)*gaussB(x+deltax,t)));	
		
		
			}
		
		}
		
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
	