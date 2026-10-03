/**
 * @arquivo js/visualizacao/enquadramento.js
 * Camada: Visualização
 * Enquadramento da câmera: região que cada país ocupa no globo e o zoom para mostrá-la inteira.
 */

import { D } from '../dados/paises.js';
import { flyTo, PI } from './animacao.js';
import { estadoRender } from './fronteiras.js';
import { ganchos } from './ganchos.js';
import { estadoCamera, H, R0, W } from './globo.js';

/* vistas já calculadas por país (zera quando os contornos mudam) */
let cacheVistas = {};
function limparCacheVistas(){cacheVistas={};}
const EXT_FB = {CL:20,AR:17,NO:12,SE:8,FI:7,IT:8,JP:14,PH:9,VN:9,ID:25,MY:10,NZ:12,RU:42,US:23,CA:30,MX:14,CN:25,IN:16,BR:24,KZ:15,MN:13,EG:10,LY:10,DZ:12,SD:11,CD:14,PE:9,CO:9,SA:12,IR:12,ZA:9,AU:22,GR:5,PT:5,GB:6,CU:6,TR:11,TH:8,MM:9,CL_:0};

function featView(f){
  if(!(f&&f.geometry&&window.d3&&d3.geo&&d3.geo.area))return null;
  try{
    var g=f.geometry,polys=g.type==='Polygon'?[g.coordinates]:(g.type==='MultiPolygon'?g.coordinates:[]);
    var arr=polys.map(function(pl){return {pl:pl,a:d3.geo.area({type:'Polygon',coordinates:pl})};});
    arr.sort(function(x,y){return y.a-x.a;});
    var tot=arr.reduce(function(t,x){return t+x.a;},0),acc=0,use=[],k;
    for(k=0;k<arr.length;k++){use.push(arr[k]);acc+=arr[k].a;if(acc>=0.75*tot)break;}
    var vs=[],sx=0,sy=0,sz=0;
    use.forEach(function(u){u.pl[0].forEach(function(c){
      var la=c[1]*PI/180,lo=c[0]*PI/180,x=Math.cos(la)*Math.sin(lo),y=Math.sin(la),z=Math.cos(la)*Math.cos(lo);
      vs.push([x,y,z]);sx+=x;sy+=y;sz+=z;});});
    var m=Math.sqrt(sx*sx+sy*sy+sz*sz);
    if(!vs.length||!(m>0))return null;
    var cx=sx/m,cy=sy/m,cz=sz/m,it,far,best,dd,v;
    for(it=1;it<=40;it++){
      far=null;best=2;
      for(k=0;k<vs.length;k++){v=vs[k];dd=v[0]*cx+v[1]*cy+v[2]*cz;if(dd<best||far===null){best=dd;far=v;}}
      cx+=(far[0]-cx)/(it+1);cy+=(far[1]-cy)/(it+1);cz+=(far[2]-cz)/(it+1);
      m=Math.sqrt(cx*cx+cy*cy+cz*cz);cx/=m;cy/=m;cz/=m;
    }
    var r=0;
    for(k=0;k<vs.length;k++){v=vs[k];dd=v[0]*cx+v[1]*cy+v[2]*cz;r=Math.max(r,Math.acos(Math.max(-1,Math.min(1,dd))));}
    return {lat:Math.asin(cy)*180/PI,lng:Math.atan2(cx,cz)*180/PI,r:r};
  }catch(e){return null;}
}

function countryView(i){
  if(cacheVistas[i])return cacheVistas[i];
  var d=D[i],f=estadoRender.FEAT[i];
  if(f){var fv=featView(f);if(fv)return (cacheVistas[i]=fv);}
  /* sem contorno: usa a área e a posição da capital (com extensão manual para países alongados) */
  var a=d.info?d.info.area:50000,ex=EXT_FB[d.cc];
  return {lat:d.lat,lng:d.lng,r:ex?ex*Math.PI/180:Math.sqrt(a/Math.PI)/6371*1.4};
}

function zoomFor(r,cap){
  var reserved=ganchos.treinoAberto()?ganchos.alturaTreino():(ganchos.alturaCartao()||H*0.4);
  var avail=Math.max(60,Math.min(W,H-reserved)/2);
  var sn=Math.sin(Math.min(Math.max(r,0.004)*1.1+0.015,1.45));
  return Math.max(1,Math.min(cap||5.5,0.8*avail/(R0*sn)));
}

function showCountry(i){var v=countryView(i);flyTo(v.lat,v.lng,zoomFor(v.r,3.4));}

function resetView(){flyTo(estadoCamera.phi*180/PI,estadoCamera.lam*180/PI,1);}

export { countryView, featView, limparCacheVistas, resetView, showCountry, zoomFor };
