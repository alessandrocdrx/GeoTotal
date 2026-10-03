/**
 * @arquivo js/interface/filtros-desfazer.js
 * Camada: Interface
 * Desfazer a última mudança de filtros.
 */

import { D } from '../dados/paises.js';
import { afterFilter, estadoFiltros } from './filtros.js';
import { $ } from '../nucleo/utilitarios.js';
import { fitTo, flyTo, PI } from '../visualizacao/animacao.js';
import { setStatus } from '../visualizacao/fronteiras.js';
import { estadoCamera, estadoMapa, visIdx } from '../visualizacao/globo.js';

/* ---------- desfazer filtros ---------- */
const hist = [];
function updateUndo(){var b=$('ubtn');b.disabled=!hist.length;b.style.opacity=hist.length?1:.4;}
function snap(){hist.push(estadoMapa.on.slice());if(hist.length>30)hist.shift();updateUndo();}
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

export { iniciar, snap };
