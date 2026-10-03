/**
 * @arquivo js/brasil/filtros.js
 * Camada: Brasil
 * Filtros por região do Brasil.
 */
/* ---------- filtros por região do Brasil ---------- */
function mkChipSt(label,color,val,count){
  var b=document.createElement('button');b.className='chip';
  var pressed=val<0?onS.every(function(v){return v;}):BRS.every(function(s){return onS[s.i]===(s.reg===val?1:0);});
  b.setAttribute('aria-pressed',pressed?'true':'false');
  if(color){var s=document.createElement('span');s.className='dot';s.style.background=color;b.appendChild(s);}
  b.appendChild(document.createTextNode(label+' ('+count+')'));
  b.onclick=function(){
    stSaved=null;
    var all=val<0||pressed;
    onS=BRS.map(function(s){return (all||s.reg===val)?1:0;});
    if(!all&&selSt&&selSt.reg!==val){selSt=null;card.style.display='none';cardH=0;}
    afterFilter();
    var v=[];onS.forEach(function(x,k){if(x)v.push(k);});
    var br=countryView(byName[norm('Brasil')]);
    if(v.length===BRS.length)flyTo(br.lat,br.lng,zoomFor(br.r,3));else fitStates(v,[]);
  };
  return b;
}
function buildChipsSt(){
  chips.innerHTML='';
  chips.appendChild(mkChipSt('Todos',null,-1,BRS.length));
  BRREG.forEach(function(r,ri){chips.appendChild(mkChipSt(r.n,r.c,ri,BRS.filter(function(s){return s.reg===ri;}).length));});
}

