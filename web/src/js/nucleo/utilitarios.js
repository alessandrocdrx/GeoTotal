/**
 * @arquivo js/nucleo/utilitarios.js
 * Camada: Núcleo
 * Utilitários gerais: $, localStorage (lsGet/lsSet), confirmação em dois toques.
 */

import { D } from '../dados/paises.js';
import { estadoMapa } from '../visualizacao/globo.js';

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
function firstOn(){for(var i=0;i<D.length;i++)if(estadoMapa.on[i])return i;return -1;}
function visIdx(){var v=[];estadoMapa.on.forEach(function(x,k){if(x)v.push(k);});return v;}

export { $, confirmTap, firstOn, lsGet, lsSet, visIdx };
