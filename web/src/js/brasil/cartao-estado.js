/**
 * @arquivo js/brasil/cartao-estado.js
 * Camada: Brasil
 * Cartão do estado selecionado.
 */

import { exitStates, updateStBtn } from './modo-estados.js';
import { BRREG, BRS } from '../dados/estados-brasil.js';
import { D, norm } from '../dados/paises.js';
import { byName, short } from '../dados/vizinhos.js';
import { estadoCartao, fmtArea, fmtPop, measureCard } from '../interface/cartao-detalhes.js';
import { card, renderChips, renderFacts, renderNear, select } from '../interface/cartao-pais.js';
import { afterFilter, updateNbBtn } from '../interface/filtros.js';
import { ganchosInterface } from '../interface/ganchos.js';
import { $ } from '../nucleo/utilitarios.js';
import { flyTo } from '../visualizacao/animacao.js';
import { countryView, zoomFor } from '../visualizacao/enquadramento.js';
import { estadoBrasil, fitStates, stateAt, stateView } from '../visualizacao/estados.js';
import { estadoCamera, estadoMapa, H, R0, rot, W } from '../visualizacao/globo.js';

/* ---------- cartão do estado ---------- */
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
  $('ccapnote').textContent='';ganchosInterface.mostrarDesempenho('BR-'+st.sigla,true);
  var ob=$('cobs');ob.textContent=st.note;ob.style.display=st.note?'block':'none';
  var dens=st.pop/st.area;
  renderFacts([['👥 População',fmtPop(st.pop/1000)],['📐 Área',fmtArea(st.area)],['🏙️ Densidade',(dens<10?dens.toFixed(1):Math.round(dens)).toString().replace('.',',')+' hab./km²'],['🧭 Região',BRREG[st.reg].n]]);
  renderChips('Estados vizinhos',st.nb.map(function(k){return {t:BRS[k].sigla+' · '+BRS[k].name,f:function(){selectSt(BRS[k],true);}};}),'Não faz fronteira com outro estado.');
  card.style.display='block';updateNbBtn();updateStBtn();
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

function stTap(x,y){
  var R=R0*estadoCamera.zoom,cand=[];
  BRS.forEach(function(st){
    if(!estadoBrasil.onS[st.i])return;
    var p=rot(st.x,st.y,st.z);if(p[2]<=0.05)return;
    var sx=W/2+R*p[0],sy=H*estadoCamera.cyFrac-R*p[1],dd=(sx-x)*(sx-x)+(sy-y)*(sy-y);
    if(dd<36*36)cand.push({s:st,dd:dd});
  });
  cand.sort(function(a,b){return a.dd-b.dd;});
  var precise=cand.length&&cand[0].dd<14*14;
  var poly=precise?null:stateAt(x,y);
  var chosen=precise?cand[0].s:(poly||(cand.length?cand[0].s:null));
  if(chosen){
    var grp=cand.map(function(c){return c.s;});
    if(grp.indexOf(chosen)<0)grp.unshift(chosen);
    selectSt(chosen,false,grp);
  }else if(estadoBrasil.selSt){estadoBrasil.selSt=null;card.style.display='none';estadoCartao.cardH=0;}
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  ganchosInterface.passoEstado = stepSt;
  ganchosInterface.alternarVizinhosEstado = toggleNbSt;
  ganchosInterface.selecionarEstado = selectSt;
  ganchosInterface.toqueEstados = function(x,y){if(!estadoBrasil.statesMode)return false;stTap(x,y);return true;};
}

export { iniciar, selectSt };
