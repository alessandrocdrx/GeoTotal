/**
 * @arquivo js/visualizacao/projecao.js
 * Camada: Visualização
 * Estado do desenho (fronteiras, textura, WebGL), projeção do globo e "em qual país caiu este ponto".
 */

import { D } from '../dados/paises.js';
import { estadoCamera, estadoMapa, H, PI, R0, W } from './tela.js';

/** Estado compartilhado com outros módulos (leitura e escrita por estadoRender.nome). */
const estadoRender = {
  gl: null,
  glProg: null,
  glTex: null,
  glBuf: null,
  useTex: false,
  optTex: true,
  /** Globo cartoon: textura de cores vivas e contorno grosso, sem relevo fino nem noite */
  cartoon: false,
  optBor: true,
  optFill: false,
  feats: null,
  FEAT: undefined,
  EXTRA: [],
  proj: null,
  gpath: null,
};

function hexA(h,a){var n=parseInt(h.slice(1),16);return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')';}

function projCfg(R,cx,cy){estadoRender.proj.scale(R).translate([cx,cy]).rotate([-estadoCamera.lam*180/PI,-estadoCamera.phi*180/PI]);}

function inRing(x,y,r){var c=false;for(var i=0,j=r.length-1;i<r.length;j=i++){var xi=r[i][0],yi=r[i][1],xj=r[j][0],yj=r[j][1];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;}return c;}

function inFeat(f,x,y){
  var g=f.geometry;if(!g)return false;
  var polys=g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];
  for(var a=0;a<polys.length;a++){
    var p=polys[a];
    if(inRing(x,y,p[0])){var hole=false;for(var h=1;h<p.length;h++)if(inRing(x,y,p[h]))hole=true;if(!hole)return true;}
  }
  return false;
}

function countryAt(x,y){
  if(!estadoRender.feats)return null;
  projCfg(R0*estadoCamera.zoom,W/2,H*estadoCamera.cyFrac);
  var ll=estadoRender.proj.invert([x,y]);
  if(!ll||isNaN(ll[0])||isNaN(ll[1]))return null;
  for(var i=0;i<D.length;i++)if(estadoMapa.on[i]&&estadoRender.FEAT[i]&&inFeat(estadoRender.FEAT[i],ll[0],ll[1]))return D[i];
  return null;
}

export { countryAt, estadoRender, hexA, inFeat, projCfg };
