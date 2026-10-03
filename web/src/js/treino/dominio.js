/**
 * @arquivo js/treino/dominio.js
 * Camada: Treino
 * Domínio ativo (mundo ou estados do Brasil) e conjunto de perguntas (poolIdx).
 */
/* ---------- domínio ativo (mundo ou Brasil/estados) ---------- */
function QD(){return quizDomain==='br'?BRS:D;}
function qcc(o){return quizDomain==='br'?('BR-'+o.sigla):o.cc;}
function dflag(d){return d.dis?('['+d.cc+']'):d.flag;}
function qflag(o){return quizDomain==='br'?o.sigla:dflag(o);}
function qcapD(o){return quizDomain==='br'?o.cap:qcapDisp(o);}
function unitWord(n){return quizDomain==='br'?(n===1?'estado':'estados'):(n===1?'país':'países');}
function regNameOf(o){return quizDomain==='br'?BRREG[o.r].n:(o.sub&&o.sub!==REG[o.r].n?o.sub:REG[o.r].n);}
function applyDomainForScope(){
  var wasBR=quizDomain==='br';
  quizDomain=(quizScope.t==='br'||quizScope.t==='brreg')?'br':'world';
  if(quizDomain==='br'){
    if(flat2D)setFlat2D(false);
    statesMode=true;
    onS=BRS.map(function(s){return (quizScope.t==='brreg')?(s.r===quizScope.r?1:0):1;});
    if(quiz.mode==='flag')quiz.mode='cap';
  }else if(wasBR){
    statesMode=false;selSt=null;
  }
}
function updateScopeBtn(){
  $('qscopev').textContent='📍 '+scopeLabel();
  $('qfocusb').textContent='Foco: '+({mix:'tudo','new':'só novos',wrong:'só errados'})[quizFocus];updateTrainRow();
}
function updateScopeBackBtn(){
  var btn=$('qscopeback');
  if(quizScopePrev){
    btn.hidden=false;
    var save=quizScope;quizScope=quizScopePrev;btn.textContent='↩ Voltar para: '+scopeLabel();quizScope=save;
  }else btn.hidden=true;
}
function fitScopeView(pl){
  if(quizDomain==='br')fitStates(pl,[]);
  else fitTo(pl);
}
function scopeView(){
  if(quizDomain==='br'){
    if(quizScope.t==='br'){var v=countryView(byName[norm('Brasil')]);flyTo(v.lat,v.lng,zoomFor(v.r,3));return;}
    var pl2=poolIdx();if(pl2.length)fitStates(pl2,[]);else resetView();
    return;
  }
  if(quizScope.t==='world'){resetView();return;}
  var pl=poolIdx();
  if(pl.length)fitTo(pl);else resetView();
}
function emptyMsg(){
  var u=unitWord(2);
  if(quizFocus==='wrong')return 'Nenhum '+unitWord(1)+' errado neste escopo — bom sinal! Troque o foco para "tudo" ou "só novos".';
  if(quizFocus==='new')return 'Você já viu todos os '+u+' deste escopo. Troque o foco para "tudo" ou "só errados".';
  return 'Nenhum '+unitWord(1)+' neste escopo. Escolha outro em 📍.';
}
function inScopeActive(o){
  if(quizDomain==='br')return quizScope.t==='brreg'?o.r===quizScope.r:true;
  return inScope(o);
}
function poolIdx(){
  var arr=QD(),p=[];
  for(var i=0;i<arr.length;i++){
    if(!inScopeActive(arr[i]))continue;
    if(arr[i].dis&&!includeDisputed)continue;
    if(arr[i].dep&&!includeDep)continue;
    if(arr[i].uni&&(!includeUni||quiz.mode!=='map'))continue;
    if(arr[i].pseudo&&(quiz.mode==='flag'||quiz.mode==='code'))continue;
    if(quiz.mode==='flag'&&arr[i].dis)continue;
    if(quiz.mode==='neighbor'){var nbz=quizDomain==='br'?arr[i].nb:NB[i];if(!nbz||!nbz.length)continue;}
    if(quiz.mode==='map'){
      if(quizDomain==='br'){if(STFEAT.some(function(f){return f;})&&!STFEAT[i])continue;}
      else{if(feats&&!FEAT[i]&&!arr[i].uni)continue;}
    }
    p.push(i);
  }
  return p;
}
/* Três níveis de sorteio, separados por tipo de treino e por domínio (mundo/Brasil):
   1) NOVOS (ainda não respondidos neste tipo) — os mais frequentes;
   2) ERRADOS (última resposta foi erro) — voltam logo, mas menos que os novos;
   3) ACERTADOS — voltam devagar: quanto mais acertos seguidos, maior o intervalo. */
var TIER_P={'new':.6,'wrong':.3,'ok':.1};
function mstats(){return QS.m[quiz.mode]||(QS.m[quiz.mode]={});}
function gapOf(e){if(e.s===0)return 3;var g=Math.min(120,12+12*e.s);return e.w>0?Math.round(g*.6):g;}
function tierOf(i){var e=mstats()[qcc(QD()[i])];return !e?'new':(e.s===0?'wrong':'ok');}
function tierCounts(){var c={n:0,w:0,o:0};poolIdx().forEach(function(i){var t=tierOf(i);if(t==='new')c.n++;else if(t==='wrong')c.w++;else c.o++;});return c;}
