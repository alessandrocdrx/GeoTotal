/**
 * @arquivo js/interface/legenda.js
 * Camada: Interface
 * Legenda das formas dos marcadores (uma por continente), mostrada na primeira visita ao modo Livre.
 */

import { D, REG } from '../dados/paises.js';
import { $, lsGet, lsSet } from '../nucleo/utilitarios.js';
import { SHAPES } from '../visualizacao/marcadores.js';

/* Iniciantes viam ●▲■◆ no globo sem saber o que eram. A legenda aparece uma vez e some no "Entendi". */

const SIMBOLO = { c: '●', d: '◆', s: '■', t: '▲' };

function mostrarLegenda(){
  if(lsGet('globo.legenda.vista',false)||$('card').style.display==='block')return;
  var box=$('legitens');box.innerHTML='';
  REG.forEach(function(rg,ri){
    if(!SHAPES[ri]||!D.some(function(d){return d.r===ri;}))return;
    var it=document.createElement('span');
    var f=document.createElement('i');f.textContent=SIMBOLO[SHAPES[ri]];f.style.color=rg.c;
    it.appendChild(f);it.appendChild(document.createTextNode(' '+rg.n));box.appendChild(it);
  });
  $('legenda').hidden=false;
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  $('legok').onclick=function(){lsSet('globo.legenda.vista',true);$('legenda').hidden=true;};
  $('qclose').addEventListener('click',function(){setTimeout(mostrarLegenda,600);});
  $('qbtn').addEventListener('click',function(){$('legenda').hidden=true;});
  /* tocar no globo já é "entendi": a legenda sai do caminho e não volta */
  $('g').addEventListener('pointerdown',function(){if(!$('legenda').hidden){lsSet('globo.legenda.vista',true);$('legenda').hidden=true;}});
}

export { iniciar };
