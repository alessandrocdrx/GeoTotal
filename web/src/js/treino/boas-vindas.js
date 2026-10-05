/**
 * @arquivo js/treino/boas-vindas.js
 * Camada: Treino
 * Boas-vindas da primeira vez: escolher Treino (começa pela América do Sul) ou Livre, ou ver o tour.
 */

import { $, lsGet, lsSet } from '../nucleo/utilitarios.js';
import { applyScopeChange } from './escopo.js';
import { estadoTreino } from './estado.js';
import { iniciarTour } from './tour.js';

/*
 * Quem abre o app pela primeira vez escolhe direto o modo tocando no cartão dele. O Treino começa
 * pela América do Sul, onde é fácil acertar. Aparece uma vez só; quem já tem progresso (atualizou o
 * app) não vê. O tour continua disponível no menu ⋯ → "Como jogar".
 */

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  if(lsGet('globo.bv.v1',false))return;
  lsSet('globo.bv.v1',true);
  /* já respondeu alguma pergunta (QS.m guarda acertos e erros por modo) */
  var m=estadoTreino.QS.m||{},jaJogou=Object.keys(m).some(function(k){return Object.keys(m[k]||{}).length>0;});
  if(jaJogou)return;
  var w=$('welcome');w.hidden=false;
  function fechar(depois){
    w.classList.add('out');
    setTimeout(function(){w.hidden=true;if(depois)depois();},250);
  }
  $('wtreino').onclick=function(){fechar(function(){applyScopeChange({t:'reg',r:0});});};
  $('wlivre').onclick=function(){fechar(function(){$('qclose').click();});};
  $('wtour').onclick=function(){fechar(function(){applyScopeChange({t:'reg',r:0});iniciarTour();});};
}

export { iniciar };
