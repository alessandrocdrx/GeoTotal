/**
 * @arquivo js/interface/menu.js
 * Camada: Interface
 * Menu "⋯": uma página só com as escolhas à vista; só "Explorar" abre páginas internas.
 */

import { alternarEfeitos, alternarMudo, alternarMusica, estadoSom } from '../nucleo/som.js';
import { $, lsGet, lsSet, setStatus } from '../nucleo/utilitarios.js';
import { estadoMapa } from '../visualizacao/tela.js';

/* ---------- menu Mais ---------- */
let themeMode;
function applyTheme(){
  document.documentElement.removeAttribute('data-theme');
  if(themeMode==='light')document.documentElement.setAttribute('data-theme','light');
  else if(themeMode==='dark')document.documentElement.setAttribute('data-theme','dark');
}
function mShow(id){
  $('mlist').hidden=!!id;
  Array.prototype.forEach.call(document.querySelectorAll('#msheet .mpage'),function(pg){pg.hidden=pg.id!==id;});
  $('mback').hidden=!id;$('mtitle').textContent=id?$(id).getAttribute('data-t'):'Mais';
  var bx=$('msheet').querySelector('.box');if(bx)bx.scrollTop=0;
}
/** Botões lado a lado (.aseg): marca o valor atual e chama definir(valor) ao tocar. */
function ligarSeg(box,atual,definir){
  function marca(v){Array.prototype.forEach.call(box.querySelectorAll('button'),function(b){b.setAttribute('aria-pressed',b.getAttribute('data-v')===v?'true':'false');});}
  Array.prototype.forEach.call(box.querySelectorAll('button'),function(b){b.onclick=function(){var v=b.getAttribute('data-v');definir(v);marca(v);};});
  marca(atual);
  return marca;
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  themeMode = lsGet('globo.theme','auto');
  applyTheme();
  ligarSeg($('mtema'),themeMode,function(v){themeMode=v;lsSet('globo.theme',v);applyTheme();});
  Array.prototype.forEach.call(document.querySelectorAll('#mlist [data-p]'),function(b){b.onclick=function(){mShow(b.getAttribute('data-p'));};});
  $('mback').onclick=function(){mShow(null);};
  /* som: o 🔊 do topo é o mudo geral; no menu, efeitos e música têm cada um sua chave */
  function somV(){$('msfx').checked=estadoSom.efeitos;$('mmusic').checked=estadoSom.musica;}
  $('msfx').onchange=function(){if(this.checked!==estadoSom.efeitos)alternarEfeitos();somV();};
  $('mmusic').onchange=function(){if(this.checked!==estadoSom.musica)alternarMusica();somV();};
  somV();
  function somH(){var b=$('msom');b.textContent=estadoSom.mudo?'🔇':'🔊';b.setAttribute('aria-label',estadoSom.mudo?'Som desligado':'Som ligado');b.classList.toggle('mudo',estadoSom.mudo);}
  $('msom').onclick=function(){alternarMudo();somH();setStatus(estadoSom.mudo?'🔇 Som desligado':'🔊 Som ligado (a música toca no modo Livre)',2200);};
  somH();
  var marcaNomes=ligarSeg($('mlabels'),estadoMapa.labelMode,function(v){$(v==='c'?'lc':'lp').click();});
  $('mbtn').onclick=function(){marcaNomes(estadoMapa.labelMode);somV();mShow(null);$('msheet').style.display='block';};
  $('mclose').onclick=function(){$('msheet').style.display='none';};
  $('msheet').addEventListener('pointerdown',function(e){if(e.target===$('msheet'))$('msheet').style.display='none';});
  $('txtd').addEventListener('pointerdown',function(e){if(e.target===$('txtd'))$('txtd').style.display='none';});
}

export { iniciar, ligarSeg };
