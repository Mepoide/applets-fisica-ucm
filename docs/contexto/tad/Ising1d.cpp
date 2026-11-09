//---------------------------------------------------------------------------

#include <vcl.h>
#include <math.h>
#include <fstream.h>
#include <iostream.h>
#pragma hdrstop

//---------------------------------------------------------------------------

#pragma argsused
int main(int argc, char* argv[])
{
        int N=100;
        int s[100];
        int b=1;
        int K=0.1;
        int Eant,E;
        int S=0,SiSj=0;
        int r,mem;

        //Configuración inicial
        for(int i=0;i<N;i+=2){
                s[i]=+1;
        }
        for(int j=1;j<N;j+=2){
                s[j]=-1;
        }

        for(int k=0;k<=200;k++){

              //Cálculo de la energía
              S=0;SiSj=0;
              for(int i=0;i<N;i++){S+=s[i];}
              SiSj+=s[0]*s[N-1]+s[0]*s[1];
              for(int i=1;i<N-1;i++){SiSj+=s[i-1]*s[i]+s[i]*s[i+1];}
              SiSj+=s[N-2]*s[N-1]+s[N-1]*s[0];
              Eant=b*S+K*SiSj;
              cout<<"Iteración:"<<k<<" "<<"Energía:"<<Eant<<" "<<"Imanación:"<<S<<endl;

              r=random(100);
              s[r]=-s[r];
              mem=r;

              S=0;SiSj=0;
              for(int i=0;i<N;i++){S+=s[i];}
              SiSj+=s[0]*s[N-1]+s[0]*s[1];
              for(int i=1;i<N-1;i++){SiSj+=s[i-1]*s[i]+s[i]*s[i+1];}
              SiSj+=s[N-2]*s[N-1]+s[N-1]*s[0];
              E=b*S+K*SiSj;

              r=random(1000);
              if((E>Eant)&((float)r/1000)>exp(Eant-E)){s[mem]=-s[mem];}



        }
        getchar();

        return 0;
}
//---------------------------------------------------------------------------
