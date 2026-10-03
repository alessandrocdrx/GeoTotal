/**
 * @arquivo js/brasil/filtros.js
 * Camada: Brasil
 * Filtros por região do Brasil.
 */

import { norm } from '../dados/paises.js';
import { byName } from '../dados/vizinhos.js';
import { flyTo } from '../visualizacao/animacao.js';
import { card } from '../interface/cartao-pais.js';
import { afterFilter, chips } from '../interface/filtros.js';
import { estadoCartao } from '../interface/cartao-detalhes.js';
import { countryView, zoomFor } from '../treino/partida.js';
import { BRREG, BRS, estadoBrasil } from './dados-estados.js';
import { fitStates } from './cartao-estado.js';

/* ---------- filtros por região do Brasil ---------- */
function mkChipSt(label,color,val,count){
  var b=document.createElement('button');b.className='chip';
  var pressed=val<0?estadoBrasil.onS.every(function(v){return v;}):BRS.every(function(s){return estadoBrasil.onS[s.i]===(s.reg===val?1:0);});
  b.setAttribute('aria-pressed',pressed?'true':'false');
  if(color){var s=document.createElement('span');s.className='dot';s.style.background=color;b.appendChild(s);}
  b.appendChild(document.createTextNode(label+' ('+count+')'));
  b.onclick=function(){
    estadoBrasil.stSaved=null;
    var all=val<0||pressed;
    estadoBrasil.onS=BRS.map(function(s){return (all||s.reg===val)?1:0;});
    if(!all&&estadoBrasil.selSt&&estadoBrasil.selSt.reg!==val){estadoBrasil.selSt=null;card.style.display='none';estadoCartao.cardH=0;}
    afterFilter();
    var v=[];estadoBrasil.onS.forEach(function(x,k){if(x)v.push(k);});
    var br=countryView(byName[norm('Brasil')]);
    if(v.length===BRS.length)flyTo(br.lat,br.lng,zoomFor(br.r,3));else fitStates(v,[]);
  };
  return b;
}
function buildChipsSt(){
  chips.innerHTML='';
  chips.appendChild(mkChipSt('Todos',null,-1,BRS.length));
  BRREG.forEach(function(r,ri){chips.appendChild(mkChipSt(r.n,r.c,ri,BRS.filter(function(s){return s.reg===ri;}).length));});
}

export { buildChipsSt };
