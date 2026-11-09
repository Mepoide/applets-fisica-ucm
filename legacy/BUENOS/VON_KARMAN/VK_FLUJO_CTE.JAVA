import java.awt.*;
import java.applet.*;
import java.awt.event.*;
import java.text.DecimalFormat;



public class VK_flujo_cte extends Applet implements ActionListener,Runnable { 


int anchura=200,altura=200;

    int nx=250,ny=nx,num=5,size,xcoor,ycoor;
    double f = 0.7;
    int ix,iy,k,j,step,x,y,rx,ry,t,t1;
    int n1[][]= new int [nx+1][ny+1];
    int n2[][]= new int[nx+1][ny+1];
    int dosk[]= new int [7];
    int occ;
    long i,num1;
    double px,py,r3,radius;
    
    //double v[][]= new double [7][3];
    
    int coll1[]=new int[129];
    int coll2[]=new int[129];
    int dens[]=new int[129];
    int contx,conty,contr;

CuadroMath3 container;
Image bola;

Button calc,pausa;
TextField num_val,f_val;

Thread runner;

int TLIMITE=170;
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
    
    num_val=new TextField(""+num,10);
    f_val=new TextField(""+ f,10);


    calc.addActionListener(this);
    pausa.addActionListener(this);
        
    
    Panel norte=new Panel();
    
    norte.add(new Label("   densidad ( 0 < n < 1 ) : "));norte.add(f_val);
    

    Panel centro=new Panel();
    centro.add(container);
    
    
    Panel sur=new Panel();
    sur.add(calc); sur.add(pausa); 
    
    setLayout(new BorderLayout());
    
    add("North",norte );
    add("Center",centro);
    add("South",sur);
     
    tiempo=0;
    
    
    contx=(nx-1)/2;conty=(ny-1)/2;contr=10;
    xcoor=(int)((nx)*0.5+((ny)*0.25));
    ycoor=((int)(0.5*(ny)));    


    
    radius=302;
    fill_vector();
    colision();

    paint(getGraphics());

    runner = new Thread(this,"Tarea1");  
}



public void run() {
    Thread me = Thread.currentThread();
        while (runner == me) {
    try {
        runner.sleep(10);
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
        if(!corriendo) {
            runner.start();
            corriendo=true;
        }
        tiempo=0;
        LeeCampos();
        
        
        inicializa();
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
        
        f=Double.valueOf(f_val.getText()).doubleValue();
        
    } catch(NumberFormatException exc) {}
    
    if(f<0 || f>1){f=0.7;f_val.setText(""+f);}
    
} 


public void movimiento() {
    
    for(int time=1;time<=2;time++){
            iteration1();
            iteration2();
    //inyección iterativa de FLUJO:
    for(ix=0;ix<=nx-1;ix++){
		n1[ix][ny-1]=97;
	} 	

    //aquí va todo el código

    /*RIC     double num2;
        num2=0.0;
        for(ix=contx;ix<=contx+contr;ix++){
            for(iy=conty;iy<=conty+contr;iy++){
            num2=num2+dens[n1[ix][iy]];
            }
        }
*/
        tiempo+=2;

        

    /*  //MEDIMOS LA DENSIDAD EN EL CENTRO
     
     	DecimalFormat df2 = new DecimalFormat ("##0.0");
        density[tiempo]=0.0; double nodos=0;

        for(ix=2*nx/3;ix<=(nx-1);ix++){
        for(iy=ny/2-10;iy<=ny/2+10;iy++){
            if((Math.pow((ix-iy/2-(xcoor-ycoor/2)),2)+3/2*Math.pow((iy-ycoor),2))<90){ nodos+=1;density[tiempo]=density[tiempo]+dens[n1[ix][iy]];}
        }
    	}
    density[tiempo]/=(7.0*nodos);
    */
    
    }


    if (tiempo>=rango){rango=(int)(tiempo*1.3);}

    DibujaParticulas();

}

void DibujaParticulas() {

    DecimalFormat df1 = new DecimalFormat ("##0.00");

    container.FG_BG(false);
    container.Limpia();
    
    
    int iix,iiy;
    double x,y,xp,yp;
    double s32,xmax,ymax,xc,yc;
    Color bolitas;
    


    for(iix=0;iix<=nx-1;iix++){
        for(iiy=0;iiy<=ny-1;iiy++){
            
            x=((iix-iiy/2.0)*nx)/(nx-1.0);
            y=(iiy*ny)/(ny-1.0)+1;              

            //xc=nx*(ny-1.0)/4.0/(nx-1.0);
            xp=1+(x+nx)%nx;
            
            
            bolitas=new Color(255,255,255);

            if(dens[n1[iix][iiy]]>=1){bolitas=new Color((int)(255*5/6),(int)(255*5/6),(int)(255*5/6));}
            if(dens[n1[iix][iiy]]>=2){bolitas=new Color((int)(255*4/6),(int)(255*4/6),(int)(255*4/6));}
            if(dens[n1[iix][iiy]]>=3){bolitas=new Color((int)(255*3/6),(int)(255*3/6),(int)(255*3/6));}
            if(dens[n1[iix][iiy]]>=4){bolitas=new Color((int)(255*2/6),(int)(255*2/6),(int)(255*2/6));}
            if(dens[n1[iix][iiy]]>=5){bolitas=new Color((int)(255*1/6),(int)(255*1/6),(int)(255*1/6));}
            if(dens[n1[iix][iiy]]>=6){bolitas=new Color(0,0,0);}
            
                container.setCol(bolitas);
                container.CirculoRelleno(xp,y,2);

        }
    }
// RIC: Dibuja un cuadradito en el centro
    int xx1=126,yy1=170,aa=4;
    container.setCol(Color.red);
    container.Recta(xx1-aa,yy1-aa,xx1+aa,yy1-aa);
    container.Recta(xx1+aa,yy1-aa,xx1+aa,yy1+aa);
    container.Recta(xx1+aa,yy1+aa,xx1-aa,yy1+aa);
    container.Recta(xx1-aa,yy1+aa,xx1-aa,yy1-aa);

    container.FG_BG(true);
    
    
    /*
    	datos.FG_BG(false);
    	datos.Limpia();
        
    	for(int a=2;a<tiempo;a=a+2){
        
        	datos.setCol(Color.blue);
        	datos.Recta(a,density[a],a+2,density[a+2]);
    	}
    	datos.setCol(Color.red);
    
    	datos.FG_BG(true);
    */	
    	
    	
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
	
	//Comienza el FLUJO
	for(ix=0;ix<=nx-1;ix++){
		n1[ix][ny-1]=97;
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
    
    /*
    double r3;
    r3=Math.sqrt(3);
    v[0][1]=0.0;v[0][2]=0.0;
    v[1][1]=1.0;v[2][1]=0.5;v[3][1]=-0.5;
    v[4][1]=-1.0;v[5][1]=-0.5;v[6][1]=0.5;
    v[1][2]=0.0;v[2][2]=r3;v[3][2]=r3;
    v[4][2]=0.0;v[5][2]=-r3;v[6][2]=-r3;
	*/
    dosk[0]=1;
    for(k=1;k<=6;k++){dosk[k]=2*dosk[k-1];}
    
    for(j=0;j<=128;j++){
        dens[j]=0;
        for(k=0;k<=6;k++){ dens[j]=dens[j] + (j & dosk[k])/ dosk[k];}
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
    return 0;
}


int iteration1(){
    int ix,iy,im1,jm1,in1,jn1;
    int aux=0;

    for(ix=0;ix<=(nx-1);ix++){
        for(iy=0;iy<=(ny-1);iy++){
            im1=(ix+1)%nx; in1=(ix-1+nx)%nx;
            jm1=(iy+1)%ny; jn1=(iy-1+ny)%ny;
            aux=(n1[ix][iy]&dosk[0])+(n1[im1][iy]&dosk[4])+(n1[im1][jm1]&dosk[5])+(n1[ix][jm1]&dosk[6])+(n1[in1][iy]&dosk[1])+(n1[in1][jn1]&dosk[2])+(n1[ix][jn1]&dosk[3]);
            n2[ix][iy]=coll1[aux];
        }
    }

    return 0;
}

int iteration2(){
    int ix,iy,im1,jm1,in1,jn1;
    int aux=0;

    for(ix=0;ix<=(nx-1);ix++){
        for(iy=0;iy<=(ny-1);iy++){
            im1=(ix+1)%nx; in1=(ix-1+nx)%nx;
            jm1=(iy+1)%ny; jn1=(iy-1+ny)%ny;
            aux=(n2[ix][iy]&dosk[0])+(n2[im1][iy]&dosk[4])+(n2[im1][jm1]&dosk[5])+(n2[ix][jm1]&dosk[6])+(n2[in1][iy]&dosk[1])+(n2[in1][jn1]&dosk[2])+(n2[ix][jn1]&dosk[3]);
            n1[ix][iy]=coll2[aux];
        }
    }
	
    return 0;
}


}
