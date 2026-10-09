/**
 * @arquivo js/treino/perguntas.js
 * Camada: Treino
 * Fluxo das perguntas (nextQ), respostas, cronômetro e tela de fim de partida.
 */

import { exitStates } from '../brasil/modo-estados.js';
import { BRS } from '../dados/estados-brasil.js';
import { D, dflag, norm, REG } from '../dados/paises.js';
import { NB, short } from '../dados/vizinhos.js';
import { closeCard, tourStop } from '../interface/cartao-detalhes.js';
import { estadoDistancia, slerp } from '../interface/distancia.js';
import { setIncludeUni } from '../interface/filtros.js';
import { hidePick } from '../interface/lista-proximos.js';
import { emitir, ouvir } from '../nucleo/eventos.js';
import { haversine } from '../nucleo/geo.js';
import { pausarMusica, tocar } from '../nucleo/som.js';
import { $, confirmTap, lsSet, setStatus } from '../nucleo/utilitarios.js';
import { addHintBtn } from './dica.js';
import { flyTo } from '../visualizacao/animacao.js';
import { applyDomainForScope, emptyMsg, inScopeActive, poolIdx, qcapD, qcc, QD, qflag, scopeView, unitWord, updateScopeBackBtn, updateScopeBtn, updateTrainRow } from './dominio.js';
import { accList, estadoTreino, freshQS, matches, measureQ, quiz, resetSession, scopeLabel, stopTimerTick } from './estado.js';
import { fillQStat, modeName } from './estatisticas.js';
import { curRun, estadoPartida, finishQ, fmtTime, makeNeighborOptions, makeOptions, MEDAL, medalFor, optLabel, pickQ, recordable, renderScore, runKey, runPool, saveRecs, saveRuns, scopeKeyFor, shareRun, showTarget } from './partida.js';
import { addXP, zerarProgresso } from './progressao.js';
import { estadoBrasil, stateAt } from '../visualizacao/estados.js';
import { estadoRender } from '../visualizacao/projecao.js';
import { estadoCamera, estadoMapa, H, R0, resize, rot, W } from '../visualizacao/tela.js';

/* ---------- sessões fechadas ---------- */
function sessionDone(){return quiz.sessionLen>0&&quiz.sessionAsked>=quiz.sessionLen;}
function timerRemaining(){if(!quiz.timerLen)return null;return Math.max(0,quiz.timerLen*1000-(Date.now()-quiz.timerStart));}
function updateTimerDisplay(){
  var el=$('qtimer'),r=timerRemaining();
  el.textContent=(r==null)?'':('⏱️ '+Math.ceil(r/1000)+'s');
}
function startTimerTick(){
  stopTimerTick();
  if(!quiz.timerLen){updateTimerDisplay();return;}
  quiz.timerStart=Date.now();updateTimerDisplay();
  quiz.timerInt=setInterval(function(){
    if(!quiz.open){stopTimerTick();return;}
    var r=timerRemaining();updateTimerDisplay();
    if(r<=0){stopTimerTick();showRoundSummary('time');}
  },250);
}
function roundDone(){
  if(quiz.survivalMode)return quiz.lastOk===false;
  /* numa região (ou nos estados) a rodada vai até zerar, sem cortar no meio; rodadas de 10 só no
     Mundo, na revisão e no desafio do dia */
  var sc=estadoTreino.quizScope;
  if(!estadoTreino.desafio&&sc.t!=='world'&&sc.t!=='review'&&sc.t!=='filter'&&runPool().length)return false;
  return sessionDone();
}
function showRoundSummary(reason){
  stopTimerTick();
  var body=$('qbody'),fb=$('qfb');fb.textContent='';fb.className='';$('qnext').style.display='none';
  body.innerHTML='';
  var log=quiz.sessionLog,okc=log.filter(function(x){return x.ok;}).length,n=log.length||1;
  var xp=log.reduce(function(t,x){return t+(x.xp||0);},0);
  var rap=log.filter(function(x){return x.rapido;}).length;
  var comboMax=log.reduce(function(m,x){return Math.max(m,x.combo||0);},0);
  /* estrelas pela taxa de acerto: 100% = 3, 70% = 2, 40% = 1 */
  var pct=okc/n,est=pct>=1?3:pct>=.7?2:pct>=.4?1:0;
  var box=document.createElement('div');box.className='rodadafim';
  var st=document.createElement('div');st.className='estrelas';
  for(var k=0;k<3;k++){var e=document.createElement('span');e.textContent='★';if(k<est){e.className='on';e.style.animationDelay=(0.15+k*0.22)+'s';}st.appendChild(e);}
  box.appendChild(st);
  var h=document.createElement('div');h.className='rftit';
  h.textContent=reason==='time'?'⏱️ Tempo esgotado!':reason==='survival'?'💀 Fim da sobrevivência!':['Bora de novo? 💪','Bom começo! 👍','Muito bem! 🎉','Perfeito! 🏆'][est];
  box.appendChild(h);
  var sub=document.createElement('div');sub.className='rfsub';sub.textContent=okc+' de '+log.length+' certas';box.appendChild(sub);
  var stats=document.createElement('div');stats.className='rfstats';
  [['+'+xp,'XP'],['🔥 '+comboMax,'seguidos'],['⚡ '+rap,'rápidas']].forEach(function(p){
    var c=document.createElement('div');var v=document.createElement('b');v.textContent=p[0];var l=document.createElement('span');l.textContent=p[1];c.appendChild(v);c.appendChild(l);stats.appendChild(c);
  });
  box.appendChild(stats);
  var miss=log.filter(function(x){return !x.ok;});
  if(miss.length){var mh=document.createElement('div');mh.className='rfrever';mh.textContent='Para rever: '+miss.map(function(x){return x.label;}).join(', ');box.appendChild(mh);}
  var again=document.createElement('button');again.className='rfjogar';again.textContent='▶ Jogar de novo';
  again.onclick=function(){resetSession();if(quiz.timerLen)startTimerTick();nextQ();};
  box.appendChild(again);
  var row=document.createElement('div');row.className='rfmais';
  if(miss.length){
    var rev=document.createElement('button');rev.textContent='Revisar os erros';
    rev.onclick=function(){estadoTreino.quizFocus='wrong';lsSet('globo.quiz.focus','wrong');updateScopeBtn();resetSession();if(quiz.timerLen)startTimerTick();nextQ();};
    row.appendChild(rev);
  }
  var free=document.createElement('button');free.textContent='Jogar sem parar';
  free.onclick=function(){
    quiz.sessionLen=0;lsSet('globo.quiz.sesslen',0);updateSessionBtn();
    quiz.timerLen=0;lsSet('globo.quiz.timerlen',0);updateTimerBtn();stopTimerTick();updateTimerDisplay();
    quiz.survivalMode=false;lsSet('globo.quiz.survival',false);updateSurvBtn();
    resetSession();nextQ();
  };
  row.appendChild(free);box.appendChild(row);
  body.appendChild(box);
  emitir('rodada-terminou',{caixa:box,log:log});
  tocar(est===3?'conquista':'meta');
  if(est>=2)celebrarTela(est===3?28:16);
  measureQ();
}
/** Confete caindo no painel (fim de rodada boa). */
function celebrarTela(n){
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var host=$('quiz').querySelector('.qpanel'),cores=['#ffd166','#06d6a0','#4cc9f0','#f72585','#fb8500'];
  for(var k=0;k<n;k++){
    var p=document.createElement('i');p.className='confete chuva';
    p.style.left=(5+Math.random()*90)+'%';p.style.background=cores[k%cores.length];p.style.animationDelay=(Math.random()*0.5)+'s';
    host.appendChild(p);setTimeout(function(el){return function(){el.remove();};}(p),2200);
  }
}
function updateSessionBtn(){updateTrainRow();
  $('qsessionb').textContent='🧮 Sessão: '+(quiz.sessionLen?quiz.sessionLen+' perguntas':'livre');
}
function updateTimerBtn(){
  $('qtimerb').textContent='⏱️ Cronômetro: '+(quiz.timerLen?quiz.timerLen+'s':'desligado');
}
function updateSurvBtn(){
  $('qsurvb').textContent='💀 Sobrevivência: '+(quiz.survivalMode?'ligada':'desligada');
}
function updateOrderBtn(){
  $('qorderb').textContent=quiz.order==='seq'?'➡️ Ordem: sequencial':'🔀 Ordem: aleatória';
}
function nextQ(){
  estadoTreino.qFlash=null;estadoTreino.qBadge=null;estadoTreino.qPino=null;estadoMapa.selected=null;quiz.hinted=false;quiz.nbAnswer=-1;
  if(estadoDistancia.arc&&estadoDistancia.arc.quiz)estadoDistancia.arc=null;
  /* partida zerada antes (em outra visita): começa outra do zero, mesmo que a região tenha ganhado um país novo
     depois (ex.: Guiana Francesa na América do Sul); a medalha e os recordes ficam guardados em globo.recs.v1 */
  var rk=runKey(),rr=estadoPartida.RUNS[rk];
  if(rr&&rr.fin&&estadoPartida.ultimoFim!==rk){delete estadoPartida.RUNS[rk];saveRuns();}
  var arr=QD(),i=pickQ();
  var body=$('qbody'),fb=$('qfb');body.innerHTML='';fb.textContent='';fb.className='';$('qnext').style.display='none';
  var isMap=quiz.mode==='map',isNeighbor=quiz.mode==='neighbor';
  $('qtypes').style.display=(isMap||isNeighbor)?'none':'flex';measureQ();
  if(i<0){updateScopeBtn();if(poolIdx().length&&!runPool().length){showRunDone();return;}semPerguntas(body);$('qpool').textContent='';return;}
  estadoPartida.ultimoFim='';
  quiz.cur=i;quiz.last=i;quiz.answered=false;quiz.sessionAsked++;estadoTreino.QS.q[quiz.mode]=(estadoTreino.QS.q[quiz.mode]||0)+1;lsSet('globo.quiz.v1',estadoTreino.QS);
  var d=arr[i];
  var n=poolIdx().length;updateScopeBtn();
  $('qpool').textContent=n+' '+unitWord(n)+' em '+scopeLabel()+'.'+(isMap&&estadoTreino.quizDomain==='world'&&!estadoRender.feats?' Sem fronteiras carregadas: os pontos das capitais ficam visíveis.':'')+(isMap&&estadoTreino.quizDomain==='br'&&!estadoBrasil.STFEAT.some(function(f){return f;})?' Sem divisas importadas: os pontos das capitais ficam visíveis.':'');
  var q=document.createElement('div');q.className='qq';
  if(quiz.mode==='cap'){
    q.textContent='Qual é a capital de '+qflag(d)+' '+short(d)+'?';
    var cbt=document.createElement('button');cbt.className='qcenter';cbt.textContent='⌖ Centralizar';cbt.onclick=function(){showTarget(i);};q.appendChild(cbt);
    addHintBtn(q,d,false);
    showTarget(i);if(estadoTreino.quizDomain==='world')estadoTreino.qFlash={i:i,kind:'ask'};
  }
  else if(quiz.mode==='pais'){
    q.textContent='Qual '+(estadoTreino.quizDomain==='br'?'estado':'país')+' tem como capital '+qcapD(d)+'?';addHintBtn(q,d,false);
    /* o contrário de País → Capital: o globo vai até a cidade e marca só ela; o país você descobre */
    if(estadoTreino.quizDomain==='world'){estadoTreino.qPino=i;flyTo(d.lat,d.lng,Math.max(1.6,REG[d.r].z*1.4));}else scopeView();
  }
  else if(quiz.mode==='flag'){
    /* o globo gira até o continente da bandeira (as opções são do mesmo lugar, então não entrega) */
    if(estadoTreino.quizDomain==='world')flyTo(REG[d.r].lat,REG[d.r].lng,REG[d.r].z);else scopeView();var f2=document.createElement('div');f2.className='qflag big';f2.textContent=d.flag;var t2=document.createElement('div');t2.textContent='De qual país é esta bandeira?';q.appendChild(f2);q.appendChild(t2);addHintBtn(q,d,false);}
  else if(quiz.mode==='code'){q.textContent='Qual é a sigla de '+qflag(d)+' '+short(d)+'?';scopeView();addHintBtn(q,d,false);}
  else if(isNeighbor){
    var nbIdxs=estadoTreino.quizDomain==='br'?d.nb:NB[i];
    quiz.nbAnswer=nbIdxs[Math.floor(Math.random()*nbIdxs.length)];
    q.textContent='Qual destes '+unitWord(2)+' faz fronteira com '+qflag(d)+' '+short(d)+'?';
    addHintBtn(q,arr[quiz.nbAnswer],false);
    showTarget(i);if(estadoTreino.quizDomain==='world')estadoTreino.qFlash={i:i,kind:'ask'};
  }
  else{q.textContent='Toque no mapa: onde fica '+qflag(d)+' '+short(d)+'?';}
  /* Centralizar e Dica numa linha só deles, embaixo da pergunta */
  var acoes=q.querySelectorAll(':scope > .qcenter');
  if(acoes.length){var ac=document.createElement('div');ac.className='qacoes';Array.prototype.forEach.call(acoes,function(b){ac.appendChild(b);});q.appendChild(ac);}
  var qs=document.createElement('div');qs.id='qstat';qs.className='qstat';fillQStat(qs,d);q.appendChild(qs);
  quiz.tShown=performance.now();quiz.escolhido=-1;
  body.appendChild(q);
  if(isMap){
    var row=document.createElement('div');row.className='qrow';
    var skip=document.createElement('button');skip.textContent='Pular / mostrar';
    skip.onclick=function(){if(quiz.answered)return;finishQ(false,'(mostrado)');};
    row.appendChild(skip);body.appendChild(row);
    addHintBtn(body,d,true);
    scopeView();
    return;
  }
  if(isNeighbor){
    var grid2=document.createElement('div');grid2.className='qopts';
    makeNeighborOptions(i,quiz.nbAnswer).forEach(function(k){
      var b=document.createElement('button');b.textContent=optLabel(k);b.dataset.k=k;
      b.onclick=function(){
        if(quiz.answered)return;
        var ok=(k===quiz.nbAnswer);
        Array.prototype.forEach.call(grid2.children,function(x){x.disabled=true;});
        b.classList.add(ok?'okb':'badb');
        if(!ok)Array.prototype.forEach.call(grid2.children,function(x){if(x.textContent===optLabel(quiz.nbAnswer))x.classList.add('okb');});
        finishQ(ok);
      };
      grid2.appendChild(b);
    });
    body.appendChild(grid2);
    return;
  }
  if(quiz.type==='choice'){
    var grid=document.createElement('div');grid.className='qopts';
    makeOptions(i).forEach(function(k){
      var b=document.createElement('button');b.textContent=optLabel(k);b.dataset.k=k;
      b.onclick=function(){
        if(quiz.answered)return;
        quiz.escolhido=k;
        var ok=(k===i);
        Array.prototype.forEach.call(grid.children,function(x){x.disabled=true;});
        b.classList.add(ok?'okb':'badb');
        if(!ok)Array.prototype.forEach.call(grid.children,function(x){if(x.textContent===optLabel(i))x.classList.add('okb');});
        finishQ(ok);
      };
      grid.appendChild(b);
    });
    body.appendChild(grid);
  }else{
    var inp=document.createElement('input');inp.type='text';inp.placeholder=quiz.mode==='code'?'Digite a sigla (2 letras)…':'Digite a resposta…';inp.autocomplete='off';inp.autocapitalize='off';inp.className='qinp';
    if(quiz.mode==='code')inp.maxLength=3;
    var go=document.createElement('button');go.textContent='Responder';go.className='qgo';
    var idk=document.createElement('button');idk.textContent='Não sei';idk.className='qidk';
    function submit(reveal){
      if(quiz.answered)return;
      var ok;
      if(reveal)ok=false;
      else if(quiz.mode==='code'){
        var want=(estadoTreino.quizDomain==='br'?d.sigla:d.cc).toUpperCase();
        ok=inp.value.trim().toUpperCase()===want;
      }else{
        var list=estadoTreino.quizDomain==='br'?[norm(quiz.mode==='cap'?d.cap:d.name)]:(quiz.mode==='cap'?accList(d.cap,d.cc,true):accList(d.name,d.cc,false));
        ok=matches(inp.value,list);
      }
      inp.disabled=true;go.disabled=true;idk.disabled=true;
      finishQ(ok,reveal?'(você pulou)':'');
    }
    go.onclick=function(){submit(false);};idk.onclick=function(){submit(true);};
    inp.addEventListener('keydown',function(e){if(e.key==='Enter')submit(false);});
    var row2=document.createElement('div');row2.className='qrow';row2.appendChild(go);row2.appendChild(idk);
    body.appendChild(inp);body.appendChild(row2);
    setTimeout(function(){try{inp.focus();}catch(e){}},50);
  }
}
function quizMapAnswer(cn){
  if(!estadoTreino.qMap||quiz.answered)return;
  var i=quiz.cur,d=D[i],ok=!!cn&&cn.i===i;
  if(ok||!cn){finishQ(ok,ok?'':'Você tocou fora de qualquer país.');return;}
  var km=Math.round(haversine(cn,d)),near=km<800;
  var pts=[],A=[cn.x,cn.y,cn.z],B=[d.x,d.y,d.z];
  for(var t=0;t<=1.0001;t+=1/60)pts.push(slerp(A,B,Math.min(1,t)));
  estadoDistancia.arc={a:cn.i,b:i,pts:pts,quiz:true};
  if(near)addXP(3);
  finishQ(false,'Você tocou em '+dflag(cn)+' '+short(cn)+', a '+km.toLocaleString('pt-BR')+' km (entre as capitais).'+(near?' Quase! +3 XP':''));
}
function quizMapAnswerBR(st){
  if(!estadoTreino.qMap||quiz.answered)return;
  var i=quiz.cur,d=BRS[i],ok=!!st&&st.i===i;
  if(ok||!st){finishQ(ok,ok?'':'Você tocou fora de qualquer estado.');return;}
  var km=Math.round(haversine(st,d)),near=km<300;
  if(near)addXP(3);
  finishQ(false,'Você tocou em '+st.sigla+' '+st.name+', a '+km.toLocaleString('pt-BR')+' km (entre as capitais).'+(near?' Quase! +3 XP':''));
}
function pickStateNear(x,y){
  var R=R0*estadoCamera.zoom,cand=[];
  BRS.forEach(function(st){
    if(!estadoBrasil.onS[st.i])return;
    var p=rot(st.x,st.y,st.z);if(p[2]<=0.05)return;
    var sx=W/2+R*p[0],sy=H*estadoCamera.cyFrac-R*p[1],dd=(sx-x)*(sx-x)+(sy-y)*(sy-y);
    if(dd<36*36)cand.push({s:st,dd:dd});
  });
  cand.sort(function(a,b){return a.dd-b.dd;});
  if(cand.length)return cand[0].s;
  return stateAt(x,y);
}
/* escopo sem perguntas neste modo: diz o porquê e oferece uma saída (ex.: Antártida só tem bases, sem capital) */
function semPerguntas(body){
  body.innerHTML='';
  var arr=QD();
  var soMapa=estadoTreino.quizDomain!=='br'&&estadoTreino.quizFocus==='mix'&&quiz.mode!=='map'&&arr.some(function(d){return d.uni&&inScopeActive(d);});
  var p=document.createElement('div');p.className='qhint';
  p.textContent=soMapa?(scopeLabel()+' não tem países com capital: só bases e territórios reivindicados. Dá para treinar onde ficam, no "Achar no mapa".'):emptyMsg();
  body.appendChild(p);
  var row=document.createElement('div');row.className='qrow';
  if(soMapa){var m=document.createElement('button');m.textContent='📍 Achar no mapa';m.onclick=function(){if(!estadoMapa.includeUni)setIncludeUni(true);quizSetMode('map');};row.appendChild(m);}
  var o=document.createElement('button');o.textContent='🌎 Outra região';o.onclick=function(){$('qscopeb').click();};row.appendChild(o);
  body.appendChild(row);
}
function buildModeButtons(){
  var box=$('qmodes');box.innerHTML='';$('qmodev').textContent=modeName(quiz.mode);
  $('qmodel').textContent='❓ Pergunta';
  var defs=estadoTreino.quizDomain==='br'?[['cap','🏛️','Estado → Capital','Qual é a capital da Bahia?'],['pais','🏙️','Capital → Estado','Salvador é capital de qual estado?'],['neighbor','🤝','Vizinhos','Quem faz divisa com a Bahia?'],['code','🔤','Siglas','Qual é a sigla da Bahia?'],['map','📍','Achar no mapa','Toque onde fica a Bahia']]
    :[['cap','🏛️','País → Capital','Qual é a capital do Peru?'],['pais','🏙️','Capital → País','Lima é capital de qual país?'],['flag','🚩','Bandeiras','De quem é esta bandeira?'],['neighbor','🤝','Vizinhos','Quem faz fronteira com o Peru?'],['map','📍','Achar no mapa','Toque onde fica o Peru']];
  defs.forEach(function(m){
    var b=document.createElement('button');b.className='mcard';b.setAttribute('aria-pressed',quiz.mode===m[0]?'true':'false');
    var t=document.createElement('b');t.textContent=m[1]+' '+m[2];var ex=document.createElement('small');ex.textContent=m[3];
    b.appendChild(t);b.appendChild(ex);
    b.onclick=function(){quizSetMode(m[0]);};box.appendChild(b);
  });
  /* jeito de responder: escolher entre 4 ou digitar (vizinhos e mapa são sempre de tocar) */
  var resp=document.createElement('div');resp.className='qresp';
  var rl=document.createElement('span');rl.textContent='Responder:';resp.appendChild(rl);
  [['choice','👆 Escolher'],['type','⌨️ Digitar']].forEach(function(t2){
    var b=document.createElement('button');b.textContent=t2[1];b.setAttribute('aria-pressed',quiz.type===t2[0]?'true':'false');
    b.onclick=function(){quiz.type=t2[0];$('qmodes').hidden=true;$('qmodeb').setAttribute('aria-expanded','false');buildModeButtons();resetSession();nextQ();};
    resp.appendChild(b);
  });
  box.appendChild(resp);
  /* as outras opções do treino ficam no menu; este atalho mostra que elas existem */
  var mais=document.createElement('button');mais.className='qmodesmais';mais.textContent='⚙️ Mais ajustes (cronômetro, tamanho da rodada…)';
  mais.onclick=function(){$('qmodes').hidden=true;$('qmodeb').setAttribute('aria-expanded','false');$('mbtn').click();setTimeout(function(){var t=document.querySelector('[data-p="mp-train"]');if(t)t.click();},60);};
  box.appendChild(mais);
  var t=$('qtypes');t.innerHTML='';
  [['choice','Múltipla escolha'],['type','Digitar']].forEach(function(m){
    var b=document.createElement('button');b.textContent=m[1];b.setAttribute('aria-pressed',quiz.type===m[0]?'true':'false');
    b.onclick=function(){quiz.type=m[0];buildModeButtons();resetSession();nextQ();};t.appendChild(b);
  });
}
function quizSetMode(m){
  $('qmodes').hidden=true;$('qmodeb').setAttribute('aria-expanded','false');
  quiz.mode=m;estadoTreino.qMap=(m==='map'&&quiz.open);
  if(m==='neighbor')quiz.type='choice';
  buildModeButtons();resetSession();nextQ();measureQ();renderScore();
}
function quizOpen(){
  if(estadoBrasil.statesMode)exitStates(false);
  tourStop();closeCard();hidePick();
  quiz.open=true;quiz.ok=0;quiz.total=0;quiz.streak=0;quiz.last=-1;syncModeSw();
  document.body.classList.add('quizing');$('quiz').classList.add('map');pausarMusica(true);
  $('quiz').style.display='block';
  applyDomainForScope();
  updateSessionBtn();updateOrderBtn();updateTimerBtn();updateSurvBtn();updateScopeBackBtn();
  if(quiz.timerLen)startTimerTick();else updateTimerDisplay();
  setTimeout(function(){resize();measureQ();},60);
  renderScore();quizSetMode(quiz.mode);
}
function quizClose(){
  quiz.open=false;estadoTreino.qMap=false;estadoTreino.qPanelH=0;estadoTreino.qFlash=null;estadoTreino.qBadge=null;syncModeSw();
  if(estadoDistancia.arc&&estadoDistancia.arc.quiz)estadoDistancia.arc=null;
  stopTimerTick();
  if(estadoTreino.quizDomain==='br'){estadoBrasil.statesMode=false;estadoBrasil.selSt=null;}
  document.body.classList.remove('quizing');$('quiz').style.display='none';setTimeout(resize,60);pausarMusica(false);
}
function syncModeSw(){$('qbtn').setAttribute('aria-pressed',quiz.open?'true':'false');$('qclose').setAttribute('aria-pressed',quiz.open?'false':'true');}

function runRestart(){delete estadoPartida.RUNS[runKey()];saveRuns();resetSession();quiz.last=-1;nextQ();renderScore();}
function showRunDone(){
  stopTimerTick();
  var r=curRun(),n=poolIdx().length,body=$('qbody'),fb=$('qfb'),res=r.res||{medal:medalFor(r.e),t:r.at||0};
  fb.textContent='';fb.className='';$('qnext').style.display='none';$('qpool').textContent='';
  body.innerHTML='';
  var box=document.createElement('div');box.className='rundone';
  $('qcomb').hidden=true;
  var rec=recordable(estadoTreino.quizScope);
  if(rec){var md=document.createElement('div');md.className='medal';md.textContent=MEDAL[res.medal].i;box.appendChild(md);}
  var h=document.createElement('div');h.className='qq';h.textContent='Você zerou '+scopeLabel()+'!';
  var sub=document.createElement('div');sub.className='qhint';
  sub.textContent=n+' '+unitWord(n)+' em '+modeName(quiz.mode)+' · '+r.e+' '+(r.e===1?'erro':'erros')+' · '+fmtTime(res.t)+' de jogo'+(rec?' · medalha de '+MEDAL[res.medal].n:'')+'.';
  box.appendChild(h);box.appendChild(sub);
  if(rec){
    var rl=document.createElement('div');rl.className='recline';
    var bits=[];
    if(res.first)bits.push('🎉 Primeira vez que você zera esta região neste tipo de pergunta!');
    else{
      if(res.newT)bits.push('🎉 Novo recorde de tempo! (antes: '+fmtTime(res.prevT)+')');
      if(res.newE&&res.prevE!=null&&r.e<res.prevE)bits.push('🎉 Novo recorde de menos erros! (antes: '+res.prevE+')');
      if(!bits.length){var R2=estadoPartida.RECS[runKey()]||{};bits.push('Seus recordes: '+fmtTime(R2.bestT)+' · '+R2.bestE+' '+(R2.bestE===1?'erro':'erros'));}
    }
    if(res.medal>1)bits.push(res.medal===2?'Para o ouro: zere sem nenhum erro.':'Para a prata: zere com até 3 erros.');
    /* quanto falta para dominar (3 acertos seguidos em cada um): cada partida sem erro soma 1 em todos */
    if(quiz.mode==='cap'){
      var stt=estadoTreino.QS.m.cap||{},arr2=QD(),menor=3;
      poolIdx().forEach(function(i2){var e2=stt[qcc(arr2[i2])];menor=Math.min(menor,e2?(e2.s||0):0);});
      var falta=3-menor;
      bits.push(falta<=0?('🏆 Você domina '+scopeLabel()+'!'):('Mais '+falta+' '+(falta===1?'partida':'partidas')+' sem errar e você domina '+scopeLabel()+'.'));
    }
    rl.textContent=bits.join(' ');box.appendChild(rl);
  }
  var row=document.createElement('div');row.className='qrow';
  var again=document.createElement('button');again.textContent='🔁 Jogar de novo';again.onclick=runRestart;
  var other=document.createElement('button');other.textContent='📍 Outra região';other.onclick=function(){$('qscopeb').click();};
  var sh=document.createElement('button');sh.className='qshare';sh.textContent='📤';sh.title='Compartilhar resultado';sh.setAttribute('aria-label','Compartilhar resultado');
  sh.onclick=function(){shareRun(n,r,res);};
  row.appendChild(again);row.appendChild(other);row.appendChild(sh);box.appendChild(row);
  /* próximas regiões: duas sugestões; sem toque, entra sozinho na primeira depois de 10 s */
  var prox=proximasRegioes();
  if(prox.length){
    var ph=document.createElement('div');ph.className='proxtit';ph.textContent='Próxima parada:';box.appendChild(ph);
    var pr=document.createElement('div');pr.className='proxreg';
    prox.forEach(function(ri,k){
      var b=document.createElement('button');b.className='proxbtn'+(k===0?' auto':'');
      b.style.setProperty('--cor',REG[ri].c);
      var t=document.createElement('b');t.textContent=REG[ri].n;b.appendChild(t);
      if(k===0){var c=document.createElement('small');c.className='proxcont';b.appendChild(c);}
      b.onclick=function(){pararContagem();emitir('treinar-regiao',{r:ri});};
      pr.appendChild(b);
    });
    box.appendChild(pr);
    iniciarContagem(prox[0],box);
  }
  var tip=document.createElement('div');tip.className='inote';tip.textContent='Cada tipo de pergunta tem a sua própria partida e a sua medalha.';
  box.appendChild(tip);
  body.appendChild(box);measureQ();
  /* qualquer outro toque na tela de fim cancela a contagem */
  Array.prototype.forEach.call(row.children,function(b){b.addEventListener('click',pararContagem);});
}
/* ordem das regiões, das mais fáceis para as mais difíceis (índices de REG em js/dados/paises.js) */
const ORDEM_REGIOES = [0, 1, 4, 5, 3, 6];
/** Duas próximas regiões ainda sem medalha neste tipo de pergunta (ou as seguintes na ordem, se todas tiverem). */
function proximasRegioes(){
  var sc=estadoTreino.quizScope,atual=sc.t==='reg'?sc.r:-1;
  var lista=ORDEM_REGIOES.filter(function(ri){return ri!==atual;});
  var sem=lista.filter(function(ri){var rec=estadoPartida.RECS[scopeKeyFor({t:'reg',r:ri},quiz.mode)];return !(rec&&rec.medal);});
  var pos=ORDEM_REGIOES.indexOf(atual);
  if(sem.length<2)sem=sem.concat(lista.filter(function(ri){return sem.indexOf(ri)<0;}));
  /* começa pela que vem depois da atual na ordem */
  sem.sort(function(a,b){var da=(ORDEM_REGIOES.indexOf(a)-pos+7)%7,db=(ORDEM_REGIOES.indexOf(b)-pos+7)%7;return da-db;});
  return sem.slice(0,2);
}
let contagemT = 0;
function pararContagem(){clearInterval(contagemT);contagemT=0;var c=document.querySelector('.proxcont');if(c)c.textContent='';var a=document.querySelector('.proxbtn.auto');if(a)a.classList.remove('auto');}
function iniciarContagem(ri,box){
  pararContagem();
  var s=10,el=box.querySelector('.proxcont'),a=box.querySelector('.proxbtn');if(a)a.classList.add('auto');
  function mostra(){if(el)el.textContent='começa em '+s+'s';}
  mostra();
  contagemT=setInterval(function(){
    if(!quiz.open||!document.body.contains(box)){pararContagem();return;}
    s--;mostra();
    if(s<=0){pararContagem();emitir('treinar-regiao',{r:ri});}
  },1000);
}
/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  ouvir('modo-estados-abriu',function(){if(quiz.open)quizClose();});
  $('qtimerb').onclick=function(){
    var opts=[0,30,60],idx=opts.indexOf(quiz.timerLen);
    quiz.timerLen=opts[(idx+1)%opts.length];lsSet('globo.quiz.timerlen',quiz.timerLen);
    if(quiz.timerLen){
      quiz.sessionLen=0;lsSet('globo.quiz.sesslen',0);updateSessionBtn();
      quiz.survivalMode=false;lsSet('globo.quiz.survival',false);updateSurvBtn();
    }
    updateTimerBtn();resetSession();startTimerTick();nextQ();
  };
  $('qsurvb').onclick=function(){
    quiz.survivalMode=!quiz.survivalMode;lsSet('globo.quiz.survival',quiz.survivalMode);
    if(quiz.survivalMode){
      quiz.sessionLen=0;lsSet('globo.quiz.sesslen',0);updateSessionBtn();
      quiz.timerLen=0;lsSet('globo.quiz.timerlen',0);updateTimerBtn();stopTimerTick();updateTimerDisplay();
    }
    updateSurvBtn();resetSession();nextQ();
  };
  $('qorderb').onclick=function(){
    quiz.order=quiz.order==='seq'?'random':'seq';
    lsSet('globo.quiz.order2',quiz.order);
    updateOrderBtn();quiz.last=-1;resetSession();nextQ();
  };
  $('qsessionb').onclick=function(){
    var opts=[0,10,20],i2=opts.indexOf(quiz.sessionLen);
    quiz.sessionLen=opts[(i2+1)%opts.length];
    lsSet('globo.quiz.sesslen',quiz.sessionLen);
    updateSessionBtn();resetSession();
  };
  $('qmodeb').onclick=function(){var o=$('qmodes').hidden;$('qmodes').hidden=!o;this.setAttribute('aria-expanded',o?'true':'false');};
  $('qbtn').onclick=function(){if(!quiz.open)quizOpen();};$('qclose').onclick=function(){if(quiz.open)quizClose();};
  confirmTap($('qrunreset'),'Toque de novo para recomeçar',runRestart);
  $('qnext').onclick=function(){if(roundDone())showRoundSummary(quiz.survivalMode?'survival':'count');else nextQ();};
  confirmTap($('qrestart'),'↺ Recomeçar?',function(){runRestart();setStatus('Partida recomeçada do zero. Medalhas e conquistas continuam.',3000);});
  confirmTap($('qreset'),'Toque de novo para zerar',function(){estadoTreino.QS=freshQS();lsSet('globo.quiz.v1',estadoTreino.QS);estadoPartida.RUNS={};saveRuns();estadoPartida.RECS={};saveRecs();zerarProgresso();quiz.ok=0;quiz.total=0;quiz.streak=0;renderScore();setStatus('Tudo zerado: treino, medalhas, nível e conquistas.',3000);});
}

export { buildModeButtons, iniciar, nextQ, pickStateNear, quizMapAnswer, quizMapAnswerBR, quizOpen, quizSetMode, runRestart };
