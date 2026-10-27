/**
 * @arquivo js/app/ultima-visao.js
 * Camada: App
 * Lembra o último país aberto no Livre entre sessões (o globo sempre abre com todos os países).
 */

import { D } from '../dados/paises.js';
import { select } from '../interface/cartao-pais.js';
import { ouvir } from '../nucleo/eventos.js';
import { lsGet, lsSet } from '../nucleo/utilitarios.js';
import { quiz } from '../treino/estado.js';
import { estadoBrasil } from '../visualizacao/estados.js';
import { estadoMapa } from '../visualizacao/tela.js';

/* ---------- lembrar o país entre sessões (só na navegação normal, fora do treino/estados) ---------- */
function saveLastView(){
  if(quiz.open||estadoBrasil.statesMode)return;
  try{
    lsSet('globo.lastview',{cc:estadoMapa.selected?estadoMapa.selected.cc:null});
  }catch(e){}
}
function restoreLastView(){
  var v=lsGet('globo.lastview',null);
  /* versões antigas guardavam também um filtro de países (tela de Filtros, que saiu na 1.43): ignorado */
  if(!v)return;
  if(v.cc){var i=D.findIndex(function(d){return d.cc===v.cc;});if(i>=0&&estadoMapa.on[i])select(D[i],false);}
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  ouvir('visao-mudou', saveLastView);
  restoreLastView();
}

export { iniciar };
