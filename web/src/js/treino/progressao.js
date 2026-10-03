/**
 * @arquivo js/treino/progressao.js
 * Camada: Treino
 * Progressão: XP, níveis, sequência de dias, meta diária e conquistas.
 */

import { BRS } from '../dados/estados-brasil.js';
import { D, N_BASE, REG } from '../dados/paises.js';
import { afterFilter, buildTree } from '../interface/filtros.js';
import { $, lsGet, lsSet } from '../nucleo/utilitarios.js';
import { estadoTreino, quiz } from './estado.js';
import { openHistory } from './estatisticas.js';
import { frame } from '../visualizacao/animacao.js';
import { startMap } from '../visualizacao/carregamento.js';
import { resize } from '../visualizacao/globo.js';

/* =====================================================================
   PROGRESSÃO: XP, níveis, sequência de dias, meta diária, conquistas
   ===================================================================== */
function pad2(n){return (n<10?'0':'')+n;}
function dateStr(d){return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());}
function todayStr(){return dateStr(new Date());}
function yestStr(){var d=new Date();d.setDate(d.getDate()-1);return dateStr(d);}
let PROG;
function saveProg(){lsSet('globo.prog.v1',PROG);}
function levelOf(xp){return Math.floor(xp/100)+1;}
function displayStreak(){
  var t=todayStr(),y=yestStr();
  return (PROG.lastStreakDate===t||PROG.lastStreakDate===y)?PROG.streak:0;
}
function ensureDay(){
  var t=todayStr();
  if(PROG.dailyDate!==t){PROG.dailyDate=t;PROG.dailyCount=0;}
}
function updateStreakPill(){
  var el=$('streakpill'),n=displayStreak();
  if(n>0){el.style.display='flex';el.textContent='🔥 '+n;}
  else el.style.display='none';
}
function updateProgUI(){
  ensureDay();
  var lv=levelOf(PROG.xp),into=PROG.xp%100;
  var lvEl=$('qlevel');if(lvEl)lvEl.textContent='Nível '+lv;
  var bar=$('qxpbar');if(bar)bar.style.width=into+'%';
  var xt=$('qxptxt');if(xt)xt.textContent=into+'/100 XP';
  var ring=$('qgoalring');
  if(ring){
    var pct=Math.max(0,Math.min(1,PROG.dailyCount/PROG.dailyGoal));
    var C=2*Math.PI*15.9155;
    ring.style.strokeDasharray=(pct*C).toFixed(1)+' '+C.toFixed(1);
  }
  var gt=$('qgoaltxt'),stk=displayStreak();if(gt)gt.textContent=Math.min(PROG.dailyCount,PROG.dailyGoal)+'/'+PROG.dailyGoal+' hoje'+(stk>0?' · 🔥'+stk:'');
  updateStreakPill();
}
const toastQ = [];
function celebrate(msg){
  toastQ.push(msg);
  if(toastQ.length>1)return;
  showNextToast();
}
function showNextToast(){
  if(!toastQ.length)return;
  var msg=toastQ[0];
  var host=quiz.open?$('quiz').querySelector('.qpanel'):$('stage');
  if(!host)return;
  var el=document.createElement('div');el.className='qtoast';el.textContent=msg;
  host.insertBefore(el,host.firstChild);
  requestAnimationFrame(function(){el.classList.add('show');});
  setTimeout(function(){
    el.classList.remove('show');
    setTimeout(function(){el.remove();toastQ.shift();showNextToast();},250);
  },2200);
}
function badgeDefs(){
  var arr=[];
  REG.forEach(function(rg,ri){
    if(!D.some(function(d){return d.r===ri&&!d.dep&&!d.uni;}))return;
    arr.push({id:'reg'+ri,title:'Domina '+rg.n,icon:'🌎',desc:'Chegue a 3 acertos seguidos em todos os países de '+rg.n+' (País → Capital).',need:function(){
      var st=estadoTreino.QS.m.cap||{},list=D.filter(function(d){return d.r===ri&&!d.dep&&!d.uni;});
      return list.length>0&&list.every(function(d){var e=st[d.cc];return e&&e.s>=3;});
    }});
  });
  arr.push({id:'world',title:'Mestre do Mundo',icon:'👑',desc:'Domine os '+N_BASE+' países e territórios em País → Capital.',need:function(){
    var st=estadoTreino.QS.m.cap||{};return D.every(function(d){if(d.dep||d.uni)return true;var e=st[d.cc];return e&&e.s>=3;});
  }});
  arr.push({id:'br27',title:'De Norte a Sul',icon:'🇧🇷',desc:'Domine os 27 estados do Brasil em Estado → Capital.',need:function(){
    var st=estadoTreino.QS.m.cap||{};return BRS.every(function(s){var e=st['BR-'+s.sigla];return e&&e.s>=3;});
  }});
  [3,7,30].forEach(function(n){arr.push({id:'streak'+n,title:'Sequência de '+n+' dia'+(n===1?'':'s'),icon:'🔥',desc:'Bata a meta diária '+n+' dias seguidos.',need:function(){return PROG.streak>=n;}});});
  [10,100,500,1000].forEach(function(n){arr.push({id:'xp'+n,title:n+' acertos',icon:'⭐',desc:'Acerte '+n+' perguntas no total, em qualquer modo.',need:function(){return PROG.totalCorrect>=n;}});});
  return arr;
}
function checkBadges(){
  var defs=badgeDefs(),known={};PROG.badges.forEach(function(id){known[id]=1;});
  var any=false;
  defs.forEach(function(b){
    if(known[b.id])return;
    if(b.need()){PROG.badges.push(b.id);any=true;celebrate('🏆 Nova conquista: '+b.title);}
  });
  if(any)saveProg();
}
function addXP(n){
  var before=levelOf(PROG.xp);
  PROG.xp+=n;
  var after=levelOf(PROG.xp);
  if(after>before)celebrate('⬆️ Subiu para o nível '+after+'!');
  saveProg();
}
function recordProgress(ok,hinted){
  ensureDay();
  PROG.dailyCount++;
  if(ok){
    PROG.totalCorrect++;
    addXP(hinted?5:10);
  }
  if(PROG.dailyCount>=PROG.dailyGoal&&PROG.goalDoneDate!==PROG.dailyDate){
    PROG.goalDoneDate=PROG.dailyDate;
    var y=yestStr();
    if(PROG.lastStreakDate===y)PROG.streak++;
    else if(PROG.lastStreakDate!==PROG.dailyDate)PROG.streak=1;
    PROG.lastStreakDate=PROG.dailyDate;
    celebrate('🔥 Meta do dia batida! Sequência: '+PROG.streak+' dia'+(PROG.streak===1?'':'s'));
  }
  saveProg();
  checkBadges();
  updateProgUI();
}
function openBadges(){
  var box=$('badgesbody');box.innerHTML='';
  var defs=badgeDefs(),known={};PROG.badges.forEach(function(id){known[id]=1;});
  defs.forEach(function(b){
    var got=!!known[b.id];
    var row=document.createElement('div');row.className='badgerow'+(got?'':' locked');
    var ic=document.createElement('div');ic.className='badgeicon';ic.textContent=got?b.icon:'🔒';
    var tx=document.createElement('div');
    var t=document.createElement('div');t.className='badgetitle';t.textContent=b.title;
    var d2=document.createElement('div');d2.className='badgedesc';d2.textContent=b.desc;
    tx.appendChild(t);tx.appendChild(d2);
    row.appendChild(ic);row.appendChild(tx);box.appendChild(row);
  });
  var n=PROG.badges.length,tot=defs.length;
  $('badgeshead').textContent='Conquistas ('+n+'/'+tot+')';
  $('badgesheet').style.display='block';
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  PROG = lsGet('globo.prog.v1',{xp:0,totalCorrect:0,streak:0,lastStreakDate:null,dailyGoal:10,dailyDate:null,dailyCount:0,goalDoneDate:null,badges:[]});
  $('mbadges').onclick=openBadges;$('mhist').onclick=function(){openHistory();};
  $('badgesclose').onclick=function(){$('badgesheet').style.display='none';};
  $('goalgo').onclick=function(){
    var opts=[5,10,20,30],idx=opts.indexOf(PROG.dailyGoal);
    PROG.dailyGoal=opts[(idx+1)%opts.length];saveProg();updateProgUI();
  };
  ensureDay();saveProg();updateProgUI();
  (function firstTip(){
    if(lsGet('globo.seenhint',false)){$('hint').style.display='none';return;}
    var h=$('hint');h.classList.add('tip');
    setTimeout(function(){h.classList.add('out');lsSet('globo.seenhint',true);setTimeout(function(){h.style.display='none';},650);},4200);
  })();

  updateStreakPill();
  buildTree();afterFilter();resize();
  requestAnimationFrame(frame);
  startMap();
}

export { addXP, celebrate, iniciar, recordProgress, updateProgUI };
