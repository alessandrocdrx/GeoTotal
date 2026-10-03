/**
 * @arquivo js/interface/filtros.js
 * Camada: Interface
 * Filtros de países (chips, árvore, vizinhança) e disponibilidade das categorias.
 */

import { D, dflag, N_DEP, N_UNI, norm, REG } from '../dados/paises.js';
import { byName, capShort, NB, short } from '../dados/vizinhos.js';
import { closeCard } from './cartao-pais.js';
import { snap } from './filtros-desfazer.js';
import { ganchosInterface } from './ganchos.js';
import { tourStop } from './passeio.js';
import { emitir, ouvir } from '../nucleo/eventos.js';
import { $, lsSet } from '../nucleo/utilitarios.js';
import { fitTo, flyTo, PI } from '../visualizacao/animacao.js';
import { estadoBrasil } from '../visualizacao/estados.js';
import { allOn, avail, availCount, estadoCamera, estadoMapa } from '../visualizacao/globo.js';

/** Estado compartilhado com outros módulos (leitura e escrita por estadoFiltros.nome). */
const estadoFiltros = {
  nbSaved: null,
};

function updateNbBtn(){
  var b=document.getElementById('nbtn');
  if(estadoBrasil.statesMode){
    if(estadoBrasil.stSaved){b.style.visibility='visible';b.textContent='↩ Mostrar todos';}
    else{b.style.visibility=estadoBrasil.selSt?'visible':'hidden';b.textContent='Só vizinhos';}
    return;
  }
  if(estadoFiltros.nbSaved){b.style.visibility='visible';b.textContent='↩ Mostrar todos';}
  else{b.style.visibility=(estadoMapa.selected&&NB[estadoMapa.selected.i].length)?'visible':'hidden';b.textContent='Só vizinhos';}
}
function toggleNb(){
  if(estadoBrasil.statesMode){ganchosInterface.alternarVizinhosEstado();return;}
  if(estadoFiltros.nbSaved){
    snap();estadoMapa.on=estadoFiltros.nbSaved.slice();estadoFiltros.nbSaved=null;afterFilter();
    var vis=[];estadoMapa.on.forEach(function(v,k){if(v)vis.push(k);});
    if(allOn())flyTo(estadoCamera.phi*180/PI,estadoCamera.lam*180/PI,1);else fitTo(vis);
    return;
  }
  if(!estadoMapa.selected)return;
  snap();
  var i=estadoMapa.selected.i,keep=estadoMapa.on.slice(),idxs=[i].concat(NB[i]);
  estadoMapa.on=D.map(function(){return 0;});idxs.forEach(function(k){estadoMapa.on[k]=1;});
  estadoFiltros.nbSaved=keep;afterFilter();fitTo(idxs);
}
function soloOf(r){return D.every(function(d){return !avail(d)||estadoMapa.on[d.i]===(d.r===r?1:0);});}
function afterFilter(){
  tourStop();
  D.forEach(function(d){if(!avail(d)&&(!estadoMapa.selected||d.i!==estadoMapa.selected.i))estadoMapa.on[d.i]=0;});
  if(estadoBrasil.statesMode){buildChips();updateNbBtn();return;}
  buildChips();refreshTree();
  var nA=availCount(),nOn=D.filter(function(d){return estadoMapa.on[d.i]&&avail(d);}).length;
  document.getElementById('fbtn').textContent='🌍 '+(nOn>=nA?'Todas':nOn===0?'Nenhum':nOn+'/'+nA)+(nOn>0&&nOn<nA?' países':'');
  $('sheetcount').textContent=nA+' países e territórios disponíveis.';
  updateNbBtn();
  if(estadoMapa.selected&&!estadoMapa.on[estadoMapa.selected.i])closeCard();
  emitir('visao-mudou');
}
function setOn(idxs,val){snap();estadoFiltros.nbSaved=null;idxs.forEach(function(i){estadoMapa.on[i]=val?1:0;});afterFilter();}
function neighborsOf(i,add){
  snap();estadoFiltros.nbSaved=null;
  var idxs=[i].concat(NB[i]);
  if(!add)estadoMapa.on=D.map(function(){return 0;});
  idxs.forEach(function(k){estadoMapa.on[k]=1;});
  afterFilter();
  var vis=[];estadoMapa.on.forEach(function(v,k){if(v)vis.push(k);});
  fitTo(add?vis:idxs);
}

let chips;
function mkChip(label,color,val,count){
  var b=document.createElement('button');b.className='chip';
  b.setAttribute('aria-pressed',(val<0?allOn():soloOf(val))?'true':'false');
  if(color){var s=document.createElement('span');s.className='dot';s.style.background=color;b.appendChild(s);}
  b.appendChild(document.createTextNode(label+' ('+count+')'));
  b.onclick=function(){
    snap();estadoFiltros.nbSaved=null;
    if(val<0||soloOf(val)){estadoMapa.on=D.map(function(d){return avail(d)?1:0;});afterFilter();flyTo(estadoCamera.phi*180/PI,estadoCamera.lam*180/PI,1);}
    else{estadoMapa.on=D.map(function(d){return d.r===val&&avail(d)?1:0;});afterFilter();var g=REG[val];flyTo(g.lat,g.lng,g.z);}
  };
  return b;
}
function buildChips(){
  if(estadoBrasil.statesMode){ganchosInterface.montarChipsEstados();return;}
  chips.innerHTML='';
  chips.appendChild(mkChip('Todas',null,-1,availCount()));
  for(var r=0;r<REG.length;r++){var nr=D.filter(function(d){return d.r===r&&avail(d);}).length;if(nr)chips.appendChild(mkChip(REG[r].n,REG[r].c,r,nr));}
}

/* painel de filtros: continente > sub-região > país */
let boxes = [];
function mkBox(idx){
  var cb=document.createElement('input');cb.type='checkbox';
  cb.addEventListener('click',function(e){e.stopPropagation();setOn(idx,cb.checked);});
  boxes.push({cb:cb,idx:idx});return cb;
}
function buildTree(){
  var tree=document.getElementById('tree');tree.innerHTML='';boxes=[];
  REG.forEach(function(rg,ri){
    if(!D.some(function(d){return d.r===ri&&avail(d);}))return;
    var subs=[];
    D.forEach(function(d){
      if(d.r!==ri)return;
      var s=null;for(var q=0;q<subs.length;q++)if(subs[q].n===d.sub)s=subs[q];
      if(!s){s={n:d.sub,idx:[]};subs.push(s);}
      s.idx.push(d.i);
    });
    var all=[];subs.forEach(function(s){all=all.concat(s.idx);});
    var det=document.createElement('details'),sm=document.createElement('summary');
    sm.appendChild(mkBox(all));
    var dot=document.createElement('span');dot.className='dotc';dot.style.background=rg.c;sm.appendChild(dot);
    var nm=document.createElement('span');nm.textContent=rg.n;sm.appendChild(nm);
    var ct=document.createElement('small');ct.textContent=all.length;sm.appendChild(ct);
    det.appendChild(sm);
    subs.forEach(function(s){
      var d2=document.createElement('details');d2.className='sub2';
      var s2=document.createElement('summary');
      s2.appendChild(mkBox(s.idx));
      var n2=document.createElement('span');n2.textContent=s.n;s2.appendChild(n2);
      var c2=document.createElement('small');c2.textContent=s.idx.length;s2.appendChild(c2);
      d2.appendChild(s2);
      var cl=document.createElement('div');cl.className='cl';
      s.idx.forEach(function(i){
        var lb=document.createElement('label');
        lb.appendChild(mkBox([i]));
        var t=document.createElement('span');t.textContent=dflag(D[i])+' '+short(D[i])+' — '+capShort(D[i])+(D[i].dis?' ⚠':'')+(D[i].dep?' ◇':'')+(D[i].uni?' ❄':'');lb.appendChild(t);
        cl.appendChild(lb);
      });
      d2.appendChild(cl);det.appendChild(d2);
    });
    tree.appendChild(det);
  });
}
function refreshTree(){
  boxes.forEach(function(b){
    var n=0;b.idx.forEach(function(i){n+=estadoMapa.on[i];});
    b.cb.checked=n===b.idx.length;
    b.cb.indeterminate=n>0&&n<b.idx.length;
  });
}
let sel;
let sheet;

function setIncludeDisputed(v){
  estadoMapa.includeDisputed=v;lsSet('globo.includeDisputed',v);
  $('oDisputed').checked=v;$('oDisputedQ').checked=v;
  if(v)D.forEach(function(d){if(d.dis)estadoMapa.on[d.i]=1;});
  afterFilter();
  emitir('categorias-mudaram',{placar:false});
}
function setIncludeDep(v){
  estadoMapa.includeDep=v;lsSet('globo.includeDep',v);
  $('oDep').checked=v;$('oDepQ').checked=v;
  if(v)D.forEach(function(d){if(d.dep)estadoMapa.on[d.i]=1;});
  afterFilter();
  emitir('categorias-mudaram',{placar:true});
}
function setIncludeUni(v){
  estadoMapa.includeUni=v;lsSet('globo.includeUni',v);
  $('oUni').checked=v;$('oUniQ').checked=v;
  if(v)D.forEach(function(d){if(d.uni)estadoMapa.on[d.i]=1;});
  buildTree();afterFilter();
  emitir('categorias-mudaram',{placar:true});
}
/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  ouvir('fronteiras-carregadas',afterFilter);
  chips = document.getElementById('chips');
  sel = document.getElementById('nbsel');
  D.slice().sort(function(a,b){return short(a).localeCompare(short(b),'pt');}).forEach(function(d){
    var o=document.createElement('option');o.value=d.i;o.textContent=d.flag+' '+short(d);sel.appendChild(o);
  });
  sel.value=byName[norm('Brasil')];
  sheet = document.getElementById('sheet');
  document.getElementById('fbtn').onclick=function(){sheet.style.display='block';};
  document.getElementById('sclose').onclick=function(){sheet.style.display='none';};
  sheet.addEventListener('pointerdown',function(e){if(e.target===sheet)sheet.style.display='none';});
  document.getElementById('allon').onclick=function(){snap();estadoFiltros.nbSaved=null;estadoMapa.on=D.map(function(d){return avail(d)?1:0;});afterFilter();};
  document.getElementById('alloff').onclick=function(){snap();estadoFiltros.nbSaved=null;estadoMapa.on=D.map(function(){return 0;});afterFilter();};
  document.getElementById('nbsolo').onclick=function(){sheet.style.display='none';neighborsOf(+sel.value,false);};
  document.getElementById('nbadd').onclick=function(){sheet.style.display='none';neighborsOf(+sel.value,true);};
  /* categorias de territórios (menu ⋯ → Mapa) */
  $('nDis').textContent='('+D.filter(function(d){return d.dis;}).length+')';$('nDep').textContent='('+N_DEP+')';$('nUni').textContent='('+N_UNI+')';
  $('oDisputed').onclick=function(){setIncludeDisputed(this.checked);};
  $('oUni').checked=estadoMapa.includeUni;
  $('oUni').onclick=function(){setIncludeUni(this.checked);};
  $('oDep').checked=estadoMapa.includeDep;
  $('oDep').onclick=function(){setIncludeDep(this.checked);};
}

export { afterFilter, buildChips, buildTree, chips, estadoFiltros, iniciar, setIncludeDep, setIncludeDisputed, setIncludeUni, toggleNb, updateNbBtn };
