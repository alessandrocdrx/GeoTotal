/**
 * @arquivo js/interface/interacao.js
 * Camada: Interface
 * Gestos: arrastar, pinça, roda do mouse e toque no globo.
 */

import { D } from '../dados/paises.js';
import { cv, estadoCamera, estadoMapa, H, R0, rot, W } from '../visualizacao/globo.js';
import { PI } from '../visualizacao/animacao.js';
import { closeCard, select } from './cartao-pais.js';
import { countryAt, estadoRender, projCfg } from '../visualizacao/fronteiras.js';
import { hidePick } from './lista-proximos.js';
import { haversine } from './distancia.js';
import { estadoTreino, qHide, quiz } from '../treino/estado.js';
import { finishQ } from '../treino/partida.js';
import { pickStateNear, quizMapAnswer, quizMapAnswerBR } from '../treino/perguntas.js';
import { estadoBrasil } from '../brasil/dados-estados.js';
import { stTap } from '../brasil/desenho.js';
import { flat2D, R2now, tap2D } from '../visualizacao/mapa-2d.js';

/* ---------- Interação ---------- */
let dragging = false;
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
    dragging=false;
    if(was&&e.type==='pointerup'&&moved<8&&performance.now()-startT<450)tap(e.clientX,e.clientY);
  }
  if(n<2)pinch0=0;
  if(n===1){var id=Object.keys(ptrs)[0];lastX=ptrs[id].x;lastY=ptrs[id].y;dragging=true;}
}

function tap(px,py){
  if(flat2D&&!estadoBrasil.statesMode){tap2D(px,py);return;}
  if(quiz.open&&!estadoTreino.qMap)return;
  var r=cv.getBoundingClientRect(),x=px-r.left,y=py-r.top,R=R0*estadoCamera.zoom,cand=[];
  if(estadoTreino.qMap&&estadoTreino.quizDomain==='br'){quizMapAnswerBR(pickStateNear(x,y));return;}
  if(estadoBrasil.statesMode){stTap(x,y);return;}
  if(!qHide()){
    for(var i=0;i<D.length;i++){
      if(!estadoMapa.on[i])continue;
      var d=D[i],p=rot(d.x,d.y,d.z);if(p[2]<=0.05)continue;
      var sx=W/2+R*p[0],sy=H*estadoCamera.cyFrac-R*p[1],dd=(sx-x)*(sx-x)+(sy-y)*(sy-y);
      if(dd<36*36)cand.push({d:d,dd:dd});
    }
    cand.sort(function(a,b){return a.dd-b.dd;});
  }
  if(estadoTreino.qMap){
    var tg=D[quiz.cur];
    if(tg&&!estadoRender.FEAT[tg.i]&&!quiz.answered){
      var tp=rot(tg.x,tg.y,tg.z),tsx=W/2+R*tp[0],tsy=H*estadoCamera.cyFrac-R*tp[1];
      if(tp[2]>0.05&&(tsx-x)*(tsx-x)+(tsy-y)*(tsy-y)<44*44){quizMapAnswer(tg);return;}
      var hit=cand.length?cand[0].d:countryAt(x,y);
      if(!hit){projCfg(R0*estadoCamera.zoom,W/2,H*estadoCamera.cyFrac);var ll=estadoRender.proj.invert([x,y]);
        if(ll&&!isNaN(ll[0])){var km0=Math.round(haversine({lat:ll[1],lng:ll[0]},tg));finishQ(false,'Você tocou a '+km0.toLocaleString('pt-BR')+' km do lugar certo.');return;}}
      quizMapAnswer(hit);return;
    }
    quizMapAnswer(cand.length?cand[0].d:countryAt(x,y));return;
  }
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

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  cv.addEventListener('pointerdown',function(e){
    cv.setPointerCapture(e.pointerId);ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
    var ids=Object.keys(ptrs);
    if(ids.length===1){dragging=true;lastX=e.clientX;lastY=e.clientY;startT=performance.now();moved=0;estadoCamera.target=null;}
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
    }else if(dragging){
      var dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;
      moved+=Math.abs(dx)+Math.abs(dy);
      var Re=(flat2D?R2now():R0)*estadoCamera.zoom;
      estadoCamera.lam-=dx/Re;estadoCamera.phi=Math.max(-PI/2,Math.min(PI/2,estadoCamera.phi+dy/Re));
    }
    estadoCamera.lastInteract=performance.now();
  });
  cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',endPtr);
  cv.addEventListener('wheel',function(e){e.preventDefault();estadoCamera.zoom=Math.max(.8,Math.min(7,estadoCamera.zoom*Math.exp(-e.deltaY*.0014)));estadoCamera.lastInteract=performance.now();},{passive:false});
}

export { dragging, iniciar, tap };
