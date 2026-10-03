/**
 * @arquivo js/treino/estatisticas.js
 * Camada: Treino
 * Estatísticas e histórico por país e região.
 */

import { norm, REG } from '../dados/paises.js';
import { short } from '../dados/vizinhos.js';
import { avail } from '../visualizacao/globo.js';
import { setStatus } from '../visualizacao/fronteiras.js';
import { $ } from '../nucleo/utilitarios.js';
import { estadoTreino, quiz, scopeLabel } from './estado.js';
import { dflag, inScopeActive, mstats, qcc, QD, unitWord } from './dominio.js';
import { BRREG } from '../brasil/dados-estados.js';

/* ---------- estatísticas por região ---------- */
function modeName(m){
  var w=estadoTreino.quizDomain==='br';
  return {cap:w?'Estado → Capital':'País → Capital',pais:w?'Capital → Estado':'Capital → País',flag:'Bandeira → País',neighbor:w?'Estado → Vizinho':'País → Vizinho',code:w?'Estado → Sigla':'País → Sigla',map:'Achar no mapa'}[m]||m;
}
function computeRegionStats(){
  var st=mstats(),arr=QD(),names=estadoTreino.quizDomain==='br'?BRREG.map(function(r){return r.n;}):REG.map(function(r){return r.n;}),groups={};
  names.forEach(function(n,i){groups[i]={n:n,r:0,w:0};});
  arr.forEach(function(o){
    var e=st[qcc(o)];if(!e)return;
    var g=groups[o.r];if(!g)return;
    g.r+=e.r;g.w+=e.w;
  });
  return Object.keys(groups).map(function(k){return groups[k];})
    .filter(function(g){return g.r+g.w>0;})
    .map(function(g){return {n:g.n,acc:Math.round(100*g.r/(g.r+g.w)),tot:g.r+g.w};})
    .sort(function(a,b){return a.acc-b.acc;});
}
let histTab = 'c';
const histView = {mode:null,sort:'w',scopeOnly:false,showAll:false,q:''};
function openStats(){
  $('htabC').setAttribute('aria-pressed',histTab==='c'?'true':'false');
  $('htabR').setAttribute('aria-pressed',histTab==='r'?'true':'false');
  if(histTab==='c')openHistCountries();else openRegionStats();
}
function openRegionStats(){
  var box=$('statsbody');box.innerHTML='';
  var t=document.createElement('div');t.className='inote';t.style.margin='0 0 10px';
  t.textContent='Treino: '+modeName(quiz.mode)+(estadoTreino.quizDomain==='br'?' · Brasil':'')+'.';
  box.appendChild(t);
  var list=computeRegionStats();
  if(!list.length){
    var e=document.createElement('div');e.className='inote';e.textContent='Ainda não há respostas registradas neste tipo de treino.';box.appendChild(e);
  }else list.forEach(function(g){
    var row=document.createElement('div');row.className='statrow';
    var lab=document.createElement('div');lab.className='statlab';lab.textContent=g.n+' — '+g.acc+'% ('+g.tot+' respostas)';
    var wrap=document.createElement('div');wrap.className='statbarwrap';
    var bar=document.createElement('div');bar.className='statbar';bar.style.width=g.acc+'%';
    bar.style.background=g.acc<50?'#d64545':(g.acc<80?'#f6c800':'#1f9d55');
    wrap.appendChild(bar);
    row.appendChild(lab);row.appendChild(wrap);
    box.appendChild(row);
  });
}
/* histórico de todo o tempo por país (ou estado): acertos e erros, até alguém zerar o progresso */
function histModes(){return estadoTreino.quizDomain==='br'?['cap','pais','neighbor','code','map']:['cap','pais','flag','neighbor','code','map'];}
function openHistCountries(){
  var box=$('statsbody');box.innerHTML='';
  if(!histView.mode||(histView.mode!=='all'&&histModes().indexOf(histView.mode)<0))histView.mode=quiz.mode;
  var ctl=document.createElement('div');ctl.className='hctl';
  var sm=document.createElement('select');sm.id='histmode';sm.setAttribute('aria-label','Tipo de pergunta');
  [['all','Todos os tipos de pergunta']].concat(histModes().map(function(m){return [m,modeName(m)];})).forEach(function(o){
    var op=document.createElement('option');op.value=o[0];op.textContent=o[1];sm.appendChild(op);});
  sm.value=histView.mode;sm.onchange=function(){histView.mode=this.value;renderHist();};
  var so=document.createElement('select');so.id='histsort';so.setAttribute('aria-label','Ordenar');
  [['w','Mais erros primeiro'],['r','Mais acertos primeiro'],['p','Pior aproveitamento primeiro'],['n','Nome (A–Z)']].forEach(function(o){
    var op=document.createElement('option');op.value=o[0];op.textContent=o[1];so.appendChild(op);});
  so.value=histView.sort;so.onchange=function(){histView.sort=this.value;renderHist();};
  var qi=document.createElement('input');qi.type='search';qi.id='histq';qi.placeholder=estadoTreino.quizDomain==='br'?'Buscar estado':'Buscar país';qi.value=histView.q;
  qi.oninput=function(){histView.q=this.value;renderHist();};
  ctl.appendChild(sm);ctl.appendChild(so);ctl.appendChild(qi);
  function chk(id,label,key){
    var l=document.createElement('label');l.className='toglab';
    var c=document.createElement('input');c.type='checkbox';c.id=id;c.checked=histView[key];
    c.onchange=function(){histView[key]=this.checked;renderHist();};
    var sp=document.createElement('span');sp.textContent=label;l.appendChild(c);l.appendChild(sp);ctl.appendChild(l);
  }
  if(estadoTreino.quizScope.t!=='world'&&estadoTreino.quizScope.t!=='br')chk('histscope','Só '+scopeLabel(),'scopeOnly');
  chk('histall','Mostrar também os que você ainda não respondeu','showAll');
  box.appendChild(ctl);
  var sum=document.createElement('div');sum.id='histsum';sum.className='hsum';box.appendChild(sum);
  var list=document.createElement('div');list.id='histlist';box.appendChild(list);
  renderHist();
}
function renderHist(){
  var arr=QD(),modes=histView.mode==='all'?histModes():[histView.mode],qn=norm((histView.q||'').trim()),rows=[],tr=0,tw=0,seen=0;
  arr.forEach(function(o){
    if(estadoTreino.quizDomain!=='br'&&!avail(o))return;
    if(histView.scopeOnly&&!inScopeActive(o))return;
    if(qn&&norm(o.name).indexOf(qn)<0)return;
    var r=0,w=0,key=qcc(o);
    modes.forEach(function(m){var e=(estadoTreino.QS.m[m]||{})[key];if(e){r+=e.r||0;w+=e.w||0;}});
    if(r+w)seen++;
    tr+=r;tw+=w;
    if(!histView.showAll&&!(r+w))return;
    rows.push({o:o,r:r,w:w,p:(r+w)?r/(r+w):-1});
  });
  var by={w:function(a,b){return b.w-a.w||a.r-b.r;},r:function(a,b){return b.r-a.r||a.w-b.w;},p:function(a,b){return (a.p<0?2:a.p)-(b.p<0?2:b.p)||b.w-a.w;},n:function(a,b){return a.o.name.localeCompare(b.o.name,'pt');}}[histView.sort];
  rows.sort(by);
  $('histsum').textContent='✔ '+tr+' acertos · ✖ '+tw+' erros · '+seen+' de '+arr.filter(function(o){return (estadoTreino.quizDomain==='br'||avail(o))&&(!histView.scopeOnly||inScopeActive(o));}).length+' '+unitWord(2)+' já respondidos'+(tr+tw?' · '+Math.round(100*tr/(tr+tw))+'% de acerto':'')+'.';
  var list=$('histlist');list.innerHTML='';
  if(!rows.length){var e=document.createElement('div');e.className='inote';e.textContent=tr+tw?'Nada encontrado.':'Ainda não há respostas registradas aqui.';list.appendChild(e);return;}
  rows.forEach(function(x){
    var row=document.createElement('div');row.className='hrow';
    var nm=document.createElement('div');nm.className='hname';
    nm.textContent=(estadoTreino.quizDomain==='br'?x.o.sigla+' · ':dflag(x.o)+' ')+(estadoTreino.quizDomain==='br'?x.o.name:short(x.o));
    var sc=document.createElement('div');sc.className='hscore';
    var ok=document.createElement('b');ok.className='hok';ok.textContent='✔ '+x.r;
    var bad=document.createElement('b');bad.className='hbad';bad.textContent='✖ '+x.w;
    sc.appendChild(ok);sc.appendChild(bad);
    var bar=document.createElement('div');bar.className='hbar';
    if(x.p>=0){var f=document.createElement('i');f.style.width=Math.round(x.p*100)+'%';f.style.background=x.p<.5?'#d64545':(x.p<.8?'#f6c800':'#1f9d55');bar.appendChild(f);}
    row.appendChild(nm);row.appendChild(sc);row.appendChild(bar);list.appendChild(row);
  });
}
function openHistory(){openStats();$('statsheet').style.display='block';}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  $('htabC').onclick=function(){histTab='c';openStats();};
  $('htabR').onclick=function(){histTab='r';openStats();};
  $('shareclose').onclick=function(){$('sharesheet').style.display='none';};
  $('sharecopy').onclick=function(){
    var ta=$('sharetxt');ta.focus();ta.select();
    var done=function(){setStatus('Texto copiado.',2000);};
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(ta.value).then(done,function(){try{document.execCommand('copy');done();}catch(e){}});
    else{try{document.execCommand('copy');done();}catch(e){}}
  };
  $('statsclose').onclick=function(){$('statsheet').style.display='none';};
}

export { iniciar, modeName, openHistory };
