import java.awt.*;
import java.applet.*;
import java.awt.event.*;

public class HardDisksApplet extends Applet implements ActionListener,Runnable {		
	int N=10,Nmax=100;
	double kT=1.;
	double[] posx=new double[Nmax];
	double[] posy=new double[Nmax];
	double[] velx=new double[Nmax];
	double[] vely=new double[Nmax];
	int anchura=200,altura=200;
	int radio=4,paredx=17,paredy=13;
	int rl,rh;
	CuadroMath container,diferencia;
	Image bola,marco;
	Button calc,pausa;
	TextField particulas,kT_val;
	Thread runner;
	int Ndcha,Nizda;
	int TMAX=200,TLIMITE=10000;
	int tiempo;
	int [] resta=new int[TLIMITE];
	boolean corriendo=false,activo=true;

	public void init() {
	 	anchura=(getSize().width-20);
	   	altura=(getSize().height-80);  

		container=new CuadroMath(0.,anchura,0,altura,anchura,altura,"","",Color.white,false,false);
		diferencia=new CuadroMath(0.,TMAX,-N,N,anchura,altura,"tiempo","Nd-Ni");

		calc=new Button("Inicia");
		pausa=new Button("Pausa ");
		calc.addActionListener(this);
		pausa.addActionListener(this);
 		particulas =new TextField(""+N,3);
      kT_val=new TextField(""+kT,5); 

		Panel norte=new Panel();
		norte.add(new Label("N (<100):")); norte.add(particulas); 
		norte.add(new Label("Temperatura:")); norte.add(kT_val);
		Panel centro=new Panel();
		centro.add(container);
		centro.add(diferencia);
		Panel sur=new Panel();
		sur.add(calc); sur.add(pausa);
		setLayout(new BorderLayout());
		add("North",norte );
		add("Center",centro);
		add("South",sur);
		
      bola= getImage(getDocumentBase(), "bolaazul.gif");
		marco= getImage(getDocumentBase(), "Marco.gif");   

		paint(getGraphics());

		runner = new Thread(this,"Tarea1");  
		//inicializa();
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
			movimiento(); 
		DibujaParticulas();
		}
	}
	public void paint(Graphics g) {
		container.paint(g);
		diferencia.paint(g);
		DibujaParticulas();
	}


	public synchronized void actionPerformed(ActionEvent e) {
		if(e.getSource()==calc) {
			if(!corriendo) {
				runner.start();
				corriendo=true;
			}
			tiempo=0;
			TMAX=100;
			resta[0]=-N;
			LeeCampos();
			inicializa();
			diferencia.fijaEscalas(0,TMAX,-N,N);
			diferencia.Limpia();
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
			N=Integer.valueOf(particulas.getText()).intValue();
			kT=Double.valueOf(kT_val.getText()).doubleValue();
		} catch(NumberFormatException exc) {
			N=50; particulas.setText("50");
			kT=100; kT_val.setText(""+kT);
		}
		if(N<1 || N>Nmax) N=50;
		if(kT<0) kT=1;
		particulas.setText(""+N);
		kT_val.setText(""+kT);
	}	


	public void movimiento() {
		double dxx,dxy,dvx,dvy;
		double dv,dv2;
		double cmx,cmy,v1cmx,v1cmy;
		double invm,b,deltat;
		double crossprod,dotprod;
		double cosphi,sinphi,dTheta;
		int i,k;
		
		Ndcha=Nizda=0;

		for (i=0;i<N;i++)
		{
			for (k=i+1;k<N;k++)
			{
				invm = 0.5;
				// dv is the neg velocity differential v1-v2
				dvx = velx[i]-velx[k];
				dvy = vely[i]-vely[k];
				dv2 = dvx*dvx+dvy*dvy;
				// dx is the distance x2-x1
				dxx=posx[k]-posx[i];
				dxy=posy[k]-posy[i];
				//dx= Math.sqrt(dxx*dxx+dxy*dxy);
				dotprod = dvx*dxx+dvy*dxy; // dv . dx
				// dotprod>0 if they are going towards each other.
				if (dotprod>0) {
					crossprod = dvy*dxx-dvx*dxy; // dx x dv
					dv = Math.sqrt(dv2);
					b = (1/(2*radio*dv))*crossprod;
					deltat = dotprod/dv2-2*radio*(1-b*b)/dv;
					if (b*b<1 && deltat>=0 && deltat<1) {
						// bring them to the point of collision.
						posx[i]+= deltat*velx[i];
						posy[i]+= deltat*vely[i];
						posx[k]+= deltat*velx[k];
						posy[k]+= deltat*vely[k];
						// dx= Math.sqrt(dxx*dxx+dxy*dxy);
						cosphi = b*b*2-1;
						sinphi = 2*b*Math.sqrt(1-b*b);
						dTheta = Math.atan2(dvy,dvx)+Math.atan2(sinphi,cosphi);
						sinphi = Math.sin(dTheta);
						cosphi = Math.cos(dTheta);
						cmx = invm*(velx[i]+velx[k]);
						cmy = invm*(vely[i]+vely[k]);
						v1cmx = invm*dv*cosphi;
						v1cmy = invm*dv*sinphi;
						velx[i]=v1cmx+cmx;
						vely[i]=v1cmy+cmy;
						velx[k]=-v1cmx+cmx;
						vely[k]=-v1cmy+cmy;
						// bring them the rest of the way
						//x[i]+= (1-deltat)*velx[i];
						//y[i]+= (1-deltat)*vely[i];
						//x[k]+= (1-deltat)*velx[k];
						//y[k]+= (1-deltat)*vely[k];
					}
				}
			}
			// Update red ball positions.				
/* Condiciones periodicas			
rl=anchura-paredx-radio;
rh=altura-paredy-radio;
if (posx[i]<0) posx[i]+=rl; if (posx[i]>rl) posx[i]-=rl;
if (posy[i]<0) posy[i]+=rh; if (posy[i]>rh) posy[i]-=rh;
 Fin de condiciones periodicas			*/

			posx[i]+=velx[i]; posy[i]+=vely[i];
			if (posx[i]<paredx+radio){ posx[i]=2*(radio+paredx)-posx[i]; velx[i]*=-1;}
			if (posy[i]<paredy+radio){ posy[i]=2*(radio+paredy)-posy[i]; vely[i]*=-1;}
			if (posx[i]>anchura-(radio+paredx)) {posx[i]=2*(anchura-paredx-radio)-posx[i]; velx[i]*=-1;}
			if (posy[i]>altura-(radio+paredy)) {posy[i]=2*(altura-paredy-radio)-posy[i]; vely[i]*=-1;}
												                                     
			if(posx[i]>anchura/2) Ndcha++; else Nizda++;
		}
		DibujaParticulas();
		resta[++tiempo]=Ndcha-Nizda;

  		diferencia.FG_BG(false);
		diferencia.Recta(tiempo-1,resta[tiempo-1],tiempo,resta[tiempo]);
      if(tiempo>=TMAX && tiempo<TLIMITE) {
			TMAX*=2;
			diferencia.fijaEscalas(0,TMAX,-N,N);
			diferencia.Limpia();
			for(int tim=0;tim<TMAX/2;tim++) {
		  		diferencia.Recta(tim,resta[tim],tim,resta[tim+1]);
			}
  		}        
  		diferencia.FG_BG(true);
	}

	void DibujaParticulas() {
		container.FG_BG(false);
		container.Limpia();
		container.Imagen(marco,0,altura);
		for(int i=0;i<N;i++) {
			container.Imagen(bola,posx[i]-2*radio+1,posy[i]+2*radio-1);
		}
		container.FG_BG(true);
	}


	void Boltzmann(double kT,int i) {
		double aux,raux;

		aux=Math.sqrt(-2*Math.log(1-Math.random()));
		raux=2*Math.PI*Math.random();
		velx[i]=aux*Math.cos(raux)*Math.sqrt(kT);
		vely[i]=aux*Math.sin(raux)*Math.sqrt(kT);
	}

	void inicializa() {
		int x,y;

		tiempo=0;
		Ndcha=0;Nizda=0;
		resta[0]=-N;

		for(int i=0;i<N;i++) {
			x=paredx+radio+(int)Math.floor(Math.random()*(anchura-2*radio-2*paredx)/2);
			y=paredx+radio+(int)Math.floor(Math.random()*(altura-2*radio-2*paredx));
			posx[i]=x; posy[i]=y;
			Boltzmann(kT,i);
			if(posx[i]>anchura/2) Ndcha++; else Nizda++;
		}
	}
}		
