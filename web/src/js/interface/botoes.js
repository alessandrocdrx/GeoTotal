/**
 * @arquivo js/interface/botoes.js
 * Camada: Interface
 * Botões de ferramentas do globo (zoom, polos, rótulos).
 */
/* ---------- Botões ---------- */
document.getElementById('zin').onclick=function(){target=null;zoom=Math.min(7,zoom*1.35);lastInteract=performance.now();};
document.getElementById('zout').onclick=function(){target=null;zoom=Math.max(.8,zoom/1.35);lastInteract=performance.now();};
document.getElementById('pn').onclick=function(){$('msheet').style.display='none';flyTo(90,lam*180/PI,1);};
document.getElementById('ps').onclick=function(){$('msheet').style.display='none';flyTo(-90,lam*180/PI,1);};
var spinB=document.getElementById('spin');
spinB.setAttribute('aria-pressed',auto?'true':'false');spinB.style.opacity=auto?1:.5;
spinB.onclick=function(){auto=!auto;spinB.setAttribute('aria-pressed',auto?'true':'false');spinB.style.opacity=auto?1:.5;};
var lp=document.getElementById('lp'),lc=document.getElementById('lc');
lp.onclick=function(){labelMode='p';lp.setAttribute('aria-pressed','true');lc.setAttribute('aria-pressed','false');};
lc.onclick=function(){labelMode='c';lc.setAttribute('aria-pressed','true');lp.setAttribute('aria-pressed','false');};

