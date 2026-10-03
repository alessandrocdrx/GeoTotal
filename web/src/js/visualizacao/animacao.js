/**
 * @arquivo js/visualizacao/animacao.js
 * Camada: Visualização
 * Voo da câmera até um ponto ou grupo de países.
 */

import { D } from '../dados/paises.js';
import { estadoCamera, PI } from './tela.js';

/* ---------- Animação ---------- */
function shortest(a,b){var d=b-a;while(d>PI)d-=2*PI;while(d<-PI)d+=2*PI;return d;}
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

export { fitTo, flyTo, shortest };
