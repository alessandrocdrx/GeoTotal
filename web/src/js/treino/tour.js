/**
 * @arquivo js/treino/tour.js
 * Camada: Treino
 * Tour guiado (opcional): destaca cada parte da tela com um balão. Disponível sempre no menu ⋯.
 */

import { $, lsGet, lsSet } from '../nucleo/utilitarios.js';
import { quiz } from './estado.js';
import { quizOpen } from './perguntas.js';

/*
 * Cada passo escurece a tela, deixa só o alvo aceso e explica em uma frase curta e simples.
 * "Próximo" avança, "Pular" fecha. Abre o Treino antes, para que os botões do painel existam.
 * Passos de botões escondidos (tela simples, ⋯ → Personalizar) são pulados sozinhos.
 */

const PASSOS = [
  { alvo: '.modesw', texto: '🔀 Aqui você escolhe: 🎯 Treino para responder perguntas, ou 🧭 Livre para passear pelo globo.' },
  { alvo: '#qbody', texto: '👆 Leia a pergunta e toque na resposta. Acertou? Ganha pontos e estrelas. Errou? O jogo mostra a certa no mapa.' },
  { alvo: '#qmodeb', texto: '🎮 Quer outro tipo de pergunta? Toque aqui: capital, bandeira, achar no mapa…' },
  { alvo: '#qscopeb', texto: '📍 Aqui você escolhe o lugar: um continente, o Brasil ou o mundo todo.' },
  { alvo: '#qscore', texto: '⭐ Aqui fica o seu progresso. Acertar várias seguidas acende o foguinho 🔥.' },
  { alvo: '.tools', texto: '🌍 Toque em + para aproximar e em − para afastar. Você também pode girar o globo arrastando o dedo.' },
  { alvo: '#msom', texto: '🔊 Este botão liga e desliga o som.' },
  { alvo: '#mestilotop', texto: '🛰️ Estilo do mapa: a foto (satélite) ou o atlas, com uma cor por país.' },
  { alvo: '#camb', texto: '🏷️ Camadas: escolha o que aparece no mapa, como mares, desertos e florestas.' },
  { alvo: '#mbtn', texto: '⋯ Nos três pontinhos ficam suas medalhas, o passaporte e o Personalizar: letra grande, som, tema e mais botões na tela. Tudo tem um botão ← Voltar.' },
];

let passo = -1;
/* passos deste tour: só os de botões que estão na tela agora (a numeração "2 de 7" não pula) */
let ativos = PASSOS;

function fecharTour(){
  passo=-1;
  var g=$('guia');if(g)g.hidden=true;
  lsSet('globo.tour.visto',true);
}
function mostrarPasso(){
  var p=ativos[passo],alvo=p&&document.querySelector(p.alvo);
  if(!p){fecharTour();return;}
  if(!alvo||!alvo.getClientRects().length){passo++;mostrarPasso();return;}
  var r=alvo.getBoundingClientRect(),m=6;
  var luz=$('guialuz'),bal=$('guiabal');
  luz.style.left=(r.left-m)+'px';luz.style.top=(r.top-m)+'px';luz.style.width=(r.width+2*m)+'px';luz.style.height=(r.height+2*m)+'px';
  $('guiatxt').textContent=p.texto;
  $('guiapasso').textContent=(passo+1)+' de '+ativos.length;
  $('guiaprox').textContent=passo===ativos.length-1?'Começar! 🚀':'Próximo →';
  /* balão embaixo do alvo, ou em cima se não couber */
  var H=window.innerHeight,emCima=r.bottom+170>H;
  bal.style.top=emCima?'auto':(r.bottom+m+12)+'px';
  bal.style.bottom=emCima?(H-r.top+m+12)+'px':'auto';
}
function iniciarTour(){
  if(!quiz.open)quizOpen();
  var g=$('guia');g.hidden=false;
  passo=0;
  setTimeout(function(){
    ativos=PASSOS.filter(function(p){var a=document.querySelector(p.alvo);return a&&a.getClientRects().length;});
    mostrarPasso();
  },450);
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  $('guiaprox').onclick=function(){passo++;mostrarPasso();};
  $('guiapular').onclick=fecharTour;
  $('mtour').onclick=function(){$('mclose').click();setTimeout(iniciarTour,200);};
  window.addEventListener('resize',function(){if(passo>=0)mostrarPasso();});
  /* Treino/Livre chamam atenção nas 3 primeiras aberturas */
  var n=lsGet('globo.aberturas',0)+1;lsSet('globo.aberturas',n);
  if(n<=3)setTimeout(function(){document.querySelector('.modesw').classList.add('chama');},1500);
}

export { iniciar, iniciarTour };
