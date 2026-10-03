/**
 * @arquivo js/brasil/desenho.js
 * Camada: Brasil
 * Desenho dos estados no globo.
 */

import { D, norm, REG } from '../dados/paises.js';
import { byName, short } from '../dados/vizinhos.js';
import { ctx, estadoCamera, FONT, H, R0, rot, W } from '../visualizacao/globo.js';
import { card } from '../interface/cartao-pais.js';
import { estadoRender, hexA, inFeat, projCfg } from '../visualizacao/fronteiras.js';
import { shapePath } from '../visualizacao/marcadores.js';
import { estadoCartao } from '../interface/cartao-detalhes.js';
import { estadoTreino, quiz } from '../treino/estado.js';
import { BRREG, BRS, estadoBrasil, STSHAPES } from './dados-estados.js';
import { selectSt } from './cartao-estado.js';

/* ---------- desenho ---------- */
function stBadgeMetrics(st){
  var t1=st.name,t2='Capital: '+st.cap,fs=16,maxw=W-72-64,w1;
  ctx.font='700 '+fs+'px '+FONT;w1=ctx.measureText(t1).width;
  while(w1>maxw&&fs>10){fs--;ctx.font='700 '+fs+'px '+FONT;w1=ctx.measureText(t1).width;}
  ctx.font='600 11.5px '+FONT;var w2=ctx.measureText(t2).width;
  var bw=Math.min(W-72,Math.max(w1,w2)+64),bh=46;
  var bx=Math.max(6,Math.min(st.sx-bw/2,W-bw-66)),by=st.sy-bh-20;
  if(by<6)by=st.sy+20;
  return {st:st,t1:t1,t2:t2,fs:fs,bx:bx,by:by,bw:bw,bh:bh};
}
function paintStBadge(m){
  var st=m.st,col=BRREG[st.reg].c,above=m.by<st.sy;
  var px=Math.max(m.bx+14,Math.min(st.sx,m.bx+m.bw-14));
  ctx.beginPath();ctx.moveTo(px,above?m.by+m.bh:m.by);ctx.lineTo(st.sx,st.sy);ctx.lineWidth=2;ctx.strokeStyle=col;ctx.stroke();
  ctx.fillStyle='rgba(4,16,36,.93)';ctx.beginPath();
  if(ctx.roundRect)ctx.roundRect(m.bx,m.by,m.bw,m.bh,13);else ctx.rect(m.bx,m.by,m.bw,m.bh);
  ctx.fill();ctx.lineWidth=2.2;ctx.strokeStyle=col;ctx.stroke();
  ctx.fillStyle=col;ctx.beginPath();
  if(ctx.roundRect)ctx.roundRect(m.bx+8,m.by+9,36,28,8);else ctx.rect(m.bx+8,m.by+9,36,28);
  ctx.fill();
  ctx.font='800 15px '+FONT;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#0b1220';
  ctx.fillText(st.sigla,m.bx+26,m.by+24);
  ctx.textAlign='left';ctx.fillStyle='#fff';
  ctx.font='700 '+m.fs+'px '+FONT;ctx.fillText(m.t1,m.bx+54,m.by+16);
  ctx.font='600 11.5px '+FONT;ctx.fillStyle='rgba(255,255,255,.72)';ctx.fillText(m.t2,m.bx+54,m.by+34);
}
function drawStates(R,cx,cy){
  if(!estadoBrasil.statesMode)return;
  var hideMk=quiz.open&&estadoTreino.qMap&&estadoTreino.quizDomain==='br'&&estadoBrasil.STFEAT.some(function(f){return f;});
  var mr=Math.max(3.8,Math.min(6.5,R*0.014)),vs=[],i,st,p;
  for(i=0;i<BRS.length;i++){
    st=BRS[i];if(!estadoBrasil.onS[i])continue;
    p=rot(st.x,st.y,st.z);
    if(p[2]>0.05){st.sx=cx+R*p[0];st.sy=cy-R*p[1];st.vz=p[2];vs.push(st);}
  }
  for(i=0;!hideMk&&i<vs.length;i++){
    st=vs[i];
    var sel=st===estadoBrasil.selSt,rr=sel?mr*1.9:mr;
    if(sel){ctx.beginPath();ctx.arc(st.sx,st.sy,rr+5,0,7);ctx.fillStyle='rgba(255,255,255,.22)';ctx.fill();}
    ctx.beginPath();shapePath(st.sx,st.sy,rr,STSHAPES[st.reg]);
    ctx.fillStyle=BRREG[st.reg].c;ctx.fill();
    ctx.lineWidth=sel?2.2:1.2;ctx.strokeStyle='#fff';ctx.stroke();
  }
  var used=[],selB=null;
  if(estadoBrasil.selSt&&estadoBrasil.onS[estadoBrasil.selSt.i]&&vs.indexOf(estadoBrasil.selSt)>=0){
    selB=stBadgeMetrics(estadoBrasil.selSt);
    used.push({x:selB.bx-6,y:selB.by-6,w:selB.bw+12,h:selB.bh+12});
  }
  ctx.lineJoin='round';ctx.lineWidth=3;ctx.textBaseline='middle';ctx.textAlign='left';
  (hideMk?[]:vs.slice()).sort(function(a,b){return b.vz-a.vz;}).forEach(function(s2){
    if(s2===estadoBrasil.selSt)return;
    ctx.font='600 11px '+FONT;
    var t=estadoCamera.zoom>=1.7?s2.name:s2.sigla,w=ctx.measureText(t).width;
    var rx=s2.sx+mr+5,rct={x:rx-2,y:s2.sy-8,w:w+4,h:16};
    if(rx+w>W-4){rct.x=s2.sx-mr-5-w-2;rx=rct.x+2;}
    for(var u=0;u<used.length;u++){var U=used[u];if(!(rct.x>U.x+U.w||rct.x+rct.w<U.x||rct.y>U.y+U.h||rct.y+rct.h<U.y))return;}
    used.push(rct);
    ctx.globalAlpha=.85;ctx.strokeStyle='rgba(4,16,36,.85)';ctx.strokeText(t,rx,s2.sy);ctx.fillStyle='#fff';ctx.fillText(t,rx,s2.sy);ctx.globalAlpha=1;
  });
  /* países vizinhos (no modo "Só vizinhos") */
  estadoBrasil.stNbC.forEach(function(k){
    var d=D[k];p=rot(d.x,d.y,d.z);
    if(p[2]<=0.05)return;
    var X=cx+R*p[0],Y=cy-R*p[1];
    ctx.beginPath();ctx.arc(X,Y,mr+2,0,7);ctx.fillStyle='#fff';ctx.fill();
    ctx.beginPath();ctx.arc(X,Y,mr-0.5,0,7);ctx.fillStyle=REG[d.r].c;ctx.fill();
    var t=d.flag+' '+short(d);
    ctx.font='700 12.5px '+FONT;ctx.lineWidth=3.5;
    var w=ctx.measureText(t).width,rx=X+mr+7;
    if(rx+w>W-6)rx=X-mr-7-w;
    ctx.strokeStyle='rgba(4,16,36,.9)';ctx.strokeText(t,rx,Y);ctx.fillStyle='#fff';ctx.fillText(t,rx,Y);
  });
  if(selB)paintStBadge(selB);
}
function drawGeoStates(R,cx,cy){
  if(!estadoRender.feats)return;
  projCfg(R,cx,cy);
  var i,br=byName[norm('Brasil')],hasSt=estadoBrasil.STFEAT.some(function(f){return f;});
  ctx.beginPath();
  for(i=0;i<D.length;i++)if(i!==br&&estadoBrasil.stNbC.indexOf(i)<0&&estadoRender.FEAT[i])estadoRender.gpath(estadoRender.FEAT[i]);
  ctx.fillStyle='rgba(2,10,24,.6)';ctx.fill();
  if(estadoBrasil.stNbC.length){
    ctx.beginPath();estadoBrasil.stNbC.forEach(function(k){if(estadoRender.FEAT[k])estadoRender.gpath(estadoRender.FEAT[k]);});
    ctx.fillStyle='rgba(255,255,255,.10)';ctx.fill();ctx.lineWidth=1.6;ctx.strokeStyle='rgba(255,255,255,.9)';ctx.stroke();
  }
  if(hasSt){
    var anyOff=estadoBrasil.onS.some(function(v){return !v;});
    if(anyOff){ctx.beginPath();for(i=0;i<BRS.length;i++)if(!estadoBrasil.onS[i]&&estadoBrasil.STFEAT[i])estadoRender.gpath(estadoBrasil.STFEAT[i]);ctx.fillStyle='rgba(2,10,24,.6)';ctx.fill();}
    if(estadoRender.optFill){
      for(var r=0;r<BRREG.length;r++){
        ctx.beginPath();
        for(i=0;i<BRS.length;i++)if(estadoBrasil.onS[i]&&BRS[i].reg===r&&estadoBrasil.STFEAT[i])estadoRender.gpath(estadoBrasil.STFEAT[i]);
        ctx.fillStyle=hexA(BRREG[r].c,.30);ctx.fill();
      }
    }
    if(estadoBrasil.selSt&&estadoBrasil.STFEAT[estadoBrasil.selSt.i]){ctx.beginPath();estadoRender.gpath(estadoBrasil.STFEAT[estadoBrasil.selSt.i]);ctx.fillStyle='rgba(255,224,102,.26)';ctx.fill();}
    ctx.beginPath();
    for(i=0;i<BRS.length;i++)if(estadoBrasil.onS[i]&&estadoBrasil.STFEAT[i])estadoRender.gpath(estadoBrasil.STFEAT[i]);
    ctx.lineJoin='round';ctx.lineWidth=1.3;ctx.strokeStyle='rgba(255,255,255,.9)';ctx.stroke();
    if(estadoBrasil.selSt&&estadoBrasil.STFEAT[estadoBrasil.selSt.i]){ctx.beginPath();estadoRender.gpath(estadoBrasil.STFEAT[estadoBrasil.selSt.i]);ctx.lineWidth=2.6;ctx.strokeStyle='#ffe066';ctx.stroke();}
  }
  if(estadoRender.FEAT[br]){ctx.beginPath();estadoRender.gpath(estadoRender.FEAT[br]);ctx.lineWidth=hasSt?1.8:2;ctx.strokeStyle=hasSt?'rgba(255,255,255,.95)':'#ffe066';ctx.stroke();}
}
function stateAt(x,y){
  if(!estadoRender.feats||!estadoBrasil.STFEAT.some(function(f){return f;}))return null;
  projCfg(R0*estadoCamera.zoom,W/2,H*estadoCamera.cyFrac);
  var ll=estadoRender.proj.invert([x,y]);
  if(!ll||isNaN(ll[0])||isNaN(ll[1]))return null;
  for(var i=0;i<BRS.length;i++)if(estadoBrasil.onS[i]&&estadoBrasil.STFEAT[i]&&inFeat(estadoBrasil.STFEAT[i],ll[0],ll[1]))return BRS[i];
  return null;
}
function stTap(x,y){
  var R=R0*estadoCamera.zoom,cand=[];
  BRS.forEach(function(st){
    if(!estadoBrasil.onS[st.i])return;
    var p=rot(st.x,st.y,st.z);if(p[2]<=0.05)return;
    var sx=W/2+R*p[0],sy=H*estadoCamera.cyFrac-R*p[1],dd=(sx-x)*(sx-x)+(sy-y)*(sy-y);
    if(dd<36*36)cand.push({s:st,dd:dd});
  });
  cand.sort(function(a,b){return a.dd-b.dd;});
  var precise=cand.length&&cand[0].dd<14*14;
  var poly=precise?null:stateAt(x,y);
  var chosen=precise?cand[0].s:(poly||(cand.length?cand[0].s:null));
  if(chosen){
    var grp=cand.map(function(c){return c.s;});
    if(grp.indexOf(chosen)<0)grp.unshift(chosen);
    selectSt(chosen,false,grp);
  }else if(estadoBrasil.selSt){estadoBrasil.selSt=null;card.style.display='none';estadoCartao.cardH=0;}
}

export { drawGeoStates, drawStates, stateAt, stTap };
