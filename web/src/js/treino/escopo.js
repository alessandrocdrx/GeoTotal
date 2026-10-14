/**
 * @arquivo js/treino/escopo.js
 * Camada: Treino
 * Seletor de escopo e foco do treino (regiões, sub-regiões, revisão).
 */

import { BRREG, BRS } from '../dados/estados-brasil.js';
import { D, norm, REG } from '../dados/paises.js';
import { ganchosInterface } from '../interface/ganchos.js';
import { ouvir } from '../nucleo/eventos.js';
import { $, lsSet, setStatus } from '../nucleo/utilitarios.js';
import { firePulseForScope } from './destaque-escopo.js';
import { applyDomainForScope, inScopeActive, poolIdx, QD, updateScopeBackBtn, updateScopeBtn } from './dominio.js';
import { estadoTreino, quiz, resetSession, scopeLabel } from './estado.js';
import { curRun, estadoPartida, fmtRelogio, MEDAL, recordable, renderScore, runPool, scopeKeyFor } from './partida.js';
import { buildModeButtons, nextQ, quizOpen, runRestart, sairJogoRapido } from './perguntas.js';
import { avail, availCount } from '../visualizacao/tela.js';

/* ---------- escopo e foco do treino ---------- */
function applyScopeChange(newScope){
  sairJogoRapido();
  estadoTreino.quizScopePrev=estadoTreino.quizScope;
  estadoTreino.quizScope=newScope;
  lsSet('globo.quiz.scope',estadoTreino.quizScope);
  applyDomainForScope();
  buildModeButtons();
  resetSession();
  quiz.last=-1;
  $('scopesheet').style.display='none';
  nextQ();
  renderScore();
  updateScopeBtn();
  updateScopeBackBtn();
  firePulseForScope();
}
/* revisão do dia: os países que você mais erra neste tipo de pergunta (até 10) */
function reviewList(){
  var st=estadoTreino.QS.m[quiz.mode]||{},arr=[];
  D.forEach(function(d){var e=st[d.cc];if(e&&e.w>0)arr.push({cc:d.cc,sc:e.w*2-e.r+(e.s===0?3:0)});});
  arr.sort(function(a,b){return b.sc-a.sc;});
  return arr.slice(0,10).map(function(x){return x.cc;});
}
/* cartões grandes: o caminho principal da tela; sub-regiões e o resto ficam em "Mais opções" */
const EMOJI_REG = ['🦜','🦅',null,'🦁','🏰','🐼','🦘'];
function buildScopeTiles(){
  var box=$('scopetiles');box.innerHTML='';
  function tile(icone,nome,count,sc,cor,unid){
    var b=document.createElement('button');b.className='stile';
    if(cor)b.style.setProperty('--cor',cor);
    var atual=estadoTreino.quizScope;
    if(sc.t===atual.t&&sc.r===atual.r&&!sc.s&&!atual.s&&(sc.t!=='multi'||JSON.stringify(sc.items)===JSON.stringify(atual.items)))b.classList.add('on');
    var rc=recordable(sc)?estadoPartida.RECS[scopeKeyFor(sc,quiz.mode)]:null;
    var i=document.createElement('span');i.className='stico';i.textContent=icone;
    var n=document.createElement('b');n.textContent=nome;
    var c=document.createElement('small');c.textContent=count+' '+(unid||(count===1?'país':'países'))+(rc&&rc.medal?' · '+MEDAL[rc.medal].i:'')+(rc&&rc.bestT?' · ⏱️ '+fmtRelogio(rc.bestT):'');
    b.appendChild(i);b.appendChild(n);b.appendChild(c);
    b.onclick=function(){applyScopeChange(sc);};
    box.appendChild(b);
  }
  var rv=reviewList();
  if(rv.length)tile('🧠','Revisão dos seus erros',rv.length,{t:'review',cc:rv},'#f72585');
  tile('🌍','Mundo todo',availCount(),{t:'world'},'#9aa3b5');
  REG.forEach(function(rg,ri){
    var n=D.filter(function(d){return d.r===ri&&avail(d);}).length;
    if(n&&EMOJI_REG[ri])tile(EMOJI_REG[ri],rg.n,n,{t:'reg',r:ri},rg.c);
  });
  tile('🇧🇷','Estados do Brasil',BRS.length,{t:'br'},'#1fa85a','estados');
}
function buildScopeList(filterStr){
  buildScopeTiles();
  var box=$('scopelist');box.innerHTML='';
  var q2=norm((filterStr||'').trim());
  function match(label){return !q2||norm(label).indexOf(q2)>=0;}
  var any=false;
  function item(label,count,sc,level){
    if(!match(label))return;
    any=true;
    var b=document.createElement('button');b.className='sitem'+(level===1?' sub':level===2?' sub sub2':'');
    var a=document.createElement('span');
    var rc=recordable(sc)?estadoPartida.RECS[scopeKeyFor(sc,quiz.mode)]:null;
    a.textContent=(rc&&rc.medal?MEDAL[rc.medal].i+' ':'')+label;
    var c=document.createElement('small');c.textContent=count+(sc.t==='br'||sc.t==='brreg'?(count===1?' estado':' estados'):(count===1?' país':' países'));
    b.appendChild(a);b.appendChild(c);
    if(sc.t===estadoTreino.quizScope.t&&sc.r===estadoTreino.quizScope.r&&sc.s===estadoTreino.quizScope.s)b.classList.add('on');
    b.onclick=function(){applyScopeChange(sc);};
    box.appendChild(b);
  }
  function header(t){if(q2)return;var h=document.createElement('div');h.className='sh';h.textContent=t;box.appendChild(h);}
  var rv=reviewList();
  if(rv.length)item('🧠 Revisão do dia: '+(rv.length===1?'o que você mais erra':'os '+rv.length+' que você mais erra'),rv.length,{t:'review',cc:rv},0);
  item('🌍 Mundo',availCount(),{t:'world'},0);
  REG.forEach(function(rg,ri){
    var list=D.filter(function(d){return d.r===ri&&avail(d);});
    if(!list.length)return;
    header(rg.n.toUpperCase());
    item(rg.n+' (inteira)',list.length,{t:'reg',r:ri},0);
    var subs=[];
    list.forEach(function(d){if(d.sub!==rg.n&&subs.indexOf(d.sub)<0)subs.push(d.sub);});
    subs.forEach(function(sn){item(sn,list.filter(function(d){return d.sub===sn;}).length,{t:'sub',r:ri,s:sn},1);});
  });
  header('BRASIL');
  item('🇧🇷 Todos os 27 estados',BRS.length,{t:'br'},0);
  BRREG.forEach(function(rg,ri){item(rg.n,BRS.filter(function(s){return s.r===ri;}).length,{t:'brreg',r:ri},1);});
  $('scopeempty').style.display=any?'none':'block';
}

/** Quais perguntas entram: todas, só as novas ou só as que você errou. */
function definirFoco(v){
  estadoTreino.quizFocus=v;lsSet('globo.quiz.focus',v);
  quiz.last=-1;resetSession();nextQ();updateScopeBtn();
}
/* recomeçar só a partida da região atual (placar, medalhas e conquistas ficam) */
function mostrarRecomecar(){
  var b=$('qrestart'),n=poolIdx().length,r=curRun(),feitos=n?n-runPool().length:0;
  b.classList.remove('armado');
  b.hidden=!(n&&!estadoTreino.desafio&&(feitos>0||r.e>0)&&!r.fin);
  b.textContent='↺ Recomeçar '+scopeLabel()+' do zero ('+feitos+' de '+n+' feitos)';
}
/* mudar quais lugares entram (não reconhecidos, territórios…) no meio de uma rodada muda a lista de
   perguntas: avisa e, se a pessoa confirmar, a rodada recomeça do zero */
function rodadaEmAndamento(){
  if(!quiz.open||estadoTreino.desafio||estadoTreino.quizDomain==='br')return false;
  var n=poolIdx().length,r=curRun();
  return !!n&&!r.fin&&(n-runPool().length>0||r.e>0);
}
function antesDeMudarLugares(fazer){
  if(!rodadaEmAndamento()){fazer();return;}
  var ov=document.createElement('div');ov.className='ov avisolug';ov.style.display='block';ov.style.zIndex='130';
  var bx=document.createElement('div');bx.className='box';
  var t=document.createElement('b');t.className='avtit';t.textContent='Recomeçar a rodada?';
  var p=document.createElement('p');p.textContent='Mudar quais lugares entram no jogo muda as perguntas. A rodada de '+scopeLabel()+' vai recomeçar do zero. Medalhas e conquistas continuam.';
  var lin=document.createElement('div');lin.className='row2';
  var sim=document.createElement('button');sim.className='avsim';sim.textContent='↺ Mudar e recomeçar';
  var nao=document.createElement('button');nao.textContent='Agora não';
  function fechar(){ov.remove();}
  sim.onclick=function(){fechar();fazer();runRestart();setStatus('Rodada recomeçada do zero com os lugares novos.',3000);};
  nao.onclick=fechar;
  ov.addEventListener('pointerdown',function(e){if(e.target===ov)fechar();});
  lin.appendChild(sim);lin.appendChild(nao);bx.appendChild(t);bx.appendChild(p);bx.appendChild(lin);ov.appendChild(bx);
  document.body.appendChild(ov);
}
/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  ganchosInterface.antesDeMudarLugares=antesDeMudarLugares;
  ouvir('treinar-regiao',function(o){if(!quiz.open)quizOpen();applyScopeChange({t:'reg',r:o.r});});
  ouvir('treinar-estados',function(){if(!quiz.open)quizOpen();applyScopeChange({t:'br'});});
  ouvir('categorias-mudaram',function(o){if(quiz.open){updateScopeBtn();if(o.placar)renderScore();if(quiz.cur>=0&&!inScopeActive(QD()[quiz.cur]))nextQ();}});
  $('qscopeback').onclick=function(){if(estadoTreino.quizScopePrev){applyScopeChange(estadoTreino.quizScopePrev);$('scopesheet').style.display='none';}};
  $('qscopeb').onclick=function(){$('scopeq').value='';$('scopeadv').open=false;buildScopeList();mostrarRecomecar();$('scopesheet').style.display='block';};
  $('qrestart').onclick=function(){
    var b=$('qrestart');
    if(!b.classList.contains('armado')){b.classList.add('armado');b.textContent='Toque de novo para recomeçar '+scopeLabel()+' do zero';clearTimeout(b._t);b._t=setTimeout(mostrarRecomecar,4000);return;}
    clearTimeout(b._t);$('scopesheet').style.display='none';runRestart();
    setStatus('Partida recomeçada do zero. Medalhas e conquistas continuam.',3000);
  };
  $('scopeq').addEventListener('input',function(){buildScopeList(this.value);});
  $('scopeclose').onclick=function(){$('scopesheet').style.display='none';};
  $('scopesheet').addEventListener('pointerdown',function(e){if(e.target===$('scopesheet'))$('scopesheet').style.display='none';});
}

export { applyScopeChange, definirFoco, iniciar };
