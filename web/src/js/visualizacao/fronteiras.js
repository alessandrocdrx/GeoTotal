/**
 * @arquivo js/visualizacao/fronteiras.js
 * Camada: Visualização
 * Fronteiras reais (TopoJSON) e desenho dos contornos dos países.
 */
/* ---------- Fronteiras reais + textura estilizada ---------- */
var glc=document.getElementById('gl'),gl=null,glProg=null,glTex=null,glU={},glBuf=null;
var useTex=false,optTex=true,optBor=true,optFill=false;
var feats=null,FEAT=D.map(function(){return null;}),EXTRA=[],proj=null,gpath=null;
var A3={TF:'ATF',HM:'HMD',GS:'SGS',IO:'IOT',BV:'BVT',UM:'UMI',PR:'PRI',VI:'VIR',VG:'VGB',AI:'AIA',MS:'MSR',KY:'CYM',TC:'TCA',AW:'ABW',CW:'CUW',SX:'SXM',BQ:'BES',GP:'GLP',MQ:'MTQ',MF:'MAF',BL:'BLM',BM:'BMU',GL:'GRL',PM:'SPM',FK:'FLK',RE:'REU',YT:'MYT',SH:'SHN',GI:'GIB',FO:'FRO',IM:'IMN',JE:'JEY',GG:'GGY',AX:'ALA',SJ:'SJM',HK:'HKG',MO:'MAC',GU:'GUM',MP:'MNP',AS:'ASM',PF:'PYF',NC:'NCL',WF:'WLF',CK:'COK',NU:'NIU',TK:'TKL',NF:'NFK',PN:'PCN',CX:'CXR',CC:'CCK',BR:'BRA',GF:'GUF',SR:'SUR',GY:'GUY',VE:'VEN',CO:'COL',EC:'ECU',PE:'PER',BO:'BOL',CL:'CHL',AR:'ARG',PY:'PRY',UY:'URY',
PA:'PAN',CR:'CRI',NI:'NIC',HN:'HND',SV:'SLV',GT:'GTM',BZ:'BLZ',CU:'CUB',JM:'JAM',BS:'BHS',HT:'HTI',DO:'DOM',KN:'KNA',AG:'ATG',DM:'DMA',LC:'LCA',VC:'VCT',BB:'BRB',GD:'GRD',TT:'TTO',
MX:'MEX',US:'USA',CA:'CAN',ZA:'ZAF',LS:'LSO',SZ:'SWZ',BW:'BWA',NA:'NAM',ZM:'ZMB',ZW:'ZWE',MZ:'MOZ',MG:'MDG',MU:'MUS',SC:'SYC',KM:'COM',MW:'MWI',TZ:'TZA',BI:'BDI',RW:'RWA',UG:'UGA',KE:'KEN',SO:'SOM',DJ:'DJI',ER:'ERI',ET:'ETH',SS:'SSD',
AO:'AGO',CD:'COD',CG:'COG',GA:'GAB',ST:'STP',GQ:'GNQ',CM:'CMR',CF:'CAF',TD:'TCD',NE:'NER',NG:'NGA',BJ:'BEN',TG:'TGO',BF:'BFA',GH:'GHA',CI:'CIV',LR:'LBR',SL:'SLE',GN:'GIN',GW:'GNB',GM:'GMB',SN:'SEN',CV:'CPV',MR:'MRT',ML:'MLI',
EH:'ESH',MA:'MAR',DZ:'DZA',TN:'TUN',LY:'LBY',EG:'EGY',SD:'SDN',PT:'PRT',ES:'ESP',AD:'AND',MC:'MCO',SM:'SMR',IT:'ITA',VA:'VAT',MT:'MLT',GR:'GRC',TR:'TUR',
FR:'FRA',IE:'IRL',GB:'GBR',NL:'NLD',BE:'BEL',DE:'DEU',LU:'LUX',LI:'LIE',CH:'CHE',AT:'AUT',IS:'ISL',DK:'DNK',SE:'SWE',NO:'NOR',FI:'FIN',EE:'EST',LV:'LVA',LT:'LTU',
RU:'RUS',BY:'BLR',PL:'POL',CZ:'CZE',SK:'SVK',HU:'HUN',SI:'SVN',HR:'HRV',BA:'BIH',ME:'MNE',AL:'ALB',CY:'CYP',MK:'MKD',RS:'SRB',RO:'ROU',BG:'BGR',MD:'MDA',UA:'UKR',GE:'GEO',AM:'ARM',AZ:'AZE',
SY:'SYR',LB:'LBN',PS:'PSE',IL:'ISR',JO:'JOR',SA:'SAU',YE:'YEM',OM:'OMN',AE:'ARE',QA:'QAT',BH:'BHR',KW:'KWT',IQ:'IRQ',IR:'IRN',AF:'AFG',KZ:'KAZ',UZ:'UZB',TM:'TKM',KG:'KGZ',TJ:'TJK',
PK:'PAK',IN:'IND',MV:'MDV',LK:'LKA',BD:'BGD',BT:'BTN',NP:'NPL',MN:'MNG',CN:'CHN',KP:'PRK',KR:'KOR',JP:'JPN',TW:'TWN',MM:'MMR',TH:'THA',LA:'LAO',VN:'VNM',KH:'KHM',MY:'MYS',SG:'SGP',ID:'IDN',BN:'BRN',PH:'PHL',TL:'TLS',
AU:'AUS',NZ:'NZL',PG:'PNG',SB:'SLB',VU:'VUT',FJ:'FJI',PW:'PLW',FM:'FSM',MH:'MHL',NR:'NRU',KI:'KIR',TV:'TUV',WS:'WSM',TO:'TON'};
var statusEl=document.getElementById('status'),statusT=0;
function setStatus(t,ms){
  clearTimeout(statusT);
  if(!t){statusEl.style.display='none';return;}
  statusEl.textContent=t;statusEl.style.display='block';
  if(ms)statusT=setTimeout(function(){statusEl.style.display='none';},ms);
}
function hexA(h,a){var n=parseInt(h.slice(1),16);return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')';}

/* carregamento sequencial de scripts (hosts permitidos: cdnjs e jsDelivr /npm/) */
function loadScript(u){return new Promise(function(ok,no){var s=document.createElement('script');s.src=u;s.async=false;s.onload=ok;s.onerror=no;document.head.appendChild(s);});}
function tryLoad(list,test){
  return new Promise(function(ok,no){
    var i=0;
    (function next(){
      if(test())return ok();
      if(i>=list.length)return no(new Error('falhou'));
      loadScript(list[i++]).then(next,next);
    })();
  });
}
function loadLibs(){
  return tryLoad(['https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.min.js','https://cdn.jsdelivr.net/npm/d3@3.5.17/d3.min.js'],function(){return window.d3&&d3.geo&&d3.geo.orthographic;})
  .then(function(){return tryLoad(['https://cdnjs.cloudflare.com/ajax/libs/topojson/1.6.9/topojson.min.js','https://cdn.jsdelivr.net/npm/topojson@1.6.9/topojson.min.js'],function(){return window.topojson&&topojson.feature;});})
  .then(function(){return tryLoad(['https://cdn.jsdelivr.net/npm/datamaps@0.5.9/dist/datamaps.world.min.js','https://cdnjs.cloudflare.com/ajax/libs/datamaps/0.5.9/datamaps.world.min.js','https://cdn.jsdelivr.net/npm/datamaps@0.5.8/dist/datamaps.world.min.js'],function(){return window.Datamap&&Datamap.prototype&&Datamap.prototype.worldTopo;});});
}
function setupGeo(){
  var topo=Datamap.prototype.worldTopo,key=Object.keys(topo.objects)[0];
  feats=topojson.feature(topo,topo.objects[key]).features;
  var idByA3={};D.forEach(function(d){idByA3[A3[d.cc]]=d.i;});
  var m=0;
  feats.forEach(function(f){var i=idByA3[f.id];if(i!==undefined&&!FEAT[i]){FEAT[i]=f;m++;}else EXTRA.push(f);});
  proj=d3.geo.orthographic().clipAngle(90).precision(0.6);
  gpath=d3.geo.path().projection(proj).context(ctx);
  return m;
}
function projCfg(R,cx,cy){proj.scale(R).translate([cx,cy]).rotate([-lam*180/PI,-phi*180/PI]);}

function drawGeo(R,cx,cy){
  if(statesMode){drawGeoStates(R,cx,cy);return;}
  if(!feats||(!optBor&&!optFill&&allOn()&&!selected&&!qFlash))return;
  projCfg(R,cx,cy);
  var allon=allOn(),i,r;
  if(optFill){
    for(r=0;r<REG.length;r++){
      ctx.beginPath();
      for(i=0;i<D.length;i++)if(on[i]&&D[i].r===r&&FEAT[i])gpath(FEAT[i]);
      ctx.fillStyle=hexA(REG[r].c,.32);ctx.fill();
    }
  }
  if(!allon){
    ctx.beginPath();
    for(i=0;i<D.length;i++)if(!on[i]&&avail(D[i])&&FEAT[i])gpath(FEAT[i]);
    ctx.fillStyle='rgba(2,10,24,.58)';ctx.fill();
  }
  if(selected&&FEAT[selected.i]){
    ctx.beginPath();gpath(FEAT[selected.i]);ctx.fillStyle='rgba(255,224,102,.26)';ctx.fill();
  }
  if(qFlash&&FEAT[qFlash.i]){
    var fk=qFlash.kind,fcol=fk==='ok'?['rgba(46,204,113,.45)','#2ecc71']:(fk==='ask'?['rgba(77,163,255,.40)','#4da3ff']:['rgba(255,224,102,.45)','#ffe066']);
    ctx.beginPath();gpath(FEAT[qFlash.i]);ctx.fillStyle=fcol[0];ctx.fill();
    ctx.lineWidth=2.6;ctx.strokeStyle=fcol[1];ctx.stroke();
  }
  if(optBor){
    ctx.beginPath();
    for(i=0;i<D.length;i++)if(FEAT[i]&&(on[i]||(allon&&!avail(D[i]))))gpath(FEAT[i]);
    if(allon)for(i=0;i<EXTRA.length;i++)gpath(EXTRA[i]);
    ctx.lineJoin='round';
    ctx.lineWidth=Math.max(.7,Math.min(1.6,.6+.25*zoom));
    ctx.strokeStyle=useTex&&optTex?'rgba(255,255,255,.78)':'rgba(255,255,255,.6)';
    ctx.stroke();
  }
  if(selected&&FEAT[selected.i]){
    ctx.beginPath();gpath(FEAT[selected.i]);ctx.lineWidth=2.2;ctx.strokeStyle='#ffe066';ctx.stroke();
  }
}

/* toque dentro de um país (quando não acertou um ponto) */
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
  if(!feats)return null;
  projCfg(R0*zoom,W/2,H*cyFrac);
  var ll=proj.invert([x,y]);
  if(!ll||isNaN(ll[0])||isNaN(ll[1]))return null;
  for(var i=0;i<D.length;i++)if(on[i]&&FEAT[i]&&inFeat(FEAT[i],ll[0],ll[1]))return D[i];
  return null;
}

