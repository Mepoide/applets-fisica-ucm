import java.awt.*;
import java.awt.event.*;
import java.text.DecimalFormat;


public class CuadroMath extends Canvas implements MouseListener {
	double xmin,xmax;
	double ymin,ymax;
	double escalax,escalay;
	int margenx,margeny;
	int width,height;
	int x,y;
	Graphics g,gbuff;
	Image ibuff;
	Panel pbuff=new Panel();
	boolean creado=false;
	boolean ejes,tipo_ejes;
	boolean primerplano=true;
	double proporcionx,proporciony;
	Color bk;
	Font fuenteold;
	String labelxmin,labelxmed,labelxmax;
	String labelymin,labelymed,labelymax;
	String labelx,labely;
	int longitudpixel=5,longitudpixel2=2;
	DecimalFormat formato;
	int mousex=0,mousey=0,dx=0,dy=0;


	public void paint(Graphics gr) {
		if(creado==false) {
		g=getGraphics();
		creado=true;

		ibuff=createImage(width,height);
		gbuff=ibuff.getGraphics();
		escalaFuente();
		fijaEscalas(xmin,xmax,ymin,ymax); 
		if(ejes) PintaEjes(tipo_ejes);	
		g.drawImage(ibuff,0,0,bk,pbuff);
		}
		else {
			if(ejes) PintaEjes(tipo_ejes);	
		 	g.drawImage(ibuff,0,0,bk,pbuff);
		 }
	}

	//Constructores
	public CuadroMath(double xmin,double xmax,double ymin,double ymax,int width,int height,String labelx,String labely,Color bk,boolean ejes,boolean tipo_ejes) {
		creado=false;
		fuenteold=getFont();
		this.width=width; this.height=height; 
		setBounds(0,0,width,height);
		this.bk=bk;
		setBackground(bk);
		this.ejes=ejes; this.tipo_ejes=tipo_ejes;
		this.xmin=xmin; this.xmax=xmax;
		this.ymin=ymin; this.ymax=ymax;
		this.labelx=labelx; this.labely=labely;
		addMouseListener(this);
		}

	public CuadroMath(double xmin,double xmax,double ymin,double ymax,int width,int height,String labelx,String labely,Color bk) {
		this(xmin,xmax,ymin,ymax,width,height,labelx,labely,bk,true,true);
	}

	public CuadroMath(double xmin,double xmax,double ymin,double ymax,int width,int height,String labelx,String labely) {
		this(xmin,xmax,ymin,ymax,width,height,labelx,labely,Color.white,true,true);
	}

	public CuadroMath(int width,int height,String labelx,String labely) {
		this(0.,1.,0.,1.,width,height,labelx,labely,Color.white,true,true);
	}

	public void Punto(double x,double y) { //Pinta un punto en x,y
		Recta(x,y,x,y);
	}

	public void Circulo(double x,double y,int radio) { 
		int cx,cy;

		if(x>=xmin && x<=xmax && y>=ymin && y<=ymax) {
			cx=(int) Math.floor((x-xmin)*escalax+margenx);
			cy=(int) Math.floor((y-ymin)*escalay+margeny);
		
			gbuff.drawOval(cx-radio,height-cy-radio,2*radio,2*radio);

			if(primerplano) g.drawImage(ibuff,0,0,bk,pbuff);
		}	
	}

	public void CirculoRelleno(double x,double y,int radio) { 
		int cx,cy;

		if(x>=xmin && x<=xmax && y>=ymin && y<=ymax) {
			cx=(int) Math.floor((x-xmin)*escalax+margenx);
			cy=(int) Math.floor((y-ymin)*escalay+margeny);
		
			gbuff.fillOval(cx-radio,height-cy-radio,2*radio,2*radio);
			
			if(primerplano) g.drawImage(ibuff,0,0,bk,pbuff);
		}	
	}

	public void Cuadrado(double x,double y,double x2,double y2) {
		Recta(x,y,x,y2);
		Recta(x,y2,x2,y2);
		Recta(x2,y2,x2,y);
		Recta(x2,y,x,y);
	}

	public void CuadradoRelleno(double x,double y,int w,int h) {
		int cx,cy;

		cx=(int) Math.floor((x-xmin)*escalax)+margenx;
		cy=(int) Math.floor((y-ymin)*escalay)+margeny;
		gbuff.fillRect(cx,height-cy,w,h);
		if(primerplano) g.drawImage(ibuff,0,0,bk,pbuff);
	}

	public void Imagen(Image imagen, double x,double y) {
		int cx,cy;

		cx=(int) Math.floor((x-xmin)*escalax)+margenx;
		cy=(int) Math.floor((y-ymin)*escalay)+margeny;

		gbuff.drawImage(imagen,cx,height-cy,pbuff);
		if(primerplano) g.drawImage(ibuff,0,0,bk,pbuff);
	}	

	public void Recta(double x,double y,double x2,double y2) {
		int cx,cy;
		int cx2,cy2;

		if(x>xmax) x=xmax; if(y>ymax) y=ymax;
		if(x<xmin) x=xmin; if(y<ymin) y=ymin;
		if(x2>xmax) x2=xmax; if(y2>ymax) y2=ymax;
		if(x2<xmin) x2=xmin; if(y2<ymin) y2=ymin;

		cx=(int) Math.floor((x-xmin)*escalax)+margenx;
		cy=(int) Math.floor((y-ymin)*escalay)+margeny;
		cx2=(int) Math.floor((x2-xmin)*escalax)+margenx;
		cy2=(int) Math.floor((y2-ymin)*escalay)+margeny;
		
		gbuff.drawLine(cx,height-cy,cx2,height-cy2);
		if(primerplano) g.drawImage(ibuff,0,0,bk,pbuff);
	}

/*
	public void Recta(double x,double y,double x2,double y2) {
		int cx,cy;
		int cx2,cy2;
		if(x>=xmin && x<=xmax && y>=ymin && y<=ymax) {
				  cx=(int) Math.floor((x-xmin)*escalax)+margenx;
				  cy=(int) Math.floor((y-ymin)*escalay)+margeny;
				  cx2=(int) Math.floor((x2-xmin)*escalax)+margenx;
				  cy2=(int) Math.floor((y2-ymin)*escalay)+margeny;
		
				  gbuff.drawLine(cx,height-cy,cx2,height-cy2);
				  if(primerplano) g.drawImage(ibuff,0,0,bk,pbuff);
		}
	}
*/



	public void SegmentoHorizontal(double x,double y,int pixels) {
		int cx,cy;

		if(x>=xmin && x<=xmax && y>=ymin && y<=ymax) {
				  cx=(int) Math.floor((x-xmin)*escalax)+margenx;
				  cy=(int) Math.floor((y-ymin)*escalay)+margeny;
		
				  gbuff.drawLine(cx-pixels/2,height-cy,cx+pixels/2,height-cy);
				  if(primerplano) g.drawImage(ibuff,0,0,bk,pbuff);
		}
	}

	public void SegmentoVertical(double x,double y,int pixels) {
		int cx,cy;

		if(x>=xmin && x<=xmax && y>=ymin && y<=ymax) {
				  cx=(int) Math.floor((x-xmin)*escalax)+margenx;
				  cy=(int) Math.floor((y-ymin)*escalay)+margeny;
		
				  gbuff.drawLine(cx,height-cy-pixels/2,cx,height-cy+pixels/2);
				  if(primerplano) g.drawImage(ibuff,0,0,bk,pbuff);
		}
	}


	public void Texto(double x,double y,String aux,Color col) {
		int cx,cy;
		cx=(int) Math.floor((x-xmin)*escalax)+margenx;
		cy=(int) Math.floor((y-ymin)*escalay)+margeny;
		setCol(col);
		gbuff.drawString(aux,cx,height-cy);
		if(primerplano) g.drawImage(ibuff,0,0,bk,pbuff);
	}

	public void fijaEscalas(double xmin,double xmax,double ymin,double ymax) {
		int exterior;
		this.xmin=xmin; this.xmax=xmax;
		this.ymin=ymin; this.ymax=ymax;
		escalaFuente();
		FontMetrics fm=gbuff.getFontMetrics();
		if(ejes) {
			//margenx=fm.stringWidth(labely+" ") +maximo(fm.stringWidth(labelymax),fm.stringWidth(labelymed),fm.stringWidth(labelymin))+10;
			margenx=fm.stringWidth(labely+" ")+fm.stringWidth(labelymed)+10;
			exterior=margenx+fm.stringWidth(labelxmax+" ")/2;
			proporcionx=(double)(width-exterior)/(double) width;
			margeny=0+fm.getHeight()+fm.getHeight()+longitudpixel*2;
			exterior=margeny+fm.getHeight()/2+longitudpixel;
			proporciony=(double)(height-exterior)/(double) height;
		}	
		else {
			proporcionx=proporciony=1.;
			margeny=margenx=0;
		}	
		escalax=(double) (width)*proporcionx/(xmax-xmin);
		escalay=(double) (height)*proporciony/(ymax-ymin);
	}

	public Point obtienePos(double x,double y) {
		int cx,cy;
		cx=(int) Math.floor((x-xmin)*escalax);
		cy=(int) Math.floor((y-ymin)*escalay);
		Point c=new Point(cx,cy);
		return c;
	}

	public void Recuadro(int x,int y,int w,int h) {
		gbuff.drawRect(x,y,w,h);
		if(primerplano) g.drawImage(ibuff,0,0,bk,pbuff);
	}
	double convierteX(int longitud) {
		return (double) longitud/escalax;
	}

	double convierteY(int longitud) {
		return (double) longitud/escalay;
	}

	public void Limpia() {
		Limpia(ejes,tipo_ejes);
	}
	
	public void Limpia(boolean ejes,boolean cerrado) {
		gbuff.clearRect(0,0,width+1,height+1);
		setCol(Color.black);
		if(ejes) {
			PintaEjes(cerrado);
		}
		if(primerplano) Muestra(); //g.drawImage(ibuff,0,0,bk,pbuff);
	}

	public void setCol(Color col) {
		gbuff.setColor(col);
	}

	public void PintaEjes(boolean cerrado) {

			if(cerrado) {
			setCol(Color.black); 
			Cuadrado(xmin,ymin,xmax,ymax);
		}
			else {
				setCol(Color.black); 
				Recta(xmin,0,xmax,0);
				Recta(0,ymin,0,ymax);
			}
			escalaFuente();
		 	FontMetrics fm=gbuff.getFontMetrics();
			
			if((ymin<=0 && ymax>=0) || cerrado) {
				setCol(Color.black); 
			  SegmentoVertical(xmin,ymin,longitudpixel);
				  SegmentoVertical((3*xmin+xmax)/4,ymin,longitudpixel2);
			  SegmentoVertical((xmin+xmax)/2,ymin,longitudpixel);
				  SegmentoVertical((xmin+3*xmax)/4,ymin,longitudpixel2);
			  SegmentoVertical(xmax,ymin,longitudpixel);

			  // Etiquetas eje x
			  double ejexdx,ejexdy;
			  ejexdy=convierteY(fm.getHeight()+longitudpixel/2);
			  ejexdx=convierteX(fm.stringWidth(labelxmin))/2;
				setCol(Color.black); 
			  Texto(xmin-ejexdx,ymin-ejexdy,labelxmin,Color.black);
			  ejexdx=convierteX(fm.stringWidth(labelxmed))/2;
			  Texto((xmin+xmax)/2-ejexdx,ymin-ejexdy,labelxmed,Color.black);
			  ejexdx=convierteX(fm.stringWidth(labelxmax))/2;
			  Texto(xmax-ejexdx,ymin-ejexdy,labelxmax,Color.black);
			  double shift_label=convierteX(fm.stringWidth(labelx))/2;
			  Texto((xmax+xmin)/2-shift_label,ymin-2*ejexdy,labelx,Color.black);
			}
			if((xmin<=0 && xmax>=0) || cerrado) {
			  setCol(Color.black);
			  SegmentoHorizontal(xmin,ymin,longitudpixel);
				  SegmentoHorizontal(xmin,(3*ymin+ymax)/4,longitudpixel2);
			  SegmentoHorizontal(xmin,(ymin+ymax)/2,longitudpixel);
				  SegmentoHorizontal(xmin,(ymin+3*ymax)/4,longitudpixel2);
			  SegmentoHorizontal(xmin,ymax,longitudpixel);

			  // Etiquetas eje y
			  double ejeydx,ejeydy;
			  int descent=fm.getDescent();
			  setCol(Color.black);
			  ejeydy=convierteY(fm.getHeight()/2-descent);
			  ejeydx=convierteX(fm.stringWidth(labelymin+"."));
			  Texto(xmin-ejeydx,ymin-ejeydy,labelymin,Color.black);
			  ejeydx=convierteX(fm.stringWidth(labelymax+"."));
			  Texto(xmin-ejeydx,ymax-ejeydy,labelymax,Color.black);
			  ejeydx=convierteX(fm.stringWidth(labelymed+"."));
			  Texto(xmin-ejeydx,(ymin+ymax)/2-ejeydy,labelymed,Color.black);
			  double shift_label=convierteX(fm.stringWidth(labely+" "));
			  Texto(xmin-ejeydx-shift_label,(ymin+ymax)/2-ejeydy,labely,Color.black);
			}


	}

	void escalaFuente() {
		Font fuente=new Font("SansSerif",Font.PLAIN,(int)Math.sqrt(width/2));
		gbuff.setFont(fuente);
		double xmed=(xmin+xmax)/2;
		double ymed=(ymin+ymax)/2;

		if(ymin==Math.floor(ymin) && ymed==Math.floor(ymed) && ymax==Math.floor(ymax)) {  
	  		labelymin=String.valueOf((int)Math.floor(ymin));
	  		labelymed=String.valueOf((int)Math.floor(ymed));
	  		labelymax=String.valueOf((int)Math.floor(ymax));
		}		  
		else {
	  		labelymin=String.valueOf(ymin);
		  	labelymax=String.valueOf(ymax);
		  	labelymed=String.valueOf(ymed);
		}

		if(xmin==Math.floor(xmin) && xmed==Math.floor(xmed) && xmax==Math.floor(xmax)) {  
	  		labelxmin=String.valueOf((int)Math.floor(xmin));	  		labelxmed=String.valueOf((int)Math.floor(xmed));
	  		labelxmax=String.valueOf((int)Math.floor(xmax));
		}		  
		else {	
			labelxmin=String.valueOf(xmin);
			labelxmax=String.valueOf(xmax);
			labelxmed=String.valueOf(xmed);
		}
	}
	
	int maximo(int a,int b,int c) {
		int maximo;
		maximo=Math.max(a,b);
		return Math.max(maximo,c);
	}
	
	public void FG_BG(boolean pp) {
		primerplano=pp;
		if(pp) Muestra();
	}

	public void Muestra() {
		g.drawImage(ibuff,0,0,bk,pbuff);
	}

	public void Muestra(Image imagen) {
		g.drawImage(imagen,0,0,bk,pbuff);
	}

	public void setImg(Image imagen) {
		ibuff=imagen;
	}	
	public Image getImg() {
		return ibuff;
	}

	public void creaDuplicado() {
		VentanaAuxiliar aux=new VentanaAuxiliar(width,height,"Duplicado",ibuff);
	}

	public void mouseClicked(MouseEvent e ){
		if(e.getModifiers()==e.BUTTON3_MASK)
			creaDuplicado();
	}

  	public void mouseEntered(MouseEvent e){;} 
  	public void mouseExited(MouseEvent e){;}
  	public void mouseReleased(MouseEvent e) {
		int mx2,my2;

  		mx2=e.getX(); my2=e.getY();
		dx=Math.abs(mx2-mousex); dy=Math.abs(my2-mousey);
		if(mx2<mousex) mousex=mx2; if(my2<mousey) mousey=my2;
	} 
  	public void mousePressed(MouseEvent e){
  		mousex=e.getX();
  		mousey=e.getY();
	}	 

}
