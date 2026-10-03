/**
 * @arquivo js/brasil/modo-estados.js
 * Camada: Brasil
 * Entrar e sair do modo estados.
 */

import { D, norm } from '../dados/paises.js';
import { byName } from '../dados/vizinhos.js';
import { estadoMapa } from '../visualizacao/globo.js';
import { card, closeCard, select } from '../interface/cartao-pais.js';
import { afterFilter, buildChips, updateNbBtn } from '../interface/filtros.js';
import { setStatus } from '../visualizacao/fronteiras.js';
import { $ } from '../nucleo/utilitarios.js';
import { estadoCartao } from '../interface/cartao-detalhes.js';
import { hidePick } from '../interface/lista-proximos.js';
import { tourStop } from '../interface/passeio.js';
import { quiz } from '../treino/estado.js';
import { quizClose } from '../treino/perguntas.js';
import { BRS, estadoBrasil } from './dados-estados.js';
import { selectSt } from './cartao-estado.js';
import { ensureStateShapes } from './importar-contornos.js';
import { flat2D, setFlat2D } from '../visualizacao/mapa-2d.js';
import { syncFab } from '../treino/progressao.js';

/* ---------- entrar e sair ---------- */
function updateStBtn(){$('stbtn').style.display=(!estadoBrasil.statesMode&&estadoMapa.selected&&estadoMapa.selected.cc==='BR')?'block':'none';}
function enterStates(st){
  syncFab();
  if(flat2D)setFlat2D(false);
  if(quiz.open)quizClose();
  tourStop();hidePick();
  estadoBrasil.statesMode=true;document.body.classList.add('states');
  closeCard();
  estadoBrasil.onS=BRS.map(function(){return 1;});estadoBrasil.stSaved=null;estadoBrasil.stNbC=[];
  buildChips();updateNbBtn();
  setStatus('');
  selectSt(st||BRS[0],true);
  ensureStateShapes();
}
function exitStates(goBrazil){
  setTimeout(syncFab,0);
  estadoBrasil.statesMode=false;document.body.classList.remove('states');
  estadoBrasil.selSt=null;estadoBrasil.stSaved=null;estadoBrasil.stNbC=[];card.style.display='none';estadoCartao.cardH=0;hidePick();
  buildChips();afterFilter();
  if(goBrazil!==false)select(D[byName[norm('Brasil')]],true);
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  $('stexit').onclick=function(){exitStates(true);};
  $('stbtn').onclick=function(){enterStates(null);};
}

export { enterStates, exitStates, iniciar, updateStBtn };
