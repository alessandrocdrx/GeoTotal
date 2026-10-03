/**
 * @arquivo js/interface/lista-proximos.js
 * Camada: Interface
 * Esconde a lista de escolha (#pick) ao tocar no globo ou iniciar um passeio.
 */

import { tourStop } from './passeio.js';
import { $ } from '../nucleo/utilitarios.js';
import { cv } from '../visualizacao/globo.js';

/* ---------- lista curta quando vários países estão colados ---------- */
let pick;
function hidePick(){pick.style.display='none';}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  pick = $('pick');
  cv.addEventListener('pointerdown',function(){hidePick();tourStop();});
}

export { hidePick, iniciar };
