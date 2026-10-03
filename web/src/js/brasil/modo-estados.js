/**
 * @arquivo js/brasil/modo-estados.js
 * Camada: Brasil
 * Sair do modo estados e botão "Estados" do cartão do Brasil (entrar fica em cartao-estado.js).
 */

import { D, norm } from '../dados/paises.js';
import { byName } from '../dados/vizinhos.js';
import { card, estadoCartao } from '../interface/cartao-detalhes.js';
import { select } from '../interface/cartao-pais.js';
import { afterFilter, buildChips } from '../interface/filtros.js';
import { ganchosInterface } from '../interface/ganchos.js';
import { hidePick } from '../interface/lista-proximos.js';
import { $ } from '../nucleo/utilitarios.js';
import { estadoBrasil } from '../visualizacao/estados.js';
import { estadoMapa } from '../visualizacao/tela.js';

/* ---------- entrar e sair ---------- */
function updateStBtn(){$('stbtn').style.display=(!estadoBrasil.statesMode&&estadoMapa.selected&&estadoMapa.selected.cc==='BR')?'block':'none';}
function exitStates(goBrazil){
  estadoBrasil.statesMode=false;document.body.classList.remove('states');
  estadoBrasil.selSt=null;estadoBrasil.stSaved=null;estadoBrasil.stNbC=[];card.style.display='none';estadoCartao.cardH=0;hidePick();
  buildChips();afterFilter();
  if(goBrazil!==false)select(D[byName[norm('Brasil')]],true);
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  ganchosInterface.atualizarBotaoEstados = updateStBtn;
  $('stexit').onclick=function(){exitStates(true);};
}

export { exitStates, iniciar, updateStBtn };
