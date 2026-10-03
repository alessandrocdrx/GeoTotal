/**
 * @arquivo js/interface/filtros.js
 * Camada: Interface
 * Filtros de países (chips, árvore, vizinhança) e disponibilidade das categorias.
 */
/* ---------- Filtros ---------- */
var nbSaved=null;
function allOn(){return D.every(function(d){return on[d.i]||!avail(d);});}
function updateNbBtn(){
  var b=document.getElementById('nbtn');
  if(statesMode){
    if(stSaved){b.style.visibility='visible';b.textContent='↩ Mostrar todos';}
    else{b.style.visibility=selSt?'visible':'hidden';b.textContent='Só vizinhos';}
    return;
  }
  if(nbSaved){b.style.visibility='visible';b.textContent='↩ Mostrar todos';}
  else{b.style.visibility=(selected&&NB[selected.i].length)?'visible':'hidden';b.textContent='Só vizinhos';}
}
function toggleNb(){
  if(statesMode){toggleNbSt();return;}
  if(nbSaved){
    snap();on=nbSaved.slice();nbSaved=null;afterFilter();
    var vis=[];on.forEach(function(v,k){if(v)vis.push(k);});
    if(allOn())flyTo(phi*180/PI,lam*180/PI,1);else fitTo(vis);
    return;
  }
  if(!selected)return;
  snap();
  var i=selected.i,keep=on.slice(),idxs=[i].concat(NB[i]);
  on=D.map(function(){return 0;});idxs.forEach(function(k){on[k]=1;});
  nbSaved=keep;afterFilter();fitTo(idxs);
}
function soloOf(r){return D.every(function(d){return !avail(d)||on[d.i]===(d.r===r?1:0);});}
function afterFilter(){
  tourStop();
  D.forEach(function(d){if(!avail(d)&&(!selected||d.i!==selected.i))on[d.i]=0;});
  if(statesMode){buildChips();updateNbBtn();return;}
  buildChips();refreshTree();
  var n=on.reduce(function(a,b){return a+b;},0);
  var nA=availCount(),nOn=D.filter(function(d){return on[d.i]&&avail(d);}).length;
  document.getElementById('fbtn').textContent='🌍 '+(nOn>=nA?'Todas':nOn===0?'Nenhum':nOn+'/'+nA)+(nOn>0&&nOn<nA?' países':'');
  $('sheetcount').textContent=nA+' países e territórios disponíveis.';
  updateNbBtn();
  if(selected&&!on[selected.i])closeCard();
  saveLastView();
}
function setOn(idxs,val){snap();nbSaved=null;idxs.forEach(function(i){on[i]=val?1:0;});afterFilter();}
function neighborsOf(i,add){
  snap();nbSaved=null;
  var idxs=[i].concat(NB[i]);
  if(!add)on=D.map(function(){return 0;});
  idxs.forEach(function(k){on[k]=1;});
  afterFilter();
  var vis=[];on.forEach(function(v,k){if(v)vis.push(k);});
  fitTo(add?vis:idxs);
}

var chips=document.getElementById('chips');
function mkChip(label,color,val,count){
  var b=document.createElement('button');b.className='chip';
  b.setAttribute('aria-pressed',(val<0?allOn():soloOf(val))?'true':'false');
  if(color){var s=document.createElement('span');s.className='dot';s.style.background=color;b.appendChild(s);}
  b.appendChild(document.createTextNode(label+' ('+count+')'));
  b.onclick=function(){
    snap();nbSaved=null;
    if(val<0||soloOf(val)){on=D.map(function(d){return avail(d)?1:0;});afterFilter();flyTo(phi*180/PI,lam*180/PI,1);}
    else{on=D.map(function(d){return d.r===val&&avail(d)?1:0;});afterFilter();var g=REG[val];flyTo(g.lat,g.lng,g.z);}
  };
  return b;
}
function buildChips(){
  if(statesMode){buildChipsSt();return;}
  chips.innerHTML='';
  chips.appendChild(mkChip('Todas',null,-1,availCount()));
  for(var r=0;r<REG.length;r++){var nr=D.filter(function(d){return d.r===r&&avail(d);}).length;if(nr)chips.appendChild(mkChip(REG[r].n,REG[r].c,r,nr));}
}

/* painel de filtros: continente > sub-região > país */
var boxes=[];
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
    var n=0;b.idx.forEach(function(i){n+=on[i];});
    b.cb.checked=n===b.idx.length;
    b.cb.indeterminate=n>0&&n<b.idx.length;
  });
}
var sel=document.getElementById('nbsel');
D.slice().sort(function(a,b){return short(a).localeCompare(short(b),'pt');}).forEach(function(d){
  var o=document.createElement('option');o.value=d.i;o.textContent=d.flag+' '+short(d);sel.appendChild(o);
});
sel.value=byName[norm('Brasil')];
var sheet=document.getElementById('sheet');
document.getElementById('fbtn').onclick=function(){sheet.style.display='block';};
document.getElementById('sclose').onclick=function(){sheet.style.display='none';};
sheet.addEventListener('pointerdown',function(e){if(e.target===sheet)sheet.style.display='none';});
document.getElementById('allon').onclick=function(){snap();nbSaved=null;on=D.map(function(d){return avail(d)?1:0;});afterFilter();};
document.getElementById('alloff').onclick=function(){snap();nbSaved=null;on=D.map(function(){return 0;});afterFilter();};
document.getElementById('nbsolo').onclick=function(){sheet.style.display='none';neighborsOf(+sel.value,false);};
document.getElementById('nbadd').onclick=function(){sheet.style.display='none';neighborsOf(+sel.value,true);};

