/**
 * @arquivo js/treino/partida.js
 * Camada: Treino
 * Partida por região: baralho embaralhado, medalhas, recordes e escolha da próxima pergunta.
 */

import { BRS } from '../dados/estados-brasil.js';
import { D, REG } from '../dados/paises.js';
import { NB, short } from '../dados/vizinhos.js';
import { tocar } from '../nucleo/som.js';
import { $, lsGet, lsSet } from '../nucleo/utilitarios.js';
import { gapOf, mstats, poolIdx, qcapD, qcc, QD, qflag, TIER_P, tierOf, unitWord } from './dominio.js';
import { estadoTreino, measureQ, quiz, scopeLabel } from './estado.js';
import { fillQStat, modeName } from './estatisticas.js';
import { addXP, celebrate, recordProgress, updateProgUI, xpAtual } from './progressao.js';
import { flyTo } from '../visualizacao/animacao.js';
import { showCountry, zoomFor } from '../visualizacao/enquadramento.js';
import { estadoBrasil, stateView } from '../visualizacao/estados.js';
import { ganchos } from '../visualizacao/ganchos.js';
import { proj2D, R2now } from '../visualizacao/mapa-2d.js';
import { ctx, estadoCamera, FONT, rot, W } from '../visualizacao/tela.js';

/** Estado compartilhado com outros módulos (leitura e escrita por estadoPartida.nome). */
const estadoPartida = {
  RUNS: undefined,
  RECS: undefined,
};

function runKey(){return estadoTreino.quizDomain+'|'+JSON.stringify(estadoTreino.quizScope)+'|'+quiz.mode;}
function curRun(){var k=runKey();return estadoPartida.RUNS[k]||(estadoPartida.RUNS[k]={d:{},e:0,t0:Date.now(),fin:0,at:0,la:Date.now()});}
function saveRecs(){lsSet('globo.recs.v1',estadoPartida.RECS);}
const MEDAL = {1:{i:'🥇',n:'ouro'},2:{i:'🥈',n:'prata'},3:{i:'🥉',n:'bronze'}};
function medalFor(e){return e===0?1:(e<=3?2:3);}
function scopeKeyFor(sc,mode){return ((sc.t==='br'||sc.t==='brreg')?'br':'world')+'|'+JSON.stringify(sc)+'|'+mode;}
function recordable(sc){return sc.t!=='filter'&&sc.t!=='review';}
function recFinish(r){
  var k=runKey(),old=estadoPartida.RECS[k]||{},m=medalFor(r.e),t=r.at||((r.fin||Date.now())-r.t0);
  var res={medal:m,t:t,first:!old.n,newMedal:!old.medal||m<old.medal,newT:old.bestT==null||Math.round(t/1000)<Math.round(old.bestT/1000),newE:old.bestE==null||r.e<old.bestE,prevT:old.bestT,prevE:old.bestE};
  if(recordable(estadoTreino.quizScope)){
    estadoPartida.RECS[k]={medal:Math.min(m,old.medal||9),bestT:Math.min(t,old.bestT==null?t:old.bestT),bestE:Math.min(r.e,old.bestE==null?r.e:old.bestE),n:(old.n||0)+1};
    saveRecs();
  }
  return res;
}
function fmtTime(ms){var s2=Math.max(1,Math.round(ms/1000)),m=Math.floor(s2/60);return m?(m+' min '+(s2%60)+' s'):(s2+' s');}
function saveRuns(){lsSet('globo.runs.v1',estadoPartida.RUNS);}
function runPool(){var arr=QD(),r=curRun();return poolIdx().filter(function(i){return !r.d[qcc(arr[i])];});}
function runRecord(i,ok){
  var r=curRun(),cc=qcc(QD()[i]),now=Date.now();
  /* tempo de jogo: soma o tempo entre respostas, com pausas longas limitadas a 1 minuto */
  r.at=(r.at||0)+Math.min(60000,Math.max(0,now-(r.la||now)));r.la=now;
  if(ok)r.d[cc]=1;else r.e++;
  /* tira a pergunta do baralho; se errou, ela volta mais adiante, numa posição sorteada */
  if(r.deck){var di=r.deck.indexOf(cc);if(di>=0)r.deck.splice(di,1);
    if(!ok){var lo=Math.min(3,r.deck.length);r.deck.splice(lo+rndInt(r.deck.length-lo+1),0,cc);}}
  if(ok&&!r.fin&&poolIdx().length&&!runPool().length){
    r.fin=now;
    r.res=recFinish(r);
    celebrate('🏁 Você zerou '+scopeLabel()+'!');tocar('conquista');addXP(50);
    if(recordable(estadoTreino.quizScope)&&r.res.newMedal)celebrate(MEDAL[r.res.medal].i+' Medalha de '+MEDAL[r.res.medal].n+'!');
  }
  saveRuns();
}
/* imagem do resultado para compartilhar */
function shareRun(n,r,res){
  var W2=1080,cv2=document.createElement('canvas');cv2.width=W2;cv2.height=W2;
  var c=cv2.getContext('2d'),g=c.createLinearGradient(0,0,W2,W2);
  g.addColorStop(0,'#2a2f8f');g.addColorStop(.55,'#141a52');g.addColorStop(1,'#05071a');
  c.fillStyle=g;c.fillRect(0,0,W2,W2);
  var gl2=c.createRadialGradient(W2*.78,W2*.2,10,W2*.78,W2*.2,420);gl2.addColorStop(0,'rgba(181,124,255,.35)');gl2.addColorStop(1,'rgba(181,124,255,0)');
  c.fillStyle=gl2;c.fillRect(0,0,W2,W2);
  var EM="'Apple Color Emoji','Noto Color Emoji','Segoe UI Emoji',sans-serif";
  c.textAlign='center';c.textBaseline='middle';
  var rec=recordable(estadoTreino.quizScope);
  c.font='220px '+EM;c.fillText(rec?MEDAL[res.medal].i:'🏆',W2/2,250);
  c.fillStyle='#ffffff';c.font='800 66px '+FONT;
  var title='Zerei '+scopeLabel()+'!',fs=66;
  while(c.measureText(title).width>W2-120&&fs>34){fs-=2;c.font='800 '+fs+'px '+FONT;}
  c.fillText(title,W2/2,480);
  c.fillStyle='#dfe7ff';c.font='600 40px '+FONT;
  c.fillText(n+' '+unitWord(n)+' · '+modeName(quiz.mode),W2/2,570);
  c.fillText(r.e+' '+(r.e===1?'erro':'erros')+' · '+fmtTime(res.t)+' de jogo',W2/2,635);
  c.font='800 92px '+FONT;var gx=c.createLinearGradient(W2/2-220,0,W2/2+220,0);
  gx.addColorStop(0,'#ffd166');gx.addColorStop(.55,'#ff9f43');gx.addColorStop(1,'#ff4f8b');
  c.fillStyle='#ffffff';c.textAlign='right';c.fillText('geo',W2/2-8,820);
  c.fillStyle=gx;c.textAlign='left';c.fillText('Total',W2/2-8,820);
  c.textAlign='center';c.fillStyle='#9fb3ff';c.font='500 34px '+FONT;
  c.fillText('github.com/alessandrocdrx/GeoTotal',W2/2,920);
  var text='🏆 Zerei '+scopeLabel()+' no geoTotal: '+n+' '+unitWord(n)+' ('+modeName(quiz.mode)+'), '+r.e+' '+(r.e===1?'erro':'erros')+', '+fmtTime(res.t)+'. https://github.com/alessandrocdrx/GeoTotal';
  var url=cv2.toDataURL('image/png');
  if(window.AndroidBridge&&AndroidBridge.shareImage){try{AndroidBridge.shareImage(url.split(',')[1],text);return;}catch(e){}}
  $('shareimg').src=url;$('sharetxt').value=text;$('sharesheet').style.display='block';
}
function rndInt(n){
  if(n<=1)return 0;
  try{var u=new Uint32Array(1);crypto.getRandomValues(u);return u[0]%n;}catch(e){return Math.floor(Math.random()*n);}
}
function shuffled(a){a=a.slice();for(var k=a.length-1;k>0;k--){var z=rndInt(k+1),t=a[k];a[k]=a[z];a[z]=t;}return a;}
function pickQ(){
  /* desafio do dia: a fila do dia, na ordem, igual para todo mundo */
  if(estadoTreino.desafio){var fd=estadoTreino.desafio.fila;return fd[Math.min(quiz.sessionAsked,fd.length-1)];}
  var pool=runPool();if(!pool.length)return -1;
  if(quiz.order==='seq')return pickQFrom(pool);
  var arr=QD(),cand=pool;
  if(estadoTreino.quizFocus!=='mix'){
    var f=pool.filter(function(i){var t=tierOf(i);return estadoTreino.quizFocus==='new'?t==='new':t==='wrong';});
    if(f.length){if(f.length>1)f=f.filter(function(i){return i!==quiz.last;});return f[rndInt(f.length)];}
  }
  /* baralho da partida: embaralhado de novo a cada partida; cada país sai uma vez e os errados voltam depois */
  var r=curRun(),byCc={};cand.forEach(function(i){byCc[qcc(arr[i])]=i;});
  var deck=(r.deck||[]).filter(function(c){return byCc[c]!==undefined;}),inDeck={};
  deck.forEach(function(c){inDeck[c]=1;});
  var miss=shuffled(Object.keys(byCc).filter(function(c){return !inDeck[c];}));
  if(!deck.length)deck=miss;else miss.forEach(function(c){deck.splice(rndInt(deck.length+1),0,c);});
  if(deck.length>1&&quiz.last>=0&&deck[0]===qcc(arr[quiz.last])){var z=1+rndInt(deck.length-1),t=deck[0];deck[0]=deck[z];deck[z]=t;}
  r.deck=deck;saveRuns();
  return byCc[deck[0]];
}
function pickQFrom(pool){
  var arr=QD();
  if(quiz.order==='seq'){
    if(quiz.last<0)return pool[0];
    var pos=pool.indexOf(quiz.last);
    return pool[(pos<0?0:pos+1)%pool.length];
  }
  var st=mstats(),qn=estadoTreino.QS.q[quiz.mode]||0,T={'new':[],'wrong':[],'ok':[]},rest=[];
  pool.forEach(function(i){
    if(i===quiz.last)return;
    var e=st[qcc(arr[i])];
    if(!e){T['new'].push(i);return;}
    rest.push(i);
    if(qn-(e.l||0)>=gapOf(e))T[e.s===0?'wrong':'ok'].push(i);
  });
  if(estadoTreino.quizFocus==='new'){return T['new'].length?T['new'][Math.floor(Math.random()*T['new'].length)]:-1;}
  if(estadoTreino.quizFocus==='wrong'){
    var wl=T['wrong'];
    if(!wl.length){wl=[];pool.forEach(function(i){if(i!==quiz.last&&tierOf(i)==='wrong')wl.push(i);});}
    if(!wl.length)return (quiz.last>=0&&pool.indexOf(quiz.last)>=0&&tierOf(quiz.last)==='wrong')?quiz.last:-1;
    var ww=wl.map(function(i){return 1+st[qcc(arr[i])].w;}),tw=0,kk;ww.forEach(function(w){tw+=w;});
    var rw=Math.random()*tw;for(kk=0;kk<wl.length;kk++){rw-=ww[kk];if(rw<=0)return wl[kk];}
    return wl[wl.length-1];
  }
  var names=['new','wrong','ok'].filter(function(t){return T[t].length;});
  if(!names.length){
    var cand=(rest.length?rest:pool).slice().sort(function(a,b){var ea=st[qcc(arr[a])],eb=st[qcc(arr[b])];return ((ea&&ea.l)||0)-((eb&&eb.l)||0);}).slice(0,3);
    return cand[Math.floor(Math.random()*cand.length)];
  }
  var tot=0;names.forEach(function(t){tot+=TIER_P[t];});
  var r=Math.random()*tot,tier=names[names.length-1],k;
  for(k=0;k<names.length;k++){r-=TIER_P[names[k]];if(r<=0){tier=names[k];break;}}
  var list=T[tier];
  if(tier==='new')return list[Math.floor(Math.random()*list.length)];
  var ws=list.map(function(i){var e=st[qcc(arr[i])];return tier==='wrong'?1+e.w:1/(1+e.s);}),t2=0;
  ws.forEach(function(w){t2+=w;});
  var r2=Math.random()*t2;
  for(k=0;k<list.length;k++){r2-=ws[k];if(r2<=0)return list[k];}
  return list[list.length-1];
}
function optLabel(k){
  var o=QD()[k];
  if(quiz.mode==='cap')return qcapD(o);
  if(quiz.mode==='code')return estadoTreino.quizDomain==='br'?o.sigla:o.cc;
  return qflag(o)+' '+short(o);
}
function makeNeighborOptions(qIdx,ansIdx){
  var arr=QD(),nbSet={};(estadoTreino.quizDomain==='br'?arr[qIdx].nb:NB[qIdx]).forEach(function(k){nbSet[k]=1;});
  var label=optLabel(ansIdx),labels={},out=[ansIdx];labels[label]=1;
  var pool=poolIdx().filter(function(k){return k!==qIdx&&!nbSet[k];});
  var same=pool.filter(function(k){return arr[k].r===arr[qIdx].r;}),guard=0;
  while(out.length<4&&guard++<400&&pool.length){
    var src=(Math.random()<.65&&same.length)?same:pool;
    var c=src[Math.floor(Math.random()*src.length)],l=optLabel(c);
    if(labels[l])continue;labels[l]=1;out.push(c);
  }
  var guard2=0;
  while(out.length<4&&guard2++<400){
    var c2=Math.floor(Math.random()*arr.length),l2=optLabel(c2);
    if(c2===qIdx||nbSet[c2]||labels[l2]||arr[c2].uni)continue;labels[l2]=1;out.push(c2);
  }
  for(var q2=out.length-1;q2>0;q2--){var z=Math.floor(Math.random()*(q2+1)),t=out[q2];out[q2]=out[z];out[z]=t;}
  return out;
}
function makeOptions(i){
  var arr=QD(),label=optLabel(i),labels={},out=[i];labels[label]=1;
  var sc=poolIdx().filter(function(k){return k!==i;}),wd=[],k,guard;
  for(k=0;k<arr.length;k++)if(k!==i&&!arr[k].uni)wd.push(k);
  /* alternativas plausíveis: quase sempre da mesma região, e sem lugares disputados (Tskhinvali,
     Sukhumi...) a não ser que a resposta certa também seja um deles */
  if(!arr[i].dis){sc=sc.filter(function(x){return !arr[x].dis;});wd=wd.filter(function(x){return !arr[x].dis;});}
  var same=sc.filter(function(x){return arr[x].r===arr[i].r;});
  guard=0;
  while(out.length<4&&guard++<400&&sc.length){
    var src=(Math.random()<.85&&same.length)?same:sc;
    var c=src[Math.floor(Math.random()*src.length)],l=optLabel(c);
    if(labels[l])continue;labels[l]=1;out.push(c);
  }
  guard=0;
  while(out.length<4&&guard++<400&&wd.length){
    var c2=wd[Math.floor(Math.random()*wd.length)],l2=optLabel(c2);
    if(labels[l2])continue;labels[l2]=1;out.push(c2);
  }
  for(var q=out.length-1;q>0;q--){var z=Math.floor(Math.random()*(q+1)),t=out[q];out[q]=out[z];out[z]=t;}
  return out;
}
function renderScore(){
  updateProgUI();
  var n=poolIdx().length,r=curRun(),done=n?n-runPool().length:0;
  $('qruntxt').textContent=estadoTreino.desafio?('🗓️ Desafio do dia · '+Math.min(quiz.sessionAsked,10)+'/10'):n?(done+' de '+n+(r.e?' · '+r.e+' '+(r.e===1?'erro':'erros'):'')):'';
  $('qrunbar').style.display=n?'block':'none';
  $('qrunfill').style.width=(n?Math.round(100*done/n):0)+'%';
}
function record(i,ok,hinted){
  var o=QD()[i],cc=qcc(o),stt=mstats(),s=stt[cc]||(stt[cc]={r:0,w:0,s:0,l:0});
  if(ok&&!hinted){s.r++;s.s++;quiz.ok++;quiz.streak++;if(quiz.streak>estadoTreino.QS.best)estadoTreino.QS.best=quiz.streak;}
  else if(ok&&hinted){s.r++;s.s=0;quiz.ok++;}
  else{s.w++;s.s=0;quiz.streak=0;}
  s.l=estadoTreino.QS.q[quiz.mode]||0;
  quiz.total++;lsSet('globo.quiz.v1',estadoTreino.QS);renderScore();
}
function fbText(d,ok,extra){
  var fl=qflag(d),nm=short(d),cp=qcapD(d);
  var base=(ok?['✔ Isso! ','✔ Boa! ','✔ Mandou bem! ','✔ Certo! '][Math.floor(Math.random()*4)]:'✖ Ops! ');
  /* quase-acerto: errar pelo vizinho dá vontade de tentar de novo (e ensina a vizinhança) */
  var esc=quiz.escolhido;
  if(!ok&&esc>=0&&esc!==quiz.cur&&estadoTreino.quizDomain==='world'){
    var arr=QD(),ce=arr[esc];
    if(NB[quiz.cur]&&NB[quiz.cur].indexOf(esc)>=0)base='🤏 Quase! '+qflag(ce)+' '+short(ce)+' é vizinho. ';
    else if(ce&&ce.r===d.r)base='🤏 Quase! Mesma região. ';
  }
  var ans;
  if(quiz.mode==='neighbor'){
    var an=QD()[quiz.nbAnswer];
    ans=fl+' '+nm+' faz fronteira com '+qflag(an)+' '+short(an)+'.';
  }else if(quiz.mode==='code'){
    ans='A sigla de '+fl+' '+nm+' é '+(estadoTreino.quizDomain==='br'?d.sigla:d.cc)+'.';
  }else{
    ans=quiz.mode==='cap'?('A capital de '+fl+' '+nm+' é '+cp+'.'):(quiz.mode==='map'?(fl+' '+nm+' fica aqui'+(d.uni?'.':' (capital: '+cp+').')):('É '+fl+' '+nm+' (capital: '+cp+').'));
  }
  return base+ans+(quiz.hinted?' (com dica)':'')+(extra?' '+extra:'');
}
function showTarget(i){
  if(estadoTreino.quizDomain==='br'){estadoBrasil.statesMode=true;estadoBrasil.selSt=BRS[i];var v=stateView(BRS[i]);flyTo(v.lat,v.lng,zoomFor(v.r,3.4));}
  else{estadoTreino.qBadge=i;showCountry(i);}
}
function sessionRecord(ok,ganho,rapido){
  var s=quiz;s.sessionLog.push({label:qflag(QD()[s.cur])+' '+short(QD()[s.cur]),ok:ok,xp:ganho||0,rapido:!!rapido,combo:s.streak});
}
/** Contador de acertos seguidos, sempre à vista no placar a partir do 2º. */
function mostrarCombo(){
  var el=$('qcomb');if(!el)return;
  if(quiz.streak>=2){el.hidden=false;el.textContent='🔥 x'+quiz.streak;el.classList.remove('pulsa');void el.offsetWidth;el.classList.add('pulsa');}
  else el.hidden=true;
}
/** Uma curiosidade curta sobre o país, com os dados que o app já tem. */
function curiosidade(d){
  var x=d&&d.info;if(!x)return '';
  var nm=short(d),op=[];
  if(x.pop>=1000)op.push(nm+' tem cerca de '+(x.pop>=1e6?(x.pop/1e6).toFixed(1).replace('.',',')+' bilhão de':(x.pop>=10000?Math.round(x.pop/1000):(x.pop/1000).toFixed(1).replace('.',','))+' milhões de')+' habitantes.');
  else if(x.pop>0)op.push(nm+' tem só cerca de '+(x.pop*1000).toLocaleString('pt-BR')+' habitantes.');
  if(x.area){var vezes=8515767/x.area;op.push(vezes>=2?('Cabem uns '+Math.round(vezes).toLocaleString('pt-BR')+' '+nm+' dentro do Brasil.'):(nm+' tem '+x.area.toLocaleString('pt-BR')+' km².'));}
  if(x.lang)op.push('Em '+nm+' se fala '+x.lang.charAt(0).toLowerCase()+x.lang.slice(1)+'.');
  if(x.cur)op.push('A moeda de '+nm+' é '+x.cur.replace(/\s*\(.*\)$/,'').toLowerCase()+'.');
  return op[Math.floor(Math.random()*op.length)]||'';
}
/** Confete leve saindo da resposta certa (só enfeite; some sozinho, respeita "reduzir movimento"). */
function comemorarAcerto(){
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var b=document.querySelector('#qbody .okb');if(!b)return;
  var cores=['#ffd166','#06d6a0','#4cc9f0','#f72585','#fb8500'],n=quiz.streak>=3?16:9;
  for(var k=0;k<n;k++){
    var p=document.createElement('i');p.className='confete';
    var a=Math.random()*Math.PI*2,dist=40+Math.random()*50;
    p.style.setProperty('--dx',Math.round(Math.cos(a)*dist)+'px');p.style.setProperty('--dy',Math.round(Math.sin(a)*dist-30)+'px');
    p.style.background=cores[k%cores.length];
    b.appendChild(p);
    setTimeout(function(el){return function(){el.remove();};}(p),900);
  }
}
function finishQ(ok,extra){
  quiz.answered=true;quiz.lastOk=ok;var xp0=xpAtual();
  /* rápido = acertou sem dica em menos de 4 segundos */
  var rapido=ok&&!quiz.hinted&&quiz.tShown&&(performance.now()-quiz.tShown)<4000;
  record(quiz.cur,ok,quiz.hinted);runRecord(quiz.cur,ok);renderScore();
  tocar(ok?'acerto':'erro',quiz.streak);if(ok)comemorarAcerto();
  recordProgress(ok,quiz.hinted);
  if(rapido)addXP(3);
  if(ok&&quiz.streak>=2)addXP(Math.min(quiz.streak-1,5));
  if(estadoTreino.QS.q&&!lsGet('globo.dicaLivre',false)&&(quiz.total||0)>=4){lsSet('globo.dicaLivre',true);setTimeout(function(){celebrate('👆 Dica: toque em Livre, lá em cima, para explorar o globo à vontade.');},1300);}
  showTarget(quiz.cur);
  if(estadoTreino.quizDomain==='world'){estadoTreino.qFlash={i:quiz.cur,kind:ok?'ok':'reveal',t:performance.now()};}
  var fb=$('qfb');fb.textContent=fbText(QD()[quiz.cur],ok,extra);fb.className=ok?'ok':'bad';
  /* curiosidade de vez em quando (1 em 5 acertos): aprender algo novo é a recompensa */
  var cur=ok&&quiz.mode==='cap'&&Math.random()<0.2?curiosidade(QD()[quiz.cur]):'';
  /* surpresa de vez em quando (1 em 10 acertos): só XP, nunca dinheiro nem compra */
  if(ok&&!estadoTreino.desafio&&Math.random()<0.1){addXP(10);var sp=document.createElement('span');sp.className='qcombo qsurpresa';sp.textContent='🎁 Surpresa! +10';fb.insertBefore(sp,fb.firstChild);tocar('nivel');}
  if(rapido){var rp=document.createElement('span');rp.className='qcombo qrapido';rp.textContent='⚡ Rápido!';fb.insertBefore(rp,fb.firstChild);}
  if(ok&&(quiz.streak===5||quiz.streak%10===0)){celebrate('🔥 '+quiz.streak+' acertos seguidos!');tocar('nivel');}
  mostrarCombo();
  if(cur){var cu=document.createElement('div');cu.className='qcurio';cu.textContent='💡 '+cur;fb.appendChild(cu);}
  /* quanto ganhou nesta resposta, subindo do botão certo */
  var ganho=xpAtual()-xp0;
  if(ok&&ganho>0){var bok=document.querySelector('#qbody .okb');if(bok){var fl=document.createElement('span');fl.className='qfloat';fl.textContent='+'+ganho+' XP';bok.appendChild(fl);setTimeout(function(){fl.remove();},1100);}}
  var qse=$('qstat');if(qse)fillQStat(qse,QD()[quiz.cur]);
  $('qnext').style.display='block';measureQ();
  sessionRecord(ok,ganho,rapido);
  /* acertou: passa sozinho para a próxima; errou: espera o toque em "Próxima" */
  clearTimeout(quiz.autoT);
  if(ok){
    var asked=quiz.sessionAsked;
    quiz.autoT=setTimeout(function(){
      if(quiz.open&&quiz.answered&&quiz.sessionAsked===asked)$('qnext').click();
    },1200);
  }
  setTimeout(function(){
    try{var qp=$('quiz').querySelector('.qpanel');if(qp)qp.scrollTo({top:qp.scrollHeight,behavior:'smooth'});}catch(e){}
  },30);
}
function drawBadge(R,cx,cy){
  if(estadoTreino.qBadge==null||estadoTreino.quizDomain!=='world')return;
  var d=D[estadoTreino.qBadge],X,Y;
  if(estadoCamera.plano2D){var R2=R2now(),pp=proj2D(d.lng,d.lat,R2,cx,cy);X=pp.x;Y=pp.y;}
  else{var p=rot(d.x,d.y,d.z);if(p[2]<0.05)return;X=cx+R*p[0];Y=cy-R*p[1];}
  ctx.beginPath();ctx.arc(X,Y,10,0,7);ctx.lineWidth=3;ctx.strokeStyle='#fff';ctx.stroke();
  ctx.beginPath();ctx.arc(X,Y,4.5,0,7);ctx.fillStyle=REG[d.r].c;ctx.fill();
  var name=short(d),fs=15;
  ctx.font='700 '+fs+'px '+FONT;
  var tw=ctx.measureText(name).width,bw=Math.min(W-12,tw+58),bh=40;
  var bx=Math.max(6,Math.min(X-bw/2,W-bw-6)),by=Y-bh-16;
  if(by<6)by=Y+16;
  ctx.fillStyle='rgba(4,16,36,.9)';ctx.beginPath();
  if(ctx.roundRect)ctx.roundRect(bx,by,bw,bh,12);else ctx.rect(bx,by,bw,bh);
  ctx.fill();ctx.lineWidth=1.2;ctx.strokeStyle='rgba(255,255,255,.35)';ctx.stroke();
  ctx.textAlign='left';ctx.textBaseline='middle';
  if(d.dis){
    ctx.fillStyle=REG[d.r].c;ctx.beginPath();
    if(ctx.roundRect)ctx.roundRect(bx+8,by+bh/2-13,28,26,7);else ctx.rect(bx+8,by+bh/2-13,28,26);
    ctx.fill();
    ctx.font='800 11px '+FONT;ctx.textAlign='center';ctx.fillStyle='#0b1220';ctx.fillText(d.cc,bx+22,by+bh/2+1);
    ctx.textAlign='left';
  }else{
    ctx.font='26px \'Apple Color Emoji\',\'Noto Color Emoji\',\'Segoe UI Emoji\',sans-serif';
    ctx.fillStyle='#fff';
    ctx.fillText(d.flag,bx+9,by+bh/2+1);
  }
  ctx.font='700 '+fs+'px '+FONT;ctx.fillStyle='#fff';
  ctx.fillText(name,bx+44,by+bh/2+1);
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  ganchos.desenharSeloResposta = drawBadge;
  /* ---------- partida: cada acerto tira o item da rodada; ao acertar todos, a região está zerada ---------- */
  estadoPartida.RUNS = lsGet('globo.runs.v1',{});
  /* recordes e medalhas de cada partida zerada (por região + tipo de pergunta) */
  estadoPartida.RECS = lsGet('globo.recs.v1',{});
}

export { curiosidade, curRun, drawBadge, estadoPartida, fbText, finishQ, fmtTime, iniciar, makeNeighborOptions, makeOptions, MEDAL, medalFor, optLabel, pickQ, recordable, renderScore, runKey, runPool, saveRecs, saveRuns, scopeKeyFor, shareRun, showTarget };
