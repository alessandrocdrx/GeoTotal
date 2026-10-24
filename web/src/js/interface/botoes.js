/**
 * @arquivo js/interface/botoes.js
 * Camada: Interface
 * Botões de ferramentas do globo (zoom, giro, rótulos) e o encaixe dos botões do cabeçalho.
 */

import { setStatus } from '../nucleo/utilitarios.js';
import { estadoCamera, estadoMapa } from '../visualizacao/tela.js';

let spinB;
let lp;
let lc;

/* largura de verdade da tela: no celular, um cabeçalho largo demais alarga a página toda (innerWidth
   cresce junto), então vale a menor das duas */
function larguraDaTela(){return Math.min(window.innerWidth,screen.width||window.innerWidth);}

/* passos para o cabeçalho caber, nesta ordem (ux.css): botões mais justos, só a logo sem o nome,
   tudo menor e, por último, o 🔥 da sequência sai do topo */
const APERTOS = ['cab-apertado', 'cab-apertado2', 'cab-apertado3', 'cab-apertado4'];

/**
 * Se o cabeçalho não cabe na tela (fonte larga, 🔥 da sequência aparecendo), aplica os passos de
 * APERTOS só até caber: nenhum atalho some e a logo fica. Sem isso a página ganhava rolagem
 * lateral e o ⋯ ficava fora da tela.
 */
function encaixarCabecalho(){
  var htop=document.querySelector('header .htop');if(!htop)return;
  var b=document.body,cs=getComputedStyle(htop.parentNode),pad=parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight);
  APERTOS.forEach(function(c){b.classList.remove(c);});
  for(var k=0;k<APERTOS.length&&htop.scrollWidth+pad>larguraDaTela()+0.5;k++)b.classList.add(APERTOS[k]);
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  /* ---------- Botões ---------- */
  document.getElementById('zin').onclick=function(){estadoCamera.target=null;estadoCamera.zoom=Math.min(7,estadoCamera.zoom*1.35);estadoCamera.lastInteract=performance.now();};
  document.getElementById('zout').onclick=function(){estadoCamera.target=null;estadoCamera.zoom=Math.max(.8,estadoCamera.zoom/1.35);estadoCamera.lastInteract=performance.now();};
  spinB = document.getElementById('spin');
  spinB.setAttribute('aria-pressed',estadoCamera.auto?'true':'false');spinB.style.opacity=estadoCamera.auto?1:.5;
  spinB.onclick=function(){estadoCamera.auto=!estadoCamera.auto;spinB.setAttribute('aria-pressed',estadoCamera.auto?'true':'false');spinB.style.opacity=estadoCamera.auto?1:.5;
    setStatus(estadoCamera.auto?'🔄 Giro automático ligado: o globo gira sozinho quando você não está mexendo.':'🔄 Giro automático desligado: o globo fica parado.',2600);};
  lp = document.getElementById('lp');
  lc = document.getElementById('lc');
  lp.onclick=function(){estadoMapa.labelMode='p';lp.setAttribute('aria-pressed','true');lc.setAttribute('aria-pressed','false');};
  lc.onclick=function(){estadoMapa.labelMode='c';lc.setAttribute('aria-pressed','true');lp.setAttribute('aria-pressed','false');};
  /* ---------- Cabeçalho que cabe na tela ---------- */
  var agendado=0;
  var agendar=function(){if(!agendado)agendado=requestAnimationFrame(function(){agendado=0;encaixarCabecalho();});};
  if(window.ResizeObserver)new ResizeObserver(agendar).observe(document.querySelector('header .hbtns'));
  window.addEventListener('resize',agendar);
  encaixarCabecalho();
}

export { encaixarCabecalho, iniciar, spinB };
