/**
 * @arquivo js/visualizacao/selo.js
 * Camada: Visualização
 * Selo com nome e capital do país selecionado, desenhado sobre o globo.
 */

import { qcapDisp, REG } from '../dados/paises.js';
import { capShort, short } from '../dados/vizinhos.js';
import { ctx, estadoMapa, FONT, W } from './tela.js';

function selBadgeMetrics(d){
  var t1=estadoMapa.labelMode==='p'||d.uni?short(d):capShort(d),t2=d.uni?d.cap:estadoMapa.labelMode==='p'?('Capital: '+qcapDisp(d)):('País: '+short(d));
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

export { paintSelBadge, selBadgeMetrics };
