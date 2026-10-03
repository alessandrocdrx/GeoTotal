/**
 * @arquivo js/visualizacao/mapa-2d.js
 * Camada: Visualização
 * Mapa 2D (alternativa ao globo 3D), reaproveitando câmera e gestos.
 */

import { LLAT, LLNG } from '../dados/massas-terra.js';
import { D, REG } from '../dados/paises.js';
import { capShort, short } from '../dados/vizinhos.js';
import { $, lsGet, lsSet } from '../nucleo/utilitarios.js';
import { PI } from './animacao.js';
import { texCanvas } from './carregamento.js';
import { estadoRender } from './fronteiras.js';
import { ganchos } from './ganchos.js';
import { avail, ctx, dpr, estadoCamera, estadoMapa, FONT, H, W } from './globo.js';
import { shapePath, SHAPES } from './marcadores.js';
import { paintSelBadge, selBadgeMetrics } from './selo.js';

/* =====================================================================
   MAPA 2D (alternativa ao globo 3D) — reaproveita lam/phi/zoom como
   deslocamento horizontal/vertical e escala, então arrastar/zoom já
   funcionam sem tocar nos manipuladores de ponteiro existentes.
   ===================================================================== */
let flat2D;
function R2now(){return Math.min(W,H)*0.26*estadoCamera.zoom;}
function proj2D(lngDeg,latDeg,R2,cx,cy){
  var lng=lngDeg*PI/180-estadoCamera.lam;
  while(lng>PI)lng-=2*PI; while(lng<-PI)lng+=2*PI;
  var lat=latDeg*PI/180-estadoCamera.phi;
  return {x:cx+lng*R2,y:cy-lat*R2};
}
function inv2D(sx,sy,R2,cx,cy){
  return [(estadoCamera.lam+(sx-cx)/R2)*180/PI,(estadoCamera.phi+(cy-sy)/R2)*180/PI];
}
function walkFeat2D(f,R2,cx,cy){
  var g=f&&f.geometry;if(!g)return;
  var polys=g.type==='Polygon'?[g.coordinates]:(g.type==='MultiPolygon'?g.coordinates:[]);
  polys.forEach(function(poly){
    poly.forEach(function(ring){
      var px=null;
      ring.forEach(function(c,ci){
        var pp=proj2D(c[0],c[1],R2,cx,cy);
        /* ao cruzar a linha de 180° o ponto salta para o outro lado do mapa: recomeça o traço */
        if(ci===0||Math.abs(pp.x-px)>PI*R2)ctx.moveTo(pp.x,pp.y);else ctx.lineTo(pp.x,pp.y);
        px=pp.x;
      });
      ctx.closePath();
    });
  });
}
function draw2D(){
  var R2=R2now(),cx=W/2,cy=H*estadoCamera.cyFrac,i,d,k,lo,la;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0b2e52';ctx.fillRect(0,0,W,H);
  /* textura de satélite: a mesma imagem equirretangular do globo, repetida na horizontal */
  var tex2=estadoRender.useTex&&estadoRender.optTex&&texCanvas;
  if(tex2){
    var tw=2*PI*R2,th=PI*R2,x0=cx+(-PI-estadoCamera.lam)*R2,y0=cy-(PI/2-estadoCamera.phi)*R2;
    x0=((x0%tw)+tw)%tw-tw;
    ctx.imageSmoothingEnabled=true;
    for(var xx=x0;xx<W;xx+=tw)ctx.drawImage(texCanvas,xx,y0,tw,th);
  }

  /* graticula — nesta projeção os meridianos/paralelos são linhas retas */
  ctx.lineWidth=.6;
  for(lo=-180;lo<180;lo+=30){
    var pp0=proj2D(lo,0,R2,cx,cy);
    ctx.strokeStyle='rgba(150,190,255,.14)';
    ctx.beginPath();ctx.moveTo(pp0.x,0);ctx.lineTo(pp0.x,H);ctx.stroke();
  }
  for(la=-60;la<=60;la+=30){
    var yy=cy-(la*PI/180-estadoCamera.phi)*R2;
    ctx.strokeStyle=la===0?'rgba(150,190,255,.3)':'rgba(150,190,255,.14)';
    ctx.lineWidth=la===0?1:.6;
    ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(W,yy);ctx.stroke();
  }

  /* terra (mesma grade de pontos usada no globo), só quando não há textura */
  var ds=tex2?0:Math.max(1,Math.min(2.4,R2*0.011));
  ctx.fillStyle='rgba(196,220,245,.55)';
  ctx.beginPath();
  for(k=0;!tex2&&k<LLAT.length;k++){
    var pp=proj2D(LLNG[k],LLAT[k],R2,cx,cy);
    if(pp.x<-8||pp.x>W+8||pp.y<-8||pp.y>H+8)continue;
    ctx.moveTo(pp.x+ds,pp.y);ctx.arc(pp.x,pp.y,ds,0,6.2832);
  }
  ctx.fill();

  /* fronteiras dos países ligados (quando carregadas) */
  if(estadoRender.feats){
    ctx.beginPath();
    for(i=0;i<D.length;i++)if(estadoRender.FEAT[i]&&(estadoMapa.on[i]||!avail(D[i])))walkFeat2D(estadoRender.FEAT[i],R2,cx,cy);
    ctx.lineJoin='round';ctx.lineWidth=Math.max(.6,Math.min(1.6,.5+.15*estadoCamera.zoom));ctx.strokeStyle='rgba(255,255,255,.72)';ctx.stroke();
    if(estadoMapa.selected&&estadoRender.FEAT[estadoMapa.selected.i]){
      ctx.beginPath();walkFeat2D(estadoRender.FEAT[estadoMapa.selected.i],R2,cx,cy);
      ctx.fillStyle='rgba(255,224,102,.28)';ctx.fill();
      ctx.lineWidth=2;ctx.strokeStyle='#ffe066';ctx.stroke();
    }
  }

  /* marcadores */
  var vis=[];
  for(i=0;i<D.length;i++){
    d=D[i];if(!estadoMapa.on[i])continue;
    var p2=proj2D(d.lng,d.lat,R2,cx,cy);
    if(p2.x<-40||p2.x>W+40||p2.y<-40||p2.y>H+40)continue;
    d.sx=p2.x;d.sy=p2.y;d.vz=1;vis.push(d);
  }
  if(ganchos.ocultarMarcadores())vis=[];
  var mr=Math.max(3.2,Math.min(6,R2*0.032));
  for(i=0;i<vis.length;i++){
    d=vis[i];
    var rr=(d===estadoMapa.selected)?mr*1.9:mr;
    if(d===estadoMapa.selected){ctx.beginPath();ctx.arc(d.sx,d.sy,rr+5,0,7);ctx.fillStyle='rgba(255,255,255,.22)';ctx.fill();}
    ctx.beginPath();shapePath(d.sx,d.sy,rr,SHAPES[d.r]);
    ctx.fillStyle=REG[d.r].c;ctx.fill();
    ctx.lineWidth=d===estadoMapa.selected?2.2:1.2;ctx.strokeStyle='#fff';ctx.stroke();
  }

  if((estadoCamera.zoom>=1.4||estadoMapa.selected)&&!ganchos.treinoAberto()){
    ctx.lineJoin='round';
    var used=[],selB=null;
    if(estadoMapa.selected&&estadoMapa.on[estadoMapa.selected.i]&&vis.indexOf(estadoMapa.selected)>=0){
      selB=selBadgeMetrics(estadoMapa.selected);
      used.push({x:selB.bx-6,y:selB.by-6,w:selB.bw+12,h:selB.bh+12});
    }
    for(i=0;i<vis.length;i++){
      d=vis[i];
      if(d===estadoMapa.selected||estadoCamera.zoom<1.4)continue;
      ctx.font='500 10.5px '+FONT;ctx.textBaseline='middle';ctx.lineWidth=3;
      var t=d.flag+' '+(estadoMapa.labelMode==='p'||d.uni?short(d):capShort(d));
      var w=ctx.measureText(t).width;
      var rx=d.sx+mr+5,rct={x:rx-2,y:d.sy-8,w:w+4,h:16};
      if(rx+w>W-4){rct.x=d.sx-mr-5-w-2;rx=rct.x+2;}
      var clash=false;
      for(var u=0;u<used.length;u++){var U=used[u];if(!(rct.x>U.x+U.w||rct.x+rct.w<U.x||rct.y>U.y+U.h||rct.y+rct.h<U.y)){clash=true;break;}}
      if(clash)continue;
      used.push(rct);
      ctx.globalAlpha=.8;ctx.strokeStyle='rgba(4,16,36,.85)';ctx.strokeText(t,rx,d.sy);
      ctx.fillStyle='#fff';ctx.fillText(t,rx,d.sy);ctx.globalAlpha=1;
    }
    if(selB)paintSelBadge(selB);
  }
  ganchos.desenharSeloResposta(0,cx,cy);
}
function setFlat2D(v){
  flat2D=v;lsSet('globo.flat2d',v);
  $('flat2d').setAttribute('aria-pressed',v?'true':'false');
  $('flat2d').textContent=v?'🌐':'🗺️';
  $('flat2d').setAttribute('aria-label',v?'Ver como globo':'Ver como mapa 2D');
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  flat2D = lsGet('globo.flat2d',false);
  $('flat2d').onclick=function(){setFlat2D(!flat2D);};
  setFlat2D(flat2D);
}

export { draw2D, flat2D, iniciar, inv2D, proj2D, R2now, setFlat2D };
