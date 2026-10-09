/**
 * @arquivo js/treino/escopo.js
 * Camada: Treino
 * Seletor de escopo e foco do treino (regiões, combinações, revisão).
 */

import { BRREG, BRS } from '../dados/estados-brasil.js';
import { D, norm, REG } from '../dados/paises.js';
import { setIncludeDep, setIncludeDisputed, setIncludeUni } from '../interface/filtros.js';
import { ouvir } from '../nucleo/eventos.js';
import { $, lsSet } from '../nucleo/utilitarios.js';
import { firePulseForScope } from './destaque-escopo.js';
import { applyDomainForScope, inScopeActive, QD, updateScopeBackBtn, updateScopeBtn } from './dominio.js';
import { AMERICAS_R, estadoTreino, quiz, resetSession } from './estado.js';
import { estadoPartida, MEDAL, recordable, renderScore, scopeKeyFor } from './partida.js';
import { buildModeButtons, nextQ, quizOpen } from './perguntas.js';
import { avail, availCount, estadoMapa } from '../visualizacao/tela.js';

/* ---------- escopo e foco do treino ---------- */
function applyScopeChange(newScope){
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
let scopeMultiMode = false;
let multiSel = [];
/* revisão do dia: os países que você mais erra neste tipo de pergunta (até 10) */
function reviewList(){
  var st=estadoTreino.QS.m[quiz.mode]||{},arr=[];
  D.forEach(function(d){var e=st[d.cc];if(e&&e.w>0)arr.push({cc:d.cc,sc:e.w*2-e.r+(e.s===0?3:0)});});
  arr.sort(function(a,b){return b.sc-a.sc;});
  return arr.slice(0,10).map(function(x){return x.cc;});
}
function multiHas(sc){return multiSel.some(function(m){return m.r===sc.r&&m.s===sc.s;});}
function updateMultiApplyBtn(){
  var n=multiSel.length,btn=$('scopeApply');
  var cnt=D.filter(function(d){return multiSel.some(function(it){return it.s?(d.r===it.r&&d.sub===it.s):d.r===it.r;});}).length;
  btn.style.display=n?'flex':'none';
  btn.textContent='Aplicar ('+n+' regi'+(n===1?'ão':'ões')+' · '+cnt+' países)';
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
    var c=document.createElement('small');c.textContent=count+' '+(unid||(count===1?'país':'países'))+(rc&&rc.medal?' · '+MEDAL[rc.medal].i:'');
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
/** Lista das categorias especiais, com bandeira e o que cada lugar é (ultramarino de quem, etc.). */
function buildCatList(){
  var box=$('catbody');if(!box||box.dataset.ok)return;box.dataset.ok='1';
  function grupo(titulo,lista){
    var h=document.createElement('div');h.className='cath';h.textContent=titulo+' ('+lista.length+')';box.appendChild(h);
    lista.forEach(function(d){
      var r=document.createElement('div');r.className='catrow';
      var f=document.createElement('span');f.className='catflag';f.textContent=d.dis?'🏳️':d.flag;
      var t=document.createElement('div');var n=document.createElement('b');n.textContent=d.name;
      var o=document.createElement('small');o.textContent=(d.obs||'').split(/[;—]/)[0].trim();
      var ultra=/ultramarin/i.test(d.obs||'');
      if(ultra){var u=document.createElement('em');u.className='catultra';u.textContent='ultramarino';n.appendChild(u);}
      t.appendChild(n);t.appendChild(o);r.appendChild(f);r.appendChild(t);box.appendChild(r);
    });
  }
  grupo('⚠️ Não reconhecidos pela ONU',D.filter(function(d){return d.dis;}));
  grupo('◇ Territórios dependentes',D.filter(function(d){return d.dep;}));
  grupo('❄️ Desabitados e Antártida',D.filter(function(d){return d.uni;}));
}
function buildScopeList(filterStr){
  buildScopeTiles();
  buildCatList();
  var box=$('scopelist');box.innerHTML='';
  var q2=norm((filterStr||'').trim());
  function match(label){return !q2||norm(label).indexOf(q2)>=0;}
  var any=false;
  function item(label,count,sc,level){
    if(!match(label))return;
    any=true;
    var b=document.createElement('button');b.className='sitem'+(level===1?' sub':level===2?' sub sub2':'');
    var a=document.createElement('span');
    var rc=(recordable(sc)&&sc.t!=='multi')?estadoPartida.RECS[scopeKeyFor(sc,quiz.mode)]:null;
    a.textContent=(rc&&rc.medal?MEDAL[rc.medal].i+' ':'')+label;
    var c=document.createElement('small');c.textContent=count+(sc.t==='br'||sc.t==='brreg'?(count===1?' estado':' estados'):(count===1?' país':' países'));
    b.appendChild(a);b.appendChild(c);
    var combinable=(sc.t==='reg'||sc.t==='sub'||sc.t==='super');
    if(scopeMultiMode&&combinable){
      if(multiHas(sc.t==='super'?{r:-1}:sc))b.classList.add('selchk');
      b.onclick=function(){
        if(sc.t==='super'){
          AMERICAS_R.forEach(function(ri){var it={r:ri};if(!multiHas(it))multiSel.push(it);});
        }else{
          var idx=multiSel.findIndex(function(m){return m.r===sc.r&&m.s===sc.s;});
          if(idx>=0)multiSel.splice(idx,1);else multiSel.push({r:sc.r,s:sc.s});
        }
        updateMultiApplyBtn();buildScopeList($('scopeq').value);
      };
    }else{
      if(sc.t===estadoTreino.quizScope.t&&sc.r===estadoTreino.quizScope.r&&sc.s===estadoTreino.quizScope.s&&(sc.t!=='multi'))b.classList.add('on');
      b.onclick=function(){applyScopeChange(sc);};
    }
    box.appendChild(b);
  }
  function header(t){if(q2)return;var h=document.createElement('div');h.className='sh';h.textContent=t;box.appendChild(h);}
  if(!scopeMultiMode){
    var rv=reviewList();
    if(rv.length)item('🧠 Revisão do dia: '+(rv.length===1?'o que você mais erra':'os '+rv.length+' que você mais erra'),rv.length,{t:'review',cc:rv},0);
    item('🌍 Mundo',availCount(),{t:'world'},0);
  }
  REG.forEach(function(rg,ri){
    var list=D.filter(function(d){return d.r===ri&&avail(d);});
    if(!list.length)return;
    header(rg.n.toUpperCase());
    item(rg.n+' (inteira)',list.length,{t:'reg',r:ri},0);
    var subs=[];
    list.forEach(function(d){if(d.sub!==rg.n&&subs.indexOf(d.sub)<0)subs.push(d.sub);});
    subs.forEach(function(sn){item(sn,list.filter(function(d){return d.sub===sn;}).length,{t:'sub',r:ri,s:sn},1);});
  });
  if(!scopeMultiMode){
    header('BRASIL');
    item('🇧🇷 Todos os 27 estados',BRS.length,{t:'br'},0);
    BRREG.forEach(function(rg,ri){item(rg.n,BRS.filter(function(s){return s.r===ri;}).length,{t:'brreg',r:ri},1);});
  }
  $('scopeempty').style.display=any?'none':'block';
  updateMultiApplyBtn();
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  ouvir('treinar-regiao',function(o){if(!quiz.open)quizOpen();applyScopeChange({t:'reg',r:o.r});});
  ouvir('categorias-mudaram',function(o){if(quiz.open){updateScopeBtn();if(o.placar)renderScore();if(quiz.cur>=0&&!inScopeActive(QD()[quiz.cur]))nextQ();}});
  $('qscopeback').onclick=function(){if(estadoTreino.quizScopePrev){applyScopeChange(estadoTreino.quizScopePrev);$('scopesheet').style.display='none';}};
  $('qscopeb').onclick=function(){$('scopeq').value='';$('scopeadv').open=false;buildScopeList();$('scopesheet').style.display='block';};
  $('scopeq').addEventListener('input',function(){buildScopeList(this.value);});
  $('scopeclose').onclick=function(){$('scopesheet').style.display='none';};
  $('scopesheet').addEventListener('pointerdown',function(e){if(e.target===$('scopesheet'))$('scopesheet').style.display='none';});
  $('scopeMulti').onclick=function(){
    scopeMultiMode=!scopeMultiMode;multiSel=[];
    this.setAttribute('aria-pressed',scopeMultiMode?'true':'false');
    buildScopeList($('scopeq').value);
  };
  $('scopeApply').onclick=function(){
    if(!multiSel.length)return;
    applyScopeChange({t:'multi',items:multiSel.slice()});
    multiSel=[];scopeMultiMode=false;$('scopeMulti').setAttribute('aria-pressed','false');
  };
  $('qfocusb').onclick=function(){
    estadoTreino.quizFocus=estadoTreino.quizFocus==='mix'?'new':(estadoTreino.quizFocus==='new'?'wrong':'mix');
    lsSet('globo.quiz.focus',estadoTreino.quizFocus);quiz.last=-1;resetSession();nextQ();
  };
  /* as mesmas categorias na folha de escopo do treino */
  $('oUniQ').checked=estadoMapa.includeUni;
  $('oDepQ').checked=estadoMapa.includeDep;
  $('oUniQ').onclick=function(){setIncludeUni(this.checked);buildScopeList($('scopeq').value);};
  $('oDepQ').onclick=function(){setIncludeDep(this.checked);buildScopeList($('scopeq').value);};
  $('oDisputedQ').onclick=function(){setIncludeDisputed(this.checked);buildScopeList($('scopeq').value);};
}

export { applyScopeChange, iniciar };
