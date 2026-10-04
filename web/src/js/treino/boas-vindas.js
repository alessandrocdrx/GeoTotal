/**
 * @arquivo js/treino/boas-vindas.js
 * Camada: Treino
 * Boas-vindas da primeira vez: explica Treino e Livre e começa por uma região fácil.
 */

import { $, lsGet, lsSet } from '../nucleo/utilitarios.js';
import { applyScopeChange } from './escopo.js';
import { estadoTreino } from './estado.js';

/*
 * Quem abre o app pela primeira vez cai direto numa pergunta do mundo todo e costuma errar logo
 * de cara. Aqui ele vê em uma tela o que são os dois modos e começa pela América do Sul, onde
 * acerta rápido. Aparece uma vez só; quem já tem progresso (atualizou o app) não vê.
 */

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  if(lsGet('globo.bv.v1',false))return;
  lsSet('globo.bv.v1',true);
  /* já respondeu alguma pergunta (QS.m guarda acertos e erros por modo) */
  var m=estadoTreino.QS.m||{},jaJogou=Object.keys(m).some(function(k){return Object.keys(m[k]||{}).length>0;});
  if(jaJogou)return;
  var w=$('welcome');w.hidden=false;
  function fechar(escopo){
    w.classList.add('out');
    setTimeout(function(){w.hidden=true;},250);
    if(escopo)applyScopeChange(escopo);
  }
  $('wgo').onclick=function(){fechar({t:'reg',r:0});};
  $('wall').onclick=function(){fechar(null);};
}

export { iniciar };
