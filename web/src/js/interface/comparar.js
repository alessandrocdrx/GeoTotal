/**
 * @arquivo js/interface/comparar.js
 * Camada: Interface
 * Comparar países (menu ⋯ > Explorar) como um duelo: barras que crescem, quem vence cada quesito,
 * placar e curiosidades (quantas vezes um cabe no outro, distância entre as capitais, se são vizinhos).
 */

import { D, dflag } from '../dados/paises.js';
import { capShort, NB, short } from '../dados/vizinhos.js';
import { haversine } from '../nucleo/geo.js';
import { $ } from '../nucleo/utilitarios.js';
import { fmtArea, fmtPop } from './cartao-detalhes.js';
import { fillCountrySelect } from './distancia.js';

function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
function num(v){return v.toLocaleString('pt-BR',{maximumFractionDigits:1});}
function dens(x){return (x&&x.pop&&x.area)?x.pop*1000/x.area:0;}
function vezes(a,b){var r=a/b;return r>=10?Math.round(r).toLocaleString('pt-BR'):r.toFixed(1).replace('.',',');}

/* quesitos com número: quem tem mais vence */
const QUESITOS = [
  ['👥','População',function(d){return d.info?d.info.pop:0;},function(d){return d.info?fmtPop(d.info.pop):'—';}],
  ['📐','Área',function(d){return d.info?d.info.area:0;},function(d){return d.info?fmtArea(d.info.area):'—';}],
  ['🏙️','Gente por km²',function(d){return dens(d.info);},function(d){var v=dens(d.info);return v?num(Math.round(v))+' hab./km²':'—';}],
  ['🤝','Vizinhos',function(d){return (NB[d.i]||[]).length;},function(d){var n=(NB[d.i]||[]).length;return n?n+(n===1?' país':' países'):'Nenhum (ilha)';}],
];

function linhaQuesito(box,q,a,b,ordem){
  var va=q[2](a),vb=q[2](b),mx=Math.max(va,vb)||1;
  var r=el('div','duelrow');r.style.setProperty('--atraso',(ordem*0.12)+'s');
  r.appendChild(el('div','dueltit',q[0]+' '+q[1]));
  [[a,va,'a'],[b,vb,'b']].forEach(function(p){
    var lado=el('div','duellado '+p[2]+(p[1]>(p[2]==='a'?vb:va)?' vence':''));
    var barra=el('div','duelbar');var fill=el('i');barra.appendChild(fill);
    lado.appendChild(el('span','duelflag',dflag(p[0])));lado.appendChild(barra);lado.appendChild(el('b',null,q[3](p[0])));
    r.appendChild(lado);
    requestAnimationFrame(function(){requestAnimationFrame(function(){fill.style.width=Math.max(3,Math.round(100*p[1]/mx))+'%';});});
  });
  box.appendChild(r);
  return va===vb?0:(va>vb?1:-1);
}

function curiosidades(a,b){
  var out=[],ia=a.info,ib=b.info;
  /* com as bandeiras no lugar dos nomes, a frase não tropeça nos artigos (o Brasil, a Argentina, Portugal) */
  if((NB[a.i]||[]).indexOf(b.i)>=0)out.push('🤝 São vizinhos: '+dflag(a)+' e '+dflag(b)+' fazem fronteira.');
  if(ia&&ib&&ia.area&&ib.area){
    var g=ia.area>=ib.area?a:b,p=g===a?b:a,gi=g.info.area,pi=p.info.area;
    if(gi/pi>=1.2)out.push('📐 '+dflag(g)+' é '+vezes(gi,pi)+' vezes maior que '+dflag(p)+' em área.');
    else out.push('📐 Têm quase o mesmo tamanho.');
  }
  if(ia&&ib&&ia.pop&&ib.pop){
    var mg=ia.pop>=ib.pop?a:b,mp=mg===a?b:a;
    if(mg.info.pop/mp.info.pop>=1.2)out.push('👥 Para cada pessoa em '+dflag(mp)+', há '+vezes(mg.info.pop,mp.info.pop)+' em '+dflag(mg)+'.');
  }
  var km=Math.round(haversine(a,b));
  out.push('✈️ De '+capShort(a)+' a '+capShort(b)+': '+km.toLocaleString('pt-BR')+' km, umas '+(km/850).toFixed(1).replace('.',',')+' h de voo direto.');
  if(ia&&ib&&ia.lang&&ib.lang){
    var la=ia.lang.split(/,| e /)[0].trim(),lb=ib.lang.split(/,| e /)[0].trim();
    if(la===lb)out.push('🗣️ Nos dois se fala '+la.toLowerCase()+'.');
  }
  if(ia&&ib&&ia.cur&&ia.cur===ib.cur)out.push('💰 Usam a mesma moeda: '+ia.cur.replace(/\s*\(.*\)$/,'').toLowerCase()+'.');
  return out;
}

function comparar(){
  var a=D[+$('cmpA').value],b=D[+$('cmpB').value],box=$('cmpres');box.innerHTML='';
  if(a===b){box.textContent='Escolha dois países diferentes.';return;}
  var head=el('div','duelhead');
  [[a,'a'],[b,'b']].forEach(function(p,k){
    var c=el('div','duelpais '+p[1]);c.appendChild(el('span','duelbig',dflag(p[0])));c.appendChild(el('b',null,short(p[0])));
    head.appendChild(c);if(k===0)head.appendChild(el('div','duelvs','VS'));
  });
  box.appendChild(head);
  var pa=0,pb=0;
  QUESITOS.forEach(function(q,k){var v=linhaQuesito(box,q,a,b,k);if(v>0)pa++;else if(v<0)pb++;});
  var placar=el('div','duelplacar');
  placar.textContent=pa===pb?('Empate: '+pa+' × '+pb):('🏆 '+short(pa>pb?a:b)+' vence por '+Math.max(pa,pb)+' × '+Math.min(pa,pb));
  box.appendChild(placar);
  var cur=el('div','duelcurio');
  curiosidades(a,b).forEach(function(t){cur.appendChild(el('p',null,t));});
  box.appendChild(cur);
  var ver=el('button','cstreinar','📏 Ver a distância no globo');
  ver.onclick=function(){$('dA').value=a.i;$('dB').value=b.i;$('dgo').click();};
  box.appendChild(ver);
  /* quesitos sem vencedor: só lado a lado */
  var tab=el('div','duelinfo');
  [['🗣️ Idioma','lang'],['💰 Moeda','cur'],['🕐 Fuso','tz']].forEach(function(f){
    var r=el('div','cmprow');
    r.appendChild(el('div','cmpv',a.info?a.info[f[1]]:'—'));r.appendChild(el('div','cmpl',f[0]));r.appendChild(el('div','cmpv',b.info?b.info[f[1]]:'—'));
    tab.appendChild(r);
  });
  box.appendChild(tab);
  box.appendChild(el('div','inote','Valores aproximados. Confira em fonte oficial antes de citar.'));
}

function sortear(){
  var ok=D.filter(function(d){return d.info&&d.info.pop&&!d.uni&&!d.dep;});
  var a=ok[Math.floor(Math.random()*ok.length)],b;
  /* metade das vezes, um vizinho ou alguém da mesma região: rende comparações mais interessantes */
  var perto=Math.random()<0.5?(NB[a.i]||[]).map(function(i){return D[i];}).filter(function(d){return ok.indexOf(d)>=0;}):[];
  if(!perto.length)perto=ok.filter(function(d){return d.r===a.r&&d!==a;});
  b=perto.length?perto[Math.floor(Math.random()*perto.length)]:ok[(ok.indexOf(a)+1)%ok.length];
  $('cmpA').value=a.i;$('cmpB').value=b.i;comparar();
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  fillCountrySelect($('cmpA'),'Brasil');fillCountrySelect($('cmpB'),'Argentina');
  /* abre já comparando (e com as barras crescendo) */
  document.querySelector('#mlist [data-p="mp-cmp"]').addEventListener('click',comparar);
  $('cmpA').onchange=comparar;$('cmpB').onchange=comparar;
  $('cmpSort').onclick=sortear;
  $('cmpTroca').onclick=function(){var t=$('cmpA').value;$('cmpA').value=$('cmpB').value;$('cmpB').value=t;comparar();};
}

export { comparar, iniciar };
