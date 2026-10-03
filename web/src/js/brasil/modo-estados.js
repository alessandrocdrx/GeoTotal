/**
 * @arquivo js/brasil/modo-estados.js
 * Camada: Brasil
 * Entrar e sair do modo estados.
 */

import { selectSt } from './cartao-estado.js';
import { ensureStateShapes } from './importar-contornos.js';
import { BRS } from '../dados/estados-brasil.js';
import { D, norm } from '../dados/paises.js';
import { byName } from '../dados/vizinhos.js';
import { estadoCartao } from '../interface/cartao-detalhes.js';
import { card, closeCard, select } from '../interface/cartao-pais.js';
import { afterFilter, buildChips, updateNbBtn } from '../interface/filtros.js';
import { ganchosInterface } from '../interface/ganchos.js';
import { hidePick } from '../interface/lista-proximos.js';
import { tourStop } from '../interface/passeio.js';
import { emitir } from '../nucleo/eventos.js';
import { $ } from '../nucleo/utilitarios.js';
import { estadoBrasil } from '../visualizacao/estados.js';
import { setStatus } from '../visualizacao/fronteiras.js';
import { estadoMapa } from '../visualizacao/globo.js';
import { flat2D, setFlat2D } from '../visualizacao/mapa-2d.js';

/* ---------- entrar e sair ---------- */
function updateStBtn(){$('stbtn').style.display=(!estadoBrasil.statesMode&&estadoMapa.selected&&estadoMapa.selected.cc==='BR')?'block':'none';}
function enterStates(st){
  if(flat2D)setFlat2D(false);
  emitir('modo-estados-abriu');
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
  estadoBrasil.statesMode=false;document.body.classList.remove('states');
  estadoBrasil.selSt=null;estadoBrasil.stSaved=null;estadoBrasil.stNbC=[];card.style.display='none';estadoCartao.cardH=0;hidePick();
  buildChips();afterFilter();
  if(goBrazil!==false)select(D[byName[norm('Brasil')]],true);
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  ganchosInterface.atualizarBotaoEstados = updateStBtn;
  ganchosInterface.abrirEstado = enterStates;
  $('stexit').onclick=function(){exitStates(true);};
  $('stbtn').onclick=function(){enterStates(null);};
}

export { enterStates, exitStates, iniciar, updateStBtn };
