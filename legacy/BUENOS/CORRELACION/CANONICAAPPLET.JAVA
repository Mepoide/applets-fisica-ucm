/** 
 *  Mario Castro Ponce                                                  
 */

import java.applet.*;
import java.awt.*;
import java.awt.event.*;
import java.text.DecimalFormat;

public class CanonicaApplet extends Applet implements ActionListener,Runnable,AdjustmentListener, ItemListener {

	Image bola,marco;
	Checkbox rapido;
	CuadroMath container,energia; /* Cuadro de dibujo */
	Button calc,pausa,histograma;
	TextField particulas,kT_val;
	int N=50,max=N;
	int Nmax=200;
	int altura,anchura;
	boolean corriendo=false,activo=true;
	int[] histo=new int[Nmax+1];
	int maxHist=0,totHist;
	Thread  runner;
	double[] posx=new double[Nmax+1];
	double[] posy=new double[Nmax+1];
	double[] velx=new double[Nmax+1];
	double[] vely=new double[Nmax+1];
	double kT=100;
	int radio=4,paredx=17,paredy=13;
	double TMAX=100.;
	int tiempo=0;
	double dt=0.1;
	double y1,y2,lambda;
	int STEP=10;
	int [] numero= new int[10000];
//	int [] tt= new int[1000];    // 
	int dentro=0,dentroold=0;
	int mx=0,my=0,dx,dy,dx_old,dy_old;
	double energia_dentro=0,energia_dentro_old=0;
	double vmax=50;

	public void init() {
		Font fuente=new Font("SansSerif",Font.PLAIN,12);
                setFont(fuente); 

		setBackground(Color.gray.brighter());
		anchura=(getSize().width-20)/2;
		altura=(getSize().height-80);

		container=new CuadroMath(0.,anchura,0.,altura,anchura,altura,"","",Color.white,false,false);
		energia=new CuadroMath(0.,TMAX,0,1.,anchura,altura,"tiempo","N");


		rapido=new Checkbox("Rápido");
		rapido.addItemListener(this);

		particulas =new TextField(""+N,3);
		kT_val=new TextField(""+kT,5);

		calc=new Button("Inicia");
		pausa=new Button("Pausa ");
		histograma=new Button(" Histograma ");
		calc.addActionListener(this);
		pausa.addActionListener(this);
		histograma.addActionListener(this);

		setLayout(new BorderLayout());
		Panel norte=new Panel();
		Panel sur=new Panel();
		norte.add(new Label("Número de partículas (<="+Nmax+"):")); 
		norte.add(particulas);
		norte.add(new Label("   Temperatura"));
		norte.add(kT_val);

		sur.add(calc); sur.add(pausa); sur.add(rapido);sur.add(histograma);
		
		add("North",norte);
		Panel centro=new Panel();
		centro.add(container);
		centro.add(energia);
		add("Center",centro);
		add("South",sur);
      bola= getImage(getDocumentBase(), "bolaazul.gif");
      marco= getImage(getDocumentBase(), "Marco3.gif");

		runner = new Thread(this,"Tarea1");  
	}



	
	public void adjustmentValueChanged(AdjustmentEvent e) {

	}

public void run() {
		Thread me = Thread.currentThread();
      while (runner == me) {
			try {
				runner.sleep(10);
				 synchronized(this) {
					while (!activo) wait();
				 }    
			} catch(InterruptedException e){}
			movimiento(); 
		}
	}


	public void itemStateChanged(ItemEvent e) {
		if(!rapido.getState()) {dt=0.1; STEP=10; } //velocidad=10;
		else {dt=1; STEP=1;} //else velocidad=1000;
	}

	public synchronized void actionPerformed(ActionEvent e) {
		if(e.getSource()==calc) {
			if(!corriendo) {
				runner.start();
				corriendo=true;
			}
			tiempo=0;
			TMAX=100;
			LeeCampos();
			container.Limpia();
			inicializa();
			int maxY=2*(int)Math.floor(N*dx*dy*vmax*vmax/2/max);
			maxY=N;
			energia.fijaEscalas(0,TMAX,0,maxY);
			energia.Limpia();
			for(int i=0;i<N-1;i++){histo[i]=0;};
			maxHist=0;totHist=0;
		}
		else if(e.getSource()==pausa) {
			if(corriendo==false) return;
			activo=!activo;
			if(!activo)  pausa.setLabel("Activa");
			if(activo) {
				pausa.setLabel("Pausa ");
				notify();
			}
		}
		else if(e.getSource()==histograma) {
                        double maxY=Math.floor((float)10)/10;
                        double maxX=Math.floor((float)(maxHist+5)/5)*5;
                        GraficoAuxiliar aux=new GraficoAuxiliar(anchura,altura,0,maxX,0,maxY,"N","Frec");
                        aux.cuadro.FG_BG(false);
                        for(int i=0;i<N+1;i++){
                                aux.cuadro.setCol(Color.red);
                                aux.cuadro.Cuadrado(i,0,i+1,(float)histo[i]/totHist);
                      //          aux.cuadro.Cuadrado(i,0,i+1,(float)histo[i]/totHist); // 
				}
			aux.cuadro.setCol(Color.blue);
			lambda=N*dx*dy/(double)(anchura-2*paredx)/(double)(altura-2*paredy);
                        // aux.cuadro.Texto(-N,maxY-.05,"  Número de partículas="+lambda,Color.black); // 
			for(int i=0;i<N+1;i++){
				y1=-lambda*Math.log(2.718281828)+i*Math.log(lambda)-lnfactorial((long)i);	
				y2=-lambda*Math.log(2.718281828)+(i+1)*Math.log(lambda)-lnfactorial((long)i+1);
				y1=Math.exp(y1);
				y2=Math.exp(y2);
                                aux.cuadro.Recta(i+0.5,y1,i+1.5,y2);
                                }
                        aux.cuadro.FG_BG(true);
                }

	}
	void LeeCampos() {
		try {
			N=Integer.valueOf(particulas.getText()).intValue();
			kT=Double.valueOf(kT_val.getText()).doubleValue();
		} catch(NumberFormatException exc) {
			N=50; particulas.setText("50");
			kT=100.; kT_val.setText(""+kT);
		}
		if(N<1 || N>Nmax) N=50;
		if(kT<0) kT=100;
		particulas.setText(""+N);
		kT_val.setText(""+kT);
		vmax=3.61*Math.sqrt(kT);
	}	

	void inicializa() {
		int num;
		int x,y;

		dx_old=anchura;
		dy_old=altura;
		max=anchura*altura;

		tiempo=0;
		TMAX=100;

		for(num=1;num<=N;num++) {

			x=paredx+radio+(int)Math.floor(Math.random()*(anchura-2*radio-2*paredx));
			y=paredy+radio+(int)Math.floor(Math.random()*(altura-2*radio-2*paredy));
			posx[num]=x; posy[num]=y;

			Boltzmann(kT,num);
		}
		DibujaParticulas();
	}

	void movimiento() {
		int num;
		int auxx=0,auxy=0;
		int mx,my,dx,dy;
		double vx,vy;
		mx=container.mousex; my=container.mousey;
		dx=container.dx; dy=container.dy;
		
		dentro=0;
		energia_dentro=0.;

		for(num=1;num<=N;num++) {
			posx[num]+=velx[num]*dt;
			posy[num]+=vely[num]*dt;

			if(posx[num]<paredx+radio) {posx[num]=2*(radio+paredx)-posx[num]; velx[num]*=-1.;}
			if(posy[num]<radio+paredy){ posy[num]=2*(radio+paredy)-posy[num];vely[num]*=-1;}
			if(posx[num]>anchura-(radio+paredx)) {posx[num]=2*(anchura-paredx-radio)-posx[num];velx[num]*=-1.;}
			if(posy[num]>altura-(radio+paredy)) {posy[num]=2*(altura-paredy-radio)-posy[num]; vely[num]*=-1;}

			auxx=(int)Math.floor(posx[num]);
			auxy=(int)Math.floor(posy[num]);
			vx=velx[num];
			vy=vely[num];
			
// Original de Mario			if(auxx>(mx+radio) && auxx<(mx+dx-radio) && auxy>(my+radio) && auxy<(my+dy-radio) ) { energia_dentro+=1; }  // 
			if(auxx>(mx) && auxx<(mx+dx) && auxy>(my) && auxy<(my+dy) ) { energia_dentro+=1; }
		}
		DibujaParticulas();
		energia.setCol(Color.black);

		energia.Recta(tiempo,energia_dentro_old,tiempo+1,energia_dentro);
		tiempo++;
		numero[tiempo]=(int)energia_dentro;
		// tt[tiempo]=tiempo;   //
		if((int)energia_dentro>maxHist){maxHist=(int)energia_dentro;}
		histo[(int)energia_dentro]+=1;totHist++;
		energia.FG_BG(false);

                if(tiempo>TMAX){
		 	TMAX*=2;
			int maxY=N;
			energia.fijaEscalas(0,TMAX,0,maxY);
			energia.Limpia();
			for(int tim=0;tim<TMAX/2;tim++){
				energia.Recta(tim,numero[tim],tim+1,numero[tim+1]);
			}
		}
		energia.FG_BG(true);
		
		//System.out.print("Energia: "+energia_dentro);
		energia_dentro_old=energia_dentro;
	}

	void DibujaParticulas() {
		int num;
		int mx=0,my;
		mx=container.mousex; my=container.mousey;
		dx=container.dx; dy=container.dy;

		if(dx!=dx_old || dy!=dy_old) {dx_old=dx; dy_old=dy;}

		container.FG_BG(false);
		container.Limpia();

		container.Imagen(marco,0,altura);
		for(num=1;num<=N;num++) {
			container.Imagen(bola,posx[num]-2*radio+1,posy[num]+2*radio-1);
		}
		container.setCol(Color.green);
		container.Recuadro(mx,my,dx,dy);
		container.FG_BG(true);
	}

	void Boltzmann(double kT,int num) {
		double aux,raux;

		aux=Math.sqrt(-2*Math.log(1-Math.random()));
		raux=2*Math.PI*Math.random();
		velx[num]=aux*Math.cos(raux)*Math.sqrt(kT);
		vely[num]=aux*Math.sin(raux)*Math.sqrt(kT);
	}

	public static float lnfactorial(long x){
		if(x<=1) return 0;
		else return (float)(x*Math.log(x)-x*Math.log(2.718281828)+0.5*Math.log(2*3.1415927*x));
		
	}
}
