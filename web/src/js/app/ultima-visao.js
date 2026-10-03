/**
 * @arquivo js/app/ultima-visao.js
 * Camada: App
 * Lembra o país e o filtro entre sessões.
 */
/* ---------- lembrar o país e o filtro entre sessões (só na navegação normal, fora do treino/estados) ---------- */
function saveLastView(){
  if(quiz.open||statesMode)return;
  try{
    var codes=[];D.forEach(function(d){if(on[d.i])codes.push(d.cc);});
    lsSet('globo.lastview',{on:codes,cc:selected?selected.cc:null});
  }catch(e){}
}
function restoreLastView(){
  var v=lsGet('globo.lastview',null);
  if(!v||!v.on||!v.on.length)return;
  var set={};v.on.forEach(function(c){set[c]=1;});
  on=D.map(function(d){return set[d.cc]?1:0;});
  if(v.cc){var i=D.findIndex(function(d){return d.cc===v.cc;});if(i>=0&&on[i])select(D[i],false);}
}
restoreLastView();
