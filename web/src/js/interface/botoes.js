/**
 * @arquivo js/interface/botoes.js
 * Camada: Interface
 * Botões de ferramentas do globo (zoom, polos, rótulos).
 */

import { estadoCamera, estadoMapa } from '../visualizacao/globo.js';
import { flyTo, PI } from '../visualizacao/animacao.js';
import { $ } from '../nucleo/utilitarios.js';

let spinB;
let lp;
let lc;

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  /* ---------- Botões ---------- */
  document.getElementById('zin').onclick=function(){estadoCamera.target=null;estadoCamera.zoom=Math.min(7,estadoCamera.zoom*1.35);estadoCamera.lastInteract=performance.now();};
  document.getElementById('zout').onclick=function(){estadoCamera.target=null;estadoCamera.zoom=Math.max(.8,estadoCamera.zoom/1.35);estadoCamera.lastInteract=performance.now();};
  document.getElementById('pn').onclick=function(){$('msheet').style.display='none';flyTo(90,estadoCamera.lam*180/PI,1);};
  document.getElementById('ps').onclick=function(){$('msheet').style.display='none';flyTo(-90,estadoCamera.lam*180/PI,1);};
  spinB = document.getElementById('spin');
  spinB.setAttribute('aria-pressed',estadoCamera.auto?'true':'false');spinB.style.opacity=estadoCamera.auto?1:.5;
  spinB.onclick=function(){estadoCamera.auto=!estadoCamera.auto;spinB.setAttribute('aria-pressed',estadoCamera.auto?'true':'false');spinB.style.opacity=estadoCamera.auto?1:.5;};
  lp = document.getElementById('lp');
  lc = document.getElementById('lc');
  lp.onclick=function(){estadoMapa.labelMode='p';lp.setAttribute('aria-pressed','true');lc.setAttribute('aria-pressed','false');};
  lc.onclick=function(){estadoMapa.labelMode='c';lc.setAttribute('aria-pressed','true');lp.setAttribute('aria-pressed','false');};
}

export { iniciar, spinB };
