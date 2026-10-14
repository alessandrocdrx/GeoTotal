/**
 * @arquivo js/treino/ajustes.js
 * Camada: Treino
 * Tela "Ajustes da partida" (botão ⚙️ do painel): cada opção mostra as alternativas lado a lado
 * e vale na hora, sem sair do jogo. Também abre pela meta do dia ("0/10 hoje").
 */

import { $ } from '../nucleo/utilitarios.js';
import { definirFoco } from './escopo.js';
import { estadoTreino, quiz } from './estado.js';
import { definirOrdem, definirResposta, definirRodada, definirSobrevivencia, definirTempo } from './perguntas.js';
import { definirMeta, metaDoDia } from './progressao.js';

/* [título, explicação, alternativas [valor, rótulo], valor atual, definir(valor)] */
const LINHAS = [
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
