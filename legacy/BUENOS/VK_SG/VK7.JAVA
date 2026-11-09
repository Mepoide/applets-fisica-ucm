import java.awt.*;
import java.applet.*;
import java.awt.event.*;
import java.text.DecimalFormat;



public class VK7 extends Applet implements ActionListener,Runnable { 


int anchura=300,altura=600;

    int nx=410,ny=290,size,xcoor,ycoor;
    
    double escalax,escalay;
    int box=12;
    int a=34,b=24;
       
    double f=0.5,fvel=0.8;
    int ix,iy,k,j,x,y,rx,ry,t,t1;
    int n1[][]= new int [nx+1][ny+1];
    int n2[][]= new int[nx+1][ny+1];
    int dosk[]= new int [7];
    int occ;
    long i,num1;
    
    
    int tam=210;
    int ixpN=150;
	int iypN=250;
	int ixpS=ixpN;
	int iypS=iypN-1;
	int bpN=ixpN+tam;
	int bpS=ixpS+tam;
    
    double ux[][]=new double[a][b];
    double uy[][]=new double[a][b];
    int densidadsuma[][]=new int[a][b];
    
    
    int coll1[]=new int[129];
    int coll2[]=new int[129];
    
    int collpN[]=new int[129];
    int collxpN[]=new int[129];
    int collbpN[]=new int[129];
    int collpS[]=new int[129];
    int collxpS[]=new int[129];
    int collbpS[]=new int[129];
    
    
    int dens[]=new int[129];
    
    int vx[]=new int[129];
    int vy[]=new int[129];
    
 

CuadroMath3 container;


Button calc,pausa;
TextField fvel_val;

Thread runner;

int TLIMITE=1500;
int tiempo,rango=200;

boolean corriendo=false,activo=true;




public void init() {

    Font fuente=new Font("SansSerif",Font.PLAIN,12);
    setFont(fuente); 
    setBackground(Color.white);


    anchura=(getSize().width-20)/2;
    altura=(getSize().height-80);  

    container=new CuadroMath3(0,nx,0,ny,anchura,altura,"","",Color.white,false,false);
    

    

    calc=new Button("Inicia");
    pausa=new Button("Pausa ");
    
    
    fvel_val=new TextField(""+ fvel,10);


    calc.addActionListener(this);
    pausa.addActionListener(this);
        
    
    Panel norte=new Panel();
    
    norte.add(new Label("   velocidad ( 0 < n < 1 ) : "));norte.add(fvel_val);
    

    Panel centro=new Panel();
    centro.add(container);
    
    
    Panel sur=new Panel();
    sur.add(calc); sur.add(pausa); 
    
    setLayout(new BorderLayout());
    
    add("North",norte );
    add("Center",centro);
    add("South",sur);
     
    tiempo=0;
    
    
    fill_vector();
    colision();
	inicializa();
	
    paint(getGraphics());
    
    escalax=(double)anchura/nx;
    escalay=(double)altura/ny;
	
	
    runner = new Thread(this,"Tarea1");  
}



public void run() {
    Thread me = Thread.currentThread();
        while (runner == me) {
    try {
        runner.sleep(100);
        synchronized(this) {
        while(!activo) wait();
    }
    } catch(InterruptedException e){}
    
    if(tiempo<TLIMITE){movimiento();}
    }
    
}

public void paint(Graphics g) {
    container.paint(g);
    
    DibujaParticulas();
}


public synchronized void actionPerformed(ActionEvent e) {
    if(e.getSource()==calc) {
        
        LeeCampos();
        inicializa();
        
        if(!corriendo) {
            runner.start();
            corriendo=true;
        }
        tiempo=0;
        
        
        
        
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
        
        fvel=Double.valueOf(fvel_val.getText()).doubleValue();
        
    } catch(NumberFormatException exc) {}
    
    if(fvel<0 || fvel>1){fvel=0.7;fvel_val.setText(""+fvel);}
    
} 


public void movimiento() {
    
    for(int time=1;time<=2;time++){
            iteration1();
            iteration2();
    
    
    //inyección iterativa de FLUJO:
    double raux=Math.random();
	for(ix=0;ix<=nx-1;ix++){
		if(raux<=fvel){n1[ix][ny-1]=97;}
		raux=Math.random();
	}       

        tiempo+=2;
        
    //Calculando el campo de velocidades...
    
    for(j=0;j<a;j++){
    for(k=0;k<b;k++){
    	ux[j][k]=0;    
    	uy[j][k]=0;
    	for(int jj=0;jj<box;jj++){
    	for(int kk=0;kk<box;kk++){	
    		densidadsuma[j][k]+=dens[n1[j*box+jj][k*box+kk]];
    		ux[j][k]+=vx[n1[j*box+jj][k*box+kk]];		
		    uy[j][k]+=vy[n1[j*box+jj][k*box+kk]];	
    	
    	}	
    	}
    	
    	ux[j][k]/=densidadsuma[j][k];
    	uy[j][k]/=densidadsuma[j][k];
    	
    	//Reescalando
    	ux[j][k]*=1000000;
    	uy[j][k]*=1000000;
    	
    	
    }	
    }
  
    }


    

    DibujaParticulas();

}

void DibujaParticulas() {

    

    container.FG_BG(false);
    container.Limpia();
    
            
    int iix,iiy;
    double x,y,xp,yp,xO,yO,xpO,xF,yF,xpF,R;
    double K,xmax,ymax,xc,yc;
    Color bolitas;
    
    Color g5 = new Color((short)(255*5/6),(short)(255*5/6),(short)(255*5/6));
    Color g4 = new Color((short)(255*4/6),(short)(255*4/6),(short)(255*4/6));
    Color g3 = new Color((short)(255*3/6),(short)(255*3/6),(short)(255*3/6));
    Color g2 = new Color((short)(255*2/6),(short)(255*2/6),(short)(255*2/6));
    Color g1 = new Color((short)(255*1/6),(short)(255*1/6),(short)(255*1/6));






    for(iix=0;iix<=nx-1;iix++){
        for(iiy=0;iiy<=ny-1;iiy++){
            
            x=((iix-iiy/2.0)*nx)/(nx-1.0);
            y=(iiy*ny)/(ny-1.0)+1;              

        
            xp=1+(x+nx)%nx;
            
            
            bolitas=Color.white;

            switch(dens[n1[iix][iiy]]) {
            	case 1: bolitas=g5;
            			break;
            	case 2: bolitas=g4;
            			break;
            	case 3: bolitas=g3;
            			break;
            	case 4: bolitas=g2;
            			break;
            	case 5: bolitas=g1;
            			break;
              
            }
             
            if (dens[n1[iix][iiy]]>=6)  bolitas=Color.black;
            
            if(((iiy==iypN)&&(iix>=ixpN)&&(iix<=(bpN)))||((iiy==iypS)&&(iix>=ixpS)&&(iix<=(bpS)))){
            	
            	bolitas=Color.green;
            }
            
                container.setCol(bolitas);
    //            container.Recuadro((int)Math.floor(xp*escalax),(int)(altura-Math.floor(escalay*y)),1,1);
                
				
        }
    }
    
    container.setCol(Color.red);
    //DIbujando el campo de velocidades....
    
    for(j=0;j<a;j++){
    for(k=0;k<b;k++){
    	
    	
    	xO=(j+0.7)*box-(k+0.7)*box/2.0;
        yO=(k+0.7)*box;              
		
        R=Math.sqrt(Math.pow(ux[j][k],2)+Math.pow(uy[j][k],2));
        if(R>=9){
        	K=R/9;
        	ux[j][k]/=K;
        	uy[j][k]/=K;
        }
        
        xF=xO+ux[j][k];
        yF=yO+uy[j][k];
        
                
        xpO=(xO+nx)%nx;
        xpF=(xF+nx)%nx;
        	
    	    
    if(!(((xO<=0)&&(xF>=0))||((xO>=0)&&(xF<=0))||((yO<=ny)&&(yF>=ny))||((yO>=0)&&(yF<=0)))){
    	
    	container.Recta(xpO,yO,xpF,yF);
    	container.Recuadro((int)Math.floor(xpF*escalax),(int)(altura-Math.floor(escalay*yF)),1,1);
    }	
	
	}
	}

    container.FG_BG(true);
  	
}




int inicializa() {
    
      
    for(ix=0;ix<=nx-1;ix++){
        for(iy=0;iy<=ny-1;iy++){
            n1[ix][iy]=0;
        }
    }
    num1 =(int)(Math.rint(f*Math.round(nx)*Math.round(ny)*Math.round(7)));
    for(i=1;i<=num1;i++){
        do{
            rx=(int)(nx*Math.random());ry=(int)(ny* Math.random());occ=(int)(7*Math.random());
            occ=dosk[occ];
        } while (((occ) & (n1[rx][ry]))!=0); 
        n1[rx][ry]=occ;
     
    }
	
	for(j=0;j<a;j++){
	for(k=0;k<b;k++){
		ux[j][k]=0;
		uy[j][k]=0;
		densidadsuma[j][k]=0;	
	}
	}
	
	//Comienza el FLUJO
	double raux=Math.random();
	for(ix=0;ix<=nx-1;ix++){
		
		if(raux<=fvel){n1[ix][ny-1]=97;}
		raux=Math.random();
	}
	
	
	//NODOS DE PARED (todos a 2^0)
	
	//PARED NORTE(comienza en ixpN, se sitúa en iypN)
	
	
	for(int ix=ixpN;ix<=(bpN);ix++){
		
		n1[ix][iypN]=1;	
		
	}
	
	//PARED SUR (comienza en ixpS=ixpN, se sitúa en iypS=iypN-1)
	
	
	for(int ix=ixpS;ix<=(bpS);ix++){
		
		n1[ix][iypS]=1;	
		
	}
	
	
	/*  for(ix=0;ix<=nx-1;ix++){
       	 for(iy=0;iy<=ny-1;iy++){
            n1[ix][iy]=0;
            n1[10][10]=127;n1[29][29]=127;n1[10][10]=127;
       	 }
    } 
    
    */
    
    /*		//HUECO CENTRAL 
     
     
     	for(ix=0;ix<=(nx-1);ix++){
        	for(iy=0;iy<=(ny-1);iy++){
        	    if((Math.pow((ix-iy/2-(xcoor-ycoor/2)),2)+3/2*Math.pow((iy-ycoor),2))<radius){ n1[ix][iy]=0;}
        	}
    	}
    	

	*/

	/*		//MEDIDA DE LA DENSIDAD
	 
	 
		density[0]=0.0; double nodos=0;
        for(ix=2*nx/3;ix<=(nx-1);ix++){
        for(iy=ny/2-10;iy<=ny/2+10;iy++){
            if((Math.pow((ix-iy/2-(xcoor-ycoor/2)),2)+3/2*Math.pow((iy-ycoor),2))<90){ nodos+=1;density[0]=density[0]+
            n1[ix][iy]];}
        }
    	}
    	density[0]/=(7.0*nodos);
    */
    
    
    
    
    rango=200;

    return 0;
    

}


int fill_vector(){
    
    dosk[0]=1;
    for(k=1;k<=6;k++){dosk[k]=2*dosk[k-1];}
    
    for(j=0;j<=128;j++){
        dens[j]=0;
        for(k=0;k<=6;k++){ dens[j]=dens[j] + (j & dosk[k])/ dosk[k];}
    }

	
	for(j=0;j<=128;j++){
		
		
		vx[j]=(j & dosk[1])/dosk[1]+(1/2)*(j & dosk[2])/dosk[2]-(1/2)*(j & dosk[3])/dosk[3]-(j & dosk[4])/ dosk[4]-(1/2)*(j & dosk[5])/ dosk[5]+(1/2)*(j & dosk[6])/ dosk[6];
    	vy[j]=(j & dosk[2])/dosk[2]+(j & dosk[3])/dosk[3]-(j & dosk[5])/dosk[5]-(j & dosk[6])/ dosk[6];
		vy[j]*=Math.sqrt(3)/2;   	
	}
    
    return 0;
}

int colision(){
    for(k=0;k<=127;k++){ coll1[k]=k;}
        coll1[3]=68; coll1[68]=3; coll1[5]=10; coll1[10]=5;
        coll1[9]=20; coll1[20]=9; coll1[17]=40;coll1[40]=17;
        coll1[33]=80;coll1[80]=33;coll1[65]=34;coll1[34]=65;
        coll1[42]=84;coll1[84]=42;
        
        //COLISIONES DUALES

        coll1[127-3]=127-68; coll1[127-68]=127-3;
        coll1[127-5]=127-10; coll1[127-10]=127-5;
        coll1[127-9]=127-20; coll1[127-20]=127-9;
        coll1[127-17]=127-40;coll1[127-40]=127-17;
        coll1[127-33]=127-80;coll1[127-80]=127-33;
        coll1[127-65]=127-34;coll1[127-34]=127-65;
        coll1[127-42]=127-84;coll1[127-84]=127-42;
        
    for(k=0;k<=127;k++){coll2[k]=coll1[k];}
        coll1[36]=18;coll1[72]=36;coll1[18]=72;
        coll1[37]=19;coll1[73]=37;coll1[19]=73;
        coll1[127-36]=127-18;coll1[127-72]=127-36;coll1[127-18]=127-72;
        coll1[127-37]=127-19;coll1[127-73]=127-37;coll1[127-19]=127-73;
    
        coll2[36]=72;coll2[72]=18;coll2[18]=36;
        coll2[37]=73;coll2[73]=19;coll2[19]=37;
        coll2[127-36]=127-72;coll2[127-72]=127-18;coll2[127-18]=127-36;
        coll2[127-37]=127-73;coll2[127-73]=127-19;coll2[127-19]=127-37;
    
    //COLISIONES ESPECIALES
    
    //PARED NORTE
    
    //Nodos internos
    for(k=0;k<=127;k++){collpN[k]=k;}
    	collpN[65]=5;collpN[33]=9; //(1)
    	collpN[97]=13; //(2)
    
    //Borde izquierdo
    for(k=0;k<=127;k++){collxpN[k]=k;}
    	collxpN[65]=5;collxpN[33]=9;//las usuales 
    	collxpN[97]=13; 
    	collxpN[3]=17;//Las usuales combinadas con una rasante izq (canal 3)
    	collxpN[35]=25;
    	collxpN[67]=21;collxpN[99]=29;
    	collxpN[5]=9;//Las anteriores combinadas con una en retroceso (canal 5)
    	collxpN[37]=13;collxpN[69]=13;
    	collxpN[7]=25;collxpN[39]=29;collxpN[101]=29;
    	collxpN[71]=29;collxpN[103]=61;
    	
    //Borde derecho
    for(k=0;k<=127;k++){collbpN[k]=k;}
    	collbpN[65]=5;collbpN[33]=9;//las usuales 
    	collbpN[97]=13; 
    	collbpN[17]=3;//las usuales combinadas con una rasante derecha (canal 17)
		collbpN[49]=11;collbpN[81]=7;collbpN[113]=15; 
		
		
		   
    //PARED SUR
    
    //Nodos internos
    for(k=0;k<=127;k++){collpS[k]=k;}
    	collpS[5]=65;collpS[9]=33; //(1)
    	collpS[13]=97;
    
    //Borde izquierdo
    for(k=0;k<=127;k++){collxpS[k]=k;}
    	collxpS[5]=65;collxpS[9]=33;//las usuales 
    	collxpS[13]=97; 
    	collxpS[3]=17;//Las usuales combinadas con una rasante izq (canal 3)
    	collxpS[11]=49;
    	collxpS[7]=81;collxpS[15]=113;
    	
    	
    //Borde derecho
    for(k=0;k<=127;k++){collbpS[k]=k;}
    	collbpS[5]=65;collbpS[9]=33;//las usuales 
    	collbpS[13]=97; 
    	collbpS[17]=3;//las usuales combinadas con una rasante derecha (canal 17)
		collbpS[21]=67;collbpS[25]=49;
		collbpS[29]=99;
		collbpS[33]=65;//las anteriores combinadas con una en retroceso (canal 33)
    	collbpS[37]=97;collbpS[41]=97;collbpS[45]=97;
    	collbpS[49]=67;collbpS[57]=71;
    	collbpS[61]=103;collbpS[53]=99;
    
    return 0;
}


int iteration1(){
    int ix,iy,im1,jm1,in1,jn1;
    int aux=0;

    for(ix=0;ix<=(nx-1);ix++){
        for(iy=1;iy<=(ny-1);iy++){
            if(!(((iy==iypN)&&(ix>=ixpN)&&(ix<=(bpN)))||((iy==iypS)&&(ix>=ixpS)&&(ix<=(bpS))))){
            
            	im1=(ix+1)%nx; in1=(ix-1+nx)%nx;
            	jm1=iy+1; jn1=iy-1;
            	aux=(n1[ix][iy]&dosk[0])+(n1[im1][iy]&dosk[4])+(n1[im1][jm1]&dosk[5])+(n1[ix][jm1]&dosk[6])+(n1[in1][iy]&dosk[1])+(n1[in1][jn1]&dosk[2])+(n1[ix][jn1]&dosk[3]);
            	n2[ix][iy]=coll1[aux];
            	
        	}
        }
    }
    //COLISIONES ESPECIALES 
    
    //PARED NORTE
    int auxN,auxxpN,auxbpN;
    jm1=iypN+1; jn1=iypN-1;
    im1=(ixpN+1)%nx; in1=(ixpN-1)%nx;
    
    
    //Borde izquierdo
    auxxpN=(n1[ixpN][iypN]&dosk[0])+(n1[im1][jm1]&dosk[5])+(n1[ixpN][jm1]&dosk[6])+(n1[in1][iypN]&dosk[1])+(n1[in1][jn1]&dosk[2]);
    n2[ixpN][iypN]=collxpN[auxxpN];
    
    //Nodos internos
    for(ix=ixpN+1;ix<=(bpN-1);ix++){
    	im1=(ix+1)%nx; in1=(ix-1+nx)%nx;
        auxN=(n1[ix][iypN]&dosk[0])+(n1[im1][jm1]&dosk[5])+(n1[ix][jm1]&dosk[6]);    	   	
   		n2[ix][iypN]=collpN[auxN];
   	}
   	
    //Borde derecho
    
    im1=(bpN+1)%nx; in1=(bpN-1)%nx;
    auxbpN=(n1[bpN][iypN]&dosk[0])+(n1[im1][jm1]&dosk[5])+(n1[bpN][jm1]&dosk[6])+(n1[im1][iypN]&dosk[4]);
    n2[bpN][iypN]=collbpN[auxbpN];
    
    
    //PARED SUR
    int auxS,auxxpS,auxbpS;
    jm1=iypS+1; jn1=iypS-1;
    im1=(ixpS+1)%nx; in1=(ixpS-1)%nx;
    
    
    //Borde izquierdo
    auxxpS=(n1[ixpS][iypS]&dosk[0])+(n1[ixpS][jn1]&dosk[3])+(n1[in1][jn1]&dosk[2])+(n1[in1][iypS]&dosk[1]);
    n2[ixpS][iypS]=collxpS[auxxpS];
    
    //Nodos internos
    for(ix=ixpS;ix<=(bpS);ix++){
    	im1=(ix+1)%nx; in1=(ix-1+nx)%nx;
        auxS=(n1[ix][iypS]&dosk[0])+(n1[ix][jn1]&dosk[3])+(n1[in1][jn1]&dosk[2]);    	   	
   		n2[ix][iypS]=collpS[auxS];
   	}
    
    
    //Borde derecho
    im1=(bpS+1)%nx; in1=(bpS-1)%nx;
    auxbpS=(n1[bpS][iypS]&dosk[0])+(n1[bpS][jn1]&dosk[3])+(n1[in1][jn1]&dosk[2])+(n1[im1][jm1]&dosk[5])+(n1[im1][iypS]&dosk[4]);
    n2[bpS][iypS]=collbpS[auxbpS];
    

    return 0;
}

int iteration2(){
    int ix,iy,im1,jm1,in1,jn1;
    int aux=0;

    for(ix=0;ix<=(nx-1);ix++){
        for(iy=1;iy<=(ny-1);iy++){
        	if(!(((iy==iypN)&&(ix>=ixpN)&&(ix<=(bpN)))||((iy==iypS)&&(ix>=ixpS)&&(ix<=(bpS))))){
            
            	im1=(ix+1)%nx; in1=(ix-1+nx)%nx;
            	jm1=iy+1; jn1=iy-1;
            	aux=(n2[ix][iy]&dosk[0])+(n2[im1][iy]&dosk[4])+(n2[im1][jm1]&dosk[5])+(n2[ix][jm1]&dosk[6])+(n2[in1][iy]&dosk[1])+(n2[in1][jn1]&dosk[2])+(n2[ix][jn1]&dosk[3]);
            	n1[ix][iy]=coll2[aux];
        	}
        }
    }
    
    //COLISIONES ESPECIALES 
    
    //PARED NORTE
    int auxN,auxxpN,auxbpN;
    jm1=iypN+1; jn1=iypN-1;
    im1=(ixpN+1)%nx; in1=(ixpN-1)%nx;
    
    
    //Borde izquierdo
    auxxpN=(n1[ixpN][iypN]&dosk[0])+(n1[im1][jm1]&dosk[5])+(n1[ixpN][jm1]&dosk[6])+(n1[in1][iypN]&dosk[1])+(n1[in1][jn1]&dosk[2]);
    n2[ixpN][iypN]=collxpN[auxxpN];
    
    //Nodos internos
    for(ix=ixpN+1;ix<=(bpN-1);ix++){
    	im1=(ix+1)%nx; in1=(ix-1+nx)%nx;
        auxN=(n1[ix][iypN]&dosk[0])+(n1[im1][jm1]&dosk[5])+(n1[ix][jm1]&dosk[6]);    	   	
   		n2[ix][iypN]=collpN[auxN];
   	}
   	
    //Borde derecho
    
    im1=(bpN+1)%nx; in1=(bpN-1)%nx;
    auxbpN=(n1[bpN][iypN]&dosk[0])+(n1[im1][jm1]&dosk[5])+(n1[bpN][jm1]&dosk[6])+(n1[im1][iypN]&dosk[4]);
    n2[bpN][iypN]=collbpN[auxbpN];
    
    
    //PARED SUR
    int auxS,auxxpS,auxbpS;
    jm1=iypS+1; jn1=iypS-1;
    im1=(ixpS+1)%nx; in1=(ixpS-1)%nx;
    
    
    //Borde izquierdo
    auxxpS=(n1[ixpS][iypS]&dosk[0])+(n1[ixpS][jn1]&dosk[3])+(n1[in1][jn1]&dosk[2])+(n1[in1][iypS]&dosk[1]);
    n2[ixpS][iypS]=collxpS[auxxpS];
    
    //Nodos internos
    for(ix=ixpS;ix<=(bpS);ix++){
    	im1=(ix+1)%nx; in1=(ix-1+nx)%nx;
        auxS=(n1[ix][iypS]&dosk[0])+(n1[ix][jn1]&dosk[3])+(n1[in1][jn1]&dosk[2]);    	   	
   		n2[ix][iypS]=collpS[auxS];
   	}
    
    
    //Borde derecho
    im1=(bpS+1)%nx; in1=(bpS-1)%nx;
    auxbpS=(n1[bpS][iypS]&dosk[0])+(n1[bpS][jn1]&dosk[3])+(n1[in1][jn1]&dosk[2])+(n1[im1][jm1]&dosk[5])+(n1[im1][iypS]&dosk[4]);
    n2[bpS][iypS]=collbpS[auxbpS];

    return 0;
}


}
