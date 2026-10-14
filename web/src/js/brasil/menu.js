/**
 * @arquivo js/brasil/menu.js
 * Camada: Brasil
 * Itens do menu específicos do Brasil.
 */

import { enterStates } from './cartao-estado.js';
import { BRS } from '../dados/estados-brasil.js';
import { tourStop } from '../interface/cartao-detalhes.js';
import { emitir } from '../nucleo/eventos.js';
import { $ } from '../nucleo/utilitarios.js';

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  /* ---------- menu Mais: Brasil ---------- */
  BRS.forEach(function(s){var o=document.createElement('option');o.value=s.i;o.textContent=s.sigla+' — '+s.name+' ('+s.cap+')';$('stSel').appendChild(o);});
  $('stGo').onclick=function(){$('msheet').style.display='none';enterStates(BRS[+$('stSel').value]);};
  $('stTreino').onclick=function(){$('msheet').style.display='none';emitir('treinar-estados');};
  $('stAll').onclick=function(){$('msheet').style.display='none';enterStates(null);};

  document.addEventListener('visibilitychange',function(){if(document.hidden)tourStop();});
}

export { iniciar };
