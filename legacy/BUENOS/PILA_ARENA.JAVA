import java.awt.*;
import java.applet.*;
import java.awt.event.*;

public class Pila_arena extends Applet implements Runnable,ActionListener{
	
	int hc=3;
	int N=0,Nmax=100;//se refieren al # de part's que caen
	int nmax=12;//se refiere al numero de columnas a llenar por part's en la caja
	int t=0,tmax=100;//se refiere al tiempo....??

	boolean[] I=new boolean[nmax];
	int[] h=new int[nmax];
	int[] y=new int[nmax];
	int[] miny=new int[nmax];
	int[] posx=new int[nmax];
	boolean[] Mov=new boolean[nmax];
	
	int y0;int y0min;

	CuadroMath2 Caja,Grafica;
	Image caja,bola,bola_que_cae;
	TextField hc_val;
	boolean parado=true;
	boolean activo=true;
	boolean first_time=true;
	boolean bolava=false;
	boolean controlpassed=true;
	
	Button stop_go,inicia;
	
	int anchura,altura;
	int altoCM,anchoCM;
	int paredx=8;
	int paredy=28;
	int diametro=10;
	
	
	

	Thread hilo;

public void init(){

	Font fuente=new Font("Sans Serif",Font.PLAIN,12);
	setFont(fuente);
	setBackground(Color.lightGray);
	setLayout(new BorderLayout());
	anchura=getSize().width;
	altura=getSize().height;	
	altoCM=(altura-200);
	anchoCM=(anchura+40)/2;

	Panel norte=new Panel();
	add("North",norte);
	hc_val=new TextField(""+hc,5);
	norte.add(new Label("Altura crítica:"));
	norte.add(hc_val);
		
	
	Caja=new CuadroMath2(0.,anchoCM,0.,altoCM+50,anchoCM,altoCM+50,"","",Color.white,false,false);
	Grafica=new CuadroMath2(0.,tmax,0.,Nmax,anchoCM,altoCM,"tiempo","#",Color.white,true,false);
	Panel centro=new Panel();
	add("Center",centro);
	centro.add(Caja);
	centro.add(Grafica);
	

	Panel sur=new Panel();
	add("South",sur);
	stop_go=new Button("Activa");
	stop_go.addActionListener(this);
	inicia=new Button("Inicia");
	inicia.addActionListener(this);	
	sur.add(inicia);
	sur.add(stop_go);

	caja=getImage(getDocumentBase(),"caja.gif");
	bola=getImage(getDocumentBase(),"bolanaranja.gif");
	bola_que_cae=getImage(getDocumentBase(),"bolaazul.gif");	
	paint(getGraphics());

	
	hilo=new Thread(this);

}

public synchronized void actionPerformed(ActionEvent e){

	if(e.getSource()==inicia){
		
		if(first_time){
			parado=false;
			stop_go.setLabel("Pausa");
			for(int m=0;m<nmax;m++){
				I[m]=false;
				Mov[m]=false;
				h[m]=0;
				y[m]=0;
				miny[m]=0;
			}
			bolava=true;
			I[0]=true;
			y0min=(h[0]+1)*diametro;
			y0=altoCM+50;
			hilo.start();
			
		}
		
	
		
	}
	if(e.getSource()==stop_go){
		
		activo=!activo;
		if(!activo) stop_go.setLabel("Activa");
		if(activo){
			stop_go.setLabel("Pausa");
			notify();
		}
		
	
	}
}


public void paint(Graphics g){
	Caja.paint(g);
	Caja.Imagen(caja,0,altoCM+50);
	Grafica.paint(g);
	
}

public void run(){

	for(int j=1;j<=300;j++){
	
	for(int n=0;n<nmax-1;n++){
	
		if(I[n]){
			
			if((h[n]-h[n+1])>=hc){
				Mov[n]=true;
				y[n]=diametro*h[n];
				miny[n]=(h[n+1]+1)*diametro;
				posx[n]=paredx+n*diametro;
				Caja.FG_BG(false);
				Caja.Limpiazona(posx[n]+2,paredy+y[n]-2,diametro,diametro);
				Caja.FG_BG(true);
				I[n+1]=true;
				h[n]--;h[n+1]++;
				
			if(n==0){y0min-=diametro;}	
				
			}else{I[n]=false;}
		
				
			
		}
	}
	
	if(h[nmax-1]>=hc){
		
		Caja.Imagen(bola_que_cae,paredx+(nmax-1)*diametro,paredy+h[nmax-1]*diametro);
		Caja.Limpiazona(paredx+2+(nmax-1)*diametro,paredy-2+h[nmax-1]*diametro,diametro,diametro);	
		h[nmax-1]--;
	}
	
	

	while(controlpassed){
		
		controlpassed=false;
	
		if(bolava){
			if(y0>=y0min){
			Caja.FG_BG(false);
			Caja.Limpiazona(paredx+2,paredy+y0+5,diametro,diametro);
			Caja.Imagen(bola,paredx,paredy+y0);
			Caja.FG_BG(true);
			y0-=5;
			
			controlpassed=true;
			
			}else{bolava=false;I[0]=true;}
		}
				
		for(int k=0;k<nmax-1;k++){
		
			if(Mov[k]){
				
			controlpassed=true;
												
				if(y[k]>=miny[k]){
					Caja.FG_BG(false);
					Caja.Limpiazona(posx[k]+diametro+2,paredy+y[k]+5,diametro,diametro);
					Caja.Imagen(bola,posx[k]+diametro,paredy+y[k]);
					Caja.FG_BG(true);
					y[k]-=5;
					
				}else{
					Mov[k]=false;
					if(Mov[k+1]){Caja.Limpiazona(posx[k]+diametro+2,paredy+miny[k]-2,diametro,diametro);}
				}
			
				
			}
			
		}

		long starttime=System.currentTimeMillis();
		try{
			starttime+=15;
			hilo.sleep(Math.max(0,starttime-System.currentTimeMillis()));
			synchronized(this) {while (!activo) wait();}
		}catch(InterruptedException e){}

	}			
			
	
	bolava=true;
	h[0]++;I[0]=true;
	controlpassed=true;
	
	y0min=(h[0]+1)*diametro;
	y0=altoCM+50;
	
	} 	
			
	
for(int f=0;f<nmax;f++){
	
	System.out.println(h[f]);
	
	
}
	
	

}


}



