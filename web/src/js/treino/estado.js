/**
 * @arquivo js/treino/estado.js
 * Camada: Treino
 * Estado do treino (QS, escopo, foco, sessão) carregado do armazenamento.
 */
/* ---------- treino ---------- */
function freshQS(){return {best:0,m:{cap:{},pais:{},flag:{},map:{}},q:{cap:0,pais:0,flag:0,map:0}};}
var QS=(function(){
  var q=lsGet('globo.quiz.v1',null)||{};
  if(!q.m){
    q.m={cap:{},pais:{},flag:{},map:{}};
    if(q.stats){for(var k in q.stats){var e=q.stats[k];q.m.cap[k]={r:e.r||0,w:e.w||0,s:e.s||0,l:0};}}
  }
  if(!q.q)q.q={cap:0,pais:0,flag:0,map:0};
  delete q.stats;if(!q.best)q.best=0;
  return q;
})();
var quizScope=(function(){var v=lsGet('globo.quiz.scope',{t:'world'});
  if(!v||!v.t)return {t:'world'};
  if((v.t==='reg'||v.t==='sub')&&!REG[v.r])return {t:'world'};
  if(v.t==='multi'){if(!Array.isArray(v.items))return {t:'world'};v.items=v.items.filter(function(it){return it&&REG[it.r];});if(!v.items.length)return {t:'world'};}
  if(v.t==='brreg'&&(v.r<0||v.r>4))return {t:'world'};
  if(v.t==='review'&&!Array.isArray(v.cc))return {t:'world'};
  return v;
})();
var quizScopePrev=null;
var quizFocus=lsGet('globo.quiz.focus','mix');
if(quizFocus!=='new'&&quizFocus!=='wrong')quizFocus='mix';
var quizDomain='world';
var quiz={open:false,mode:'cap',type:'choice',cur:-1,answered:false,ok:0,total:0,streak:0,last:-1,hinted:false,
  sessionLen:lsGet('globo.quiz.sesslen',0),sessionAsked:0,sessionLog:[],
  order:lsGet('globo.quiz.order2','random'),
  timerLen:lsGet('globo.quiz.timerlen',0),timerStart:0,timerInt:null,
  survivalMode:lsGet('globo.quiz.survival',false),lastOk:null,nbAnswer:-1};
var qMap=false,qFlash=null,qBadge=null,qPanelH=0;
function measureQ(){setTimeout(function(){qPanelH=quiz.open?$('quiz').querySelector('.qpanel').offsetHeight+10:0;},80);}
function qHide(){return quiz.open&&quizDomain==='world'&&!(quiz.mode==='map'&&!feats);}
var ACC_EXTRA={US:['eua','usa','estados unidos da america'],GB:['uk','inglaterra','gra bretanha'],CD:['rd congo','republica democratica do congo','congo kinshasa'],CG:['congo','congo brazzaville'],CZ:['republica tcheca','tchequia'],NR:['yaren'],SZ:['suazilandia'],MK:['macedonia'],CI:['costa do marfim'],MM:['birmania'],BY:['bielorussia','belarus'],TR:['turquia'],VA:['vaticano']};
function accList(str,cc,isCap){
  var out=[];
  String(str).split(/ · | \/ /).forEach(function(seg){
    var m=seg.match(/^(.*?)\s*\((.*)\)\s*$/);
    if(m){out.push(m[1]);if(!/capital|sede|proclamada|de fato|administrativa|legislativa|judici|constitucional|Estados Federados|RASD/i.test(m[2]))out.push(m[2]);}
    else out.push(seg);
  });
  if(ACC_EXTRA[cc]&&(!isCap||cc==='NR'))out=out.concat(ACC_EXTRA[cc]);
  return out.map(function(s){return norm(s).trim();}).filter(Boolean);
}
function lev(a,b){
  var m=a.length,n=b.length,d=[],i,j;
  for(i=0;i<=m;i++){d[i]=[i];}for(j=1;j<=n;j++)d[0][j]=j;
  for(i=1;i<=m;i++)for(j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  return d[m][n];
}
function matches(user,list){
  var n=norm(user).replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  if(!n)return false;
  for(var i=0;i<list.length;i++){
    var a=list[i].replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
    if(n===a)return true;
    if(a.length>=6&&lev(n,a)<=1)return true;
  }
  return false;
}
var AMERICAS_R=[0,1,2];
function inScope(d){
  var sc=quizScope;
  if(sc.t==='world')return true;
  if(sc.t==='filter')return !!on[d.i];
  if(sc.t==='review')return (sc.cc||[]).indexOf(d.cc)>=0;
  if(sc.t==='super')return AMERICAS_R.indexOf(d.r)>=0;
  if(sc.t==='multi')return sc.items.some(function(it){return it.s?(d.r===it.r&&d.sub===it.s):d.r===it.r;});
  if(sc.t==='reg')return d.r===sc.r;
  return d.r===sc.r&&d.sub===sc.s;
}
function scopeLabel(){
  var sc=quizScope;
  if(sc.t==='world')return 'Mundo';
  if(sc.t==='review')return 'Revisão dos erros';
  if(sc.t==='filter')return 'Filtros atuais';
  if(sc.t==='super')return 'Américas';
  if(sc.t==='br')return 'Brasil (todos os estados)';
  if(sc.t==='brreg')return BRREG[sc.r].n+' (Brasil)';
  if(sc.t==='multi'){
    var names=sc.items.map(function(it){return it.s||REG[it.r].n;});
    return names.length<=2?names.join(' + '):names.length+' regiões combinadas';
  }
  if(sc.t==='reg')return REG[sc.r].n;
  return sc.s;
}
