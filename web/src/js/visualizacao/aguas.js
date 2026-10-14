/**
 * @arquivo js/visualizacao/aguas.js
 * Camada: Visualização
 * Nomes dos oceanos e dos mares, no globo e no mapa 2D. Os mares menores só aparecem com o mapa
 * mais perto, e um nome nunca é escrito por cima de outro (usados = áreas já ocupadas). As camadas ligam e desligam no botão 🏷️.
 */

import { OC } from '../dados/oceanos-polos.js';
import { REGIOES } from '../dados/regioes-naturais.js';
import { estadoRender } from './projecao.js';
import { ctx, FONT } from './tela.js';

function cabe(r,usados){
  for(var u=0;u<usados.length;u++){var U=usados[u];if(!(r.x>U.x+U.w||r.x+r.w<U.x||r.y>U.y+U.h||r.y+r.h<U.y))return false;}
  return true;
}

/**
 * Escreve os nomes. projetar(item) devolve {x, y, a} (a = opacidade de 0 a 1) ou null se não aparece.
 * zoom decide quais mares entram; escala é o tamanho do mapa na tela (raio do globo).
 */
function desenharAguas(projetar,escala,zoom,usados){
  var cam=estadoRender.camadas,atlas=estadoRender.atlas&&!!estadoRender.feats;
  usados=usados||[];
  if(!cam.oceanos&&!cam.mares)return usados;
  /* no atlas o mar é claro: letra azul-escura; no satélite, azul-clara */
  var cor=atlas?'30,78,128':'168,214,255',k,p;
  ctx.textAlign='center';ctx.textBaseline='middle';
  var fs=Math.max(9,Math.min(24,escala*0.06));
  if(cam.oceanos){
    ctx.font='italic 600 '+fs+'px '+FONT;
    if('letterSpacing' in ctx)ctx.letterSpacing=(fs*0.2)+'px';
    for(k=0;k<OC.length;k++){
      var oc=OC[k];p=projetar(oc);if(!p)continue;
      var w=Math.max(ctx.measureText(oc.l1).width,ctx.measureText(oc.l2).width),ro={x:p.x-w/2,y:p.y-fs*1.3,w:w,h:fs*2.6};
      if(!cabe(ro,usados))continue;
      usados.push(ro);
      ctx.fillStyle='rgba('+cor+','+(p.a*.9)+')';
      ctx.fillText(oc.l1,p.x,p.y-fs*.62);ctx.fillText(oc.l2,p.x,p.y+fs*.72);
    }
    if('letterSpacing' in ctx)ctx.letterSpacing='0px';
  }
  if(cam.mares){
    var fm=Math.max(9,Math.min(14,fs*.62)),nivel=zoom>=2.2?2:1;
    ctx.font='italic 600 '+fm+'px '+FONT;
    for(k=0;k<REGIOES.length;k++){
      var m=REGIOES[k];if(m.tipo!=='w'||m.nivel>nivel)continue;
      p=projetar(m);if(!p)continue;
      var tw=ctx.measureText(m.nome).width,r={x:p.x-tw/2-3,y:p.y-fm*.75,w:tw+6,h:fm*1.5};
      if(!cabe(r,usados))continue;
      usados.push(r);
      ctx.fillStyle='rgba('+cor+','+(p.a*.82)+')';
      ctx.fillText(m.nome,p.x,p.y);
    }
  }
  ctx.textAlign='left';
  return usados;
}

export { desenharAguas };
