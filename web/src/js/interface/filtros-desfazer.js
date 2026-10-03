/**
 * @arquivo js/interface/filtros-desfazer.js
 * Camada: Interface
 * Botão Desfazer: volta ao filtro anterior guardado por filtros.js.
 */

import { D } from '../dados/paises.js';
import { afterFilter, estadoFiltros, hist, updateUndo } from './filtros.js';
import { $, setStatus } from '../nucleo/utilitarios.js';
import { fitTo, flyTo } from '../visualizacao/animacao.js';
import { estadoCamera, estadoMapa, PI, visIdx } from '../visualizacao/tela.js';

/* ---------- desfazer filtros ---------- */
function undo(){
  if(!hist.length)return;
  estadoMapa.on=hist.pop();estadoFiltros.nbSaved=null;afterFilter();updateUndo();
  var v=visIdx();
  if(v.length===D.length)flyTo(estadoCamera.phi*180/PI,estadoCamera.lam*180/PI,1);else if(v.length)fitTo(v);
  setStatus('Filtro desfeito.',1800);
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  $('ubtn').onclick=undo;updateUndo();
}

export { iniciar };
