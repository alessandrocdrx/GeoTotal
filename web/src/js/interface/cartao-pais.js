/**
 * @arquivo js/interface/cartao-pais.js
 * Camada: Interface
 * Cartão do país selecionado: abrir, preencher, navegar (anterior/próximo, deslizar).
 */

import { D, dflag, REG } from '../dados/paises.js';
import { NB, short } from '../dados/vizinhos.js';
import { card, closeCard, fillInfo, fmtArea, fmtPop, measureCard, tourStop } from './cartao-detalhes.js';
import { afterFilter, toggleNb, updateNbBtn } from './filtros.js';
import { ganchosInterface } from './ganchos.js';
import { emitir } from '../nucleo/eventos.js';
import { flyTo } from '../visualizacao/animacao.js';
import { countryView, zoomFor } from '../visualizacao/enquadramento.js';
import { estadoBrasil } from '../visualizacao/estados.js';
import { ganchos } from '../visualizacao/ganchos.js';
import { estadoCamera, estadoMapa } from '../visualizacao/tela.js';

/* ---------- Cartão ---------- */
function renderNear(group,cur,pick,label){
  var box=document.getElementById('cnear');box.innerHTML='';
  var others=(group||[]).filter(function(x){return x!==cur;}).slice(0,5);
  if(!others.length){box.hidden=true;return;}
  var t=document.createElement('span');t.className='nt';t.textContent='Também perto do seu toque';box.appendChild(t);
  others.forEach(function(o){var b=document.createElement('button');b.textContent=label(o);b.onclick=function(){tourStop();pick(o);};box.appendChild(b);});
  box.hidden=false;
}
/* desempenho no treino (todos os tipos de pergunta, desde o último "zerar progresso") */
/* linha discreta no treino: o seu histórico com este país neste tipo de pergunta */
function renderFacts(rows){
  var box=document.getElementById('cfacts');box.innerHTML='';
  rows.forEach(function(r){
    if(!r[1])return;
    var f=document.createElement('div');f.className='fact';
    var a=document.createElement('span');a.textContent=r[0];
    var b=document.createElement('b');b.textContent=r[1];
    f.appendChild(a);f.appendChild(b);box.appendChild(f);
  });
}
function renderChips(title,items,empty){
  var box=document.getElementById('cnb');box.innerHTML='';
  var t=document.createElement('div');t.className='st';t.textContent=title+(items.length?' ('+items.length+')':'');box.appendChild(t);
  if(!items.length){var e=document.createElement('div');e.className='none';e.textContent=empty;box.appendChild(e);return;}
  var w=document.createElement('div');w.className='chipsx';
  items.forEach(function(it){var b=document.createElement('button');b.textContent=it.t;b.onclick=function(){tourStop();it.f();};w.appendChild(b);});
  box.appendChild(w);
}
function select(d,fly,group){
  if(ganchos.treinoAberto())return;
  if(!estadoMapa.on[d.i]){estadoMapa.on[d.i]=1;afterFilter();}
  estadoMapa.selected=d;
  document.getElementById('hint').style.display='none';
  document.getElementById('cdot').style.background=REG[d.r].c;
  document.getElementById('creg').textContent=(d.sub===REG[d.r].n)?REG[d.r].n:REG[d.r].n+' · '+d.sub;
  var cfl=document.getElementById('cflag');
  if(d.dis){cfl.className='flag sig';cfl.textContent=d.cc;}else{cfl.className='flag';cfl.textContent=d.flag;}
  document.getElementById('cname').textContent=d.name;
  var dtag=document.getElementById('cdis');
  if(!dtag){dtag=document.createElement('span');dtag.id='cdis';dtag.className='distag';document.getElementById('cname').insertAdjacentElement('afterend',dtag);}
  dtag.textContent=d.dis?'Não reconhecido pela ONU':(d.dep?'Território dependente':(d.uni?(d.r===7?'Antártida e ilhas remotas':'Território desabitado'):''));dtag.style.display=(d.dis||d.dep||d.uni)?'inline-block':'none';dtag.classList.toggle('dep',!!(d.dep||d.uni));
  document.getElementById('ccap').textContent=d.cap;
  /* observação sobre a capital fica junto dela; o resto vira "Saiba mais" */
  ganchosInterface.mostrarDesempenho(d.cc,false);
  var capNote=/capital|sede|Putrajaya/i.test(d.obs);
  document.getElementById('ccapnote').textContent=capNote?d.obs:'';
  var ob=document.getElementById('cobs');ob.textContent=capNote?'':d.obs;ob.style.display=(d.obs&&!capNote)?'block':'none';
  var x=d.info;
  renderFacts(x?[['👥 População',fmtPop(x.pop)],['📐 Área',fmtArea(x.area)],['🗣️ Idioma',x.lang],['💰 Moeda',x.cur]]:[]);
  renderChips('Fronteiras por terra',NB[d.i].map(function(i){return {t:dflag(D[i])+' '+short(D[i]),f:function(){select(D[i],true);}};}),
    'Não faz fronteira terrestre com outro país.');
  card.style.display='block';
  updateNbBtn();ganchosInterface.atualizarBotaoEstados();
  renderNear(group,d,function(x){select(x,false,group);},function(x){return x.flag+' '+short(x);});
  document.getElementById('cncty').hidden=true;
  fillInfo(d);setTimeout(measureCard,40);
  emitir('visao-mudou');
  if(fly===false)flyTo(d.lat,d.lng,Math.max(estadoCamera.zoom,1.5));
  else{var cv2=countryView(d.i);flyTo(cv2.lat,cv2.lng,zoomFor(cv2.r,5.5));}
}
function step(dir){
  if(estadoBrasil.statesMode){ganchosInterface.passoEstado(dir);return;}
  if(!estadoMapa.selected)return;
  var i=estadoMapa.selected.i,n=D.length;
  for(var k=0;k<n;k++){i=(i+dir+n)%n;if(estadoMapa.on[i]){select(D[i],true);return;}}
}

let sw = null;
/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  document.getElementById('close').onclick=closeCard;
  document.getElementById('prev').onclick=function(){step(-1);};
  document.getElementById('next').onclick=function(){step(1);};
  document.getElementById('nbtn').onclick=toggleNb;
  /* deslizar o cartão para o lado troca de país */
  card.addEventListener('pointerdown',function(e){if(e.target.closest('button')){sw=null;return;}sw={x:e.clientX,y:e.clientY};});
  card.addEventListener('pointerup',function(e){if(!sw)return;var dx=e.clientX-sw.x,dy=e.clientY-sw.y;sw=null;if(Math.abs(dx)>60&&Math.abs(dy)<45)step(dx<0?1:-1);});
}

export { iniciar, renderChips, renderFacts, renderNear, select, step };
