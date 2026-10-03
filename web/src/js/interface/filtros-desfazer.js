/**
 * @arquivo js/interface/filtros-desfazer.js
 * Camada: Interface
 * Desfazer a última mudança de filtros.
 */
/* ---------- desfazer filtros ---------- */
var hist=[];
function updateUndo(){var b=$('ubtn');b.disabled=!hist.length;b.style.opacity=hist.length?1:.4;}
function snap(){hist.push(on.slice());if(hist.length>30)hist.shift();updateUndo();}
function undo(){
  if(!hist.length)return;
  on=hist.pop();nbSaved=null;afterFilter();updateUndo();
  var v=visIdx();
  if(v.length===D.length)flyTo(phi*180/PI,lam*180/PI,1);else if(v.length)fitTo(v);
  setStatus('Filtro desfeito.',1800);
}
$('ubtn').onclick=undo;updateUndo();

