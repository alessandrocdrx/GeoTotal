/**
 * @arquivo js/treino/tour.js
 * Camada: Treino
 * Tour guiado (opcional): destaca cada parte da tela com um balão. Disponível sempre no menu ⋯.
 */

import { $, lsGet, lsSet } from '../nucleo/utilitarios.js';
import { quiz } from './estado.js';
import { estadoPartida, runKey } from './partida.js';
import { quizOpen } from './perguntas.js';

/*
 * Cada passo escurece a tela, deixa só o alvo aceso e explica em uma frase. "Próximo" avança,
 * "Pular" fecha. Abre o Treino antes, para que os botões do painel existam.
 */

const PASSOS = [
  { alvo: '.modesw', texto: '🔀 Aqui você troca de modo: 🎯 Treino tem perguntas; 🧭 Livre é para explorar o globo à vontade.' },
  { alvo: '#qmodeb', texto: '🎮 Escolha o jogo: capital, bandeira, achar no mapa, vizinhos… ou um jogo rápido (Relâmpago, Misto, Desafio do dia).' },
  { alvo: '#qscopeb', texto: '📍 Escolha a região: um continente, uma parte dele, os estados do Brasil ou o mundo todo.' },
  { alvo: '#qajustb', texto: '⚙️ Ajustes da partida: digitar ou escolher, cronômetro, tamanho da rodada, meta do dia…' },
  { alvo: '#qscore', texto: '⭐ Seu progresso: quantos você já acertou na região, o relógio e a meta do dia. Acertos seguidos viram combo 🔥.' },
  { alvo: '#qbody', texto: '👆 Toque na resposta. Rodadas de 10 perguntas, com estrelas no final.' },
  { alvo: '.tools', texto: '🌍 Controles do globo: aproximar (+), afastar (−) e mapa plano 🗺️. No modo Livre aparecem também 🔄 giro automático e 🎬 passeio pelos países.' },
  { alvo: '#mvisual', texto: '☀️ Dia e noite: a sombra da noite de verdade no globo, ou sempre de dia.' },
  { alvo: '#camb', texto: '🗺️ Mapa: satélite ou atlas, dia e noite, e o que aparece (oceanos, mares, zonas climáticas, desertos, florestas, relevo, o mês do ano e os lugares especiais). No Livre, toque num país; toque de novo no mesmo lugar para ver o deserto, a floresta ou o mar que está embaixo.' },
  { alvo: '#mbtn', texto: '☰ No menu: atalhos de som, dia e noite, satélite ou atlas e mapa; passaporte, conquistas, histórico, distância entre capitais, comparar países, folha de estudo, salvar progresso e este tour de novo. Tudo o que abre por ele tem ← Voltar, que traz você de volta ao menu. O ícone ⓘ explica de onde vêm os dados.' },
];

let passo = -1;

function fecharTour(){
  passo=-1;
  var g=$('guia');if(g)g.hidden=true;
  lsSet('globo.tour.visto',true);
  /* o tempo lendo o tour não conta no relógio da partida: ele recomeça a contar agora */
  var r=estadoPartida.RUNS[runKey()];if(r&&!r.fin)r.la=Date.now();
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
  /* guarda o tempo jogado até agora: com o tour aberto o relógio para nele, sem voltar */
  var r=estadoPartida.RUNS[runKey()],agora=Date.now();
  if(r&&!r.fin&&r.la){r.at=(r.at||0)+Math.min(60000,Math.max(0,agora-r.la));r.la=agora;}
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
