import java.awt.*;
import java.applet.*;
import java.awt.event.*;
import java.text.DecimalFormat;

public class HDA_Maxwell extends Applet implements ActionListener,Runnable {		
	int N=80,Nmax=300;
	int boxes=20;
	double kT=0;
	double m=1;
	double[] posx=new double[Nmax];
	double[] posy=new double[Nmax];
	double[] velx=new double[Nmax];
	double[] vely=new double[Nmax];
	int[] N_v=new int[boxes];
	double vmax=1;
	int N_col=0;
	DecimalFormat df=new DecimalFormat("##0.0");
	int anchura=200,altura=200;
	int radio=4,paredx=17,paredy=13;
	int rl,rh;
	
	CuadroMath container,distribucion;
	Image bola,marco;
	Button calc,pausa;
	TextField particulas;
	Choice set_dist;
	
	Thread runner;
	int Ndcha,Nizda;
	
	
	
	boolean corriendo=false,activo=true;

	public void init() {
	 	Font fuente=new Font("SansSerif",Font.PLAIN,12);
	 	setFont(fuente);
	 	setBackground(Color.white);
	 	
	 	anchura=(getSize().width-20)/2;
	   	altura=(getSize().height-80);  
		

		container=new CuadroMath(0.,anchura,0,altura,anchura,altura,"","",Color.white,false,false);
		distribucion=new CuadroMath(0.,vmax,0.,N/4,anchura,altura,"v","N(v)",Color.white,true,true);

		calc=new Button("Inicia");
		pausa=new Button("Pausa ");
		calc.addActionListener(this);
		pausa.addActionListener(this);
 		particulas =new TextField(""+N,3);
        

		set_dist=new Choice();
		set_dist.add("Aleatoria en ángulo");
		set_dist.add("Aleatoria en vx,vy");
		set_dist.add("Aleatoria en vy; vx fija ");
		set_dist.add("Fijas vx y vy");
		set_dist.select(0);

		Panel norte=new Panel();
		norte.add(new Label("Partículas (<150):"));
		norte.add(particulas); 
		norte.add(new Label("Distribución inicial:"));
		norte.add(set_dist);
		
		
		Panel centro=new Panel();
		centro.add(container);
		centro.add(distribucion);
		
		Panel sur=new Panel();
		sur.add(calc);sur.add(pausa);
		sur.add(new Label("Colisiones por partícula:"));
		
		setLayout(new BorderLayout());
		add("North",norte );
		add("Center",centro);
		add("South",sur);
		
      	bola= getImage(getDocumentBase(), "bolaazul.gif");
		marco= getImage(getDocumentBase(), "Marco2.gif");   

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
		distribucion.paint(g);
		DibujaParticulas();
	}


	public synchronized void actionPerformed(ActionEvent e) {
		if(e.getSource()==calc) {
			LeeCampos();
			inicializa();
			DibujaParticulas();
			
			if(!corriendo) {
				runner.start();
				corriendo=true;
			}
			//Inicializacion de la distribucion y temperatura;
			//Así se inicializa tambien el CuadroMath distribucion
			//o sea fijaEscalas(0.,vmax,0,N+5);vmax=(3-4)sqrt(kT);
					
			
			
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
			
		} catch(NumberFormatException exc) {
			N=80; particulas.setText("80");
			
		}
		if(N<1 || N>Nmax) N=80;
		
		particulas.setText(""+N);
		
	}	


	public void movimiento() {
		double dxx,dxy,dvx,dvy;
		double dv,dv2;
		double cmx,cmy,v1cmx,v1cmy;
		double invm,b,deltat;
		double crossprod,dotprod;
		double cosphi,sinphi,dTheta;
		int i,k;
		
		double v,deltav;
		

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
						
						N_col++;
						
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
												                                     
			
		}
		DibujaParticulas();
		
		
		
		deltav=vmax/boxes;
		for(int g=0;g<boxes;g++) N_v[g]=0;//Inicializacion total de N_v
		for(int m=0;m<N;m++){
			v=Math.sqrt(velx[m]*velx[m]+vely[m]*vely[m]);
			for(int n=0;n<boxes;n++){
				if((v>=n*deltav)&(v<=(n+1)*deltav)) N_v[n]++;
			}//Construcción de N(v) para el histograma
		}
		
		distribucion.FG_BG(false);
		distribucion.Limpia();
		distribucion.Texto(0,(double)altura/2,"Colisiones por partícula: "+df.format((double)N_col/(2*N)),Color.black);
		for(int s=0;s<boxes;s++){
			distribucion.setCol(Color.red);
			distribucion.Cuadrado(s*deltav,0,(s+1)*deltav,N_v[s]);	
		//Construcción del histograma
			distribucion.setCol(Color.blue);
			distribucion.Recta((double)s*deltav,((double)N*deltav)*s*deltav*(m/kT)*Math.exp((-(double)m*s*deltav*s*deltav)/(2*kT)),(double)(s+1)*deltav,((double)N*deltav)*(s+1)*deltav*(m/kT)*Math.exp((-(double)m*(s+1)*deltav*(s+1)*deltav)/(2*kT))); 	
		}
		
		distribucion.FG_BG(true);
		

  		
      
	}//

	void DibujaParticulas() {
		container.FG_BG(false);
		container.Limpia();
		container.Imagen(marco,0,altura);
		for(int i=0;i<N;i++) {
			container.Imagen(bola,posx[i]-2*radio+1,posy[i]+2*radio-1);
		}
		container.FG_BG(true);
	}


	void Velocidad(int i) {
		
		if(set_dist.getSelectedIndex()==0){
		
			double raux;
			raux=2*Math.PI*Math.random();	
			velx[i]=Math.cos(raux);
			vely[i]=Math.sin(raux);	
			
		}
		if(set_dist.getSelectedIndex()==1){
		
			double aux,raux;
			aux=2*Math.random()-1;
			raux=2*Math.PI*Math.random();	
			velx[i]=aux*Math.cos(raux);
			vely[i]=aux*Math.sin(raux);
				
		
		}
		if(set_dist.getSelectedIndex()==2){
			
			double aux,raux;
			aux=2*Math.random()-1;
			raux=2*Math.PI*Math.random();
			vely[i]=aux*Math.sin(raux);
			velx[i]=1;
			
		}
		if(set_dist.getSelectedIndex()==3){
			velx[i]=1;
			vely[i]=1;
			
		}

	}

	void inicializa() {
		int x,y;
		double v,vh,deltav;
		
		
		for(int i=0;i<N;i++) {
			x=paredx+radio+(int)Math.floor(Math.random()*(anchura-2*radio-2*paredx));
			y=paredx+radio+(int)Math.floor(Math.random()*(altura-2*radio-2*paredx));
			posx[i]=x; posy[i]=y;
			Velocidad(i);//Inicialización de velocidades
			
		
		}
		kT=0;
		for(int k=0;k<N;k++){
			v=Math.sqrt(velx[k]*velx[k]+vely[k]*vely[k]);
			kT+=(double)(1/((double)2*N))*m*v*v;
			
			//Temperatura//
		}
		
		if(set_dist.getSelectedIndex()==0){vmax=3.0;}
		if(set_dist.getSelectedIndex()==1){vmax=2.0;}
		if(set_dist.getSelectedIndex()==2){vmax=3.0;}
		if(set_dist.getSelectedIndex()==3){vmax=4.0;}
		
		for(int a=0;a<boxes;a++) N_v[a]=0;//Inicializacion total de N_v
		deltav=vmax/boxes;
		for(int ñ=0;ñ<N;ñ++){
			v=Math.sqrt(velx[ñ]*velx[ñ]+vely[ñ]*vely[ñ]);		
			for(int j=0;j<boxes;j++){
					if((v>=j*deltav)&(v<=(j+1)*deltav)){
						N_v[j]++;
						
					}
			}//Inicialización de N(v) para el histograma
		}
		
		distribucion.FG_BG(false);
		distribucion.fijaEscalas(0.,vmax,0.,N/4);
			
		distribucion.Limpia();
		N_col=0;//Número de colisiones a cero
		distribucion.Texto(0,(double)altura/2,"Colisiones por partícula: "+df.format((double)N_col/(2*N)),Color.black);
		
		for(int h=0;h<boxes;h++){
			distribucion.setCol(Color.red);
			distribucion.Cuadrado(h*deltav,0,(h+1)*deltav,N_v[h]);
			distribucion.setCol(Color.blue);
			distribucion.Recta(h*deltav,((double)N*deltav)*h*deltav*(m/kT)*Math.exp((-(double)m*h*deltav*h*deltav)/(2*kT)),(h+1)*deltav,((double)N*deltav)*(h+1)*deltav*(m/kT)*Math.exp((-(double)m*(h+1)*deltav*(h+1)*deltav)/(2*kT)));	
			
		//Inicializacion de histograma 	
		}
		distribucion.FG_BG(true);
		
		
		
	}
		
		


	
}		
