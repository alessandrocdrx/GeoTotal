/**
 * @arquivo js/treino/ajustes.js
 * Camada: Treino
 * Tela "Ajustes da partida" (botão ⚙️ do painel): cada opção mostra as alternativas lado a lado
 * e vale na hora, sem sair do jogo. Também abre pela meta do dia ("0/10 hoje").
 */

import { $, setStatus } from '../nucleo/utilitarios.js';
import { poolIdx } from './dominio.js';
import { definirFoco } from './escopo.js';
import { estadoTreino, quiz, scopeLabel } from './estado.js';
import { curRun, runPool } from './partida.js';
import { definirNivel, definirOrdem, definirResposta, definirRodada, definirSobrevivencia, definirTempo, runRestart } from './perguntas.js';
import { definirMeta, metaDoDia } from './progressao.js';

/* [título, explicação, alternativas [valor, rótulo], valor atual, definir(valor)] */
const LINHAS = [
  ['Nível','Muda as alternativas. Fácil: lugares bem diferentes. Difícil: nomes parecidos e vizinhos (+2 XP por acerto).',[['facil','😊 Fácil'],['normal','🙂 Normal'],['dificil','😈 Difícil']],
    function(){return quiz.nivel||'normal';},definirNivel],
  ['Responder','Vizinhos e Achar no mapa são sempre de tocar.',[['choice','👆 Escolher'],['type','⌨️ Digitar']],
    function(){return quiz.type;},definirResposta],
  ['Perguntas','',[['mix','Todas'],['new','Só novas'],['wrong','Que errei']],
    function(){return estadoTreino.quizFocus;},definirFoco],
  ['Ordem','',[['random','🔀 Aleatória'],['seq','➡️ Em sequência']],
    function(){return quiz.order==='seq'?'seq':'random';},definirOrdem],
  ['Tamanho da rodada','No Mundo. Numa região, a rodada vai até completar a região.',[[0,'Sem fim'],[10,'10'],[20,'20']],
    function(){return quiz.sessionLen;},definirRodada],
  ['Cronômetro','Responda o máximo que der antes do tempo acabar.',[[0,'Sem tempo'],[30,'30 s'],[60,'60 s']],
    function(){return quiz.timerLen;},definirTempo],
  ['Sobrevivência','Errou uma vez, a rodada acaba.',[[false,'Não'],[true,'💀 Sim']],
    function(){return !!quiz.survivalMode;},definirSobrevivencia],
  ['Meta do dia','Respostas por dia para manter a sequência 🔥.',[[5,'5'],[10,'10'],[20,'20'],[30,'30']],
    metaDoDia,definirMeta],
];

function montarAjustes(){
  var box=$('ajbody');box.innerHTML='';
  LINHAS.forEach(function(l){
    var row=document.createElement('div');row.className='ajrow';
    var t=document.createElement('b');t.textContent=l[0];row.appendChild(t);
    var seg=document.createElement('div');seg.className='aseg';
    var atual=l[3]();
    l[2].forEach(function(op){
      var b=document.createElement('button');b.textContent=op[1];
      b.setAttribute('aria-pressed',op[0]===atual?'true':'false');
      /* cronômetro, rodada e sobrevivência se excluem: redesenha tudo para mostrar o efeito */
      b.onclick=function(){if(op[0]!==l[3]()){l[4](op[0]);}montarAjustes();};
      seg.appendChild(b);
    });
    row.appendChild(seg);
    if(l[1]){var d=document.createElement('small');d.textContent=l[1];row.appendChild(d);}
    box.appendChild(row);
  });
  montarRecomecar(box);
}
/* recomeçar a partida da região atual (medalhas, nível e conquistas ficam); pede dois toques */
function montarRecomecar(box){
  var n=poolIdx().length,r=curRun(),feitos=n?n-runPool().length:0;
  if(!n||estadoTreino.desafio||quiz.jogoRapido||r.fin||(!feitos&&!r.e))return;
  var row=document.createElement('div');row.className='ajrow';
  var t=document.createElement('b');t.textContent='Partida de '+scopeLabel();row.appendChild(t);
  var b=document.createElement('button');b.className='ajzerar';
  function rotulo(){b.classList.remove('armado');b.textContent='↺ Recomeçar do zero ('+feitos+' de '+n+' feitos)';}
  rotulo();
  b.onclick=function(){
    if(!b.classList.contains('armado')){b.classList.add('armado');b.textContent='Toque de novo para recomeçar';clearTimeout(b._t);b._t=setTimeout(rotulo,4000);return;}
    clearTimeout(b._t);fecharAjustes();runRestart();
    setStatus('Partida recomeçada do zero. Medalhas e conquistas continuam.',3000);
  };
  row.appendChild(b);
  var d=document.createElement('small');d.textContent='Medalhas, nível e conquistas continuam.';row.appendChild(d);
  box.appendChild(row);
}
function abrirAjustes(){montarAjustes();$('ajsheet').style.display='block';}
function fecharAjustes(){$('ajsheet').style.display='none';}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  $('qajustb').onclick=abrirAjustes;
  $('goalgo').onclick=abrirAjustes;
  $('goalgo').title='Toque para mudar a meta do dia e outros ajustes';
  $('ajclose').onclick=fecharAjustes;$('ajok').onclick=fecharAjustes;
  $('ajsheet').addEventListener('pointerdown',function(e){if(e.target===$('ajsheet'))fecharAjustes();});
}

export { abrirAjustes, iniciar };
