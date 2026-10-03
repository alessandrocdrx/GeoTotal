/**
 * @arquivo js/brasil/cartao-estado.js
 * Camada: Brasil
 * Cartão do estado selecionado.
 */

import { D, norm } from '../dados/paises.js';
import { byName, short } from '../dados/vizinhos.js';
import { estadoCamera, estadoMapa } from '../visualizacao/globo.js';
import { flyTo, PI } from '../visualizacao/animacao.js';
import { card, renderCardStat, renderChips, renderFacts, renderNear, select } from '../interface/cartao-pais.js';
import { afterFilter, updateNbBtn } from '../interface/filtros.js';
import { $ } from '../nucleo/utilitarios.js';
import { fmtArea, fmtPop, measureCard } from '../interface/cartao-detalhes.js';
import { countryView, featView, zoomFor } from '../treino/partida.js';
import { BRREG, BRS, estadoBrasil } from './dados-estados.js';
import { exitStates, updateStBtn } from './modo-estados.js';
import { syncFab } from '../treino/progressao.js';

/* ---------- cartão do estado ---------- */
function stateView(st){
  if(estadoBrasil.STGEOM[st.i])return estadoBrasil.STGEOM[st.i];
  if(estadoBrasil.STFEAT[st.i]){var v=featView(estadoBrasil.STFEAT[st.i]);if(v)return (estadoBrasil.STGEOM[st.i]=v);}
  return {lat:st.clat,lng:st.clng,r:st.ext*Math.PI/180};
}
function fillInfoSt(st){
  var box=$('cinfo');box.innerHTML='';
  [['Sigla',st.sigla],['Código IBGE',st.ibge]].forEach(function(r){
    var row=document.createElement('div');row.className='irow';
    var a=document.createElement('span');a.textContent=r[0];
    var b=document.createElement('b');b.textContent=r[1];
    row.appendChild(a);row.appendChild(b);box.appendChild(row);
  });
  var n=document.createElement('div');n.className='inote';
  n.textContent='Valores aproximados (Censo 2022 e áreas do IBGE, arredondados). Confira em fonte oficial antes de citar.';
  box.appendChild(n);
}
function refreshNbC(){
  estadoBrasil.stNbC=(estadoBrasil.stSaved&&estadoBrasil.selSt)?estadoBrasil.selSt.cn.slice():[];
}
function renderStCountries(st){
  var box=document.getElementById('cncty');box.innerHTML='';
  var t=document.createElement('span');t.className='nt';
  t.textContent=st.cn.length?'Países na fronteira':'Não faz fronteira com outro país';
  box.appendChild(t);
  st.cn.forEach(function(k){
    var b=document.createElement('button');b.textContent=D[k].flag+' '+short(D[k]);
    b.onclick=function(){exitStates(false);select(D[k],true);};
    box.appendChild(b);
  });
  box.hidden=false;
}
function selectSt(st,fly,group){
  if(!estadoBrasil.onS[st.i]){estadoBrasil.onS[st.i]=1;afterFilter();}
  estadoBrasil.selSt=st;estadoMapa.selected=null;refreshNbC();
  $('hint').style.display='none';
  $('cdot').style.background=BRREG[st.reg].c;
  $('creg').textContent='Brasil · '+BRREG[st.reg].n;
  var fl=$('cflag');fl.textContent=st.sigla;fl.className='flag sig';
  $('cname').textContent=st.name;
  $('ccap').textContent=st.cap;
  $('ccapnote').textContent='';renderCardStat('BR-'+st.sigla,true);
  var ob=$('cobs');ob.textContent=st.note;ob.style.display=st.note?'block':'none';
  var dens=st.pop/st.area;
  renderFacts([['👥 População',fmtPop(st.pop/1000)],['📐 Área',fmtArea(st.area)],['🏙️ Densidade',(dens<10?dens.toFixed(1):Math.round(dens)).toString().replace('.',',')+' hab./km²'],['🧭 Região',BRREG[st.reg].n]]);
  renderChips('Estados vizinhos',st.nb.map(function(k){return {t:BRS[k].sigla+' · '+BRS[k].name,f:function(){selectSt(BRS[k],true);}};}),'Não faz fronteira com outro estado.');
  card.style.display='block';syncFab();updateNbBtn();updateStBtn();
  renderNear(group,st,function(x){selectSt(x,false,group);},function(x){return x.sigla+' '+x.name;});
  renderStCountries(st);
  fillInfoSt(st);setTimeout(measureCard,40);
  if(fly===false)flyTo(st.lat,st.lng,Math.max(estadoCamera.zoom,1.6));
  else{var v=stateView(st);flyTo(v.lat,v.lng,zoomFor(v.r,5.5));}
}
function stepSt(dir){
  if(!estadoBrasil.selSt)return;
  var i=estadoBrasil.selSt.i,n=BRS.length;
  for(var k=0;k<n;k++){i=(i+dir+n)%n;if(estadoBrasil.onS[i]){selectSt(BRS[i],true);return;}}
}
function toggleNbSt(){
  if(estadoBrasil.stSaved){
    estadoBrasil.onS=estadoBrasil.stSaved.slice();estadoBrasil.stSaved=null;refreshNbC();afterFilter();
    var v=[];estadoBrasil.onS.forEach(function(x,k){if(x)v.push(k);});
    var b=countryView(byName[norm('Brasil')]);
    if(v.length===BRS.length)flyTo(b.lat,b.lng,zoomFor(b.r,3));else fitStates(v,[]);
    return;
  }
  if(!estadoBrasil.selSt)return;
  estadoBrasil.stSaved=estadoBrasil.onS.slice();
  estadoBrasil.onS=BRS.map(function(){return 0;});
  var idx=[estadoBrasil.selSt.i].concat(estadoBrasil.selSt.nb);idx.forEach(function(k){estadoBrasil.onS[k]=1;});
  refreshNbC();afterFilter();fitStates(idx,estadoBrasil.stNbC);
}
function fitStates(idxs,cidx){
  var vs=idxs.map(function(i){return [BRS[i].x,BRS[i].y,BRS[i].z];});
  (cidx||[]).forEach(function(k){vs.push([D[k].x,D[k].y,D[k].z]);});
  var sx=0,sy=0,sz=0;
  vs.forEach(function(v){sx+=v[0];sy+=v[1];sz+=v[2];});
  var m=Math.sqrt(sx*sx+sy*sy+sz*sz)||1;sx/=m;sy/=m;sz/=m;
  var th=0;
  vs.forEach(function(v){var c=v[0]*sx+v[1]*sy+v[2]*sz;th=Math.max(th,Math.acos(Math.max(-1,Math.min(1,c))));});
  flyTo(Math.asin(sy)*180/PI,Math.atan2(sx,sz)*180/PI,zoomFor(th+0.05,5));
}

export { fitStates, selectSt, stateView, stepSt, toggleNbSt };
