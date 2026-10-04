/**
 * @arquivo js/treino/desafio.js
 * Camada: Treino
 * Desafio do dia: 10 países iguais para todo mundo, uma vez por dia, com resultado para compartilhar.
 */

import { D } from '../dados/paises.js';
import { ouvir } from '../nucleo/eventos.js';
import { $, lsGet, lsSet } from '../nucleo/utilitarios.js';
import { applyScopeChange } from './escopo.js';
import { estadoTreino, quiz, resetSession, stopTimerTick } from './estado.js';
import { renderScore } from './partida.js';
import { nextQ, quizOpen, quizSetMode } from './perguntas.js';
import { celebrate } from './progressao.js';

/*
 * Inspirado no Wordle: uma rodada curta por dia, a mesma para todos, e um resultado em quadradinhos
 * (🟩🟥) que não revela as respostas. Dá motivo para voltar amanhã e para mostrar aos amigos, sem
 * pressão: perder o dia não tira nada de ninguém.
 */

const INICIO = Date.UTC(2026, 9, 1); /* desafio #1 = 1º de outubro de 2026 */

function hojeStr(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function numeroDoDia(){var d=new Date();return Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-INICIO)/864e5)+1;}

/** Sorteio com semente: a mesma data gera a mesma sequência em qualquer celular. */
function sorteador(semente){
  return function(){semente|=0;semente=semente+0x6D2B79F5|0;var t=Math.imul(semente^semente>>>15,1|semente);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
}
function filaDoDia(num){
  var base=[];D.forEach(function(d,i){if(!d.dep&&!d.uni&&!d.dis)base.push(i);});
  var r=sorteador(num*7919+17),fila=[];
  while(fila.length<10&&base.length){fila.push(base.splice(Math.floor(r()*base.length),1)[0]);}
  return fila;
}

function faltaParaAmanha(){var a=new Date(),m=new Date(a.getFullYear(),a.getMonth(),a.getDate()+1),min=Math.ceil((m-a)/6e4);return Math.floor(min/60)+'h '+(min%60)+'min';}
function resultadoDeHoje(){var v=lsGet('globo.desafio.v1',null);return v&&v.dia===hojeStr()?v:null;}

function textoParaCompartilhar(v){
  return '🌍 geoTotal · Desafio #'+v.num+' · '+v.certas+'/10\n'+v.grade+'\nhttps://play.google.com/store/apps/details?id=io.github.alessandrocdrx.geototal';
}
function copiar(texto){
  function plano(){var t=document.createElement('textarea');t.value=texto;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();try{document.execCommand('copy');}catch(e){}t.remove();}
  try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(texto).catch(plano);}else plano();}catch(e){plano();}
  celebrate('📋 Resultado copiado! Cole no WhatsApp.');
}

/** Começa o desafio de hoje (ou lembra que já foi feito). */
function iniciarDesafio(){
  var feito=resultadoDeHoje();
  if(feito){celebrate('✅ Desafio de hoje: '+feito.certas+'/10. O próximo sai em '+faltaParaAmanha()+'.');return;}
  if(!quiz.open)quizOpen();
  if(estadoTreino.quizDomain!=='world'||estadoTreino.quizScope.t!=='world')applyScopeChange({t:'world'});
  if(quiz.mode!=='cap')quizSetMode('cap');
  var num=numeroDoDia();
  estadoTreino.desafio={dia:hojeStr(),num:num,fila:filaDoDia(num),antes:{len:quiz.sessionLen,surv:quiz.survivalMode,timer:quiz.timerLen}};
  /* o desafio é sempre igual: 10 perguntas, sem cronômetro nem sobrevivência (sem gravar a preferência) */
  quiz.sessionLen=10;quiz.survivalMode=false;quiz.timerLen=0;stopTimerTick();
  resetSession();quiz.last=-1;nextQ();renderScore();
}

function aoTerminarRodada(o){
  var box=o.caixa,ds=estadoTreino.desafio;
  if(ds){
    var certas=o.log.filter(function(x){return x.ok;}).length;
    var v={dia:ds.dia,num:ds.num,certas:certas,grade:o.log.map(function(x){return x.ok?'🟩':'🟥';}).join('')};
    lsSet('globo.desafio.v1',v);
    quiz.sessionLen=ds.antes.len;quiz.survivalMode=ds.antes.surv;quiz.timerLen=ds.antes.timer;
    estadoTreino.desafio=null;renderScore();
    box.querySelector('.rftit').textContent='🗓️ Desafio do dia #'+v.num;
    var g=document.createElement('div');g.className='rfgrade';g.textContent=v.grade;
    box.insertBefore(g,box.querySelector('.rfstats'));
    var c=document.createElement('button');c.className='rfcopiar';c.textContent='📋 Copiar resultado';
    c.onclick=function(){copiar(textoParaCompartilhar(v));};
    box.insertBefore(c,box.querySelector('.rfjogar'));
    box.querySelector('.rfjogar').textContent='▶ Continuar treinando';
    var prox=document.createElement('div');prox.className='rfrever';prox.textContent='⏳ Próximo desafio em '+faltaParaAmanha();box.insertBefore(prox,c);
    return;
  }
  if(!resultadoDeHoje()){
    var b=document.createElement('button');b.textContent='🗓️ Desafio do dia';b.onclick=iniciarDesafio;
    var mais=box.querySelector('.rfmais');if(mais)mais.insertBefore(b,mais.firstChild);
  }
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  ouvir('rodada-terminou',aoTerminarRodada);
  $('mdesafio').onclick=function(){$('mclose').click();iniciarDesafio();};
}

export { iniciar };
