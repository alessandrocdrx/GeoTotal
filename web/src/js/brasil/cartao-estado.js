/**
 * @arquivo js/brasil/cartao-estado.js
 * Camada: Brasil
 * Cartão do estado selecionado.
 */
/* ---------- cartão do estado ---------- */
function stateView(st){
  if(STGEOM[st.i])return STGEOM[st.i];
  if(STFEAT[st.i]){var v=featView(STFEAT[st.i]);if(v)return (STGEOM[st.i]=v);}
  return {lat:st.clat,lng:st.clng,r:st.ext*Math.PI/180};
}
function fillInfoSt(st){
  var box=$('cinfo');box.innerHTML='';
  var dens=st.pop/st.area;
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
  stNbC=(stSaved&&selSt)?selSt.cn.slice():[];
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
  if(!onS[st.i]){onS[st.i]=1;afterFilter();}
  selSt=st;selected=null;refreshNbC();
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
  if(fly===false)flyTo(st.lat,st.lng,Math.max(zoom,1.6));
  else{var v=stateView(st);flyTo(v.lat,v.lng,zoomFor(v.r,5.5));}
}
function stepSt(dir){
  if(!selSt)return;
  var i=selSt.i,n=BRS.length;
  for(var k=0;k<n;k++){i=(i+dir+n)%n;if(onS[i]){selectSt(BRS[i],true);return;}}
}
function toggleNbSt(){
  if(stSaved){
    onS=stSaved.slice();stSaved=null;refreshNbC();afterFilter();
    var v=[];onS.forEach(function(x,k){if(x)v.push(k);});
    var b=countryView(byName[norm('Brasil')]);
    if(v.length===BRS.length)flyTo(b.lat,b.lng,zoomFor(b.r,3));else fitStates(v,[]);
    return;
  }
  if(!selSt)return;
  stSaved=onS.slice();
  onS=BRS.map(function(){return 0;});
  var idx=[selSt.i].concat(selSt.nb);idx.forEach(function(k){onS[k]=1;});
  refreshNbC();afterFilter();fitStates(idx,stNbC);
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

