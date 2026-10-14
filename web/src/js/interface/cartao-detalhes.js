/**
 * @arquivo js/interface/cartao-detalhes.js
 * Camada: Interface
 * Base do cartão: elemento, altura, detalhes extras, fechar e parar o passeio.
 */

import { appendLang, appendRel } from '../dados/linguas.js';
import { INFO_MIC } from '../dados/micronacoes.js';
import { $, notaAjuda, setStatus } from '../nucleo/utilitarios.js';
import { folhaArrastavel } from './folha-arrastavel.js';
import { estadoBrasil } from '../visualizacao/estados.js';
import { ganchos } from '../visualizacao/ganchos.js';
import { estadoMapa } from '../visualizacao/tela.js';

/** Estado compartilhado com outros módulos (leitura e escrita por estadoCartao.nome). */
const estadoCartao = {
  /** O usuário abriu "Mais informações" (vale até fechar o cartão). */
  expandido: false,
  cardH: 0,
  /** Intervalo do passeio automático pela rota (null = parado). */
  passeio: null,
  /** Passeio continua sem mostrar o cartão (a pessoa fechou o cartão durante o passeio). */
  semCartao: false,
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
/* micronação: nome oficial, história, curiosidades e o site oficial */
function infoMicronacao(box,mi){
  function tit(t){var h=document.createElement('div');h.className='st micst';h.textContent=t;box.appendChild(h);}
  var no=document.createElement('div');no.className='irow';
  var a=document.createElement('span');a.textContent='Nome oficial';var b=document.createElement('b');b.textContent=mi.nomeOficial;
  no.appendChild(a);no.appendChild(b);box.appendChild(no);
  tit('📜 História');
  mi.historia.forEach(function(t){var p=document.createElement('p');p.className='micp';p.textContent=t;box.appendChild(p);});
  tit('💡 Curiosidades');
  var ul=document.createElement('ul');ul.className='micul';
  mi.curiosidades.forEach(function(t){var li=document.createElement('li');li.textContent=t;ul.appendChild(li);});
  box.appendChild(ul);
  if(mi.site){
    var l=document.createElement('a');l.className='micsite';l.href=mi.site;l.target='_blank';l.rel='noopener';
    l.textContent='🌐 Site oficial: '+mi.site.replace(/^https?:\/\/(www\.)?/,'');box.appendChild(l);
  }
  box.appendChild(notaAjuda('Micronação: se declara país, mas nenhum país da ONU a reconhece. Informações públicas até 2025; confira no site oficial.','O que é uma micronação'));
}
function fillInfo(d){
  var box=$('cinfo');box.innerHTML='';
  var x=d.info,mi=d.mic&&INFO_MIC[d.cc];
  if(mi){infoMicronacao(box,mi);return;}
  if(!x){box.textContent='Sem dados adicionais para este território.';return;}
  [['Fuso horário',x.tz],['Telefone (DDI)',x.dial],['Domínio de internet',x.tld]].forEach(function(r){
    var row=document.createElement('div');row.className='irow';
    var a=document.createElement('span');a.textContent=r[0];
    var b=document.createElement('b');b.textContent=r[1];
    row.appendChild(a);row.appendChild(b);box.appendChild(row);
  });
  appendLang(box,d);
  appendRel(box,d);
  box.appendChild(notaAjuda('Valores aproximados (estimativas por volta de 2024). Confira em fonte oficial antes de citar.'));
}
/* o cartão abre pequeno (bandeira, nome e capital) para sobrar mapa; o resto fica no botão grande */
function aplicarCompacto(){
  card.classList.toggle('compacto',!estadoCartao.expandido);
  $('cinfo').hidden=!estadoCartao.expandido;
  var b=$('cexpandir');b.textContent=estadoCartao.expandido?'▴ Menos informações':'ℹ️ Mais informações';
  b.setAttribute('aria-expanded',estadoCartao.expandido?'true':'false');
}
function measureCard(){estadoCartao.cardH=card.style.display==='block'?card.offsetHeight+10:0;}

let card;
let folha;
function closeCard(){
  /* durante o passeio, fechar o cartão só esconde o cartão: o passeio continua pelo mapa */
  if(estadoCartao.passeio&&estadoMapa.selected){card.style.display='none';estadoCartao.cardH=0;estadoCartao.semCartao=true;setStatus('🎬 O passeio continua sem o cartão. Toque em ⏹ para parar.',3000);return;}
  estadoMapa.selected=null;estadoBrasil.selSt=null;card.style.display='none';estadoCartao.cardH=0;estadoCartao.expandido=false;aplicarCompacto();if(folha)folha.soltar();tourStop();}
function tourStop(){if(!estadoCartao.passeio)return;clearInterval(estadoCartao.passeio);estadoCartao.passeio=null;estadoCartao.semCartao=false;$('tour').textContent='🎬';$('tour').setAttribute('aria-label','Passeio pelos países');}
/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  card = document.getElementById('card');
  ganchos.alturaCartao = function(){return estadoCartao.cardH;};
  /* alça para arrastar o cartão; "Mais informações" faz o mesmo que puxar para cima */
  folha=folhaArrastavel(card,{chave:'globo.cartao.altura',
    grande:function(){estadoCartao.expandido=true;aplicarCompacto();},
    pequeno:function(){estadoCartao.expandido=false;aplicarCompacto();card.scrollTop=0;},
    ehGrande:function(){return estadoCartao.expandido;},
    mudou:function(){setTimeout(measureCard,40);}});
  $('cexpandir').onclick=function(){if(estadoCartao.expandido)folha.pequeno();else folha.grande();};
  aplicarCompacto();
  window.addEventListener('resize',function(){setTimeout(measureCard,60);});
}

export { aplicarCompacto, card, closeCard, estadoCartao, fillInfo, fmtArea, fmtPop, iniciar, measureCard, tourStop };
