/**
 * @arquivo js/visualizacao/globo.js
 * Camada: Visualização
 * Desenho principal do globo 3D no canvas e laço de quadros (frame).
 */

import { LX, LY, LZ } from '../dados/massas-terra.js';
import { OC } from '../dados/oceanos-polos.js';
import { D, REG } from '../dados/paises.js';
import { capShort, short } from '../dados/vizinhos.js';
import { shortest } from './animacao.js';
import { drawStates, estadoBrasil } from './estados.js';
import { drawGeo } from './fronteiras.js';
import { ganchos } from './ganchos.js';
import { draw2D } from './mapa-2d.js';
import { shapePath, SHAPES } from './marcadores.js';
import { estadoRender } from './projecao.js';
import { paintSelBadge, selBadgeMetrics } from './selo.js';
import { ctx, dpr, estadoCamera, estadoMapa, FONT, girar, H, PI, R0, rot, W } from './tela.js';
import { glDraw } from './webgl.js';

/* ---------- Estado e desenho ---------- */
/* item disponível = não está escondido por "não reconhecidos" nem por "territórios dependentes" */

function drawPole(north,R,cx,cy){
  var p=rot(0,north?1:-1,0);
  if(p[2]<0.03)return;
  var X=cx+R*p[0],Y=cy-R*p[1],s=Math.max(6,Math.min(10,R*0.028));
  ctx.beginPath();
  ctx.moveTo(X,Y-s*1.35);ctx.lineTo(X+s*.55,Y-s*.4);ctx.lineTo(X+s*1.35,Y);ctx.lineTo(X+s*.55,Y+s*.4);
  ctx.lineTo(X,Y+s*1.35);ctx.lineTo(X-s*.55,Y+s*.4);ctx.lineTo(X-s*1.35,Y);ctx.lineTo(X-s*.55,Y-s*.4);ctx.closePath();
  ctx.fillStyle='#ffe066';ctx.fill();ctx.lineWidth=1.4;ctx.strokeStyle='#fff';ctx.stroke();
  ctx.font='700 12px '+FONT;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=3.5;
  var t=north?'Polo Norte':'Polo Sul',t2=north?'90° N':'90° S';
  var ty=Y+(north?-s*3.3:s*3.3),ty2=ty+(north?-14:14);
  var pw=Math.max(ctx.measureText(t).width,52)+14,py=Math.min(ty,ty2)-9;
  ctx.fillStyle='rgba(4,16,36,.82)';ctx.beginPath();
  if(ctx.roundRect)ctx.roundRect(X-pw/2,py,pw,36,9);else ctx.rect(X-pw/2,py,pw,36);
  ctx.fill();
  ctx.fillStyle='#ffe066';ctx.fillText(t,X,ty);
  ctx.font='600 10.5px '+FONT;
  ctx.fillStyle='rgba(255,255,255,.85)';ctx.fillText(t2,X,ty2);
  ctx.textAlign='left';
}

function draw(){
  if(estadoCamera.plano2D){draw2D();return;}
  var R=R0*estadoCamera.zoom, cx=W/2, cy=H*estadoCamera.cyFrac;
  girar();
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,W,H);
  var tex=estadoRender.useTex&&estadoRender.optTex;
  glDraw(tex,R,cx,cy);

  var g=ctx.createRadialGradient(cx,cy,0,cx,cy,R*1.12);
  g.addColorStop(0,'rgba(90,160,255,0)');g.addColorStop(.855,'rgba(90,160,255,0)');g.addColorStop(.875,'rgba(90,160,255,.34)');g.addColorStop(1,'rgba(90,160,255,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R*1.12,0,7);ctx.fill();
  if(!tex){
    var o=ctx.createRadialGradient(cx-R*.35,cy-R*.4,R*.1,cx,cy,R);
    o.addColorStop(0,'#1f5a9c');o.addColorStop(.55,'#0d3160');o.addColorStop(1,'#061a38');
    ctx.fillStyle=o;ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.fill();
  }

  /* graticula (equador um pouco mais marcado) */
  var la,lo,k,p,pen;
  for(la=-60;la<=60;la+=30){
    ctx.lineWidth=la===0?1:.6;ctx.strokeStyle=tex?(la===0?'rgba(255,255,255,.22)':'rgba(255,255,255,.1)'):(la===0?'rgba(150,190,255,.32)':'rgba(150,190,255,.16)');
    ctx.beginPath();pen=false;
    for(lo=-180;lo<=180;lo+=6){
      var a=la*Math.PI/180,b=lo*Math.PI/180;
      p=rot(Math.cos(a)*Math.sin(b),Math.sin(a),Math.cos(a)*Math.cos(b));
      if(p[2]>0){var X=cx+R*p[0],Y=cy-R*p[1];if(pen)ctx.lineTo(X,Y);else{ctx.moveTo(X,Y);pen=true;}}else pen=false;
    }
    ctx.stroke();
  }
  ctx.lineWidth=.6;ctx.strokeStyle='rgba(150,190,255,.16)';
  for(lo=-180;lo<180;lo+=30){
    ctx.beginPath();pen=false;
    for(la=-90;la<=90;la+=6){
      var a2=la*Math.PI/180,b2=lo*Math.PI/180;
      p=rot(Math.cos(a2)*Math.sin(b2),Math.sin(a2),Math.cos(a2)*Math.cos(b2));
      if(p[2]>0){var X2=cx+R*p[0],Y2=cy-R*p[1];if(pen)ctx.lineTo(X2,Y2);else{ctx.moveTo(X2,Y2);pen=true;}}else pen=false;
    }
    ctx.stroke();
  }

  /* terra (pontos, só quando não há textura) */
  var ds=Math.max(1.3,Math.min(3.2,R*0.0072));
  ctx.fillStyle='rgba(196,220,245,.62)';
  ctx.beginPath();
  for(k=0;!tex&&k<LX.length;k++){
    var q=rot(LX[k],LY[k],LZ[k]);
    if(q[2]>0.02){
      var s=ds*(0.45+0.55*q[2]);
      var sx=cx+R*q[0],sy=cy-R*q[1];
      ctx.moveTo(sx+s,sy);ctx.arc(sx,sy,s,0,6.2832);
    }
  }
  ctx.fill();

  drawGeo(R,cx,cy);
  ganchos.desenharArco(R,cx,cy);

  /* nomes dos oceanos */
  var fs=Math.max(9,Math.min(24,R*0.06));
  ctx.font='italic 600 '+fs+'px '+FONT;ctx.textAlign='center';ctx.textBaseline='middle';
  if('letterSpacing' in ctx)ctx.letterSpacing=(fs*0.2)+'px';
  for(k=0;k<OC.length;k++){
    var oc=OC[k],pp=rot(oc.x,oc.y,oc.z);
    if(pp[2]>0.22){
      var al=Math.min(1,(pp[2]-0.22)*2.4)*.9;
      var ox=cx+R*pp[0],oy=cy-R*pp[1];
      ctx.fillStyle='rgba(168,214,255,'+al+')';
      ctx.fillText(oc.l1,ox,oy-fs*.62);ctx.fillText(oc.l2,ox,oy+fs*.72);
    }
  }
  if('letterSpacing' in ctx)ctx.letterSpacing='0px';
  ctx.textAlign='left';

  /* marcadores (só países ligados) */
  var vis=[],i,d;
  for(i=0;i<D.length;i++){
    d=D[i];if(!estadoMapa.on[i])continue;
    p=rot(d.x,d.y,d.z);
    if(p[2]>0.05){d.sx=cx+R*p[0];d.sy=cy-R*p[1];d.vz=p[2];vis.push(d);}
  }
  if(ganchos.ocultarMarcadores()||estadoBrasil.statesMode)vis=[];
  var mr=Math.max(3.2,Math.min(6,R*0.0125));
  for(i=0;i<vis.length;i++){
    d=vis[i];
    var rr=(d===estadoMapa.selected)?mr*1.9:mr;
    if(d===estadoMapa.selected){ctx.beginPath();ctx.arc(d.sx,d.sy,rr+5,0,7);ctx.fillStyle='rgba(255,255,255,.22)';ctx.fill();}
    ctx.beginPath();shapePath(d.sx,d.sy,rr,SHAPES[d.r]);
    ctx.fillStyle=REG[d.r].c;ctx.fill();
    ctx.lineWidth=d===estadoMapa.selected?2.2:1.2;ctx.strokeStyle='#fff';ctx.stroke();
  }

  /* rótulos dos países/capitais (o selecionado ganha um selo em destaque) */
  if((estadoCamera.zoom>=1.9||estadoMapa.selected)&&!ganchos.treinoAberto()){
    ctx.lineJoin='round';
    var used=[],selB=null;
    if(estadoMapa.selected&&estadoMapa.on[estadoMapa.selected.i]&&vis.indexOf(estadoMapa.selected)>=0){
      selB=selBadgeMetrics(estadoMapa.selected);
      used.push({x:selB.bx-6,y:selB.by-6,w:selB.bw+12,h:selB.bh+12});
    }
    var order=vis.slice().sort(function(a,b){return b.vz-a.vz;});
    for(i=0;i<order.length;i++){
      d=order[i];
      if(d===estadoMapa.selected||estadoCamera.zoom<1.9)continue;
      ctx.font='500 10.5px '+FONT;ctx.textBaseline='middle';ctx.lineWidth=3;
      var t=d.flag+' '+(estadoMapa.labelMode==='p'||d.uni?short(d):capShort(d));
      var w=ctx.measureText(t).width;
      var rx=d.sx+mr+5,rct={x:rx-2,y:d.sy-8,w:w+4,h:16};
      if(rx+w>W-4){rct.x=d.sx-mr-5-w-2;rx=rct.x+2;}
      var clash=false;
      for(var u=0;u<used.length;u++){var U=used[u];if(!(rct.x>U.x+U.w||rct.x+rct.w<U.x||rct.y>U.y+U.h||rct.y+rct.h<U.y)){clash=true;break;}}
      if(clash)continue;
      used.push(rct);
      ctx.globalAlpha=.72;
      ctx.strokeStyle='rgba(4,16,36,.85)';ctx.strokeText(t,rx,d.sy);
      ctx.fillStyle='#fff';ctx.fillText(t,rx,d.sy);
      ctx.globalAlpha=1;
    }
    if(selB)paintSelBadge(selB);
  }

  drawStates(R,cx,cy);
  ganchos.desenharPulsoEscopo(R,cx,cy);

  /* polos */
  drawPole(true,R,cx,cy);drawPole(false,R,cx,cy);
  ganchos.desenharSeloResposta(R,cx,cy);
}

function frame(){
  if(estadoCamera.target){
    var dl=shortest(estadoCamera.lam,estadoCamera.target.lam),dp=estadoCamera.target.phi-estadoCamera.phi,dz=estadoCamera.target.zoom-estadoCamera.zoom;
    estadoCamera.lam+=dl*.14;estadoCamera.phi+=dp*.14;estadoCamera.zoom+=dz*.14;
    if(Math.abs(dl)<.0008&&Math.abs(dp)<.0008&&Math.abs(dz)<.004)estadoCamera.target=null;
  }else if(estadoCamera.auto&&!estadoCamera.dragging&&!estadoMapa.selected&&!ganchos.treinoAberto()&&!estadoBrasil.statesMode&&!estadoBrasil.selSt&&!estadoCamera.plano2D&&(performance.now()-estadoCamera.lastInteract>2500)){
    estadoCamera.lam+=0.0022;
  }
  var wantCy=((estadoMapa.selected||estadoBrasil.selSt)&&!ganchos.treinoAberto())?Math.max(.26,Math.min(.5,(H-ganchos.alturaCartao())/(2*H))):(ganchos.treinoAberto()?Math.max(.24,Math.min(.5,(H-ganchos.alturaTreino())/(2*H))):.5);estadoCamera.cyFrac+=(wantCy-estadoCamera.cyFrac)*.15;
  if(estadoCamera.lam>PI)estadoCamera.lam-=2*PI;if(estadoCamera.lam<-PI)estadoCamera.lam+=2*PI;
  draw();requestAnimationFrame(frame);
}

export { frame };
