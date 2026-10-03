/**
 * @arquivo js/interface/passeio.js
 * Camada: Interface
 * Passeio automático pela rota de países.
 */

import { D } from '../dados/paises.js';
import { estadoCamera, estadoMapa } from '../visualizacao/globo.js';
import { select, step } from './cartao-pais.js';
import { spinB } from './botoes.js';
import { $, firstOn } from '../nucleo/utilitarios.js';
import { BRS, estadoBrasil } from '../brasil/dados-estados.js';
import { selectSt } from '../brasil/cartao-estado.js';

/* ---------- passeio pela rota ---------- */
let tourT = null;
function tourStart(){
  if(tourT)return;
  var f=estadoBrasil.statesMode?estadoBrasil.onS.indexOf(1):firstOn();if(f<0)return;
  estadoCamera.auto=false;spinB.setAttribute('aria-pressed','false');spinB.style.opacity=.5;
  if(estadoBrasil.statesMode){if(!estadoBrasil.selSt||!estadoBrasil.onS[estadoBrasil.selSt.i])selectSt(BRS[f],true);}
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
