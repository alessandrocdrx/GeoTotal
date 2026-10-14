/**
 * @arquivo js/interface/escolha-pais.js
 * Camada: Interface
 * Escolher um país digitando: as listas de país (Distância, Comparar, Filtros) abrem uma tela com
 * busca por nome, capital ou sigla, em vez da lista enorme do sistema. O <select> continua sendo
 * a fonte do valor: a escolha muda o value e dispara "change", como antes.
 */

import { D, norm } from '../dados/paises.js';
import { capShort, short } from '../dados/vizinhos.js';

let ov = null, aberto = null;

function montar(){
  ov=document.createElement('div');ov.id='escolha';ov.className='escolha';ov.hidden=true;
  ov.innerHTML='<div class="esbox"><div class="eshead"><b id="estit"></b><button class="closeb" id="esfechar" aria-label="Fechar">✕</button></div>'+
    '<input id="esq" type="search" autocomplete="off" placeholder="Digite o país, a capital ou a sigla" aria-label="Buscar país">'+
    '<div id="eslista" class="eslista" role="listbox"></div></div>';
  document.body.appendChild(ov);
  ov.querySelector('#esfechar').onclick=fechar;
  ov.addEventListener('pointerdown',function(e){if(e.target===ov)fechar();});
  ov.querySelector('#esq').addEventListener('input',function(){listar(this.value);});
  ov.querySelector('#esq').addEventListener('keydown',function(e){
    if(e.key==='Enter'){var b=ov.querySelector('#eslista button');if(b){e.preventDefault();b.click();}}
    if(e.key==='Escape')fechar();
  });
}
function fechar(){if(ov)ov.hidden=true;aberto=null;}
function listar(q){
  var box=ov.querySelector('#eslista');box.innerHTML='';
  var t=norm((q||'').trim()),ops=[];
  Array.prototype.forEach.call(aberto.options,function(o){
    if(o.value==='')return;
    var d=D[+o.value];if(!d)return;
    var nome=norm(short(d)),pos=-1;
    if(!t)pos=0;
    else if(nome.indexOf(t)===0)pos=0;
    else if(nome.indexOf(t)>0||norm(d.name).indexOf(t)>=0)pos=1;
    else if(norm(d.cap).indexOf(t)>=0)pos=2;
    else if(t.length===2&&d.cc.toLowerCase()===t)pos=0;
    if(pos>=0)ops.push({o:o,d:d,pos:pos});
  });
  ops.sort(function(a,b){return a.pos-b.pos;});
  ops.slice(0,80).forEach(function(x){
    var b=document.createElement('button');b.className='esitem';b.setAttribute('role','option');
    if(String(x.o.value)===String(aberto.value))b.classList.add('on');
    var f=document.createElement('span');f.className='esflag';f.textContent=x.d.flag;
    var n=document.createElement('span');n.className='esnome';n.textContent=short(x.d);
    var c=document.createElement('small');c.textContent=capShort(x.d);
    n.appendChild(c);b.appendChild(f);b.appendChild(n);
    b.onclick=function(){var s=aberto;fechar();s.value=x.o.value;s.dispatchEvent(new Event('change',{bubbles:true}));};
    box.appendChild(b);
  });
  if(!ops.length){var v=document.createElement('div');v.className='esvazio';v.textContent='Nenhum país com esse nome.';box.appendChild(v);}
}
function abrir(sel,titulo){
  if(!ov)montar();
  aberto=sel;ov.querySelector('#estit').textContent=titulo||sel.dataset.titulo||sel.getAttribute('aria-label')||'Escolha um país';
  var q=ov.querySelector('#esq');q.value='';listar('');ov.hidden=false;
  setTimeout(function(){q.focus();},60);
}

/** Faz o <select> de países abrir a busca ao ser tocado (uma vez por select). */
function buscaNoSelect(sel,titulo){
  if(sel.dataset.busca)return;sel.dataset.busca='1';
  function interceptar(e){e.preventDefault();e.stopPropagation();abrir(sel,titulo);}
  sel.addEventListener('mousedown',interceptar);
  sel.addEventListener('touchend',function(e){if(e.cancelable)interceptar(e);});
  sel.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){interceptar(e);}});
}

export { buscaNoSelect, fechar as fecharEscolha };
