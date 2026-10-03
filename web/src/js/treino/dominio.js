/**
 * @arquivo js/treino/dominio.js
 * Camada: Treino
 * Domínio ativo (mundo ou estados do Brasil) e conjunto de perguntas (poolIdx).
 */

import { BRREG, BRS } from '../dados/estados-brasil.js';
import { D, dflag, norm, qcapDisp, REG } from '../dados/paises.js';
import { byName, NB } from '../dados/vizinhos.js';
import { $ } from '../nucleo/utilitarios.js';
import { estadoTreino, inScope, quiz, scopeLabel } from './estado.js';
import { updateTrainRow } from './perguntas.js';
import { fitTo, flyTo } from '../visualizacao/animacao.js';
import { countryView, resetView, zoomFor } from '../visualizacao/enquadramento.js';
import { estadoBrasil, fitStates } from '../visualizacao/estados.js';
import { estadoRender } from '../visualizacao/fronteiras.js';
import { estadoMapa } from '../visualizacao/globo.js';
import { flat2D, setFlat2D } from '../visualizacao/mapa-2d.js';

/* ---------- domínio ativo (mundo ou Brasil/estados) ---------- */
function QD(){return estadoTreino.quizDomain==='br'?BRS:D;}
function qcc(o){return estadoTreino.quizDomain==='br'?('BR-'+o.sigla):o.cc;}
function qflag(o){return estadoTreino.quizDomain==='br'?o.sigla:dflag(o);}
function qcapD(o){return estadoTreino.quizDomain==='br'?o.cap:qcapDisp(o);}
function unitWord(n){return estadoTreino.quizDomain==='br'?(n===1?'estado':'estados'):(n===1?'país':'países');}
function regNameOf(o){return estadoTreino.quizDomain==='br'?BRREG[o.r].n:(o.sub&&o.sub!==REG[o.r].n?o.sub:REG[o.r].n);}
function applyDomainForScope(){
  var wasBR=estadoTreino.quizDomain==='br';
  estadoTreino.quizDomain=(estadoTreino.quizScope.t==='br'||estadoTreino.quizScope.t==='brreg')?'br':'world';
  if(estadoTreino.quizDomain==='br'){
    if(flat2D)setFlat2D(false);
    estadoBrasil.statesMode=true;
    estadoBrasil.onS=BRS.map(function(s){return (estadoTreino.quizScope.t==='brreg')?(s.r===estadoTreino.quizScope.r?1:0):1;});
    if(quiz.mode==='flag')quiz.mode='cap';
  }else if(wasBR){
    estadoBrasil.statesMode=false;estadoBrasil.selSt=null;
  }
}
function updateScopeBtn(){
  $('qscopev').textContent='📍 '+scopeLabel();
  $('qfocusb').textContent='Foco: '+({mix:'tudo','new':'só novos',wrong:'só errados'})[estadoTreino.quizFocus];updateTrainRow();
}
function updateScopeBackBtn(){
  var btn=$('qscopeback');
  if(estadoTreino.quizScopePrev){
    btn.hidden=false;
    var save=estadoTreino.quizScope;estadoTreino.quizScope=estadoTreino.quizScopePrev;btn.textContent='↩ Voltar para: '+scopeLabel();estadoTreino.quizScope=save;
  }else btn.hidden=true;
}
function fitScopeView(pl){
  if(estadoTreino.quizDomain==='br')fitStates(pl,[]);
  else fitTo(pl);
}
function scopeView(){
  if(estadoTreino.quizDomain==='br'){
    if(estadoTreino.quizScope.t==='br'){var v=countryView(byName[norm('Brasil')]);flyTo(v.lat,v.lng,zoomFor(v.r,3));return;}
    var pl2=poolIdx();if(pl2.length)fitStates(pl2,[]);else resetView();
    return;
  }
  if(estadoTreino.quizScope.t==='world'){resetView();return;}
  var pl=poolIdx();
  if(pl.length)fitTo(pl);else resetView();
}
function emptyMsg(){
  var u=unitWord(2);
  if(estadoTreino.quizFocus==='wrong')return 'Nenhum '+unitWord(1)+' errado neste escopo — bom sinal! Troque o foco para "tudo" ou "só novos".';
  if(estadoTreino.quizFocus==='new')return 'Você já viu todos os '+u+' deste escopo. Troque o foco para "tudo" ou "só errados".';
  return 'Nenhum '+unitWord(1)+' neste escopo. Escolha outro em 📍.';
}
function inScopeActive(o){
  if(estadoTreino.quizDomain==='br')return estadoTreino.quizScope.t==='brreg'?o.r===estadoTreino.quizScope.r:true;
  return inScope(o);
}
function poolIdx(){
  var arr=QD(),p=[];
  for(var i=0;i<arr.length;i++){
    if(!inScopeActive(arr[i]))continue;
    if(arr[i].dis&&!estadoMapa.includeDisputed)continue;
    if(arr[i].dep&&!estadoMapa.includeDep)continue;
    if(arr[i].uni&&(!estadoMapa.includeUni||quiz.mode!=='map'))continue;
    if(arr[i].pseudo&&(quiz.mode==='flag'||quiz.mode==='code'))continue;
    if(quiz.mode==='flag'&&arr[i].dis)continue;
    if(quiz.mode==='neighbor'){var nbz=estadoTreino.quizDomain==='br'?arr[i].nb:NB[i];if(!nbz||!nbz.length)continue;}
    if(quiz.mode==='map'){
      if(estadoTreino.quizDomain==='br'){if(estadoBrasil.STFEAT.some(function(f){return f;})&&!estadoBrasil.STFEAT[i])continue;}
      else{if(estadoRender.feats&&!estadoRender.FEAT[i]&&!arr[i].uni)continue;}
    }
    p.push(i);
  }
  return p;
}
/* Três níveis de sorteio, separados por tipo de treino e por domínio (mundo/Brasil):
   1) NOVOS (ainda não respondidos neste tipo) — os mais frequentes;
   2) ERRADOS (última resposta foi erro) — voltam logo, mas menos que os novos;
   3) ACERTADOS — voltam devagar: quanto mais acertos seguidos, maior o intervalo. */
const TIER_P = {'new':.6,'wrong':.3,'ok':.1};
function mstats(){return estadoTreino.QS.m[quiz.mode]||(estadoTreino.QS.m[quiz.mode]={});}
function gapOf(e){if(e.s===0)return 3;var g=Math.min(120,12+12*e.s);return e.w>0?Math.round(g*.6):g;}
function tierOf(i){var e=mstats()[qcc(QD()[i])];return !e?'new':(e.s===0?'wrong':'ok');}

export { applyDomainForScope, emptyMsg, fitScopeView, gapOf, inScopeActive, mstats, poolIdx, qcapD, qcc, QD, qflag, regNameOf, scopeView, TIER_P, tierOf, unitWord, updateScopeBackBtn, updateScopeBtn };
