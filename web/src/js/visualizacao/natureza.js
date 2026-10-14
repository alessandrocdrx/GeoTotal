/**
 * @arquivo js/visualizacao/natureza.js
 * Camada: Visualização
 * Camadas do botão 🏷️ além das águas: zonas climáticas (faixas e linhas) e as áreas de desertos,
 * florestas, cordilheiras e planaltos, com os nomes. Servem ao globo e ao mapa 2D: quem chama passa a projeção.
 */

import { REGIOES } from '../dados/regioes-naturais.js';
import { FAIXAS_ZONAS, LINHAS_ZONAS } from '../dados/zonas-climaticas.js';
import { estadoRender, inFeat } from './projecao.js';
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

/* camada, ícone, cor do nome no atlas e no satélite */
const TIPOS = {
  d:['desertos','🏜️','#8a5a12','#ffe2a8'],
  f:['florestas','🌳','#1f6a33','#bdf2c4'],
  m:['montanhas','⛰️','#5a4a44','#f1ece6'],
  p:['montanhas','🏔️','#6b5a45','#e8dcc8'],
  w:['mares','🌊','#1e4e80','#a8d6ff'],
};
/* aparência de cada tipo: [preenchimento, contorno, tracejado, desenho da textura] — no satélite o
   fundo já mostra o relevo, então só um véu claro e o contorno; no atlas, cores de atlas escolar */
const ESTILO = {
  sat:{
    d:['rgba(255,214,140,.16)','rgba(255,214,140,.85)',[],null],
    f:['rgba(110,215,130,.13)','rgba(140,230,150,.75)',[],null],
    m:['rgba(255,255,255,.07)','rgba(255,255,255,.6)',[],function(g){g.strokeStyle='rgba(255,255,255,.28)';g.lineWidth=1;g.beginPath();g.moveTo(0,8);g.lineTo(4,3);g.lineTo(8,8);g.stroke();}],
    p:[null,'rgba(236,220,190,.6)',[5,4],null],
    w:[null,'rgba(168,214,255,.4)',[3,4],null],
  },
  atlas:{
    d:['rgba(244,214,150,.45)','rgba(196,150,70,.8)',[],function(g){g.fillStyle='rgba(180,130,50,.45)';g.fillRect(1,2,1.2,1.2);g.fillRect(5,6,1.2,1.2);}],
    f:['rgba(80,165,95,.22)','rgba(55,130,70,.75)',[],null],
    m:['rgba(150,130,120,.14)','rgba(110,90,80,.7)',[],function(g){g.strokeStyle='rgba(110,90,80,.5)';g.lineWidth=1;g.beginPath();g.moveTo(0,8);g.lineTo(4,3);g.lineTo(8,8);g.stroke();}],
    p:[null,'rgba(150,125,90,.75)',[5,4],null],
    w:[null,'rgba(40,95,150,.4)',[3,4],null],
  },
};
const PADROES = {};
function padrao(modo,t){
  var k=modo+t;
  if(PADROES[k]!==undefined)return PADROES[k];
  var f=ESTILO[modo][t][3];
  if(!f){PADROES[k]=null;return null;}
  var c=document.createElement('canvas');c.width=c.height=8;f(c.getContext('2d'));
  PADROES[k]=ctx.createPattern(c,'repeat');
  return PADROES[k];
}

/**
 * Áreas de desertos, relevo e florestas, com cor, textura e contorno.
 * tracar(feature) acrescenta o contorno ao caminho atual (globo: d3; 2D: a projeção plana);
 * terra() acrescenta todos os países, para recortar as florestas (desenhadas à mão) pela costa.
 */
function desenharAreas(tracar,terra){
  var cam=estadoRender.camadas;
  var modo=estadoRender.atlas&&estadoRender.feats?'atlas':'sat';
  ['w','p','m','d','f'].forEach(function(t){
    var T=TIPOS[t],E=ESTILO[modo][t];if(!cam[T[0]])return;
    ctx.save();
    if(t==='f'){ctx.beginPath();terra();ctx.clip();}
    ctx.beginPath();
    for(var k=0;k<REGIOES.length;k++)if(REGIOES[k].tipo===t)tracar(REGIOES[k]);
    if(E[0]){ctx.fillStyle=E[0];ctx.fill();}
    var pd=padrao(modo,t);if(pd){ctx.fillStyle=pd;ctx.fill();}
    ctx.lineJoin='round';ctx.lineWidth=1.1;ctx.strokeStyle=E[1];ctx.setLineDash(E[2]);
    ctx.stroke();
    ctx.restore();
  });
  /* a área tocada fica em destaque */
  var sel=estadoRender.areaSel;
  if(sel){
    ctx.save();ctx.beginPath();tracar(sel);
    ctx.fillStyle='rgba(255,224,102,.22)';ctx.fill();
    ctx.lineJoin='round';ctx.lineWidth=2.4;ctx.strokeStyle='#ffd23f';ctx.stroke();ctx.restore();
  }
}
/**
 * Qual área (das camadas ligadas) está neste ponto. Terra primeiro (a menor ganha: o Ténéré dentro do
 * Saara); mar só se o ponto não está num país (sobreTerra = falso). Devolve o item ou null.
 */
function areaEm(lng,lat,sobreTerra){
  var cam=estadoRender.camadas,achou=null;
  for(var k=0;k<REGIOES.length;k++){
    var r=REGIOES[k],t=TIPOS[r.tipo];
    if(!cam[t[0]]||(r.tipo==='w')===!!sobreTerra)continue;
    var c=r.caixa;
    if(c[2]-c[0]<300&&(lng<c[0]||lng>c[2]||lat<c[1]||lat>c[3]))continue;
    if(inFeat(r,lng,lat)&&(!achou||r.area<achou.area))achou=r;
  }
  return achou;
}
/** Tipo da área em palavras (para o cartão). */
function tipoDaArea(r){
  return {d:'Deserto',f:'Floresta',m:'Cordilheira',p:'Planalto'}[r.tipo]||(r.especie?r.especie[0].toUpperCase()+r.especie.slice(1):'Mar');
}
/** Nomes das áreas ligadas. projetar(item) devolve {x, y, a} ou null. */
function desenharNatureza(projetar,zoom,usados){
  var cam=estadoRender.camadas;
  if(!cam.desertos&&!cam.florestas&&!cam.montanhas)return;
  var atlas=estadoRender.atlas&&!!estadoRender.feats,nivel=zoom>=2.2?2:1;
  /* os nomes dos mares saem em aguas.js, no estilo dos oceanos */
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(var k=0;k<REGIOES.length;k++){
    var n=REGIOES[k],t=TIPOS[n.tipo];
    if(n.tipo==='w'||!cam[t[0]]||n.nivel>nivel)continue;
    var p=projetar(n);if(!p||p.x<4||p.x>W-50||p.y<4||p.y>H-4)continue;  /* fora da tela: sem nome (não puxa para a borda) */
    ctx.globalAlpha=p.a;
    rotulo(t[1]+' '+n.nome,p.x,p.y,11,atlas?t[2]:t[3],atlas?'rgba(255,255,255,.85)':'rgba(4,16,36,.85)',usados);
    ctx.globalAlpha=1;
  }
  ctx.textAlign='left';
}

export { areaEm, desenharAreas, desenharNatureza, desenharZonas, rotulosZonas, TIPOS, tipoDaArea };
