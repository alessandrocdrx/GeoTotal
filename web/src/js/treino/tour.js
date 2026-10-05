/**
 * @arquivo js/treino/tour.js
 * Camada: Treino
 * Tour guiado (opcional): destaca cada parte da tela com um balão. Disponível sempre no menu ⋯.
 */

import { $, lsGet, lsSet } from '../nucleo/utilitarios.js';
import { quiz } from './estado.js';
import { quizOpen } from './perguntas.js';

/*
 * Cada passo escurece a tela, deixa só o alvo aceso e explica em uma frase. "Próximo" avança,
 * "Pular" fecha. Abre o Treino antes, para que os botões do painel existam.
 */

const PASSOS = [
  { alvo: '.modesw', texto: '🔀 Aqui você troca de modo: 🎯 Treino tem perguntas; 🧭 Livre é para explorar o globo à vontade.' },
  { alvo: '#qmodeb', texto: '❓ Escolha o tipo de pergunta: capital, bandeira, achar no mapa, vizinhos…' },
  { alvo: '#qscopeb', texto: '📍 Escolha a região: um continente, um país e seus vizinhos ou o mundo todo.' },
  { alvo: '#qscore', texto: '⭐ Seu progresso: acertos na região, seu nível e título, e a meta do dia. Acertos seguidos viram combo 🔥.' },
  { alvo: '#qbody', texto: '👆 Toque na resposta. Rodadas de 10 perguntas, com estrelas no final.' },
  { alvo: '.tools', texto: '🌍 Controles do globo: aproximar, afastar, girar sozinho, passeio pelos países e mapa plano.' },
  { alvo: '#mbtn', texto: '⋯ No menu: desafio do dia, conquistas, histórico, som, salvar progresso e este tour de novo.' },
];

let passo = -1;

function fecharTour(){
  passo=-1;
  var g=$('guia');if(g)g.hidden=true;
  lsSet('globo.tour.visto',true);
}
function mostrarPasso(){
  var p=PASSOS[passo],alvo=p&&document.querySelector(p.alvo);
  if(!p){fecharTour();return;}
  if(!alvo||!alvo.getClientRects().length){passo++;mostrarPasso();return;}
  var r=alvo.getBoundingClientRect(),m=6;
  var luz=$('guialuz'),bal=$('guiabal');
  luz.style.left=(r.left-m)+'px';luz.style.top=(r.top-m)+'px';luz.style.width=(r.width+2*m)+'px';luz.style.height=(r.height+2*m)+'px';
  $('guiatxt').textContent=p.texto;
  $('guiapasso').textContent=(passo+1)+' de '+PASSOS.length;
  $('guiaprox').textContent=passo===PASSOS.length-1?'Começar! 🚀':'Próximo →';
  /* balão embaixo do alvo, ou em cima se não couber */
  var H=window.innerHeight,emCima=r.bottom+170>H;
  bal.style.top=emCima?'auto':(r.bottom+m+12)+'px';
  bal.style.bottom=emCima?(H-r.top+m+12)+'px':'auto';
}
function iniciarTour(){
  if(!quiz.open)quizOpen();
  var g=$('guia');g.hidden=false;
  passo=0;
  setTimeout(mostrarPasso,450);
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
