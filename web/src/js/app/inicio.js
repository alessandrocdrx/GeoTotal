/**
 * @arquivo js/app/inicio.js
 * Camada: App
 * Ponto de entrada: abre o modo Treino e, ao voltar para o app depois de um tempo, a tela de início
 * com o caminho principal à vista (Continuar, Desafio do dia, Relâmpago, Explorar).
 */

import { $, lsGet, lsSet, setStatus } from '../nucleo/utilitarios.js';
import { emitir } from '../nucleo/eventos.js';
import { poolIdx } from '../treino/dominio.js';
import { estadoTreino, quiz, scopeLabel } from '../treino/estado.js';
import { modeName } from '../treino/estatisticas.js';
import { estadoPartida, runKey, runPool } from '../treino/partida.js';
import { iniciarJogoRapido, pularRetomar, quizOpen, recordeRelampago, runRestart } from '../treino/perguntas.js';
import { displayStreak, levelOf, xpAtual } from '../treino/progressao.js';

const AUSENCIA = 30 * 60e3; /* mostra a tela de início quando volta depois de 30 min ou mais */

function hojeStr(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function fechar(depois){
  var t=$('inicio');t.classList.add('out');
  setTimeout(function(){t.hidden=true;t.classList.remove('out');if(depois)depois();},220);
}
function mostrarInicio(){
  if(!quiz.open)quizOpen();
  pularRetomar();
  var st=displayStreak();
  $('inivel').textContent='Nível '+levelOf(xpAtual())+(st?' · 🔥 '+st+(st===1?' dia':' dias'):'');
  var n=poolIdx().length,r=estadoPartida.RUNS[runKey()],feitos=r&&!r.fin&&n?n-runPool().length:0;
  $('icontsub').textContent=scopeLabel()+' · '+modeName(quiz.mode)+(feitos?' · '+feitos+' de '+n:'');
  var d=lsGet('globo.desafio.v1',null);
  $('idesafiosub').textContent=d&&d.dia===hojeStr()?('✅ Feito hoje: '+d.certas+'/10 · amanhã tem outro'):'10 capitais, iguais para todos, 1 vez por dia';
  var rc=recordeRelampago();$('irelsub').textContent='Quantas você acerta em 60 s?'+(rc?' Recorde: '+rc:'');
  var z=$('izero');z.classList.remove('armado');
  z.hidden=!(feitos||(r&&r.e&&!r.fin));
  z.textContent='↺ Começar '+scopeLabel()+' do zero';
  $('inicio').hidden=false;
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  /* o app abre no modo Treino; o botão "🌍 Livre" leva ao globo livre */
  quizOpen();
  var ultima=lsGet('globo.ultima.visita',0),saiu=0;
  lsSet('globo.ultima.visita',Date.now());
  $('icont').onclick=function(){fechar();};
  $('idesafio').onclick=function(){fechar(function(){emitir('abrir-desafio');});};
  $('irelampago').onclick=function(){fechar(function(){iniciarJogoRapido('relampago');});};
  $('iexplorar').onclick=function(){fechar(function(){$('qclose').click();});};
  $('izero').onclick=function(){
    var z=$('izero');
    if(!z.classList.contains('armado')){z.classList.add('armado');z.textContent='Toque de novo para começar do zero';return;}
    fechar(function(){runRestart();setStatus('Partida recomeçada do zero. Medalhas e conquistas continuam.',3000);});
  };
  /* primeira vez: quem cuida são as boas-vindas */
  if(ultima&&Date.now()-ultima>=AUSENCIA&&!estadoTreino.desafio)mostrarInicio();
  /* no celular o app volta do segundo plano sem recarregar: conta o tempo fora também */
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){saiu=Date.now();lsSet('globo.ultima.visita',saiu);return;}
    if(saiu&&Date.now()-saiu>=AUSENCIA&&$('inicio').hidden&&!quiz.jogoRapido&&!estadoTreino.desafio)mostrarInicio();
    lsSet('globo.ultima.visita',Date.now());
  });
}

export { iniciar, mostrarInicio };
