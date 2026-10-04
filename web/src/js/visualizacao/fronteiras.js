/**
 * @arquivo js/visualizacao/fronteiras.js
 * Camada: Visualização
 * Fronteiras reais (TopoJSON): carregamento das bibliotecas e desenho dos contornos dos países.
 */

import { D, REG } from '../dados/paises.js';
import { drawGeoStates, estadoBrasil } from './estados.js';
import { ganchos } from './ganchos.js';
import { estadoRender, hexA, projCfg } from './projecao.js';
import { allOn, avail, ctx, estadoCamera, estadoMapa } from './tela.js';

/* ---------- Fronteiras reais + textura estilizada ---------- */
const A3 = {TF:'ATF',HM:'HMD',GS:'SGS',IO:'IOT',BV:'BVT',UM:'UMI',PR:'PRI',VI:'VIR',VG:'VGB',AI:'AIA',MS:'MSR',KY:'CYM',TC:'TCA',AW:'ABW',CW:'CUW',SX:'SXM',BQ:'BES',GP:'GLP',MQ:'MTQ',MF:'MAF',BL:'BLM',BM:'BMU',GL:'GRL',PM:'SPM',FK:'FLK',RE:'REU',YT:'MYT',SH:'SHN',GI:'GIB',FO:'FRO',IM:'IMN',JE:'JEY',GG:'GGY',AX:'ALA',SJ:'SJM',HK:'HKG',MO:'MAC',GU:'GUM',MP:'MNP',AS:'ASM',PF:'PYF',NC:'NCL',WF:'WLF',CK:'COK',NU:'NIU',TK:'TKL',NF:'NFK',PN:'PCN',CX:'CXR',CC:'CCK',BR:'BRA',GF:'GUF',SR:'SUR',GY:'GUY',VE:'VEN',CO:'COL',EC:'ECU',PE:'PER',BO:'BOL',CL:'CHL',AR:'ARG',PY:'PRY',UY:'URY',
PA:'PAN',CR:'CRI',NI:'NIC',HN:'HND',SV:'SLV',GT:'GTM',BZ:'BLZ',CU:'CUB',JM:'JAM',BS:'BHS',HT:'HTI',DO:'DOM',KN:'KNA',AG:'ATG',DM:'DMA',LC:'LCA',VC:'VCT',BB:'BRB',GD:'GRD',TT:'TTO',
MX:'MEX',US:'USA',CA:'CAN',ZA:'ZAF',LS:'LSO',SZ:'SWZ',BW:'BWA',NA:'NAM',ZM:'ZMB',ZW:'ZWE',MZ:'MOZ',MG:'MDG',MU:'MUS',SC:'SYC',KM:'COM',MW:'MWI',TZ:'TZA',BI:'BDI',RW:'RWA',UG:'UGA',KE:'KEN',SO:'SOM',DJ:'DJI',ER:'ERI',ET:'ETH',SS:'SSD',
AO:'AGO',CD:'COD',CG:'COG',GA:'GAB',ST:'STP',GQ:'GNQ',CM:'CMR',CF:'CAF',TD:'TCD',NE:'NER',NG:'NGA',BJ:'BEN',TG:'TGO',BF:'BFA',GH:'GHA',CI:'CIV',LR:'LBR',SL:'SLE',GN:'GIN',GW:'GNB',GM:'GMB',SN:'SEN',CV:'CPV',MR:'MRT',ML:'MLI',
EH:'ESH',MA:'MAR',DZ:'DZA',TN:'TUN',LY:'LBY',EG:'EGY',SD:'SDN',PT:'PRT',ES:'ESP',AD:'AND',MC:'MCO',SM:'SMR',IT:'ITA',VA:'VAT',MT:'MLT',GR:'GRC',TR:'TUR',
FR:'FRA',IE:'IRL',GB:'GBR',NL:'NLD',BE:'BEL',DE:'DEU',LU:'LUX',LI:'LIE',CH:'CHE',AT:'AUT',IS:'ISL',DK:'DNK',SE:'SWE',NO:'NOR',FI:'FIN',EE:'EST',LV:'LVA',LT:'LTU',
RU:'RUS',BY:'BLR',PL:'POL',CZ:'CZE',SK:'SVK',HU:'HUN',SI:'SVN',HR:'HRV',BA:'BIH',ME:'MNE',AL:'ALB',CY:'CYP',MK:'MKD',RS:'SRB',RO:'ROU',BG:'BGR',MD:'MDA',UA:'UKR',GE:'GEO',AM:'ARM',AZ:'AZE',
SY:'SYR',LB:'LBN',PS:'PSE',IL:'ISR',JO:'JOR',SA:'SAU',YE:'YEM',OM:'OMN',AE:'ARE',QA:'QAT',BH:'BHR',KW:'KWT',IQ:'IRQ',IR:'IRN',AF:'AFG',KZ:'KAZ',UZ:'UZB',TM:'TKM',KG:'KGZ',TJ:'TJK',
PK:'PAK',IN:'IND',MV:'MDV',LK:'LKA',BD:'BGD',BT:'BTN',NP:'NPL',MN:'MNG',CN:'CHN',KP:'PRK',KR:'KOR',JP:'JPN',TW:'TWN',MM:'MMR',TH:'THA',LA:'LAO',VN:'VNM',KH:'KHM',MY:'MYS',SG:'SGP',ID:'IDN',BN:'BRN',PH:'PHL',TL:'TLS',
AU:'AUS',NZ:'NZL',PG:'PNG',SB:'SLB',VU:'VUT',FJ:'FJI',PW:'PLW',FM:'FSM',MH:'MHL',NR:'NRU',KI:'KIR',TV:'TUV',WS:'WSM',TO:'TON'};

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
function setupGeo(){
  var topo=Datamap.prototype.worldTopo,key=Object.keys(topo.objects)[0];
  estadoRender.feats=topojson.feature(topo,topo.objects[key]).features;
  var idByA3={};D.forEach(function(d){idByA3[A3[d.cc]]=d.i;});
  var m=0;
  estadoRender.feats.forEach(function(f){var i=idByA3[f.id];if(i!==undefined&&!estadoRender.FEAT[i]){estadoRender.FEAT[i]=f;m++;}else estadoRender.EXTRA.push(f);});
  estadoRender.proj=d3.geo.orthographic().clipAngle(90).precision(0.6);
  estadoRender.gpath=d3.geo.path().projection(estadoRender.proj).context(ctx);
  return m;
}

function drawGeo(R,cx,cy){
  if(estadoBrasil.statesMode){drawGeoStates(R,cx,cy);return;}
  if(!estadoRender.feats||(!estadoRender.optBor&&!estadoRender.optFill&&allOn()&&!estadoMapa.selected&&!ganchos.destaquePais()))return;
  projCfg(R,cx,cy);
  var allon=allOn(),i,r;
  if(estadoRender.optFill){
    for(r=0;r<REG.length;r++){
      ctx.beginPath();
      for(i=0;i<D.length;i++)if(estadoMapa.on[i]&&D[i].r===r&&estadoRender.FEAT[i])estadoRender.gpath(estadoRender.FEAT[i]);
      ctx.fillStyle=hexA(REG[r].c,.32);ctx.fill();
    }
  }
  if(!allon){
    ctx.beginPath();
    for(i=0;i<D.length;i++)if(!estadoMapa.on[i]&&avail(D[i])&&estadoRender.FEAT[i])estadoRender.gpath(estadoRender.FEAT[i]);
    ctx.fillStyle='rgba(2,10,24,.58)';ctx.fill();
  }
  if(estadoMapa.selected&&estadoRender.FEAT[estadoMapa.selected.i]){
    ctx.beginPath();estadoRender.gpath(estadoRender.FEAT[estadoMapa.selected.i]);ctx.fillStyle='rgba(255,224,102,.26)';ctx.fill();
  }
  if(ganchos.destaquePais()&&estadoRender.FEAT[ganchos.destaquePais().i]){
    var fk=ganchos.destaquePais().kind,fcol=fk==='ok'?['rgba(46,204,113,.45)','#2ecc71']:(fk==='ask'?['rgba(77,163,255,.40)','#4da3ff']:['rgba(255,224,102,.45)','#ffe066']);
    /* logo após a resposta, o contorno pulsa e brilha por um instante */
    var t0=ganchos.destaquePais().t,pulso=t0?Math.max(0,1-(performance.now()-t0)/1000):0;
    ctx.beginPath();estadoRender.gpath(estadoRender.FEAT[ganchos.destaquePais().i]);ctx.fillStyle=fcol[0];ctx.fill();
    if(pulso>0){ctx.save();ctx.shadowColor=fcol[1];ctx.shadowBlur=28*pulso;}
    ctx.lineWidth=2.6+5*pulso;ctx.strokeStyle=fcol[1];ctx.stroke();
    if(pulso>0)ctx.restore();
  }
  if(estadoRender.optBor){
    ctx.beginPath();
    for(i=0;i<D.length;i++)if(estadoRender.FEAT[i]&&(estadoMapa.on[i]||(allon&&!avail(D[i]))))estadoRender.gpath(estadoRender.FEAT[i]);
    if(allon)for(i=0;i<estadoRender.EXTRA.length;i++)estadoRender.gpath(estadoRender.EXTRA[i]);
    ctx.lineJoin='round';
    ctx.lineWidth=Math.max(.7,Math.min(1.6,.6+.25*estadoCamera.zoom));
    ctx.strokeStyle=estadoRender.useTex&&estadoRender.optTex?'rgba(255,255,255,.78)':'rgba(255,255,255,.6)';
    ctx.stroke();
  }
  if(estadoMapa.selected&&estadoRender.FEAT[estadoMapa.selected.i]){
    ctx.beginPath();estadoRender.gpath(estadoRender.FEAT[estadoMapa.selected.i]);ctx.lineWidth=2.2;ctx.strokeStyle='#ffe066';ctx.stroke();
  }
}

/* toque dentro de um país (quando não acertou um ponto) */

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  estadoRender.FEAT = D.map(function(){return null;});
}

export { A3, drawGeo, iniciar, setupGeo, tryLoad };
