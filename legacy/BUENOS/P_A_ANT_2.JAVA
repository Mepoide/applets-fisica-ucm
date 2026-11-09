import java.awt.*;
import java.applet.*;
import java.awt.event.*;

public class P_a_ant_2 extends Applet implements ActionListener,Runnable{
	
	int hc=4;
	int N=0,Nmax=100;//se refieren al # de part's que caen
	int nmax=20;//se refiere al numero de columnas a llenar por part's en la caja
	int t=0,tmax=100;//se refiere al tiempo....??

	int[] h=new int[nmax];

	CuadroMath2 Caja,Grafica;
	Image caja;
	Image bola;
	TextField hc_val;
	boolean parado=true;
	boolean activo=true;
	Button stop_go,inicia;
	
	int anchura,altura;
	int altoCM,anchoCM;
	int paredx=12;
	int paredy=33;
	int diametro=10;
	
	int y;int ymin;int yant;
	
	Thread jurl;

	

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
		
	
	Caja=new CuadroMath2(0.,anchoCM,0.,altoCM,anchoCM,altoCM,"","",Color.white,false,false);
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
	
	
	jurl=new Thread(this);
	y=altoCM;ymin=0;yant=altoCM;
	
	
	caja=getImage(getDocumentBase(),"caja.gif");	
	bola=getImage(getDocumentBase(),"bolanaranja.gif");
	paint(getGraphics());

	
}

public synchronized void actionPerformed(ActionEvent e){

	if(e.getSource()==inicia){
		
		parado=false;
		stop_go.setLabel("Pausa");
		jurl.start();
		
		
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

public void run(){
	
	
	long starttime=System.currentTimeMillis();	
	
	for(int j=0;j<=diametro;j+=diametro){
	while((y>ymin)&(!parado)){
		
		
		Caja.FG_BG(false);
		Caja.Limpiazona(j+paredx+2,paredy+yant,diametro,diametro);
		Caja.Imagen(bola,j+paredx,paredy+y);
		Caja.FG_BG(true);
		yant=y;
		y-=5;
		
		try{
			starttime+=100;
			jurl.sleep(Math.max(0,starttime-System.currentTimeMillis()));
			synchronized(this) {
            	while (!activo) wait();
            }      	       
        }catch(InterruptedException e){}
		
	}
	y=altoCM-20;
	}
	
}

public void paint(Graphics g){
	Caja.paint(g);
	Caja.Imagen(caja,0,altoCM-50);
	Grafica.paint(g);
	
}

public void stop(){
	
	System.out.println(jurl.isAlive());
	}

}