/**
 * @arquivo js/nucleo/armazenamento.js
 * Camada: Núcleo
 * Armazenamento local (IndexedDB) de textura e fronteiras importadas.
 */
/* ---------- armazenamento local (IndexedDB) ---------- */
function idb(){return new Promise(function(ok,no){try{var r=indexedDB.open('globo-cache',1);r.onupgradeneeded=function(){r.result.createObjectStore('kv');};r.onsuccess=function(){ok(r.result);};r.onerror=function(){no(r.error);};}catch(e){no(e);}});}
function idbGet(k){return idb().then(function(db){return new Promise(function(ok,no){var q=db.transaction('kv','readonly').objectStore('kv').get(k);q.onsuccess=function(){ok(q.result);};q.onerror=function(){no(q.error);};});}).catch(function(){return undefined;});}
function idbSet(k,v){return idb().then(function(db){return new Promise(function(ok,no){var t=db.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=ok;t.onerror=function(){no(t.error);};});}).catch(function(){});}
function idbDel(k){return idb().then(function(db){return new Promise(function(ok,no){var t=db.transaction('kv','readwrite');t.objectStore('kv').delete(k);t.oncomplete=ok;t.onerror=function(){no(t.error);};});}).catch(function(){});}
function blobToImg(b){return new Promise(function(ok,no){var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){ok(im);};im.onerror=no;im.src=fr.result;};fr.onerror=no;fr.readAsDataURL(b);});}
function blobToTexCanvas(b){return blobToImg(b).then(function(im){var c=document.createElement('canvas');c.width=2048;c.height=1024;c.getContext('2d').drawImage(im,0,0,2048,1024);return c;});}
var texSource='nenhuma',bordersCustom=false,texCanvas=null;
function updateMapInfo(){
  var t={nenhuma:'ainda sem textura',proc:'gerada pelo app (salva neste aparelho)',custom:'imagem importada por você'}[texSource]||texSource;
  $('minfo').textContent='Textura: '+t+' · Fronteiras: '+(feats?(bordersCustom?'arquivo importado por você':'biblioteca de mapas'):'não carregadas');
}
function setTextureFrom(c,src){
  if(uploadTexture(c)){useTex=true;texSource=src;texCanvas=c;updateOpts();updateMapInfo();return true;}
  return false;
}
function genTexture(){
  if(!gl||!feats)return;
  setStatus('Gerando a textura do globo… 0%');
  buildTexture(function(tc){
    if(setTextureFrom(tc,'proc')){
      setStatus('Pronto: textura gerada e salva neste aparelho.',3500);
      tc.toBlob(function(b){if(b)idbSet('tex-proc',b);},'image/jpeg',.9);
    }else setStatus('A textura não pôde ser usada neste aparelho.',7000);
  },function(p){setStatus('Gerando a textura do globo… '+p+'%');});
}
function setupFeatures(list){
  feats=list;GEOM={};FEAT=D.map(function(){return null;});EXTRA=[];
  var by={};D.forEach(function(d){by[A3[d.cc]]=d.i;});
  var m=0;
  list.forEach(function(f){var i=by[f.id];if(i!==undefined&&!FEAT[i]){FEAT[i]=f;m++;}else EXTRA.push(f);});
  proj=d3.geo.orthographic().clipAngle(90).precision(0.6);
  gpath=d3.geo.path().projection(proj).context(ctx);
  return m;
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
    idbGet('tex-custom').then(function(b){return b?{b:b,src:'custom'}:idbGet('tex-proc').then(function(b2){return b2?{b:b2,src:'proc'}:null;});})
    .then(function(r){
      if(!r)return false;
      return blobToTexCanvas(r.b).then(function(c){return setTextureFrom(c,r.src);}).catch(function(){return false;});
    });
  Promise.all([pTex,idbGet('borders')]).then(function(res){
    var bstr=res[1];
    if(res[0])setStatus('Textura carregada do aparelho. Carregando fronteiras…');
    return loadD3Topo().then(function(){
      if(bstr){
        try{var m=setupFeatures(JSON.parse(bstr).features);bordersCustom=true;return m;}catch(e){bordersCustom=false;}
      }
      return loadDM().then(function(){return setupGeo();});
    });
  }).then(function(m){
    afterFilter();updateOpts();updateMapInfo();
    if(!okGL){setStatus('Fronteiras carregadas ('+m+' países com contorno). Este aparelho não suporta a textura 3D.',7000);return;}
    if(useTex){setStatus('Pronto: fronteiras carregadas ('+m+' países com contorno).',3500);return;}
    genTexture();
  },function(){
    updateOpts();updateMapInfo();
    setStatus(useTex?'Textura carregada, mas não consegui carregar as fronteiras (a biblioteca de mapas não abriu).':'Não consegui carregar as fronteiras (a biblioteca de mapas não abriu). O globo segue funcionando sem elas.',9000);
  });
}
function featA3(f){
  var p=f.properties||{},a2map={};
  D.forEach(function(d){a2map[d.cc]=A3[d.cc];});
  var cands=[p.ADM0_A3,p.ISO_A3,p.iso_a3,p.ISO3,p['ISO3166-1-Alpha-3'],p.iso_3166_1_alpha_3,p.A3,p.adm0_a3,(typeof f.id==='string'&&f.id.length===3)?f.id:null];
  for(var i=0;i<cands.length;i++){var c=cands[i];if(typeof c==='string'&&c.length===3&&c!=='-99')return c.toUpperCase();}
  var c2=[p.ISO_A2,p.iso_a2,p['ISO3166-1-Alpha-2'],p.ISO2];
  for(var j=0;j<c2.length;j++){var q=c2[j];if(typeof q==='string'&&a2map[q.toUpperCase()])return a2map[q.toUpperCase()];}
  return null;
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
function ingestGeo(json){
  var fs=null;
  if(json.type==='FeatureCollection')fs=json.features;
  else if(json.type==='Topology'){var k=Object.keys(json.objects)[0];fs=topojson.feature(json,json.objects[k]).features;}
  else if(json.type==='Feature')fs=[json];
  if(!fs)throw new Error('formato não reconhecido');
  var valid={};D.forEach(function(d){valid[A3[d.cc]]=1;});
  var out=[],m=0;
  fs.forEach(function(f){
    if(!f.geometry)return;
    var a3=featA3(f);
    var nf={type:'Feature',id:a3||('X'+out.length),properties:{},geometry:JSON.parse(JSON.stringify(f.geometry))};
    if(a3&&valid[a3])m++;
    out.push(fixWind(nf));
  });
  if(m<50)throw new Error('só reconheci '+m+' países pelos códigos ISO');
  return out;
}
$('impBor').onchange=function(){
  var f=this.files[0];this.value='';if(!f)return;
  if(!window.d3||!window.topojson){setStatus('As bibliotecas de mapa ainda não carregaram; tente de novo em instantes.',6000);return;}
  var fr=new FileReader();
  fr.onload=function(){
    try{
      var list=ingestGeo(JSON.parse(fr.result)),m=setupFeatures(list);
      bordersCustom=true;afterFilter();updateOpts();updateMapInfo();
      idbSet('borders',JSON.stringify({type:'FeatureCollection',features:list}));
      setStatus('Fronteiras importadas: '+m+' países com contorno. Salvas neste aparelho.',6000);
      if(texSource!=='custom'&&gl){idbDel('tex-proc');genTexture();}
    }catch(e){setStatus('Não consegui usar esse arquivo: '+e.message+'. Use um GeoJSON de países com códigos ISO (por exemplo ISO_A3).',10000);}
  };
  fr.readAsText(f);
};
$('impTex').onchange=function(){
  var f=this.files[0];this.value='';if(!f)return;
  if(!gl){setStatus('Este aparelho não suporta a textura 3D.',5000);return;}
  var fr=new FileReader();
  fr.onload=function(){
    var im=new Image();
    im.onload=function(){
      var ratio=im.width/im.height,c=document.createElement('canvas');c.width=2048;c.height=1024;
      c.getContext('2d').drawImage(im,0,0,2048,1024);
      if(setTextureFrom(c,'custom')){
        c.toBlob(function(b){if(b)idbSet('tex-custom',b);},'image/jpeg',.92);
        setStatus('Textura importada e salva.'+((ratio<1.9||ratio>2.1)?' A proporção não era 2:1, então a imagem foi esticada.':''),7000);
      }else setStatus('Essa imagem não pôde ser usada como textura.',6000);
    };
    im.onerror=function(){setStatus('Não consegui abrir essa imagem.',6000);};
    im.src=fr.result;
  };
  fr.readAsDataURL(f);
};
$('resetTex').onclick=function(){
  idbDel('tex-custom').then(function(){return idbGet('tex-proc');}).then(function(b){
    if(b)return blobToTexCanvas(b).then(function(c){setTextureFrom(c,'proc');setStatus('Voltei à textura gerada pelo app.',3500);});
    if(feats)genTexture();else setStatus('A textura será gerada quando as fronteiras carregarem.',4000);
  });
};
confirmTap($('clearData'),'Toque de novo para apagar',function(){
  Promise.all([idbDel('tex-custom'),idbDel('tex-proc'),idbDel('borders')]).then(function(){setStatus('Dados de mapa apagados. Recarregue a página para começar do zero.',8000);});
});

