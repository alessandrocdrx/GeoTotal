/**
 * @arquivo js/app/ultima-visao.js
 * Camada: App
 * Lembra o país e o filtro entre sessões.
 */

import { D } from '../dados/paises.js';
import { select } from '../interface/cartao-pais.js';
import { ouvir } from '../nucleo/eventos.js';
import { lsGet, lsSet } from '../nucleo/utilitarios.js';
import { quiz } from '../treino/estado.js';
import { estadoBrasil } from '../visualizacao/estados.js';
import { estadoMapa } from '../visualizacao/globo.js';

/* ---------- lembrar o país e o filtro entre sessões (só na navegação normal, fora do treino/estados) ---------- */
function saveLastView(){
  if(quiz.open||estadoBrasil.statesMode)return;
  try{
    var codes=[];D.forEach(function(d){if(estadoMapa.on[d.i])codes.push(d.cc);});
    lsSet('globo.lastview',{on:codes,cc:estadoMapa.selected?estadoMapa.selected.cc:null});
  }catch(e){}
}
function restoreLastView(){
  var v=lsGet('globo.lastview',null);
  if(!v||!v.on||!v.on.length)return;
  var set={};v.on.forEach(function(c){set[c]=1;});
  estadoMapa.on=D.map(function(d){return set[d.cc]?1:0;});
  if(v.cc){var i=D.findIndex(function(d){return d.cc===v.cc;});if(i>=0&&estadoMapa.on[i])select(D[i],false);}
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  ouvir('visao-mudou', saveLastView);
  restoreLastView();
}

export { iniciar };
