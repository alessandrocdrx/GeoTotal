/**
 * @arquivo js/interface/passeio.js
 * Camada: Interface
 * Passeio automático pela rota de países.
 */

import { BRS } from '../dados/estados-brasil.js';
import { D } from '../dados/paises.js';
import { spinB } from './botoes.js';
import { card, estadoCartao, tourStop } from './cartao-detalhes.js';
import { select, step } from './cartao-pais.js';
import { ganchosInterface } from './ganchos.js';
import { $, setStatus } from '../nucleo/utilitarios.js';
import { estadoBrasil } from '../visualizacao/estados.js';
import { estadoCamera, estadoMapa, firstOn } from '../visualizacao/tela.js';

/* ---------- passeio pela rota ---------- */
function tourStart(){
  if(estadoCartao.passeio)return;
  var f=estadoBrasil.statesMode?estadoBrasil.onS.indexOf(1):firstOn();if(f<0)return;
  estadoCamera.auto=false;spinB.setAttribute('aria-pressed','false');spinB.style.opacity=.5;
  if(estadoBrasil.statesMode){if(!estadoBrasil.selSt||!estadoBrasil.onS[estadoBrasil.selSt.i])ganchosInterface.selecionarEstado(BRS[f],true);}
  else if(!estadoMapa.selected||!estadoMapa.on[estadoMapa.selected.i])select(D[f],true);
  estadoCartao.passeio=setInterval(function(){step(1);if(estadoCartao.semCartao){card.style.display='none';estadoCartao.cardH=0;}},4200);
  $('tour').textContent='⏹';$('tour').setAttribute('aria-label','Parar passeio');
  setStatus('🎬 Passeio: mostro um país a cada 4 segundos. Toque em ⏹ para parar.',3500);
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  $('tour').onclick=function(){if(estadoCartao.passeio)tourStop();else tourStart();};
}

export { iniciar };
