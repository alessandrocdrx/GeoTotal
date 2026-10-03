/**
 * @arquivo js/visualizacao/dia-noite.js
 * Camada: Visualização
 * Sombra de dia e noite em tempo real.
 */

import { PI } from './animacao.js';
import { setStatus } from './fronteiras.js';
import { $ } from '../nucleo/utilitarios.js';

/* ---------- dia e noite ---------- */
let optNight = false;
function sunVec(){
  var now=new Date(),N=(now-Date.UTC(now.getUTCFullYear(),0,0))/864e5;
  var decl=-23.44*Math.cos(2*PI/365*(N+10))*PI/180;
  var hrs=now.getUTCHours()+now.getUTCMinutes()/60+now.getUTCSeconds()/3600;
  var B=2*PI*(N-81)/364,eot=9.87*Math.sin(2*B)-7.53*Math.cos(B)-1.5*Math.sin(B);
  var lg=-(hrs+eot/60-12)*15*PI/180;
  return [Math.cos(decl)*Math.sin(lg),Math.sin(decl),Math.cos(decl)*Math.cos(lg)];
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  $('oNight').onchange=function(){
    optNight=this.checked;
    if(optNight){var n=new Date(),p=function(x){return (x<10?'0':'')+x;};setStatus('Noite calculada para agora ('+p(n.getUTCHours())+':'+p(n.getUTCMinutes())+' UTC). Ela acompanha o relógio do seu aparelho.',5000);}
  };
}

export { iniciar, optNight, sunVec };
