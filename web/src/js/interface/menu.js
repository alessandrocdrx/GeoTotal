/**
 * @arquivo js/interface/menu.js
 * Camada: Interface
 * Menu "⋯": navegação entre páginas e ações.
 */
/* ---------- menu Mais ---------- */
var themeMode=lsGet('globo.theme','auto');
function applyTheme(){
  document.documentElement.removeAttribute('data-theme');
  if(themeMode==='light')document.documentElement.setAttribute('data-theme','light');
  else if(themeMode==='dark')document.documentElement.setAttribute('data-theme','dark');
  $('themeb').textContent='🌗 Tema: '+({auto:'automático',light:'claro',dark:'escuro'})[themeMode];
  var tv=$('mthemev');if(tv)tv.textContent=({auto:'Automático (segue o celular)',light:'Claro',dark:'Escuro'})[themeMode];
}
$('themeb').onclick=function(){
  themeMode=themeMode==='auto'?'light':(themeMode==='light'?'dark':'auto');
  lsSet('globo.theme',themeMode);applyTheme();
};
applyTheme();
function mShow(id){
  $('mlist').hidden=!!id;
  Array.prototype.forEach.call(document.querySelectorAll('#msheet .mpage'),function(pg){pg.hidden=pg.id!==id;});
  $('mback').hidden=!id;$('mtitle').textContent=id?$(id).getAttribute('data-t'):'Mais';
  var bx=$('msheet').querySelector('.box');if(bx)bx.scrollTop=0;
}
Array.prototype.forEach.call(document.querySelectorAll('#mlist [data-p]'),function(b){b.onclick=function(){mShow(b.getAttribute('data-p'));};});
$('mback').onclick=function(){mShow(null);};
$('mthemerow').onclick=function(){$('themeb').click();};
function updateLabelsRow(){$('mlabelsv').textContent=labelMode==='p'?'Países':'Capitais';}
$('mlabels').onclick=function(){(labelMode==='p'?$('lc'):$('lp')).click();updateLabelsRow();};
updateLabelsRow();
$('mbtn').onclick=function(){updateMapInfo();mShow(null);$('msheet').style.display='block';};
$('mclose').onclick=function(){$('msheet').style.display='none';};
$('msheet').addEventListener('pointerdown',function(e){if(e.target===$('msheet'))$('msheet').style.display='none';});
$('txtd').addEventListener('pointerdown',function(e){if(e.target===$('txtd'))$('txtd').style.display='none';});

