/**
 * @arquivo js/visualizacao/animacao.js
 * Camada: Visualização
 * Laço de animação (voo da câmera, rotação automática).
 */

import { D } from '../dados/paises.js';
import { estadoBrasil } from './estados.js';
import { ganchos } from './ganchos.js';
import { draw, estadoCamera, estadoMapa, H } from './globo.js';
import { flat2D } from './mapa-2d.js';

/* ---------- Animação ---------- */
let PI;
function shortest(a,b){var d=b-a;while(d>PI)d-=2*PI;while(d<-PI)d+=2*PI;return d;}
function frame(){
  if(estadoCamera.target){
    var dl=shortest(estadoCamera.lam,estadoCamera.target.lam),dp=estadoCamera.target.phi-estadoCamera.phi,dz=estadoCamera.target.zoom-estadoCamera.zoom;
    estadoCamera.lam+=dl*.14;estadoCamera.phi+=dp*.14;estadoCamera.zoom+=dz*.14;
    if(Math.abs(dl)<.0008&&Math.abs(dp)<.0008&&Math.abs(dz)<.004)estadoCamera.target=null;
  }else if(estadoCamera.auto&&!estadoCamera.dragging&&!estadoMapa.selected&&!ganchos.treinoAberto()&&!estadoBrasil.statesMode&&!estadoBrasil.selSt&&!flat2D&&(performance.now()-estadoCamera.lastInteract>2500)){
    estadoCamera.lam+=0.0022;
  }
  var wantCy=((estadoMapa.selected||estadoBrasil.selSt)&&!ganchos.treinoAberto())?Math.max(.26,Math.min(.5,(H-ganchos.alturaCartao())/(2*H))):(ganchos.treinoAberto()?Math.max(.24,Math.min(.5,(H-ganchos.alturaTreino())/(2*H))):.5);estadoCamera.cyFrac+=(wantCy-estadoCamera.cyFrac)*.15;
  if(estadoCamera.lam>PI)estadoCamera.lam-=2*PI;if(estadoCamera.lam<-PI)estadoCamera.lam+=2*PI;
  draw();requestAnimationFrame(frame);
}
function flyTo(latDeg,lngDeg,z){
  document.getElementById('hint').style.display='none';
  estadoCamera.target={lam:lngDeg*PI/180,phi:Math.max(-PI/2,Math.min(PI/2,latDeg*PI/180)),zoom:z};
  estadoCamera.lastInteract=performance.now();
}
function fitTo(idxs){
  if(!idxs.length)return;
  var sx=0,sy=0,sz=0;
  idxs.forEach(function(i){sx+=D[i].x;sy+=D[i].y;sz+=D[i].z;});
  var m=Math.sqrt(sx*sx+sy*sy+sz*sz)||1;sx/=m;sy/=m;sz/=m;
  var th=0;
  idxs.forEach(function(i){var c=D[i].x*sx+D[i].y*sy+D[i].z*sz;th=Math.max(th,Math.acos(Math.max(-1,Math.min(1,c))));});
  var z=Math.max(1,Math.min(3.2,0.9/Math.sin(Math.min(th+0.12,1.5))));
  flyTo(Math.asin(sy)*180/PI,Math.atan2(sx,sz)*180/PI,z);
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  PI = Math.PI;
}

export { fitTo, flyTo, frame, iniciar, PI };
