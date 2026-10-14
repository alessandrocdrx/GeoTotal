/**
 * @arquivo js/visualizacao/natureza.js
 * Camada: Visualização
 * Camadas do botão 🏷️ além das águas: zonas climáticas (faixas e linhas) e as áreas de desertos,
 * florestas, cordilheiras e planaltos, com os nomes. Servem ao globo e ao mapa 2D: quem chama passa a projeção.
 */

import { REGIOES } from '../dados/regioes-naturais.js';
import { FAIXAS_ZONAS, LINHAS_ZONAS } from '../dados/zonas-climaticas.js';
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

/* camada, ícone, cor do nome no atlas e no satélite, preenchimento, contorno */
const TIPOS = {
  d:['desertos','🏜️','#8a4b12','#ffd59a','rgba(240,196,100,.42)','#d99a2b'],
  f:['florestas','🌳','#1d6b2f','#b4f5b4','rgba(46,160,70,.40)','#2e8b3e'],
  m:['montanhas','⛰️','#5b3a24','#ecd9c6','rgba(130,82,48,.40)','#8b5a2b'],
  p:['montanhas','🏔️','#6b5238','#e2d3bf','rgba(185,150,105,.30)','#a98656'],
};
/* texturas: pontinhos de areia nos desertos, listras no relevo, folhinhas nas florestas */
const PADROES = {};
function padrao(t){
  if(PADROES[t]!==undefined)return PADROES[t];
  var c=document.createElement('canvas');c.width=c.height=10;var g=c.getContext('2d');
  if(t==='d'){g.fillStyle='rgba(150,95,20,.55)';g.fillRect(2,2,1.4,1.4);g.fillRect(7,6,1.4,1.4);}
  else if(t==='m'){g.strokeStyle='rgba(80,45,20,.55)';g.lineWidth=1.2;g.beginPath();g.moveTo(0,10);g.lineTo(10,0);g.stroke();}
  else if(t==='f'){g.fillStyle='rgba(10,90,30,.5)';g.beginPath();g.arc(3,3,1.5,0,7);g.arc(8,8,1.5,0,7);g.fill();}
  else {PADROES[t]=null;return null;}
  PADROES[t]=ctx.createPattern(c,'repeat');
  return PADROES[t];
}

/**
 * Áreas de desertos, relevo e florestas, com cor, textura e contorno.
 * tracar(feature) acrescenta o contorno ao caminho atual (globo: d3; 2D: a projeção plana);
 * terra() acrescenta todos os países, para recortar as florestas (desenhadas à mão) pela costa.
 */
function desenharAreas(tracar,terra){
  var cam=estadoRender.camadas;
  if(!cam.desertos&&!cam.florestas&&!cam.montanhas)return;
  ['p','m','d','f'].forEach(function(t){
    var T=TIPOS[t];if(!cam[T[0]])return;
    ctx.save();
    if(t==='f'){ctx.beginPath();terra();ctx.clip();}
    ctx.beginPath();
    for(var k=0;k<REGIOES.length;k++)if(REGIOES[k].tipo===t)tracar(REGIOES[k]);
    ctx.fillStyle=T[4];ctx.fill();
    var pd=padrao(t);if(pd){ctx.fillStyle=pd;ctx.fill();}
    ctx.lineJoin='round';ctx.lineWidth=1.3;ctx.strokeStyle=T[5];
    if(t==='p')ctx.setLineDash([4,3]);
    ctx.stroke();
    ctx.restore();
  });
}
/** Nomes das áreas ligadas. projetar(item) devolve {x, y, a} ou null. */
function desenharNatureza(projetar,zoom,usados){
  var cam=estadoRender.camadas;
  if(!cam.desertos&&!cam.florestas&&!cam.montanhas)return;
  var atlas=estadoRender.atlas&&!!estadoRender.feats,nivel=zoom>=2.2?2:1;
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(var k=0;k<REGIOES.length;k++){
    var n=REGIOES[k],t=TIPOS[n.tipo];
    if(!cam[t[0]]||n.nivel>nivel)continue;
    var p=projetar(n);if(!p||p.x<4||p.x>W-50||p.y<4||p.y>H-4)continue;  /* fora da tela: sem nome (não puxa para a borda) */
    ctx.globalAlpha=p.a;
    rotulo(t[1]+' '+n.nome,p.x,p.y,11,atlas?t[2]:t[3],atlas?'rgba(255,255,255,.85)':'rgba(4,16,36,.85)',usados);
    ctx.globalAlpha=1;
  }
  ctx.textAlign='left';
}

export { desenharAreas, desenharNatureza, desenharZonas, rotulosZonas };
