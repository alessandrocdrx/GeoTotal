/**
 * @arquivo js/brasil/modo-estados.js
 * Camada: Brasil
 * Entrar e sair do modo estados.
 */
/* ---------- entrar e sair ---------- */
function updateStBtn(){$('stbtn').style.display=(!statesMode&&selected&&selected.cc==='BR')?'block':'none';}
function enterStates(st){
  syncFab();
  if(flat2D)setFlat2D(false);
  if(quiz.open)quizClose();
  tourStop();hidePick();
  statesMode=true;document.body.classList.add('states');
  closeCard();
  onS=BRS.map(function(){return 1;});stSaved=null;stNbC=[];
  buildChips();updateNbBtn();
  setStatus('');
  selectSt(st||BRS[0],true);
  ensureStateShapes();
}
function exitStates(goBrazil){
  setTimeout(syncFab,0);
  statesMode=false;document.body.classList.remove('states');
  selSt=null;stSaved=null;stNbC=[];card.style.display='none';cardH=0;hidePick();
  buildChips();afterFilter();
  if(goBrazil!==false)select(D[byName[norm('Brasil')]],true);
}
$('stexit').onclick=function(){exitStates(true);};
$('stbtn').onclick=function(){enterStates(null);};

