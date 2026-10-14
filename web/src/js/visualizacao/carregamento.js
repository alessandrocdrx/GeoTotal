/**
 * @arquivo js/visualizacao/carregamento.js
 * Camada: Visualização
 * Carregamento do mapa: bibliotecas, contornos dos países e textura, com cache no IndexedDB.
 */

import { emitir } from '../nucleo/eventos.js';
import { setStatus } from '../nucleo/utilitarios.js';
import { setupGeo, tryLoad } from './fronteiras.js';
import { estadoRender } from './projecao.js';
import { buildTexture, updateOpts } from './textura.js';
import { initGL, uploadTexture } from './webgl.js';

/* ---------- armazenamento local (IndexedDB) ---------- */
function idb(){return new Promise(function(ok,no){try{var r=indexedDB.open('globo-cache',1);r.onupgradeneeded=function(){r.result.createObjectStore('kv');};r.onsuccess=function(){ok(r.result);};r.onerror=function(){no(r.error);};}catch(e){no(e);}});}
function idbGet(k){return idb().then(function(db){return new Promise(function(ok,no){var q=db.transaction('kv','readonly').objectStore('kv').get(k);q.onsuccess=function(){ok(q.result);};q.onerror=function(){no(q.error);};});}).catch(function(){return undefined;});}
function idbSet(k,v){return idb().then(function(db){return new Promise(function(ok,no){var t=db.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=ok;t.onerror=function(){no(t.error);};});}).catch(function(){});}
function idbDel(k){return idb().then(function(db){return new Promise(function(ok,no){var t=db.transaction('kv','readwrite');t.objectStore('kv').delete(k);t.oncomplete=ok;t.onerror=function(){no(t.error);};});}).catch(function(){});}
function blobToImg(b){return new Promise(function(ok,no){var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){ok(im);};im.onerror=no;im.src=fr.result;};fr.onerror=no;fr.readAsDataURL(b);});}
function blobToTexCanvas(b){return blobToImg(b).then(function(im){var c=document.createElement('canvas');c.width=2048;c.height=1024;c.getContext('2d').drawImage(im,0,0,2048,1024);return c;});}
let texCanvas = null;
/* a textura muda com a neve de cada mês: uma chave por mês (as dos outros meses são apagadas) */
function chaveTex(){return 'tex-proc-m'+new Date().getMonth();}
function setTextureFrom(c){
  if(uploadTexture(c)){estadoRender.useTex=true;texCanvas=c;updateOpts();return true;}
  return false;
}
function genTexture(){
  if(!estadoRender.gl||!estadoRender.feats)return;
  setStatus('Gerando a textura do globo… 0%');
  buildTexture(function(tc){
    if(setTextureFrom(tc)){
      setStatus('Pronto: textura gerada e salva neste aparelho.',3500);
      tc.toBlob(function(b){if(b)idbSet(chaveTex(),b);},'image/jpeg',.9);
    }else setStatus('A textura não pôde ser usada neste aparelho.',7000);
  },function(p){setStatus('Gerando a textura do globo… '+p+'%');});
}
function loadD3Topo(){
  return tryLoad(['https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.min.js','https://cdn.jsdelivr.net/npm/d3@3.5.17/d3.min.js'],function(){return window.d3&&d3.geo&&d3.geo.orthographic;})
  .then(function(){return tryLoad(['https://cdnjs.cloudflare.com/ajax/libs/topojson/1.6.9/topojson.min.js','https://cdn.jsdelivr.net/npm/topojson@1.6.9/topojson.min.js'],function(){return window.topojson&&topojson.feature;});});
}
function loadDM(){
  return tryLoad(['https://cdn.jsdelivr.net/npm/datamaps@0.5.9/dist/datamaps.world.min.js','https://cdnjs.cloudflare.com/ajax/libs/datamaps/0.5.9/datamaps.world.min.js','https://cdn.jsdelivr.net/npm/datamaps@0.5.8/dist/datamaps.world.min.js'],function(){return window.Datamap&&Datamap.prototype&&Datamap.prototype.worldTopo;});
}
function startMap(){
  var okGL=initGL();
  setStatus('Carregando o mapa…');
  var pTex=!okGL?Promise.resolve(false):
    idbGet(chaveTex()).then(function(b){
      if(!b)return false;
      return blobToTexCanvas(b).then(function(c){return setTextureFrom(c);}).catch(function(){return false;});
    });
  /* textura e fronteiras importadas por versões antigas (a importação saiu do menu): apaga as sobras */
  idbDel('tex-custom');idbDel('borders');idbDel('tex-proc');
  for(var m=0;m<12;m++)if('tex-proc-m'+m!==chaveTex())idbDel('tex-proc-m'+m);
  pTex.then(function(okTex){
    if(okTex)setStatus('Textura carregada do aparelho. Carregando fronteiras…');
    return loadD3Topo().then(function(){
      return loadDM().then(function(){return setupGeo();});
    });
  }).then(function(m){
    emitir('fronteiras-carregadas');updateOpts();
    if(!okGL){setStatus('Fronteiras carregadas ('+m+' países com contorno). Este aparelho não suporta a textura 3D.',7000);return;}
    if(estadoRender.useTex){setStatus('Pronto: fronteiras carregadas ('+m+' países com contorno).',3500);return;}
    genTexture();
  },function(){
    updateOpts();
    setStatus(estadoRender.useTex?'Textura carregada, mas não consegui carregar as fronteiras (a biblioteca de mapas não abriu).':'Não consegui carregar as fronteiras (a biblioteca de mapas não abriu). O globo segue funcionando sem elas.',9000);
  });
}
function fixWind(f){
  var g=f.geometry;if(!g)return f;
  function fixPoly(coords){
    try{if(d3.geo.area({type:'Polygon',coordinates:coords})>2*Math.PI)return coords.map(function(r){return r.slice().reverse();});}catch(e){}
    return coords;
  }
  if(g.type==='Polygon')g.coordinates=fixPoly(g.coordinates);
  else if(g.type==='MultiPolygon')g.coordinates=g.coordinates.map(fixPoly);
  return f;
}

export { fixWind, idbGet, idbSet, startMap, texCanvas };
