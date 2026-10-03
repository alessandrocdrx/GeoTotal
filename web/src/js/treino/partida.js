/**
 * @arquivo js/treino/partida.js
 * Camada: Treino
 * Partida por região: baralho embaralhado, medalhas, recordes e escolha da próxima pergunta.
 */
/* ---------- partida: cada acerto tira o item da rodada; ao acertar todos, a região está zerada ---------- */
var RUNS=lsGet('globo.runs.v1',{});
function runKey(){return quizDomain+'|'+JSON.stringify(quizScope)+'|'+quiz.mode;}
function curRun(){var k=runKey();return RUNS[k]||(RUNS[k]={d:{},e:0,t0:Date.now(),fin:0,at:0,la:Date.now()});}
/* recordes e medalhas de cada partida zerada (por região + tipo de pergunta) */
var RECS=lsGet('globo.recs.v1',{});
function saveRecs(){lsSet('globo.recs.v1',RECS);}
var MEDAL={1:{i:'🥇',n:'ouro'},2:{i:'🥈',n:'prata'},3:{i:'🥉',n:'bronze'}};
function medalFor(e){return e===0?1:(e<=3?2:3);}
function scopeKeyFor(sc,mode){return ((sc.t==='br'||sc.t==='brreg')?'br':'world')+'|'+JSON.stringify(sc)+'|'+mode;}
function recordable(sc){return sc.t!=='filter'&&sc.t!=='review';}
function recFinish(r){
  var k=runKey(),old=RECS[k]||{},m=medalFor(r.e),t=r.at||((r.fin||Date.now())-r.t0);
  var res={medal:m,t:t,first:!old.n,newMedal:!old.medal||m<old.medal,newT:old.bestT==null||Math.round(t/1000)<Math.round(old.bestT/1000),newE:old.bestE==null||r.e<old.bestE,prevT:old.bestT,prevE:old.bestE};
  if(recordable(quizScope)){
    RECS[k]={medal:Math.min(m,old.medal||9),bestT:Math.min(t,old.bestT==null?t:old.bestT),bestE:Math.min(r.e,old.bestE==null?r.e:old.bestE),n:(old.n||0)+1};
    saveRecs();
  }
  return res;
}
function fmtTime(ms){var s2=Math.max(1,Math.round(ms/1000)),m=Math.floor(s2/60);return m?(m+' min '+(s2%60)+' s'):(s2+' s');}
function saveRuns(){lsSet('globo.runs.v1',RUNS);}
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
    celebrate('🏁 Você zerou '+scopeLabel()+'!');addXP(50);
    if(recordable(quizScope)&&r.res.newMedal)celebrate(MEDAL[r.res.medal].i+' Medalha de '+MEDAL[r.res.medal].n+'!');
  }
  saveRuns();
}
function runRestart(){delete RUNS[runKey()];saveRuns();resetSession();quiz.last=-1;nextQ();renderScore();}
function fmtDur(ms){var m=Math.round(ms/60000);if(m<1)return 'menos de 1 min';if(m<60)return m+' min';var h=Math.floor(m/60);return h+' h '+(m%60)+' min';}
function showRunDone(){
  stopTimerTick();
  var r=curRun(),n=poolIdx().length,body=$('qbody'),fb=$('qfb'),res=r.res||{medal:medalFor(r.e),t:r.at||0};
  fb.textContent='';fb.className='';$('qnext').style.display='none';$('qpool').textContent='';
  body.innerHTML='';
  var box=document.createElement('div');box.className='rundone';
  var rec=recordable(quizScope);
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
      if(!bits.length){var R2=RECS[runKey()]||{};bits.push('Seus recordes: '+fmtTime(R2.bestT)+' · '+R2.bestE+' '+(R2.bestE===1?'erro':'erros'));}
    }
    if(res.medal>1)bits.push(res.medal===2?'Para o ouro: zere sem nenhum erro.':'Para a prata: zere com até 3 erros.');
    rl.textContent=bits.join(' ');box.appendChild(rl);
  }
  var row=document.createElement('div');row.className='qrow';
  var again=document.createElement('button');again.textContent='🔁 Jogar de novo';again.onclick=runRestart;
  var other=document.createElement('button');other.textContent='📍 Outra região';other.onclick=function(){$('qscopeb').click();};
  var sh=document.createElement('button');sh.className='qshare';sh.textContent='📤';sh.title='Compartilhar resultado';sh.setAttribute('aria-label','Compartilhar resultado');
  sh.onclick=function(){shareRun(n,r,res);};
  row.appendChild(again);row.appendChild(other);row.appendChild(sh);box.appendChild(row);
  var tip=document.createElement('div');tip.className='inote';tip.textContent='Cada tipo de pergunta tem a sua própria partida e a sua medalha.';
  box.appendChild(tip);
  body.appendChild(box);measureQ();
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
  var rec=recordable(quizScope);
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
  var pool=runPool();if(!pool.length)return -1;
  if(quiz.order==='seq')return pickQFrom(pool);
  var arr=QD(),cand=pool;
  if(quizFocus!=='mix'){
    var f=pool.filter(function(i){var t=tierOf(i);return quizFocus==='new'?t==='new':t==='wrong';});
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
  var st=mstats(),qn=QS.q[quiz.mode]||0,T={'new':[],'wrong':[],'ok':[]},rest=[];
  pool.forEach(function(i){
    if(i===quiz.last)return;
    var e=st[qcc(arr[i])];
    if(!e){T['new'].push(i);return;}
    rest.push(i);
    if(qn-(e.l||0)>=gapOf(e))T[e.s===0?'wrong':'ok'].push(i);
  });
  if(quizFocus==='new'){return T['new'].length?T['new'][Math.floor(Math.random()*T['new'].length)]:-1;}
  if(quizFocus==='wrong'){
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
  if(quiz.mode==='code')return quizDomain==='br'?o.sigla:o.cc;
  return qflag(o)+' '+short(o);
}
function makeNeighborOptions(qIdx,ansIdx){
  var arr=QD(),nbSet={};(quizDomain==='br'?arr[qIdx].nb:NB[qIdx]).forEach(function(k){nbSet[k]=1;});
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
  var same=sc.filter(function(x){return arr[x].r===arr[i].r;});
  guard=0;
  while(out.length<4&&guard++<400&&sc.length){
    var src=(Math.random()<.65&&same.length)?same:sc;
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
  $('qruntxt').textContent=n?(done+' de '+n+(r.e?' · '+r.e+' '+(r.e===1?'erro':'erros'):'')):'';
  $('qrunbar').style.display=n?'block':'none';
  $('qrunfill').style.width=(n?Math.round(100*done/n):0)+'%';
}
function record(i,ok,hinted){
  var o=QD()[i],cc=qcc(o),stt=mstats(),s=stt[cc]||(stt[cc]={r:0,w:0,s:0,l:0});
  if(ok&&!hinted){s.r++;s.s++;quiz.ok++;quiz.streak++;if(quiz.streak>QS.best)QS.best=quiz.streak;}
  else if(ok&&hinted){s.r++;s.s=0;quiz.ok++;}
  else{s.w++;s.s=0;quiz.streak=0;}
  s.l=QS.q[quiz.mode]||0;
  quiz.total++;lsSet('globo.quiz.v1',QS);renderScore();
}
function fbText(d,ok,extra){
  var fl=qflag(d),nm=short(d),cp=qcapD(d);
  var base=(ok?'✔ Correto! ':'✖ Não foi dessa vez. ');
  var ans;
  if(quiz.mode==='neighbor'){
    var an=QD()[quiz.nbAnswer];
    ans=fl+' '+nm+' faz fronteira com '+qflag(an)+' '+short(an)+'.';
  }else if(quiz.mode==='code'){
    ans='A sigla de '+fl+' '+nm+' é '+(quizDomain==='br'?d.sigla:d.cc)+'.';
  }else{
    ans=quiz.mode==='cap'?('A capital de '+fl+' '+nm+' é '+cp+'.'):(quiz.mode==='map'?(fl+' '+nm+' fica aqui'+(d.uni?'.':' (capital: '+cp+').')):('É '+fl+' '+nm+' (capital: '+cp+').'));
  }
  return base+ans+(quiz.hinted?' (com dica)':'')+(extra?' '+extra:'');
}
function showTarget(i){
  if(quizDomain==='br'){statesMode=true;selSt=BRS[i];var v=stateView(BRS[i]);flyTo(v.lat,v.lng,zoomFor(v.r,3.4));}
  else{qBadge=i;showCountry(i);}
}
function sessionRecord(ok){
  var s=quiz;s.sessionLog.push({label:qflag(QD()[s.cur])+' '+short(QD()[s.cur]),ok:ok});
}
function finishQ(ok,extra){
  quiz.answered=true;quiz.lastOk=ok;record(quiz.cur,ok,quiz.hinted);runRecord(quiz.cur,ok);renderScore();
  recordProgress(ok,quiz.hinted);
  showTarget(quiz.cur);
  if(quizDomain==='world'){qFlash={i:quiz.cur,kind:ok?'ok':'reveal'};}
  var fb=$('qfb');fb.textContent=fbText(QD()[quiz.cur],ok,extra);fb.className=ok?'ok':'bad';
  var qse=$('qstat');if(qse)fillQStat(qse,QD()[quiz.cur]);
  $('qnext').style.display='block';measureQ();
  sessionRecord(ok);
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
var GEOM={};
var EXT_FB={CL:20,AR:17,NO:12,SE:8,FI:7,IT:8,JP:14,PH:9,VN:9,ID:25,MY:10,NZ:12,RU:42,US:23,CA:30,MX:14,CN:25,IN:16,BR:24,KZ:15,MN:13,EG:10,LY:10,DZ:12,SD:11,CD:14,PE:9,CO:9,SA:12,IR:12,ZA:9,AU:22,GR:5,PT:5,GB:6,CU:6,TR:11,TH:8,MM:9,CL_:0};
function featView(f){
  if(!(f&&f.geometry&&window.d3&&d3.geo&&d3.geo.area))return null;
  try{
    var g=f.geometry,polys=g.type==='Polygon'?[g.coordinates]:(g.type==='MultiPolygon'?g.coordinates:[]);
    var arr=polys.map(function(pl){return {pl:pl,a:d3.geo.area({type:'Polygon',coordinates:pl})};});
    arr.sort(function(x,y){return y.a-x.a;});
    var tot=arr.reduce(function(t,x){return t+x.a;},0),acc=0,use=[],k;
    for(k=0;k<arr.length;k++){use.push(arr[k]);acc+=arr[k].a;if(acc>=0.75*tot)break;}
    var vs=[],sx=0,sy=0,sz=0;
    use.forEach(function(u){u.pl[0].forEach(function(c){
      var la=c[1]*PI/180,lo=c[0]*PI/180,x=Math.cos(la)*Math.sin(lo),y=Math.sin(la),z=Math.cos(la)*Math.cos(lo);
      vs.push([x,y,z]);sx+=x;sy+=y;sz+=z;});});
    var m=Math.sqrt(sx*sx+sy*sy+sz*sz);
    if(!vs.length||!(m>0))return null;
    var cx=sx/m,cy=sy/m,cz=sz/m,it,far,best,dd,v;
    for(it=1;it<=40;it++){
      far=null;best=2;
      for(k=0;k<vs.length;k++){v=vs[k];dd=v[0]*cx+v[1]*cy+v[2]*cz;if(dd<best||far===null){best=dd;far=v;}}
      cx+=(far[0]-cx)/(it+1);cy+=(far[1]-cy)/(it+1);cz+=(far[2]-cz)/(it+1);
      m=Math.sqrt(cx*cx+cy*cy+cz*cz);cx/=m;cy/=m;cz/=m;
    }
    var r=0;
    for(k=0;k<vs.length;k++){v=vs[k];dd=v[0]*cx+v[1]*cy+v[2]*cz;r=Math.max(r,Math.acos(Math.max(-1,Math.min(1,dd))));}
    return {lat:Math.asin(cy)*180/PI,lng:Math.atan2(cx,cz)*180/PI,r:r};
  }catch(e){return null;}
}
function countryView(i){
  if(GEOM[i])return GEOM[i];
  var d=D[i],f=FEAT[i];
  if(f){var fv=featView(f);if(fv)return (GEOM[i]=fv);}
  /* sem contorno: usa a área e a posição da capital (com extensão manual para países alongados) */
  var a=d.info?d.info.area:50000,ex=EXT_FB[d.cc];
  return {lat:d.lat,lng:d.lng,r:ex?ex*Math.PI/180:Math.sqrt(a/Math.PI)/6371*1.4};
}
function zoomFor(r,cap){
  var reserved=quiz.open?qPanelH:(cardH||H*0.4);
  var avail=Math.max(60,Math.min(W,H-reserved)/2);
  var sn=Math.sin(Math.min(Math.max(r,0.004)*1.1+0.015,1.45));
  return Math.max(1,Math.min(cap||5.5,0.8*avail/(R0*sn)));
}
function showCountry(i){var v=countryView(i);flyTo(v.lat,v.lng,zoomFor(v.r,3.4));}
function resetView(){flyTo(phi*180/PI,lam*180/PI,1);}
function selBadgeMetrics(d){
  var t1=labelMode==='p'||d.uni?short(d):capShort(d),t2=d.uni?d.cap:labelMode==='p'?('Capital: '+qcapDisp(d)):('País: '+short(d));
  var fs=16,maxw=W-72-56,w1;
  ctx.font='700 '+fs+'px '+FONT;w1=ctx.measureText(t1).width;
  while(w1>maxw&&fs>10){fs--;ctx.font='700 '+fs+'px '+FONT;w1=ctx.measureText(t1).width;}
  ctx.font='600 11.5px '+FONT;var w2=ctx.measureText(t2).width;
  var bw=Math.min(W-72,Math.max(w1,w2)+56),bh=46;
  var bx=Math.max(6,Math.min(d.sx-bw/2,W-bw-66)),by=d.sy-bh-20;
  if(by<6)by=d.sy+20;
  return {d:d,t1:t1,t2:t2,fs:fs,bx:bx,by:by,bw:bw,bh:bh};
}
function paintSelBadge(m){
  var d=m.d,col=REG[d.r].c,above=m.by<d.sy;
  var px=Math.max(m.bx+14,Math.min(d.sx,m.bx+m.bw-14));
  ctx.beginPath();ctx.moveTo(px,above?m.by+m.bh:m.by);ctx.lineTo(d.sx,d.sy);ctx.lineWidth=2;ctx.strokeStyle=col;ctx.stroke();
  ctx.fillStyle='rgba(4,16,36,.93)';ctx.beginPath();
  if(ctx.roundRect)ctx.roundRect(m.bx,m.by,m.bw,m.bh,13);else ctx.rect(m.bx,m.by,m.bw,m.bh);
  ctx.fill();ctx.lineWidth=2.2;ctx.strokeStyle=col;ctx.stroke();
  ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillStyle='#fff';
  if(d.dis){
    ctx.fillStyle=col;ctx.beginPath();
    if(ctx.roundRect)ctx.roundRect(m.bx+8,m.by+9,32,28,8);else ctx.rect(m.bx+8,m.by+9,32,28);
    ctx.fill();
    ctx.font='800 12px '+FONT;ctx.textAlign='center';ctx.fillStyle='#0b1220';ctx.fillText(d.cc,m.bx+24,m.by+24);
    ctx.textAlign='left';ctx.fillStyle='#fff';
  }else{
    ctx.font='28px \'Apple Color Emoji\',\'Noto Color Emoji\',\'Segoe UI Emoji\',sans-serif';
    ctx.fillText(d.flag,m.bx+10,m.by+m.bh/2+1);
  }
  ctx.font='700 '+m.fs+'px '+FONT;ctx.fillText(m.t1,m.bx+48,m.by+16);
  ctx.font='600 11.5px '+FONT;ctx.fillStyle='rgba(255,255,255,.72)';ctx.fillText(m.t2,m.bx+48,m.by+34);
}
function drawBadge(R,cx,cy){
  if(qBadge==null||quizDomain!=='world')return;
  var d=D[qBadge],X,Y;
  if(flat2D){var R2=R2now(),pp=proj2D(d.lng,d.lat,R2,cx,cy);X=pp.x;Y=pp.y;}
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
