/**
 * @arquivo js/interface/menu.js
 * Camada: Interface
 * Menu ☰: uma página só, com o seu nível e atalhos no alto; mapa, som e tela, lugares, progresso,
 * explorar e ajuda. Três tipos de linha: chave, lista com bolinha e linha com › (abre uma tela).
 */

import { alternarEfeitos, alternarMudo, alternarMusica, estadoSom } from '../nucleo/som.js';
import { $, lsGet, lsSet } from '../nucleo/utilitarios.js';
import { estadoMapa } from '../visualizacao/tela.js';

/* ---------- menu Mais ---------- */
let themeMode;
function applyTheme(){
  document.documentElement.removeAttribute('data-theme');
  if(themeMode==='light')document.documentElement.setAttribute('data-theme','light');
  else if(themeMode==='dark')document.documentElement.setAttribute('data-theme','dark');
}
/* páginas dentro de páginas (Mapa › Época do ano): o ← volta para a anterior */
let pilha=[];
function mShow(id){
  $('mlist').hidden=!!id;
  Array.prototype.forEach.call(document.querySelectorAll('#msheet .mpage'),function(pg){pg.hidden=pg.id!==id;});
  /* um botão só no canto esquerdo: ✕ na primeira página, ← nas de dentro */
  $('mback').hidden=!id;$('mclose').hidden=!!id;$('mguia').hidden=!!id;$('mtitle').textContent=id?$(id).getAttribute('data-t'):'Menu';
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
  Array.prototype.forEach.call(document.querySelectorAll('#msheet [data-p]'),function(b){b.onclick=function(){
    var atual=null;Array.prototype.forEach.call(document.querySelectorAll('#msheet .mpage'),function(p){if(!p.hidden)atual=p.id;});
    pilha.push(atual);mShow(b.getAttribute('data-p'));
  };});
  $('mback').onclick=function(){mShow(pilha.length?pilha.pop():null);};
  /* som: o 🔊 do topo é o mudo geral; no menu, efeitos e música têm cada um sua chave */
  function somV(){$('msfx').checked=estadoSom.efeitos;$('mmusic').checked=estadoSom.musica;}
  $('msfx').onchange=function(){if(this.checked!==estadoSom.efeitos)alternarEfeitos();somV();};
  $('mmusic').onchange=function(){if(this.checked!==estadoSom.musica)alternarMusica();somV();};
  somV();
  /* som: chave geral (mudo); no menu Som e tela, efeitos e música têm cada um a sua */
  function somH(){var b=$('msom'),lig=!estadoSom.mudo;b.setAttribute('aria-checked',lig?'true':'false');b.querySelector('.mi').textContent=lig?'🔊':'🔇';b.setAttribute('aria-label',lig?'Som ligado':'Som desligado');}
  $('msom').onclick=function(){alternarMudo();somH();};
  somH();
  var marcaNomes=ligarSeg($('mlabels'),estadoMapa.labelMode,function(v){$(v==='c'?'lc':'lp').click();});
  /* atalhos do alto: pulam para a parte certa da página. A posição é medida na tela (não pelo
     offsetTop, que conta a partir de outra caixa) e desconta o título e os atalhos, que ficam presos
     no alto e cobririam o começo da parte. */
  var caixa=$('msheet').querySelector('.box'),travaAtalho=0;
  function botoesAtalho(){return document.querySelectorAll('#msheet .matal button');}
  function acender(bt){Array.prototype.forEach.call(botoesAtalho(),function(x){x.classList.toggle('at',x===bt);});}
  function topoNaCaixa(el){return el.getBoundingClientRect().top-caixa.getBoundingClientRect().top+caixa.scrollTop;}
  /* altura do que fica preso no alto: o "top" do sticky dos atalhos mais a altura deles (vale mesmo
     antes de eles grudarem, no começo da página) */
  function alturaPresa(){var at=caixa.querySelector('.matal');return (parseFloat(getComputedStyle(at).top)||0)+at.offsetHeight;}
  Array.prototype.forEach.call(botoesAtalho(),function(b){
    b.onclick=function(){
      acender(b);
      /* enquanto a página rola até a parte, o atalho tocado fica aceso (sem piscar os do caminho) */
      travaAtalho=Date.now()+900;
      caixa.scrollTo({top:Math.max(0,topoNaCaixa($(b.dataset.ir))-alturaPresa()-22),behavior:'smooth'});
    };
  });
  /* ao rolar, acende o atalho da parte que está logo abaixo dos atalhos */
  caixa.addEventListener('scroll',function(){
    if(!$('mlist').offsetParent||Date.now()<travaAtalho)return;
    var bts=botoesAtalho(),lim=caixa.scrollTop+alturaPresa()+40,atual=null;
    Array.prototype.forEach.call(bts,function(b){if(topoNaCaixa($(b.dataset.ir))<=lim)atual=b;});
    /* no fim da página a última parte pode nem chegar ao alto: chegou ao fim, acende o último atalho */
    if(caixa.scrollTop+caixa.clientHeight>=caixa.scrollHeight-4)atual=bts[bts.length-1];
    acender(atual);
  },{passive:true});
  /* o guia "Como jogar" sempre à mão no alto do menu; o seu nível leva às conquistas */
  $('mguia').onclick=function(){$('mtour').click();};
  $('mperfil').onclick=function(){$('mbadges').click();};
  function abrirMenu(pg){marcaNomes(estadoMapa.labelMode);somV();pilha=[];mShow(pg||null);$('msheet').style.display='block';}
  $('mbtn').onclick=function(){abrirMenu(null);};
  $('mclose').onclick=function(){$('msheet').style.display='none';};
  $('msheet').addEventListener('pointerdown',function(e){if(e.target===$('msheet'))$('msheet').style.display='none';});
  $('txtd').addEventListener('pointerdown',function(e){if(e.target===$('txtd'))$('txtd').style.display='none';});
  /* o que abre pelo menu volta para o menu (← Voltar ou o voltar do Android), na mesma página dele */
  var VOLTA={study:'studyclose',passsheet:'passclose',badgesheet:'badgesclose',statsheet:'statsclose',dbar:'dexit',stbar:'stexit'};
  function visivel(el){return !!el&&el.getClientRects().length>0;}
  var origem=null;
  $('msheet').addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b||b.hasAttribute('data-p')||b.id==='mback'||b.id==='mclose')return;
    var pg=null;Array.prototype.forEach.call(document.querySelectorAll('#msheet .mpage'),function(p){if(!p.hidden)pg=p.id;});
    setTimeout(function(){
      if(visivel($('msheet')))return;
      var alvo=Object.keys(VOLTA).filter(function(id){return visivel($(id));})[0];
      origem=alvo?{tela:alvo,pagina:pg}:null;
    },80);
  });
  Object.keys(VOLTA).forEach(function(id){
    $(VOLTA[id]).addEventListener('click',function(){
      if(!origem||origem.tela!==id)return;
      var pg=origem.pagina;origem=null;
      setTimeout(function(){if(visivel($(id)))return;$('mbtn').click();if(pg)mShow(pg);},0);
    });
  });
}

export { iniciar, ligarSeg };
