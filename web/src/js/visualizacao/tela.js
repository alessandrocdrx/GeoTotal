/**
 * @arquivo js/visualizacao/tela.js
 * Camada: Visualização
 * Base da visualização: canvas, tamanho da tela, câmera, países ligados no mapa e rotação do globo.
 */

import { D } from '../dados/paises.js';
import { lsGet } from '../nucleo/utilitarios.js';

const PI = Math.PI;

/** Estado compartilhado com outros módulos (leitura e escrita por estadoCamera.nome). */
const estadoCamera = {
  dragging: false,
  lam: -0.9,
  phi: 0.25,
  zoom: 1,
  cyFrac: .5,
  target: null,
  auto: true,
  lastInteract: 0,
  /** Mapa 2D (planisfério) em vez do globo. */
  plano2D: false,
};
/** Estado compartilhado com outros módulos (leitura e escrita por estadoMapa.nome). */
const estadoMapa = {
  selected: null,
  labelMode: 'p',
  includeDisputed: undefined,
  includeDep: undefined,
  includeUni: undefined,
  on: undefined,
};
let cv;
let ctx;
let W = 0;
let H = 0;
let R0 = 0;
let dpr = 1;
function avail(d){return (!d.dis||estadoMapa.includeDisputed)&&(!d.dep||estadoMapa.includeDep)&&(!d.uni||estadoMapa.includeUni);}
function availCount(){return D.filter(avail).length;}
let reduce;
const FONT = 'system-ui,-apple-system,Segoe UI,Roboto,"Noto Color Emoji",sans-serif';
function resize(){
  var r=cv.getBoundingClientRect();W=r.width;H=r.height;
  dpr=Math.min(window.devicePixelRatio||1,2);
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
  glc.width=cv.width;glc.height=cv.height;
  R0=Math.min(W,H)*0.44;
}
let cosL;
let sinL;
let cosP;
let sinP;
/** Atualiza a rotação usada por rot() a partir da câmera (uma vez por quadro). */
function girar(){cosL=Math.cos(estadoCamera.lam);sinL=Math.sin(estadoCamera.lam);cosP=Math.cos(estadoCamera.phi);sinP=Math.sin(estadoCamera.phi);}
function rot(x,y,z){
  var x1=x*cosL-z*sinL, z1=x*sinL+z*cosL;
  var y2=y*cosP-z1*sinP, z2=y*sinP+z1*cosP;
  return [x1,y2,z2];
}
function allOn(){return D.every(function(d){return estadoMapa.on[d.i]||!avail(d);});}
function firstOn(){for(var i=0;i<D.length;i++)if(estadoMapa.on[i])return i;return -1;}
function visIdx(){var v=[];estadoMapa.on.forEach(function(x,k){if(x)v.push(k);});return v;}
let glc;
/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  cv = document.getElementById('g');
  ctx = cv.getContext('2d');
  glc = document.getElementById('gl');
  estadoMapa.includeDisputed = lsGet('globo.includeDisputed',true);
  estadoMapa.includeDep = lsGet('globo.includeDep',false);
  estadoMapa.includeUni = lsGet('globo.includeUni',false);
  estadoMapa.on = D.map(function(d){return avail(d)?1:0;});
  reduce = window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce)estadoCamera.auto=false;
  window.addEventListener('resize',resize);
}

export { allOn, avail, availCount, ctx, cv, dpr, estadoCamera, estadoMapa, firstOn, FONT, girar, glc, H, iniciar, PI, R0, resize, rot, visIdx, W };
