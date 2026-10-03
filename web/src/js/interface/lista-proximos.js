/**
 * @arquivo js/interface/lista-proximos.js
 * Camada: Interface
 * Lista curta quando vários países estão colados no toque.
 */
/* ---------- lista curta quando vários países estão colados ---------- */
var pick=$('pick');
function hidePick(){pick.style.display='none';}
function showPickItems(items,x,y){
  pick.innerHTML='';
  items.slice(0,6).forEach(function(it){
    var b=document.createElement('button');
    b.textContent=it.label;
    b.onclick=function(){hidePick();it.fn();};
    pick.appendChild(b);
  });
  pick.style.display='block';
  var st=$('stage').getBoundingClientRect(),w=pick.offsetWidth,h=pick.offsetHeight;
  pick.style.left=Math.max(6,Math.min(x-w/2,st.width-w-6))+'px';
  pick.style.top=Math.max(6,Math.min(y+16,st.height-h-6))+'px';
}
function showPick(list,x,y){
  showPickItems(list.map(function(d){return {label:d.flag+' '+short(d)+' — '+capShort(d),fn:function(){select(d,false);}};}),x,y);
}
cv.addEventListener('pointerdown',function(){hidePick();tourStop();});

