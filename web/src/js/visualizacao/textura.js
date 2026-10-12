/**
 * @arquivo js/visualizacao/textura.js
 * Camada: Visualização
 * Textura procedural com aparência de satélite (não é foto real).
 */

import { $ } from '../nucleo/utilitarios.js';
import { estadoRender } from './projecao.js';
import { PI } from './tela.js';

/* ---------- Textura procedural (aparência de satélite, NÃO é foto real) ---------- */
function hh(x,y){var n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);}
function vn(x,y){var xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  var a=hh(xi,yi),b=hh(xi+1,yi),c=hh(xi,yi+1),d=hh(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function fbm(x,y){return (.55*vn(x,y)+.3*vn(x*2.1,y*2.1)+.15*vn(x*4.3,y*4.3));}
function sm(a,b,x){var t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
function mix3(c,d,t){c[0]+=(d[0]-c[0])*t;c[1]+=(d[1]-c[1])*t;c[2]+=(d[2]-c[2])*t;}
const DES = [[23,10,10,28,1],[24,45,9,12,1],[33,58,6,11,.65],[41,95,6,16,.8],[27,71,4,6,.55],[-25,132,11,15,.9],[-23,19,8,8,.85],[-22,-69,9,3,.9],[-45,-68,7,4,.5],[35,-112,6,8,.65],[28,-105,5,5,.5],[7,45,6,5,.5],[14,5,3,26,.4],[48,68,5,18,.4],[30,44,5,8,.5]];
const FOR = [[-4,-62,8,13,.9],[0,22,7,11,.9],[0,111,9,24,.8],[5,-75,6,5,.5],[6,-3,3,10,.55],[-25,-50,8,6,.35],[35,-85,8,8,.2],[-38,146,5,6,.2]];
const MTN = [[-20,-70,26,3.2,1],[45,-112,17,5,.85],[32,85,4,16,1.1],[34,92,4,9,.9],[46.5,10,2.2,7,.9],[58,60,10,1.5,.5],[9,39,5,4,.8],[38,-80,8,3,.4],[64,14,7,3.2,.6],[42.5,44,1.6,5.5,.8],[43,80,3,11,.85],[33,-3.5,2,8,.6],[-29,29,4,3,.5],[-30,150,12,2,.4],[-6,35,6,3,.35],[19,-100,3,7,.7],[10,-73,3,3,.5]];
const RAMP = [[0,[203,172,118]],[.22,[178,150,98]],[.42,[139,132,76]],[.62,[88,114,54]],[.82,[46,90,44]],[1,[24,64,34]]];
function ramp(w){for(var i=1;i<RAMP.length;i++){if(w<=RAMP[i][0]){var a=RAMP[i-1],b=RAMP[i],t=(w-a[0])/(b[0]-a[0]);return [a[1][0]+(b[1][0]-a[1][0])*t,a[1][1]+(b[1][1]-a[1][1])*t,a[1][2]+(b[1][2]-a[1][2])*t];}}return RAMP[RAMP.length-1][1].slice();}
function dl(a,b){var d=a-b;while(d>180)d-=360;while(d<-180)d+=360;return d;}
function buildTexture(done,progress){
  var TW=2048,TH=1024,FW=1024,FH=512;
  var fc=document.createElement('canvas');fc.width=FW;fc.height=FH;
  var fx=fc.getContext('2d'),fd=fx.createImageData(FW,FH),fp=fd.data;
  var y=0,rowD=new Array(DES.length),rowF=new Array(FOR.length),rowM=new Array(MTN.length);
  function rowFactors(lat){
    var k;for(k=0;k<DES.length;k++){var q=(lat-DES[k][0])/DES[k][2];rowD[k]=Math.exp(-q*q);}
    for(k=0;k<FOR.length;k++){var q2=(lat-FOR[k][0])/FOR[k][2];rowF[k]=Math.exp(-q2*q2);}
    for(k=0;k<MTN.length;k++){var q3=(lat-MTN[k][0])/MTN[k][2];rowM[k]=Math.exp(-q3*q3);}
  }
  function step(){
    var end=Math.min(FH,y+22);
    for(;y<end;y++){
      var lat=90-(y+.5)*180/FH,a=Math.abs(lat);rowFactors(lat);
      for(var x=0;x<FW;x++){
        var lng=-180+(x+.5)*360/FW,k,g,dg;
        var n=fbm(lng*.09+7,lat*.09+3),n2=fbm(lng*.5,lat*.5);
        var w=.14+.8*Math.exp(-Math.pow(lat/15,2))+.55*Math.exp(-Math.pow((a-47)/13,2));
        var e=0;
        for(k=0;k<DES.length;k++){if(rowD[k]<.02)continue;dg=dl(lng,DES[k][1]);if(Math.abs(dg)>DES[k][3]*2.6)continue;g=dg/DES[k][3];w-=DES[k][4]*rowD[k]*Math.exp(-g*g);}
        for(k=0;k<FOR.length;k++){if(rowF[k]<.02)continue;dg=dl(lng,FOR[k][1]);if(Math.abs(dg)>FOR[k][3]*2.6)continue;g=dg/FOR[k][3];w+=FOR[k][4]*rowF[k]*Math.exp(-g*g);}
        for(k=0;k<MTN.length;k++){if(rowM[k]<.02)continue;dg=dl(lng,MTN[k][1]);if(Math.abs(dg)>MTN[k][3]*2.6)continue;g=dg/MTN[k][3];e+=MTN[k][4]*rowM[k]*Math.exp(-g*g);}
        e*=(.45+1.1*n2);
        w+=(n-.5)*.55;w=Math.max(0,Math.min(1,w));
        var c=ramp(w);
        mix3(c,[40,72,54],sm(50,62,a)*.6);
        mix3(c,[126,130,112],sm(63,73,a)*.8);
        mix3(c,[122,106,92],.8*sm(.2,.7,e));
        var sn=sm(70,84,a)*(.55+(n2-.5));
        /* neve das montanhas em manchas (só onde o ruído fino deixa), não uma mancha única */
        var n3=fbm(lng*2.3+11,lat*2.3+5);
        sn=Math.max(sn,sm(1.3,1.85,e)*sm(.42,.62,n3)*(a>12?1:.3));
        if(lat<-62)sn=Math.max(sn,sm(-62,-66,lat)*1);
        if(lat>59&&lng>-75&&lng<-10)sn=Math.max(sn,.95*sm(59,63,lat));
        mix3(c,[244,247,250],Math.max(0,Math.min(1,sn)));
        var sh=.86+.28*n2;sh=1-(1-sh)*(1-.65*Math.max(0,Math.min(1,sn)));var o=(y*FW+x)*4;
        fp[o]=c[0]*sh;fp[o+1]=c[1]*sh;fp[o+2]=c[2]*sh;fp[o+3]=255;
      }
    }
    if(progress)progress(Math.round(y/FH*100));
    if(y<FH)setTimeout(step,0);else finish();
  }
  function finish(){
    fx.putImageData(fd,0,0);
    var eq=d3.geo.equirectangular().scale(TW/(2*PI)).translate([TW/2,TH/2]).precision(0.2);
    var mk=document.createElement('canvas');mk.width=TW;mk.height=TH;
    var mx=mk.getContext('2d');mx.fillStyle='#000';mx.fillRect(0,0,TW,TH);
    var pth=d3.geo.path().projection(eq).context(mx);
    mx.fillStyle='#fff';mx.beginPath();estadoRender.feats.forEach(function(f){pth(f);});mx.fill();
    var hasAnt=estadoRender.feats.some(function(f){return f.id==='ATA';});
    if(!hasAnt)mx.fillRect(0,TH*(90+72)/180,TW,TH);
    var tc=document.createElement('canvas');tc.width=TW;tc.height=TH;
    var tx=tc.getContext('2d');
    var og=tx.createLinearGradient(0,0,0,TH);
    og.addColorStop(0,'#8fb0c4');og.addColorStop(.07,'#1b4a78');og.addColorStop(.3,'#0c3a72');og.addColorStop(.5,'#0a4a86');og.addColorStop(.7,'#0c3a72');og.addColorStop(.93,'#1b4a78');og.addColorStop(1,'#8fb0c4');
    tx.fillStyle=og;tx.fillRect(0,0,TW,TH);
    /* plataforma continental (águas rasas) */
    var pt=d3.geo.path().projection(eq).context(tx);
    tx.save();tx.translate(-6000,0);tx.shadowOffsetX=6000;
    tx.shadowColor='rgba(70,175,195,.55)';tx.shadowBlur=26;tx.fillStyle='#000';tx.beginPath();estadoRender.feats.forEach(function(f){pt(f);});tx.fill();
    tx.shadowColor='rgba(120,215,215,.5)';tx.shadowBlur=9;tx.beginPath();estadoRender.feats.forEach(function(f){pt(f);});tx.fill();
    tx.restore();
    var cc=document.createElement('canvas');cc.width=TW;cc.height=TH;
    var cx2=cc.getContext('2d');cx2.imageSmoothingEnabled=true;cx2.drawImage(fc,0,0,TW,TH);
    var od=tx.getImageData(0,0,TW,TH),ld=cx2.getImageData(0,0,TW,TH),md=mx.getImageData(0,0,TW,TH);
    var O=od.data,L=ld.data,M=md.data;
    for(var i=0;i<O.length;i+=4){
      var al=M[i]/255;
      if(al>0){O[i]=O[i]*(1-al)+L[i]*al;O[i+1]=O[i+1]*(1-al)+L[i+1]*al;O[i+2]=O[i+2]*(1-al)+L[i+2]*al;}
    }
    tx.putImageData(od,0,0);
    done(tc);
  }
  step();
}

let oTex;
let oBor;
let oFill;
function updateOpts(){$('oNight').disabled=!estadoRender.useTex;oTex.disabled=!estadoRender.useTex;oTex.checked=estadoRender.useTex&&estadoRender.optTex;oBor.disabled=!estadoRender.feats;oFill.disabled=!estadoRender.feats;}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  oTex = document.getElementById('oTex');
  oBor = document.getElementById('oBor');
  oFill = document.getElementById('oFill');
  oTex.onchange=function(){estadoRender.optTex=oTex.checked;};
  oBor.onchange=function(){estadoRender.optBor=oBor.checked;};
  oFill.onchange=function(){estadoRender.optFill=oFill.checked;};
}

export { buildTexture, iniciar, updateOpts };
