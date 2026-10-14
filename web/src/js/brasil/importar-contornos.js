/**
 * @arquivo js/brasil/importar-contornos.js
 * Camada: Brasil
 * Carregar/importar contornos dos estados (amCharts/GeoJSON).
 */

import { CONTORNOS_ESTADOS } from '../dados/contornos-estados.js';
import { BRBY, BRS } from '../dados/estados-brasil.js';
import { norm } from '../dados/paises.js';
import { setStatus } from '../nucleo/utilitarios.js';
import { fixWind } from '../visualizacao/carregamento.js';
import { estadoBrasil } from '../visualizacao/estados.js';
import { estadoRender } from '../visualizacao/projecao.js';

/* ---------- importar contornos dos estados (GeoJSON) ---------- */
function stFeatIndex(f){
  var p=f.properties||{};
  var idc=[p.id,p.ID,f.id,p.iso_3166_2,p['ISO3166-2'],p.ISO_3166_2,p.hasc,p.HASC_1];
  for(var a=0;a<idc.length;a++){
    var v=idc[a];
    if(typeof v==='string'){var m=v.match(/^(?:BR[-.])?([A-Za-z]{2})$/);if(m&&BRBY[m[1].toUpperCase()]!==undefined)return BRBY[m[1].toUpperCase()];}
  }
  var cands=[p.SIGLA,p.sigla,p.UF,p.uf,p.SIGLA_UF,p.sigla_uf,p.abbrev_state,p.abbrev,p.postal];
  for(var i=0;i<cands.length;i++){var c=cands[i];if(typeof c==='string'&&BRBY[c.toUpperCase()]!==undefined)return BRBY[c.toUpperCase()];}
  var codes=[p.codarea,p.CD_UF,p.CD_GEOCUF,p.GEOCODIGO,p.cod_uf,p.codigo_ibge,p.id,f.id];
  for(var j=0;j<codes.length;j++){var q=codes[j];if(q==null||!/^\d{2}/.test(String(q)))continue;q=String(q).slice(0,2);for(var k=0;k<BRS.length;k++)if(BRS[k].ibge===q)return k;}
  var names=[p.name,p.NAME,p.NOME,p.nome,p.NM_UF,p.NM_ESTADO,p.estado,p.ESTADO,p.name_1,p.NAME_1];
  for(var m2=0;m2<names.length;m2++){
    var n=names[m2];if(typeof n!=='string')continue;n=norm(n);
    for(var t=0;t<BRS.length;t++)if(norm(BRS[t].name)===n)return t;
    if(n==='federal district')return BRBY.DF;
  }
  return -1;
}
function setupStates(list){
  estadoBrasil.STFEAT=BRS.map(function(){return null;});estadoBrasil.STGEOM={};
  var m=0;
  list.forEach(function(f){var k=stFeatIndex(f);if(k>=0&&!estadoBrasil.STFEAT[k]){estadoBrasil.STFEAT[k]=f;m++;}});
  return m;
}
function ingestStates(json){
  var fs=null;
  if(json.type==='FeatureCollection')fs=json.features;
  else if(json.type==='Topology'&&window.topojson){var k=Object.keys(json.objects)[0];fs=topojson.feature(json,json.objects[k]).features;}
  if(!fs)throw new Error('formato não reconhecido');
  var out=[],m=0;
  fs.forEach(function(f){
    if(!f.geometry)return;
    var nf={type:'Feature',id:f.id,properties:f.properties||{},geometry:JSON.parse(JSON.stringify(f.geometry))};
    if(stFeatIndex(nf)>=0)m++;
    out.push(fixWind(nf));
  });
  if(m<25)throw new Error('só reconheci '+m+' dos 27 estados');
  return out;
}
/* os contornos vêm embutidos no jogo (js/dados/contornos-estados.js); antes eram baixados do jsDelivr,
   que deixou de entregar o pacote e fazia os estados aparecerem sem divisas fora do app Android */
let espera = 0;
function ensureStateShapes(){
  if(estadoBrasil.STFEAT.some(function(f){return f;}))return;
  /* precisa do d3 e do mapa-múndi prontos; até lá, tenta de novo sozinho */
  if(!estadoRender.feats||!window.d3){if(!espera)espera=setTimeout(function(){espera=0;ensureStateShapes();},500);return;}
  try{setupStates(ingestStates(CONTORNOS_ESTADOS));}
  catch(e){setStatus('Não consegui montar os limites dos estados.',6000);}
}
export { ensureStateShapes };
