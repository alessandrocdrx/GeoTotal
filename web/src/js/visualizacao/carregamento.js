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
/* a textura muda com a neve de cada mês: uma chave por mês. O mês é o de hoje, ou o escolhido no
   botão 🏷️ (estadoRender.mesMapa); as texturas de outros meses são apagadas ao abrir o app */
function mesDoMapa(){return estadoRender.mesMapa==null?new Date().getMonth():estadoRender.mesMapa;}
function chaveTex(){return 'tex-proc-m'+mesDoMapa();}
function setTextureFrom(c){
  if(uploadTexture(c)){estadoRender.useTex=true;texCanvas=c;updateOpts();return true;}
  return false;
}
function genTexture(){
  if(!estadoRender.gl||!estadoRender.feats)return;
  setStatus('Gerando a textura do globo… 0%');
  var chave=chaveTex();
  buildTexture(function(tc){
    if(setTextureFrom(tc)){
      setStatus('Pronto: textura gerada e salva neste aparelho.',3500);
      tc.toBlob(function(b){if(b)idbSet(chave,b);},'image/jpeg',.9);
    }else setStatus('A textura não pôde ser usada neste aparelho.',7000);
  },function(p){setStatus('Gerando a textura do globo… '+p+'%');},mesDoMapa());
}
/** Troca a textura para o mês do mapa (do aparelho, se já foi feita; senão gera). */
function trocarMes(){
  if(!estadoRender.gl||!estadoRender.feats)return;
  idbGet(chaveTex()).then(function(b){
    if(!b){genTexture();return;}
    blobToTexCanvas(b).then(function(c){setTextureFrom(c);}).catch(genTexture);
  });
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
  /* sem WebGL o globo não aparece: abre o mapa plano (que não usa WebGL) e diz o motivo */
  if(!okGL){
    emitir('sem-webgl');
    /* depois que o Treino abre: a tela de partida limpa a barra de avisos ao abrir */
    setTimeout(function(){setStatus('Seu celular não abriu o globo 3D (WebGL). Mostrando o mapa plano.',12000);},2000);
  }
  var pTex=!okGL?Promise.resolve(false):
    idbGet(chaveTex()).then(function(b){
      if(!b)return false;
      return blobToTexCanvas(b).then(function(c){return setTextureFrom(c);}).catch(function(){return false;});
    });
  /* textura e fronteiras importadas por versões antigas (a importação saiu do menu): apaga as sobras */
  idbDel('tex-custom');idbDel('borders');idbDel('tex-proc');
  for(var m=0;m<12;m++)if(m!==mesDoMapa()&&m!==new Date().getMonth())idbDel('tex-proc-m'+m);
  pTex.then(function(okTex){
    if(okTex)setStatus('Textura carregada do aparelho. Carregando fronteiras…');
    return loadD3Topo().then(function(){
      return loadDM().then(function(){return setupGeo();});
    });
  }).then(function(m){
    emitir('fronteiras-carregadas');updateOpts();
    if(!okGL)return;
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

export { fixWind, idbGet, idbSet, startMap, texCanvas, trocarMes };
