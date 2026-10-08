/**
 * @arquivo js/treino/progressao.js
 * Camada: Treino
 * Progressão: XP, níveis, sequência de dias, meta diária e conquistas.
 */

import { BRS } from '../dados/estados-brasil.js';
import { D, N_BASE, REG } from '../dados/paises.js';
import { afterFilter, buildTree } from '../interface/filtros.js';
import { tocar } from '../nucleo/som.js';
import { $, lsGet, lsSet } from '../nucleo/utilitarios.js';
import { estadoTreino, quiz, scopeLabel } from './estado.js';
import { modeName, openHistory } from './estatisticas.js';
import { startMap } from '../visualizacao/carregamento.js';
import { frame } from '../visualizacao/globo.js';
import { resize } from '../visualizacao/tela.js';

/* =====================================================================
   PROGRESSÃO: XP, níveis, sequência de dias, meta diária, conquistas
   ===================================================================== */
function pad2(n){return (n<10?'0':'')+n;}
function dateStr(d){return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());}
function todayStr(){return dateStr(new Date());}
function yestStr(){var d=new Date();d.setDate(d.getDate()-1);return dateStr(d);}
let PROG;
function progNovo(){return {xp:0,totalCorrect:0,streak:0,lastStreakDate:null,dailyGoal:10,dailyDate:null,dailyCount:0,goalDoneDate:null,badges:[]};}
function saveProg(){lsSet('globo.prog.v1',PROG);}
/** "Zerar progresso": volta nível, XP, sequência e conquistas ao começo (mantém a meta diária escolhida). */
function zerarProgresso(){var meta=PROG.dailyGoal;PROG=progNovo();PROG.dailyGoal=meta||10;saveProg();updateProgUI();}
function levelOf(xp){return Math.floor(xp/100)+1;}
/** Título do jogador pelo nível: quem joga passa a se ver como explorador, não como "nível 7". */
const TITULOS = [[1,'Turista'],[3,'Mochileiro'],[6,'Viajante'],[10,'Explorador'],[15,'Navegador'],[22,'Cartógrafo'],[30,'Embaixador'],[45,'Lenda do Mapa']];
function tituloDe(lv){var t=TITULOS[0][1];TITULOS.forEach(function(x){if(lv>=x[0])t=x[1];});return t;}
/** XP total do jogador (para saber quanto uma resposta ou rodada rendeu). */
function xpAtual(){return PROG.xp;}
function anteontem(){var d=new Date();d.setDate(d.getDate()-2);return dateStr(d);}
/* congelador: um dia perdido não zera a sequência se houver congelador guardado (ganha 1 a cada 7 dias, máx. 2) */
function displayStreak(){
  var t=todayStr(),y=yestStr();
  if(PROG.lastStreakDate===t||PROG.lastStreakDate===y)return PROG.streak;
  return (PROG.lastStreakDate===anteontem()&&(PROG.freezes||0)>0)?PROG.streak:0;
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
  var lvEl=$('qlevel');if(lvEl)lvEl.textContent='Nv '+lv+' · '+tituloDe(lv);
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
/* "Domina": a barra anda a cada acerto seguido (até 3 por item), para uma rodada perfeita já aparecer na barra */
function progDominio(ccs,unid){
  var st=estadoTreino.QS.m.cap||{},a=0,dom=0;
  ccs.forEach(function(cc){var e=st[cc],s=e?Math.min(3,e.s||0):0;a+=s;if(s>=3)dom++;});
  return [a,ccs.length*3,dom+' de '+ccs.length+' '+unid+' dominados · '+a+' de '+ccs.length*3+' acertos'];
}
function badgeDefs(){
  var arr=[];
  REG.forEach(function(rg,ri){
    if(!D.some(function(d){return d.r===ri&&!d.dep&&!d.uni;}))return;
    arr.push({id:'reg'+ri,title:'Domina '+rg.n,icon:'🌎',desc:'Acerte cada país de '+rg.n+' 3 vezes seguidas, em rodadas diferentes (País → Capital).',need:function(){
      var st=estadoTreino.QS.m.cap||{},list=D.filter(function(d){return d.r===ri&&!d.dep&&!d.uni;});
      return list.length>0&&list.every(function(d){var e=st[d.cc];return e&&e.s>=3;});
    },prog:function(){return progDominio(D.filter(function(d){return d.r===ri&&!d.dep&&!d.uni;}).map(function(d){return d.cc;}),'países');}});
  });
  arr.push({id:'world',title:'Mestre do Mundo',icon:'👑',desc:'Acerte cada um dos '+N_BASE+' países e territórios 3 vezes seguidas, em rodadas diferentes (País → Capital).',need:function(){
    var st=estadoTreino.QS.m.cap||{};return D.every(function(d){if(d.dep||d.uni)return true;var e=st[d.cc];return e&&e.s>=3;});
  },prog:function(){return progDominio(D.filter(function(d){return !d.dep&&!d.uni;}).map(function(d){return d.cc;}),'países');}});
  arr.push({id:'br27',title:'De Norte a Sul',icon:'🇧🇷',desc:'Acerte cada um dos 27 estados 3 vezes seguidas, em rodadas diferentes (Estado → Capital).',need:function(){
    var st=estadoTreino.QS.m.cap||{};return BRS.every(function(s){var e=st['BR-'+s.sigla];return e&&e.s>=3;});
  },prog:function(){return progDominio(BRS.map(function(s){return 'BR-'+s.sigla;}),'estados');}});
  [3,7,30].forEach(function(n){arr.push({id:'streak'+n,title:'Sequência de '+n+' dia'+(n===1?'':'s'),icon:'🔥',desc:'Bata a meta diária '+n+' dias seguidos.',need:function(){return PROG.streak>=n;},prog:function(){return [Math.min(PROG.streak,n),n];}});});
  [10,100,500,1000].forEach(function(n){arr.push({id:'xp'+n,title:n+' acertos',icon:'⭐',desc:'Acerte '+n+' perguntas no total, em qualquer modo.',need:function(){return PROG.totalCorrect>=n;},prog:function(){return [Math.min(PROG.totalCorrect,n),n];}});});
  return arr;
}
function checkBadges(){
  var defs=badgeDefs(),known={};PROG.badges.forEach(function(id){known[id]=1;});
  var any=false;
  defs.forEach(function(b){
    if(known[b.id])return;
    if(b.need()){PROG.badges.push(b.id);any=true;celebrate('🏆 Nova conquista: '+b.title);tocar('conquista');}
  });
  if(any)saveProg();
}
function addXP(n){
  var before=levelOf(PROG.xp);
  PROG.xp+=n;
  var after=levelOf(PROG.xp);
  if(after>before){var nt=tituloDe(after);celebrate(nt!==tituloDe(before)?('🎖️ Agora você é '+nt+'! (nível '+after+')'):('⬆️ Subiu para o nível '+after+'!'));tocar(nt!==tituloDe(before)?'conquista':'nivel');}
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
    else if(PROG.lastStreakDate===anteontem()&&(PROG.freezes||0)>0){PROG.freezes--;PROG.streak++;celebrate('🧊 O congelador salvou sua sequência!');}
    else if(PROG.lastStreakDate!==PROG.dailyDate)PROG.streak=1;
    if(PROG.streak%7===0&&(PROG.freezes||0)<2){PROG.freezes=(PROG.freezes||0)+1;setTimeout(function(){celebrate('🧊 Você ganhou um congelador: se faltar um dia, a sequência não zera.');},2400);}
    PROG.lastStreakDate=PROG.dailyDate;
    celebrate('🔥 Meta do dia batida! Sequência: '+PROG.streak+' dia'+(PROG.streak===1?'':'s'));tocar('meta');
  }
  saveProg();
  checkBadges();
  updateProgUI();
}
/* medalhas das regiões zeradas (gravadas em globo.recs.v1 por treino/partida.js) */
const ICONE_MEDALHA = {1:'🥇',2:'🥈',3:'🥉'};
function blocoMedalhas(){
  var recs=lsGet('globo.recs.v1',{}),lista=[];
  Object.keys(recs).forEach(function(k){
    var r=recs[k],p=k.split('|'),sc;
    if(!r||!r.medal||p.length<3)return;
    try{sc=JSON.parse(p.slice(1,-1).join('|'));}catch(e){return;}
    lista.push({medal:r.medal,nome:scopeLabel(sc),modo:modeName(p[p.length-1],p[0]),erros:r.bestE,vezes:r.n||1});
  });
  lista.sort(function(a,b){return a.medal-b.medal||a.nome.localeCompare(b.nome);});
  var sec=document.createElement('div');sec.className='medsec';
  var h=document.createElement('div');h.className='medtit';h.textContent='Medalhas das regiões zeradas ('+lista.length+')';sec.appendChild(h);
  if(!lista.length){var v=document.createElement('div');v.className='badgedesc';v.textContent='Zere uma região no treino (acerte todos os países dela) para ganhar a primeira medalha.';sec.appendChild(v);}
  lista.forEach(function(m){
    var row=document.createElement('div');row.className='badgerow';
    var ic=document.createElement('div');ic.className='badgeicon';ic.textContent=ICONE_MEDALHA[m.medal]||'🏅';
    var tx=document.createElement('div');
    var t=document.createElement('div');t.className='badgetitle';t.textContent=m.nome;
    var d=document.createElement('div');d.className='badgedesc';
    d.textContent=m.modo+' · melhor: '+m.erros+' '+(m.erros===1?'erro':'erros')+(m.vezes>1?' · zerou '+m.vezes+' vezes':'');
    tx.appendChild(t);tx.appendChild(d);row.appendChild(ic);row.appendChild(tx);sec.appendChild(row);
  });
  var h2=document.createElement('div');h2.className='medtit';h2.textContent='Conquistas';sec.appendChild(h2);
  return sec;
}
function openBadges(){
  var box=$('badgesbody');box.innerHTML='';
  var defs=badgeDefs(),known={};PROG.badges.forEach(function(id){known[id]=1;});
  /* conquistadas primeiro; depois as mais perto de completar (dá vontade de fechar a que falta pouco) */
  function frac(b){if(known[b.id])return 2;var p=b.prog?b.prog():[0,1];return p[1]?p[0]/p[1]:0;}
  defs=defs.slice().sort(function(a,b){return frac(b)-frac(a);});
  defs.forEach(function(b){
    var got=!!known[b.id];
    var row=document.createElement('div');row.className='badgerow'+(got?'':' locked');
    var ic=document.createElement('div');ic.className='badgeicon';ic.textContent=got?b.icon:'🔒';
    var tx=document.createElement('div');
    var t=document.createElement('div');t.className='badgetitle';t.textContent=b.title;
    var d2=document.createElement('div');d2.className='badgedesc';d2.textContent=b.desc;
    tx.appendChild(t);tx.appendChild(d2);
    if(!got&&b.prog){
      var pg=b.prog(),pb=document.createElement('div');pb.className='bprog';
      var fi=document.createElement('i');fi.style.width=Math.round(100*pg[0]/Math.max(1,pg[1]))+'%';pb.appendChild(fi);
      var pt=document.createElement('span');pt.textContent=pg[2]||(pg[0]+' de '+pg[1]);
      tx.appendChild(pb);tx.appendChild(pt);pt.className='bprogt';
    }
    row.appendChild(ic);row.appendChild(tx);box.appendChild(row);
  });
  box.insertBefore(blocoMedalhas(),box.firstChild);
  var n=PROG.badges.length,tot=defs.length;
  $('badgeshead').textContent='Conquistas ('+n+'/'+tot+')';
  $('badgesheet').style.display='block';
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  PROG = lsGet('globo.prog.v1',progNovo());
  $('streakpill').onclick=function(){
    var n=displayStreak(),f=PROG.freezes||0;
    celebrate('🔥 '+n+(n===1?' dia seguido':' dias seguidos')+' batendo a meta de '+PROG.dailyGoal+' respostas por dia'+(f?' · 🧊 '+f+(f===1?' congelador':' congeladores'):'')+'. Jogue amanhã para não perder!');
  };
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

export { addXP, celebrate, iniciar, recordProgress, updateProgUI, xpAtual, zerarProgresso };
