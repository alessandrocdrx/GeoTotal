/**
 * @arquivo js/visualizacao/natureza.js
 * Camada: Visualização
 * Camadas do botão 🏷️ além das águas: zonas climáticas (faixas e linhas) e os nomes de desertos,
 * florestas e cordilheiras. Servem ao globo e ao mapa 2D: quem chama passa a projeção.
 */

import { FAIXAS_ZONAS, LINHAS_ZONAS, NATUREZA } from '../dados/natureza.js';
import { estadoRender } from './projecao.js';
import { ctx, FONT, H, W } from './tela.js';

function hexA(h,a){var n=parseInt(h.slice(1),16);return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')';}
function cabe(r,usados){
  for(var u=0;u<usados.length;u++){var U=usados[u];if(!(r.x>U.x+U.w||r.x+r.w<U.x||r.y>U.y+U.h||r.y+r.h<U.y))return false;}
  return true;
}
/* escreve com contorno, para ler sobre qualquer fundo; devolve false se bateu em outro nome */
function rotulo(t,x,y,fs,cor,halo,usados){
  ctx.font='700 '+fs+'px '+FONT;
  var w=ctx.measureText(t).width;
  x=Math.max(w/2+4,Math.min(W-w/2-58,x));  /* 58: a coluna de botões à direita */
  var r={x:x-w/2-3,y:y-fs*.75,w:w+6,h:fs*1.5};
  if(!cabe(r,usados))return false;
  usados.push(r);
  ctx.lineWidth=3;ctx.lineJoin='round';ctx.strokeStyle=halo;ctx.strokeText(t,x,y);
  ctx.fillStyle=cor;ctx.fillText(t,x,y);
  return true;
}

/**
 * Faixas e linhas das zonas climáticas. pt(lat, lng) devolve [x, y, z] na tela (z > 0 = visível);
 * plano = mapa 2D (corta no salto de 180°). Os nomes vêm em rotulosZonas, nas longitudes lngLinhas e
 * lngFaixas (nas laterais, para não cobrir o centro).
 */
function desenharZonas(pt,plano){
  if(!estadoRender.camadas.zonas)return;
  var atlas=estadoRender.atlas&&!!estadoRender.feats,k,lo,la,p;
  /* faixas coloridas, em quadradinhos de 6° de longitude */
  FAIXAS_ZONAS.forEach(function(f){
    ctx.beginPath();
    var passoLa=(f[1]-f[0])/4;
    for(lo=-180;lo<180;lo+=6){
      for(la=f[0];la<f[1]-1e-6;la+=passoLa){
        var c=[pt(la,lo),pt(la,lo+6),pt(la+passoLa,lo+6),pt(la+passoLa,lo)];
        if(c[0][2]<=0||c[1][2]<=0||c[2][2]<=0||c[3][2]<=0)continue;
        if(plano&&Math.abs(c[1][0]-c[0][0])>W/2)continue;
        ctx.moveTo(c[0][0],c[0][1]);for(k=1;k<4;k++)ctx.lineTo(c[k][0],c[k][1]);ctx.closePath();
      }
    }
    ctx.fillStyle=hexA(f[3],atlas?.2:.13);ctx.fill();
  });
  /* linhas tracejadas */
  ctx.save();ctx.setLineDash([7,5]);
  LINHAS_ZONAS.forEach(function(l){
    ctx.beginPath();var pen=false,px=0;
    for(lo=-180;lo<=180;lo+=3){
      p=pt(l[0],lo);
      if(p[2]>0&&!(plano&&pen&&Math.abs(p[0]-px)>W/2)){if(pen)ctx.lineTo(p[0],p[1]);else{ctx.moveTo(p[0],p[1]);pen=true;}}else pen=false;
      px=p[0];
    }
    ctx.lineWidth=l[0]===0?1.6:1.2;ctx.strokeStyle=atlas?'rgba(140,40,40,.75)':'rgba(255,224,102,.8)';ctx.stroke();
  });
  ctx.restore();
}
/** Nomes das linhas e das faixas (depois dos outros nomes: só entram onde sobra espaço). */
function rotulosZonas(pt,lngLinhas,lngFaixas,usados){
  if(!estadoRender.camadas.zonas)return;
  var atlas=estadoRender.atlas&&!!estadoRender.feats,p;
  /* nomes: das linhas logo acima delas (à esquerda) e das faixas (à direita) */
  ctx.textAlign='center';ctx.textBaseline='middle';
  var cor=atlas?'#7a2323':'#ffe8a3',halo=atlas?'rgba(255,255,255,.85)':'rgba(4,16,36,.85)';
  LINHAS_ZONAS.forEach(function(l){
    p=pt(l[0],lngLinhas);if(p[2]<=0.25)return;
    rotulo(l[1]+' '+Math.abs(l[0]).toLocaleString('pt-BR')+'°'+(l[0]>0?' N':l[0]<0?' S':''),p[0],p[1]-9,10.5,cor,halo,usados);
  });
  FAIXAS_ZONAS.forEach(function(f){
    var meio=f[2]==='Zona tropical'?11:(f[0]+f[1])/2;
    p=pt(meio,lngFaixas);if(p[2]<=0.25)return;
    rotulo(f[2].toUpperCase(),p[0],p[1],11,atlas?'#3a3a3a':'#fff',halo,usados);
  });
  ctx.textAlign='left';
}

const TIPOS = {
  d:['desertos','🏜️','#8a4b12','#ffd59a'],
  f:['florestas','🌳','#1d6b2f','#b4f5b4'],
  m:['montanhas','⛰️','#5b4636','#ecd9c6'],
};
/** Nomes de desertos, florestas e cordilheiras. projetar(item) devolve {x, y, a} ou null. */
function desenharNatureza(projetar,zoom,usados){
  var cam=estadoRender.camadas;
  if(!cam.desertos&&!cam.florestas&&!cam.montanhas)return;
  var atlas=estadoRender.atlas&&!!estadoRender.feats,nivel=zoom>=2.2?2:1;
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(var k=0;k<NATUREZA.length;k++){
    var n=NATUREZA[k],t=TIPOS[n.tipo];
    if(!cam[t[0]]||n.nivel>nivel)continue;
    var p=projetar(n);if(!p||p.x<-80||p.x>W+80||p.y<-20||p.y>H+20)continue;
    ctx.globalAlpha=p.a;
    rotulo(t[1]+' '+n.nome,p.x,p.y,11,atlas?t[2]:t[3],atlas?'rgba(255,255,255,.85)':'rgba(4,16,36,.85)',usados);
    ctx.globalAlpha=1;
  }
  ctx.textAlign='left';
}

export { desenharNatureza, desenharZonas, rotulosZonas };
