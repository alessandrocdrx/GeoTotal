/**
 * @arquivo js/interface/cartao-detalhes.js
 * Camada: Interface
 * Base do cartão: elemento, altura, detalhes extras, fechar e parar o passeio.
 */

import { appendLang, appendRel } from '../dados/linguas.js';
import { $ } from '../nucleo/utilitarios.js';
import { estadoBrasil } from '../visualizacao/estados.js';
import { ganchos } from '../visualizacao/ganchos.js';
import { estadoMapa } from '../visualizacao/tela.js';

/** Estado compartilhado com outros módulos (leitura e escrita por estadoCartao.nome). */
const estadoCartao = {
  cardH: 0,
  /** Intervalo do passeio automático pela rota (null = parado). */
  passeio: null,
};

/* ---------- cartão: dados extras, recolher, deslizar ---------- */
function fmtPop(p){
  if(!p)return 'Sem população permanente';
  if(p>=1e6)return (p/1e6).toFixed(2).replace('.',',')+' bilhões';
  if(p>=1000){var m=p/1000;return (m<100?m.toFixed(1).replace('.',','):Math.round(m))+' milhões';}
  if(p>=1)return Math.round(p).toLocaleString('pt-BR')+' mil';
  return 'cerca de '+Math.round(p*1000)+' habitantes';
}
function fmtArea(a){return (a<10?String(a).replace('.',','):Math.round(a).toLocaleString('pt-BR'))+' km²';}
function fillInfo(d){
  var box=$('cinfo');box.innerHTML='';
  var x=d.info;
  if(!x){box.textContent='Sem dados adicionais para este território.';return;}
  [['Fuso horário',x.tz],['Telefone (DDI)',x.dial],['Domínio de internet',x.tld]].forEach(function(r){
    var row=document.createElement('div');row.className='irow';
    var a=document.createElement('span');a.textContent=r[0];
    var b=document.createElement('b');b.textContent=r[1];
    row.appendChild(a);row.appendChild(b);box.appendChild(row);
  });
  appendLang(box,d);
  appendRel(box,d);
  var n=document.createElement('div');n.className='inote';
  n.textContent='Valores aproximados (estimativas por volta de 2024). Confira em fonte oficial antes de citar.';
  box.appendChild(n);
}
function measureCard(){estadoCartao.cardH=card.style.display==='block'?card.offsetHeight+10:0;}

let card;
function closeCard(){estadoMapa.selected=null;estadoBrasil.selSt=null;card.style.display='none';estadoCartao.cardH=0;tourStop();}
function tourStop(){if(!estadoCartao.passeio)return;clearInterval(estadoCartao.passeio);estadoCartao.passeio=null;$('tour').textContent='🎬';$('tour').setAttribute('aria-label','Passeio pelos países');}
/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  card = document.getElementById('card');
  ganchos.alturaCartao = function(){return estadoCartao.cardH;};
  $('moreb').onclick=function(){var b=$('cinfo');b.hidden=!b.hidden;$('moreb').textContent=b.hidden?'Ver mais detalhes ▾':'Ver menos ▴';setTimeout(measureCard,40);};
  window.addEventListener('resize',function(){setTimeout(measureCard,60);});
}

export { card, closeCard, estadoCartao, fillInfo, fmtArea, fmtPop, iniciar, measureCard, tourStop };
