/**
 * @arquivo js/interface/passeio.js
 * Camada: Interface
 * Passeio automático pela rota de países.
 */
/* ---------- passeio pela rota ---------- */
var tourT=null;
function tourStart(){
  if(tourT)return;
  var f=statesMode?onS.indexOf(1):firstOn();if(f<0)return;
  auto=false;spinB.setAttribute('aria-pressed','false');spinB.style.opacity=.5;
  if(statesMode){if(!selSt||!onS[selSt.i])selectSt(BRS[f],true);}
  else if(!selected||!on[selected.i])select(D[f],true);
  tourT=setInterval(function(){step(1);},4200);
  $('tour').textContent='⏸';$('tour').setAttribute('aria-label','Parar passeio');
}
function tourStop(){if(!tourT)return;clearInterval(tourT);tourT=null;$('tour').textContent='▶';$('tour').setAttribute('aria-label','Passeio pela rota');}
$('tour').onclick=function(){if(tourT)tourStop();else tourStart();};

