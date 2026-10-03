/**
 * @arquivo js/brasil/importar-contornos.js
 * Camada: Brasil
 * Carregar/importar contornos dos estados (amCharts/GeoJSON).
 */

import { BRBY, BRS } from '../dados/estados-brasil.js';
import { norm } from '../dados/paises.js';
import { $, setStatus } from '../nucleo/utilitarios.js';
import { fixWind, idbGet, idbSet } from '../visualizacao/carregamento.js';
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
function saveStates(list){
  var slim=list.map(function(x){var k=stFeatIndex(x);return {type:'Feature',id:'S'+k,properties:{SIGLA:k>=0?BRS[k].sigla:''},geometry:x.geometry};});
  idbSet('br-states',JSON.stringify({type:'FeatureCollection',features:slim}));
}
/* carrega os contornos dos estados sozinho (tentativa via jsDelivr); se não der, o usuário importa um arquivo */
let stAuto = 0;
function loadAmcharts(){
  return new Promise(function(ok,no){
    if(window.am5geodata_brazilLow)return ok(window.am5geodata_brazilLow);
    var oe=window.exports,om=window.module;
    window.exports={};window.module={exports:window.exports};
    function restore(){if(oe===undefined)delete window.exports;else window.exports=oe;if(om===undefined)delete window.module;else window.module=om;}
    var urls=['https://cdn.jsdelivr.net/npm/@amcharts/amcharts5-geodata@5.1.4/brazilLow.js','https://cdn.jsdelivr.net/npm/@amcharts/amcharts5-geodata@5/brazilLow.js'];
    (function next(i){
      if(i>=urls.length){restore();return no(new Error('indisponível'));}
      var sc=document.createElement('script');sc.src=urls[i];
      sc.onload=function(){
        var g=window.am5geodata_brazilLow||(window.module&&window.module.exports&&(window.module.exports.default||window.module.exports))||(window.exports&&(window.exports.default||window.exports));
        if(g&&g.features&&g.features.length){restore();ok(g);}else next(i+1);
      };
      sc.onerror=function(){next(i+1);};
      document.head.appendChild(sc);
    })(0);
  });
}
function ensureStateShapes(){
  if(estadoBrasil.STFEAT.some(function(f){return f;})||stAuto===1)return;
  if(!estadoRender.feats||!window.d3){setStatus('Os limites dos estados aparecem depois que o mapa carregar. Importe um arquivo em ⋯ Mais se preferir.',6000);return;}
  stAuto=1;
  setStatus('Carregando os limites dos estados…');
  loadAmcharts().then(function(g){
    var list=ingestStates(g),m=setupStates(list);
    saveStates(list);stAuto=2;
    setStatus('Limites dos estados carregados ('+m+' de 27). Dados: amCharts geodata / Natural Earth.',6000);
  }).catch(function(){
    stAuto=0;
    setStatus('Não consegui carregar os limites dos estados sozinho. Você pode importar um GeoJSON em ⋯ Mais → Brasil.',9000);
  });
}
function loadSavedStates(){
  idbGet('br-states').then(function(str){
    if(!str)return;
    var tries=0;
    (function wait(){
      if(window.d3&&estadoRender.feats){try{setupStates(JSON.parse(str).features);}catch(e){}return;}
      if(++tries<80)setTimeout(wait,500);
    })();
  });
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  $('impSt').onchange=function(){
    var f=this.files[0];this.value='';if(!f)return;
    if(!window.d3||!window.topojson){setStatus('As bibliotecas de mapa ainda não carregaram; tente de novo em instantes.',6000);return;}
    var fr=new FileReader();
    fr.onload=function(){
      try{
        var list=ingestStates(JSON.parse(fr.result)),m=setupStates(list);
        saveStates(list);
        setStatus('Contornos dos estados importados ('+m+' de 27). Salvos neste aparelho.',6000);
      }catch(e){setStatus('Não consegui usar esse arquivo: '+e.message+'. Use um GeoJSON dos estados do Brasil (por exemplo, a malha do IBGE).',10000);}
    };
    fr.readAsText(f);
  };
  loadSavedStates();
}

export { ensureStateShapes, iniciar };
