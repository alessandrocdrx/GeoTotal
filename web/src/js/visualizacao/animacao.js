/**
 * @arquivo js/visualizacao/animacao.js
 * Camada: Visualização
 * Laço de animação (voo da câmera, rotação automática).
 */
/* ---------- Animação ---------- */
var PI=Math.PI;
function shortest(a,b){var d=b-a;while(d>PI)d-=2*PI;while(d<-PI)d+=2*PI;return d;}
function frame(){
  if(target){
    var dl=shortest(lam,target.lam),dp=target.phi-phi,dz=target.zoom-zoom;
    lam+=dl*.14;phi+=dp*.14;zoom+=dz*.14;
    if(Math.abs(dl)<.0008&&Math.abs(dp)<.0008&&Math.abs(dz)<.004)target=null;
  }else if(auto&&!dragging&&!selected&&!quiz.open&&!statesMode&&!selSt&&!flat2D&&(performance.now()-lastInteract>2500)){
    lam+=0.0022;
  }
  var wantCy=((selected||selSt)&&!quiz.open)?Math.max(.26,Math.min(.5,(H-cardH)/(2*H))):(quiz.open?Math.max(.24,Math.min(.5,(H-qPanelH)/(2*H))):.5);cyFrac+=(wantCy-cyFrac)*.15;
  if(lam>PI)lam-=2*PI;if(lam<-PI)lam+=2*PI;
  draw();requestAnimationFrame(frame);
}
function flyTo(latDeg,lngDeg,z){
  document.getElementById('hint').style.display='none';
  target={lam:lngDeg*PI/180,phi:Math.max(-PI/2,Math.min(PI/2,latDeg*PI/180)),zoom:z};
  lastInteract=performance.now();
}
function fitTo(idxs){
  if(!idxs.length)return;
  var sx=0,sy=0,sz=0;
  idxs.forEach(function(i){sx+=D[i].x;sy+=D[i].y;sz+=D[i].z;});
  var m=Math.sqrt(sx*sx+sy*sy+sz*sz)||1;sx/=m;sy/=m;sz/=m;
  var th=0;
  idxs.forEach(function(i){var c=D[i].x*sx+D[i].y*sy+D[i].z*sz;th=Math.max(th,Math.acos(Math.max(-1,Math.min(1,c))));});
  var z=Math.max(1,Math.min(3.2,0.9/Math.sin(Math.min(th+0.12,1.5))));
  flyTo(Math.asin(sy)*180/PI,Math.atan2(sx,sz)*180/PI,z);
}

