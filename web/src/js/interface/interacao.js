/**
 * @arquivo js/interface/interacao.js
 * Camada: Interface
 * Gestos: arrastar, pinça, roda do mouse e toque no globo.
 */

import { D } from '../dados/paises.js';
import { closeCard } from './cartao-detalhes.js';
import { select } from './cartao-pais.js';
import { ganchosInterface } from './ganchos.js';
import { hidePick } from './lista-proximos.js';
import { estadoBrasil } from '../visualizacao/estados.js';
import { ganchos } from '../visualizacao/ganchos.js';
import { inv2D, proj2D, R2now } from '../visualizacao/mapa-2d.js';
import { countryAt, estadoRender, inFeat } from '../visualizacao/projecao.js';
import { cv, estadoCamera, estadoMapa, H, PI, R0, rot, W } from '../visualizacao/tela.js';

/* ---------- Interação ---------- */
const ptrs = {};
let lastX = 0;
let lastY = 0;
let startT = 0;
let pinch0 = 0;
let zoom0 = 1;
let moved = 0;
function endPtr(e){
  var was=ptrs[e.pointerId];delete ptrs[e.pointerId];
  var n=Object.keys(ptrs).length;
  if(n===0){
    estadoCamera.dragging=false;
    if(was&&e.type==='pointerup'&&moved<8&&performance.now()-startT<450)tap(e.clientX,e.clientY);
  }
  if(n<2)pinch0=0;
  if(n===1){var id=Object.keys(ptrs)[0];lastX=ptrs[id].x;lastY=ptrs[id].y;estadoCamera.dragging=true;}
}

function tap(px,py){
  if(estadoCamera.plano2D&&!estadoBrasil.statesMode){tap2D(px,py);return;}
  var r=cv.getBoundingClientRect(),x=px-r.left,y=py-r.top,R=R0*estadoCamera.zoom,cand=[];
  if(ganchosInterface.toqueAntes(x,y))return;
  if(ganchosInterface.toqueEstados(x,y))return;
  if(!ganchos.ocultarMarcadores()){
    for(var i=0;i<D.length;i++){
      if(!estadoMapa.on[i])continue;
      var d=D[i],p=rot(d.x,d.y,d.z);if(p[2]<=0.05)continue;
      var sx=W/2+R*p[0],sy=H*estadoCamera.cyFrac-R*p[1],dd=(sx-x)*(sx-x)+(sy-y)*(sy-y);
      if(dd<36*36)cand.push({d:d,dd:dd});
    }
    cand.sort(function(a,b){return a.dd-b.dd;});
  }
  if(ganchosInterface.toqueNoGlobo(x,y,cand))return;
  hidePick();
  /* toque preciso no ponto vence; senão vale o país sob o dedo; senão, o ponto mais próximo */
  var precise=cand.length&&cand[0].dd<14*14;
  var poly=precise?null:countryAt(x,y);
  var chosen=precise?cand[0].d:(poly||(cand.length?cand[0].d:null));
  if(chosen){
    var grp=cand.map(function(c){return c.d;});
    if(grp.indexOf(chosen)<0)grp.unshift(chosen);
    select(chosen,false,grp);
  }else if(estadoMapa.selected)closeCard();
}

function tap2D(px,py){
  var r=cv.getBoundingClientRect(),x=px-r.left,y=py-r.top,R2=R2now(),cx=W/2,cy=H*estadoCamera.cyFrac,i;
  if(ganchosInterface.toqueNoMapa2D(x,y))return;
  hidePick();
  var cand2=[];
  for(i=0;i<D.length;i++){
    if(!estadoMapa.on[i])continue;
    var d2=D[i],pp2=proj2D(d2.lng,d2.lat,R2,cx,cy),dd2=(pp2.x-x)*(pp2.x-x)+(pp2.y-y)*(pp2.y-y);
    if(dd2<36*36)cand2.push({d:d2,dd:dd2});
  }
  cand2.sort(function(a,b){return a.dd-b.dd;});
  var precise=cand2.length&&cand2[0].dd<14*14;
  var poly2=null;
  if(!precise&&estadoRender.feats){
    var ll2=inv2D(x,y,R2,cx,cy);
    for(i=0;i<D.length;i++){if(estadoMapa.on[i]&&estadoRender.FEAT[i]&&inFeat(estadoRender.FEAT[i],ll2[0],ll2[1])){poly2=D[i];break;}}
  }
  var chosen=precise?cand2[0].d:(poly2||(cand2.length?cand2[0].d:null));
  if(chosen){
    var grp=cand2.map(function(c){return c.d;});
    if(grp.indexOf(chosen)<0)grp.unshift(chosen);
    select(chosen,false,grp);
  }else if(estadoMapa.selected)closeCard();
}
/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  cv.addEventListener('pointerdown',function(e){
    cv.setPointerCapture(e.pointerId);ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
    var ids=Object.keys(ptrs);
    if(ids.length===1){estadoCamera.dragging=true;lastX=e.clientX;lastY=e.clientY;startT=performance.now();moved=0;estadoCamera.target=null;}
    if(ids.length===2){var a=ptrs[ids[0]],b=ptrs[ids[1]];pinch0=Math.hypot(a.x-b.x,a.y-b.y);zoom0=estadoCamera.zoom;}
    estadoCamera.lastInteract=performance.now();
  });
  cv.addEventListener('pointermove',function(e){
    if(!ptrs[e.pointerId])return;
    ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
    var ids=Object.keys(ptrs);
    if(ids.length>=2){
      var a=ptrs[ids[0]],b=ptrs[ids[1]];
      var dd=Math.hypot(a.x-b.x,a.y-b.y);
      if(pinch0>0)estadoCamera.zoom=Math.max(.8,Math.min(7,zoom0*dd/pinch0));
      moved=99;
    }else if(estadoCamera.dragging){
      var dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;
      moved+=Math.abs(dx)+Math.abs(dy);
      var Re=(estadoCamera.plano2D?R2now():R0)*estadoCamera.zoom;
      estadoCamera.lam-=dx/Re;estadoCamera.phi=Math.max(-PI/2,Math.min(PI/2,estadoCamera.phi+dy/Re));
    }
    estadoCamera.lastInteract=performance.now();
  });
  cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',endPtr);
  cv.addEventListener('wheel',function(e){e.preventDefault();estadoCamera.zoom=Math.max(.8,Math.min(7,estadoCamera.zoom*Math.exp(-e.deltaY*.0014)));estadoCamera.lastInteract=performance.now();},{passive:false});
}

export { iniciar, tap, tap2D };
