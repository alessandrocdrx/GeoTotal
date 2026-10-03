/**
 * @arquivo js/nucleo/utilitarios.js
 * Camada: Núcleo
 * Utilitários gerais: $, localStorage (lsGet/lsSet), confirmação em dois toques, aviso de status.
 */

/* =====================================================================
   MÓDULOS NOVOS
   ===================================================================== */
function $(id){return document.getElementById(id);}
function lsGet(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function confirmTap(btn,ask,fn){
  var orig=btn.textContent,armed=false,t=0;
  btn.onclick=function(){
    if(!armed){armed=true;btn.textContent=ask;t=setTimeout(function(){armed=false;btn.textContent=orig;},4000);return;}
    clearTimeout(t);armed=false;btn.textContent=orig;fn();
  };
}

function setStatus(t,ms){
  var statusEl=document.getElementById('status');
  clearTimeout(statusT);
  if(!t){statusEl.style.display='none';return;}
  statusEl.textContent=t;statusEl.style.display='block';
  if(ms)statusT=setTimeout(function(){statusEl.style.display='none';},ms);
}
let statusT = 0;

export { $, confirmTap, lsGet, lsSet, setStatus };
