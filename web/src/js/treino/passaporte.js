/**
 * @arquivo js/treino/passaporte.js
 * Camada: Treino
 * Passaporte: um carimbo (a bandeira) para cada país que você domina em País → Capital.
 */

import { D, REG } from '../dados/paises.js';
import { $ } from '../nucleo/utilitarios.js';
import { estadoTreino } from './estado.js';

/* o carimbo é o mesmo critério do "Domina …" e do dourado no globo: 3 acertos seguidos da capital */
function carimbado(d){var e=(estadoTreino.QS.m.cap||{})[d.cc];return !!(e&&e.s>=3);}
function paisesDoPassaporte(){return D.filter(function(d){return !d.dep&&!d.uni;});}
function contarCarimbos(){var l=paisesDoPassaporte();return [l.filter(carimbado).length,l.length];}

function abrirPassaporte(){
  var box=$('passbody');box.innerHTML='';
  var c=contarCarimbos();
  $('passhead').textContent='🛂 Passaporte ('+c[0]+' de '+c[1]+')';
  var intro=document.createElement('div');intro.className='passintro';
  intro.textContent='Cada país ganha o carimbo quando você acerta a capital dele 3 vezes seguidas, em rodadas diferentes.';
  box.appendChild(intro);
  REG.forEach(function(rg,ri){
    var lista=paisesDoPassaporte().filter(function(d){return d.r===ri;});
    if(!lista.length)return;
    var feitos=lista.filter(carimbado).length;
    var h=document.createElement('div');h.className='passreg';
    var t=document.createElement('b');t.textContent=rg.n;var n=document.createElement('span');n.textContent=feitos+' de '+lista.length;
    h.appendChild(t);h.appendChild(n);box.appendChild(h);
    var g=document.createElement('div');g.className='passgrid';
    lista.slice().sort(function(a,b){return (carimbado(b)-carimbado(a))||a.name.localeCompare(b.name);}).forEach(function(d){
      var on=carimbado(d),cel=document.createElement('div');cel.className='carimbo'+(on?' on':'');
      cel.title=d.name+(on?'':' (ainda sem carimbo)');
      var f=document.createElement('span');f.className='cbandeira';f.textContent=d.dis?'🏳️':d.flag;
      var nm=document.createElement('small');nm.textContent=d.name;
      cel.appendChild(f);cel.appendChild(nm);g.appendChild(cel);
    });
    box.appendChild(g);
  });
  $('passsheet').style.display='block';
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  $('mpassaporte').onclick=abrirPassaporte;
  $('passclose').onclick=function(){$('passsheet').style.display='none';};
}

export { abrirPassaporte, contarCarimbos, iniciar };
