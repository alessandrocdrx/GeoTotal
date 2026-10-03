/**
 * @arquivo js/interface/distancia.js
 * Camada: Interface
 * Distância entre capitais, desenhada como arco no globo.
 */

import { D, norm } from '../dados/paises.js';
import { byName, capShort, short } from '../dados/vizinhos.js';
import { haversine } from '../nucleo/geo.js';
import { $ } from '../nucleo/utilitarios.js';
import { fitTo } from '../visualizacao/animacao.js';
import { setStatus } from '../visualizacao/fronteiras.js';
import { ganchos } from '../visualizacao/ganchos.js';
import { ctx, rot } from '../visualizacao/globo.js';
import { flat2D } from '../visualizacao/mapa-2d.js';

/** Estado compartilhado com outros módulos (leitura e escrita por estadoDistancia.nome). */
const estadoDistancia = {
  arc: null,
};

function slerp(a,b,t){
  var dot=Math.max(-1,Math.min(1,a[0]*b[0]+a[1]*b[1]+a[2]*b[2])),om=Math.acos(dot),so=Math.sin(om);
  if(so<1e-6)return a.slice();
  var s1=Math.sin((1-t)*om)/so,s2=Math.sin(t*om)/so;
  return [a[0]*s1+b[0]*s2,a[1]*s1+b[1]*s2,a[2]*s1+b[2]*s2];
}
function drawArc(R,cx,cy){
  if(!estadoDistancia.arc||flat2D)return;
  ctx.save();ctx.setLineDash([7,5]);ctx.lineWidth=2.4;ctx.strokeStyle='#ffe066';ctx.lineJoin='round';
  ctx.beginPath();
  var pen=false,k,p;
  for(k=0;k<estadoDistancia.arc.pts.length;k++){
    p=rot(estadoDistancia.arc.pts[k][0],estadoDistancia.arc.pts[k][1],estadoDistancia.arc.pts[k][2]);
    if(p[2]>0.02){var X=cx+R*p[0],Y=cy-R*p[1];if(pen)ctx.lineTo(X,Y);else{ctx.moveTo(X,Y);pen=true;}}else pen=false;
  }
  ctx.stroke();ctx.restore();
  [estadoDistancia.arc.a,estadoDistancia.arc.b].forEach(function(i){
    var d=D[i];p=rot(d.x,d.y,d.z);
    if(p[2]>0.02){ctx.beginPath();ctx.arc(cx+R*p[0],cy-R*p[1],8,0,7);ctx.lineWidth=2.4;ctx.strokeStyle='#ffe066';ctx.stroke();}
  });
}
function fillCountrySelect(sel,first){
  D.slice().sort(function(a,b){return short(a).localeCompare(short(b),'pt');}).forEach(function(d){
    var o=document.createElement('option');o.value=d.i;o.textContent=d.flag+' '+short(d);sel.appendChild(o);
  });
  sel.value=byName[norm(first)];
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  ganchos.desenharArco = drawArc;
  fillCountrySelect($('dA'),'Brasil');fillCountrySelect($('dB'),'Japão');
  $('dgo').onclick=function(){
    var a=+$('dA').value,b=+$('dB').value;
    if(a===b){$('dres').textContent='Escolha dois países diferentes.';return;}
    var km=haversine(D[a],D[b]),pts=[],A=[D[a].x,D[a].y,D[a].z],B=[D[b].x,D[b].y,D[b].z];
    for(var t=0;t<=1.0001;t+=1/80)pts.push(slerp(A,B,Math.min(1,t)));
    estadoDistancia.arc={a:a,b:b,pts:pts};
    var txt=D[a].flag+' '+capShort(D[a])+' → '+D[b].flag+' '+capShort(D[b])+': '+Math.round(km).toLocaleString('pt-BR')+' km em linha reta pela superfície ('+Math.round(km*.621371).toLocaleString('pt-BR')+' mi) · voo direto de ~'+(km/850).toFixed(1).replace('.',',')+' h a 850 km/h.';
    $('dres').textContent=txt;
    $('msheet').style.display='none';
    setStatus(txt,12000);
    fitTo([a,b]);
  };
  $('dclear').onclick=function(){estadoDistancia.arc=null;$('dres').textContent='';setStatus('');};
}

export { drawArc, estadoDistancia, fillCountrySelect, iniciar, slerp };
