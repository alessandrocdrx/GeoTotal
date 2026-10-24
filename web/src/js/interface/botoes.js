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

/* passos para o cabeçalho caber, nesta ordem (ux.css): botões mais justos, tudo menor, o 🔥 da
   sequência sai do topo e, por último, nome e atalhos ainda menores; o nome geoTotal nunca sai */
const APERTOS = ['cab-apertado', 'cab-apertado2', 'cab-apertado3', 'cab-apertado4'];

/**
 * Cabeçalho sob medida para a largura do celular. Se não cabe (fonte larga, 🔥 da sequência
 * aparecendo), aplica os passos de APERTOS só até caber: nenhum atalho some e a logo e o nome
 * geoTotal ficam. Sem isso a página ganhava rolagem lateral e o ⋯ ficava fora da tela.
 */
function encaixarCabecalho(){
  var htop=document.querySelector('header .htop');if(!htop)return;
  var b=document.body,cs=getComputedStyle(htop.parentNode),pad=parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight);
  var L=larguraDaTela();
  htop.style.zoom='';
  APERTOS.forEach(function(c){b.classList.remove(c);});
  for(var k=0;k<APERTOS.length&&htop.scrollWidth+pad>L+0.5;k++)b.classList.add(APERTOS[k]);
  /* no celular, se sobrar espaço (também depois dos passos), o cabeçalho inteiro cresce por igual
     (logo, nome e atalhos) até ocupar a largura, no máximo 20% maior */
  if(L<=460){
    var h1=htop.querySelector('h1'),hb=htop.querySelector('.hbtns');
    var usado=h1.getBoundingClientRect().width+hb.getBoundingClientRect().width+(parseFloat(getComputedStyle(htop).columnGap)||0);
    var z=Math.min(1.2,Math.floor((L-pad-2)/usado*100)/100);
    if(z>1.01)htop.style.zoom=String(z);
  }
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
