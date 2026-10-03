/**
 * @arquivo js/treino/destaque-escopo.js
 * Camada: Treino
 * Pulso de destaque da região do treino no globo.
 */
/* ---------- pulso de destaque do escopo no globo ---------- */
var scopePulse=null;
function firePulse(pts){scopePulse={pts:pts,t0:performance.now()};}
function firePulseForScope(){
  var idxs=poolIdx(),arr=QD();
  firePulse(idxs.map(function(i){return arr[i];}));
}
function drawScopePulse(R,cx,cy){
  if(!scopePulse||flat2D)return;
  var dt=performance.now()-scopePulse.t0,dur=1300;
  if(dt>dur){scopePulse=null;return;}
  var t=dt/dur,rad=10+34*t,al=(1-t)*.85;
  ctx.save();ctx.globalAlpha=al;ctx.lineWidth=2.4;ctx.strokeStyle='#ffe066';
  scopePulse.pts.forEach(function(p){
    var pp=rot(p.x,p.y,p.z);if(pp[2]<=0.02)return;
    var X=cx+R*pp[0],Y=cy-R*pp[1];
    ctx.beginPath();ctx.arc(X,Y,rad,0,7);ctx.stroke();
  });
  ctx.restore();
}

