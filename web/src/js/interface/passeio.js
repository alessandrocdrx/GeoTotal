/**
 * @arquivo js/interface/passeio.js
 * Camada: Interface
 * Passeio automático pela rota de países.
 */

import { BRS } from '../dados/estados-brasil.js';
import { D } from '../dados/paises.js';
import { spinB } from './botoes.js';
import { select, step } from './cartao-pais.js';
import { ganchosInterface } from './ganchos.js';
import { $ } from '../nucleo/utilitarios.js';
import { estadoBrasil } from '../visualizacao/estados.js';
import { estadoCamera, estadoMapa, firstOn } from '../visualizacao/globo.js';

/* ---------- passeio pela rota ---------- */
let tourT = null;
function tourStart(){
  if(tourT)return;
  var f=estadoBrasil.statesMode?estadoBrasil.onS.indexOf(1):firstOn();if(f<0)return;
  estadoCamera.auto=false;spinB.setAttribute('aria-pressed','false');spinB.style.opacity=.5;
  if(estadoBrasil.statesMode){if(!estadoBrasil.selSt||!estadoBrasil.onS[estadoBrasil.selSt.i])ganchosInterface.selecionarEstado(BRS[f],true);}
  else if(!estadoMapa.selected||!estadoMapa.on[estadoMapa.selected.i])select(D[f],true);
  tourT=setInterval(function(){step(1);},4200);
  $('tour').textContent='⏸';$('tour').setAttribute('aria-label','Parar passeio');
}
function tourStop(){if(!tourT)return;clearInterval(tourT);tourT=null;$('tour').textContent='▶';$('tour').setAttribute('aria-label','Passeio pela rota');}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  $('tour').onclick=function(){if(tourT)tourStop();else tourStart();};
}

export { iniciar, tourStop };
