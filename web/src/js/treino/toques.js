/**
 * @arquivo js/treino/toques.js
 * Camada: Treino
 * Toques no mapa durante o treino (responder "Achar no mapa" ou ignorar toques durante as perguntas).
 */

import { D } from '../dados/paises.js';
import { ganchosInterface } from '../interface/ganchos.js';
import { haversine } from '../nucleo/geo.js';
import { estadoTreino, qHide, quiz } from './estado.js';
import { finishQ } from './partida.js';
import { pickStateNear, quizMapAnswer, quizMapAnswerBR } from './perguntas.js';
import { inv2D, proj2D, R2now } from '../visualizacao/mapa-2d.js';
import { countryAt, estadoRender, inFeat, projCfg } from '../visualizacao/projecao.js';
import { estadoCamera, estadoMapa, H, R0, rot, W } from '../visualizacao/tela.js';

/** Antes de tudo: durante perguntas sem mapa o toque é ignorado; no "Achar no mapa" dos estados, responde. */
/** País sob o ponto tocado (globo ou mapa plano), ou null. */
function paisNoPonto(x,y){
  if(!estadoCamera.plano2D)return countryAt(x,y);
  if(!estadoRender.feats)return null;
  var ll=inv2D(x,y,R2now(),W/2,H*estadoCamera.cyFrac);
  for(var i=0;i<D.length;i++)if(estadoRender.FEAT[i]&&inFeat(estadoRender.FEAT[i],ll[0],ll[1]))return D[i];
  return null;
}
function toqueAntes(x,y){
  /* durante a pergunta, tocar num país só mostra o nome dele (sem a capital); não responde */
  if(quiz.open&&!estadoTreino.qMap){
    if(estadoTreino.quizDomain==='world'){var d=paisNoPonto(x,y);if(d)estadoTreino.qEspia={i:d.i,t:performance.now()};}
    return true;
  }
  if(estadoTreino.qMap&&estadoTreino.quizDomain==='br'){quizMapAnswerBR(pickStateNear(x,y));return true;}
  return false;
}

/** "Achar no mapa" no globo: cand são os pontos próximos ao toque, do mais perto ao mais longe. */
function toqueNoGlobo(x,y,cand){
  if(!estadoTreino.qMap)return false;
  var R=R0*estadoCamera.zoom,tg=D[quiz.cur];
  if(tg&&!estadoRender.FEAT[tg.i]&&!quiz.answered){
    var tp=rot(tg.x,tg.y,tg.z),tsx=W/2+R*tp[0],tsy=H*estadoCamera.cyFrac-R*tp[1];
    if(tp[2]>0.05&&(tsx-x)*(tsx-x)+(tsy-y)*(tsy-y)<44*44){quizMapAnswer(tg);return true;}
    var hit=cand.length?cand[0].d:countryAt(x,y);
    if(!hit){projCfg(R,W/2,H*estadoCamera.cyFrac);var ll=estadoRender.proj.invert([x,y]);
      if(ll&&!isNaN(ll[0])){var km0=Math.round(haversine({lat:ll[1],lng:ll[0]},tg));finishQ(false,'Você tocou a '+km0.toLocaleString('pt-BR')+' km do lugar certo.');return true;}}
    quizMapAnswer(hit);return true;
  }
  quizMapAnswer(cand.length?cand[0].d:countryAt(x,y));return true;
}

/** Toque no mapa 2D durante o treino; devolve true se o treino tratou o toque. */
function toqueNoMapa2D(x,y){
  if(quiz.open&&!estadoTreino.qMap)return toqueAntes(x,y);
  if(!estadoTreino.qMap)return false;
  var R2=R2now(),cx=W/2,cy=H*estadoCamera.cyFrac,i,cand=[];
  if(!qHide()){
    for(i=0;i<D.length;i++){
      if(!estadoMapa.on[i])continue;
      var d=D[i],pp=proj2D(d.lng,d.lat,R2,cx,cy),dd=(pp.x-x)*(pp.x-x)+(pp.y-y)*(pp.y-y);
      if(dd<36*36)cand.push({d:d,dd:dd});
    }
    cand.sort(function(a,b){return a.dd-b.dd;});
  }
  var ll=inv2D(x,y,R2,cx,cy),poly=null,tg=D[quiz.cur];
  if(tg&&!estadoRender.FEAT[tg.i]&&!quiz.answered){
    var tq=proj2D(tg.lng,tg.lat,R2,cx,cy);
    if((tq.x-x)*(tq.x-x)+(tq.y-y)*(tq.y-y)<44*44){quizMapAnswer(tg);return true;}
  }
  if(estadoRender.feats)for(i=0;i<D.length;i++){if(estadoMapa.on[i]&&estadoRender.FEAT[i]&&inFeat(estadoRender.FEAT[i],ll[0],ll[1])){poly=D[i];break;}}
  if(tg&&!estadoRender.FEAT[tg.i]&&!quiz.answered&&!cand.length&&!poly&&ll&&!isNaN(ll[0])){finishQ(false,'Você tocou a '+Math.round(haversine({lat:ll[1],lng:ll[0]},tg)).toLocaleString('pt-BR')+' km do lugar certo.');return true;}
  quizMapAnswer(cand.length?cand[0].d:poly);
  return true;
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar(){
  ganchosInterface.toqueAntes=toqueAntes;
  ganchosInterface.toqueNoGlobo=toqueNoGlobo;
  ganchosInterface.toqueNoMapa2D=toqueNoMapa2D;
}

export { iniciar };
