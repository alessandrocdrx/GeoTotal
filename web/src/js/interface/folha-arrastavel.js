/**
 * @arquivo js/interface/folha-arrastavel.js
 * Camada: Interface
 * Alça no alto dos cartões (país, estado, área natural): arrastar para cima aumenta, para baixo diminui,
 * como as folhas dos apps de mapa. Um toque na alça alterna entre pequeno e grande.
 */

import { lsGet, lsSet } from '../nucleo/utilitarios.js';

/**
 * Liga a alça. op.chave guarda o tamanho preferido; op.pequeno() e op.grande() trocam o conteúdo;
 * op.ehGrande() diz o estado atual; op.mudou() é chamado depois de cada mudança; op.fechar (opcional)
 * é chamado ao puxar bem para baixo.
 */
function folhaArrastavel(el,op){
  var alca=document.createElement('div');alca.className='alca';alca.setAttribute('role','button');
  alca.setAttribute('aria-label','Arraste para aumentar ou diminuir');alca.tabIndex=0;
  alca.appendChild(document.createElement('i'));
  el.insertBefore(alca,el.firstChild);
  var y0=0,h0=0,arrastando=false,mexeu=0;
  function altoMax(){var p=el.parentElement;return (p?p.clientHeight:window.innerHeight)*0.9;}
  function aplicar(fr){el.style.maxHeight='none';el.style.height=Math.round(Math.max(180,Math.min(altoMax(),fr*altoMax()/0.9)))+'px';}
  function soltarAltura(){el.style.height='';el.style.maxHeight='';}
  /* aberta pelo botão, a folha grande mostra bastante coisa (sem cobrir o mapa todo), mesmo que tenha sido encolhida antes */
  function abrirGrande(){op.grande();aplicar(Math.max(0.5,lsGet(op.chave,0.72)));op.mudou();}
  function abrirPequeno(){op.pequeno();soltarAltura();op.mudou();}
  alca.addEventListener('pointerdown',function(e){
    arrastando=true;mexeu=0;y0=e.clientY;h0=el.offsetHeight;alca.setPointerCapture(e.pointerId);e.preventDefault();
  });
  alca.addEventListener('pointermove',function(e){
    if(!arrastando)return;
    var dy=y0-e.clientY;mexeu=Math.max(mexeu,Math.abs(dy));
    if(mexeu<6)return;
    if(dy>0&&!op.ehGrande())op.grande();
    el.style.maxHeight='none';el.style.height=Math.round(Math.max(120,Math.min(altoMax(),h0+dy)))+'px';
  });
  alca.addEventListener('pointerup',function(e){
    if(!arrastando)return;arrastando=false;
    if(mexeu<6){if(op.ehGrande())abrirPequeno();else abrirGrande();return;}
    var h=el.offsetHeight,dy=y0-e.clientY;
    if(op.fechar&&h0+dy<110){soltarAltura();op.fechar();return;}
    if(h<h0-40&&h<260){abrirPequeno();return;}
    var fr=h/altoMax()*0.9;lsSet(op.chave,Math.round(fr*100)/100);
    if(!op.ehGrande())op.grande();
    op.mudou();
  });
  alca.addEventListener('pointercancel',function(){arrastando=false;});
  alca.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();if(op.ehGrande())abrirPequeno();else abrirGrande();}});
  return {grande:abrirGrande,pequeno:abrirPequeno,soltar:soltarAltura};
}

export { folhaArrastavel };
