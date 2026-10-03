/**
 * @arquivo js/interface/interacao.js
 * Camada: Interface
 * Gestos: arrastar, pinça, roda do mouse e toque no globo.
 */
/* ---------- Interação ---------- */
var dragging=false,ptrs={},lastX=0,lastY=0,startT=0,pinch0=0,zoom0=1,moved=0;
cv.addEventListener('pointerdown',function(e){
  cv.setPointerCapture(e.pointerId);ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
  var ids=Object.keys(ptrs);
  if(ids.length===1){dragging=true;lastX=e.clientX;lastY=e.clientY;startT=performance.now();moved=0;target=null;}
  if(ids.length===2){var a=ptrs[ids[0]],b=ptrs[ids[1]];pinch0=Math.hypot(a.x-b.x,a.y-b.y);zoom0=zoom;}
  lastInteract=performance.now();
});
cv.addEventListener('pointermove',function(e){
  if(!ptrs[e.pointerId])return;
  ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
  var ids=Object.keys(ptrs);
  if(ids.length>=2){
    var a=ptrs[ids[0]],b=ptrs[ids[1]];
    var dd=Math.hypot(a.x-b.x,a.y-b.y);
    if(pinch0>0)zoom=Math.max(.8,Math.min(7,zoom0*dd/pinch0));
    moved=99;
  }else if(dragging){
    var dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;
    moved+=Math.abs(dx)+Math.abs(dy);
    var Re=(flat2D?R2now():R0)*zoom;
    lam-=dx/Re;phi=Math.max(-PI/2,Math.min(PI/2,phi+dy/Re));
  }
  lastInteract=performance.now();
});
function endPtr(e){
  var was=ptrs[e.pointerId];delete ptrs[e.pointerId];
  var n=Object.keys(ptrs).length;
  if(n===0){
    dragging=false;
    if(was&&e.type==='pointerup'&&moved<8&&performance.now()-startT<450)tap(e.clientX,e.clientY);
  }
  if(n<2)pinch0=0;
  if(n===1){var id=Object.keys(ptrs)[0];lastX=ptrs[id].x;lastY=ptrs[id].y;dragging=true;}
}
cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',endPtr);
cv.addEventListener('wheel',function(e){e.preventDefault();zoom=Math.max(.8,Math.min(7,zoom*Math.exp(-e.deltaY*.0014)));lastInteract=performance.now();},{passive:false});

function tap(px,py){
  if(flat2D&&!statesMode){tap2D(px,py);return;}
  if(quiz.open&&!qMap)return;
  var r=cv.getBoundingClientRect(),x=px-r.left,y=py-r.top,R=R0*zoom,cand=[];
  if(qMap&&quizDomain==='br'){quizMapAnswerBR(pickStateNear(x,y));return;}
  if(statesMode){stTap(x,y);return;}
  if(!qHide()){
    for(var i=0;i<D.length;i++){
      if(!on[i])continue;
      var d=D[i],p=rot(d.x,d.y,d.z);if(p[2]<=0.05)continue;
      var sx=W/2+R*p[0],sy=H*cyFrac-R*p[1],dd=(sx-x)*(sx-x)+(sy-y)*(sy-y);
      if(dd<36*36)cand.push({d:d,dd:dd});
    }
    cand.sort(function(a,b){return a.dd-b.dd;});
  }
  if(qMap){
    var tg=D[quiz.cur];
    if(tg&&!FEAT[tg.i]&&!quiz.answered){
      var tp=rot(tg.x,tg.y,tg.z),tsx=W/2+R*tp[0],tsy=H*cyFrac-R*tp[1];
      if(tp[2]>0.05&&(tsx-x)*(tsx-x)+(tsy-y)*(tsy-y)<44*44){quizMapAnswer(tg);return;}
      var hit=cand.length?cand[0].d:countryAt(x,y);
      if(!hit){projCfg(R0*zoom,W/2,H*cyFrac);var ll=proj.invert([x,y]);
        if(ll&&!isNaN(ll[0])){var km0=Math.round(haversine({lat:ll[1],lng:ll[0]},tg));finishQ(false,'Você tocou a '+km0.toLocaleString('pt-BR')+' km do lugar certo.');return;}}
      quizMapAnswer(hit);return;
    }
    quizMapAnswer(cand.length?cand[0].d:countryAt(x,y));return;
  }
  hidePick();
  /* toque preciso no ponto vence; senão vale o país sob o dedo; senão, o ponto mais próximo */
  var precise=cand.length&&cand[0].dd<14*14;
  var poly=precise?null:countryAt(x,y);
  var chosen=precise?cand[0].d:(poly||(cand.length?cand[0].d:null));
  if(chosen){
    var grp=cand.map(function(c){return c.d;});
    if(grp.indexOf(chosen)<0)grp.unshift(chosen);
    select(chosen,false,grp);
  }else if(selected)closeCard();
}

