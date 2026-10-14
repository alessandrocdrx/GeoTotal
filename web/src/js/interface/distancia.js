/**
 * @arquivo js/interface/distancia.js
 * Camada: Interface
 * Distância entre capitais numa tela própria: de 2 a 6 paradas (A → B → C…), rota no globo e no mapa
 * 2D com um aviãozinho voando, e uma barra em cima com o total. Enquanto ela está aberta, o cartão,
 * a busca e os toques nos países ficam de fora (não misturam com o modo Livre nem com o Treino).
 */

import { D, norm } from '../dados/paises.js';
import { byName, capShort, short } from '../dados/vizinhos.js';
import { haversine } from '../nucleo/geo.js';
import { $ } from '../nucleo/utilitarios.js';
import { fitTo } from '../visualizacao/animacao.js';
import { ganchos } from '../visualizacao/ganchos.js';
import { proj2D, R2now } from '../visualizacao/mapa-2d.js';
import { ctx, estadoCamera, rot } from '../visualizacao/tela.js';
import { closeCard } from './cartao-detalhes.js';
import { hidePick } from './lista-proximos.js';

/** Estado compartilhado com outros módulos (leitura e escrita por estadoDistancia.nome). */
const estadoDistancia = {
  /** Linha desenhada: { pts (pontos 3D), pontos (índices em D), quiz?, aviao? }. O Treino usa uma com quiz: true. */
  arc: null,
  /** true enquanto a tela da Distância está aberta. */
  ativo: false,
};
const MAX_PARADAS = 6;
const VELOCIDADE = 850; /* km/h, avião de linha em cruzeiro */
let paradas = [];

function slerp(a,b,t){
  var dot=Math.max(-1,Math.min(1,a[0]*b[0]+a[1]*b[1]+a[2]*b[2])),om=Math.acos(dot),so=Math.sin(om);
  if(so<1e-6)return a.slice();
  var s1=Math.sin((1-t)*om)/so,s2=Math.sin(t*om)/so;
  return [a[0]*s1+b[0]*s2,a[1]*s1+b[1]*s2,a[2]*s1+b[2]*s2];
}
function xyz(d){return [d.x,d.y,d.z];}
/* ponto 3D (x = cos lat · sin lng, y = sin lat, z = cos lat · cos lng) em graus, para o mapa 2D */
function latLng(p){return {lat:Math.asin(Math.max(-1,Math.min(1,p[1])))*180/Math.PI,lng:Math.atan2(p[0],p[2])*180/Math.PI};}
/* posição na tela de um ponto 3D, ou null se estiver atrás do globo */
function naTela(p,R,cx,cy){
  if(estadoCamera.plano2D){var ll=latLng(p);return proj2D(ll.lng,ll.lat,R2now(),cx,cy);}
  var r=rot(p[0],p[1],p[2]);return r[2]>0.02?{x:cx+R*r[0],y:cy-R*r[1]}:null;
}
/* no 2D, um salto de meia tela é a rota cruzando a borda do mapa */
function salto(a,b){return estadoCamera.plano2D&&Math.abs(a.x-b.x)>R2now()*2;}
function drawArc(R,cx,cy){
  var arc=estadoDistancia.arc;if(!arc)return;
  ctx.save();ctx.setLineDash([7,5]);ctx.lineWidth=2.4;ctx.strokeStyle='#ffe066';ctx.lineJoin='round';
  ctx.beginPath();
  var prev=null,k,s;
  for(k=0;k<arc.pts.length;k++){
    s=naTela(arc.pts[k],R,cx,cy);
    if(s&&prev&&!salto(s,prev))ctx.lineTo(s.x,s.y);else if(s)ctx.moveTo(s.x,s.y);
    prev=s;
  }
  ctx.stroke();ctx.restore();
  var pontos=arc.pontos||[];
  pontos.forEach(function(i,n){
    var p=naTela(xyz(D[i]),R,cx,cy);if(!p)return;
    ctx.beginPath();ctx.arc(p.x,p.y,8,0,7);ctx.lineWidth=2.4;ctx.strokeStyle='#ffe066';ctx.stroke();
    if(pontos.length>2){
      ctx.fillStyle='#ffe066';ctx.beginPath();ctx.arc(p.x,p.y-18,9,0,7);ctx.fill();
      ctx.font='800 12px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillStyle='#1a1400';ctx.fillText(String.fromCharCode(65+n),p.x,p.y-17.5);
    }
  });
  if(arc.aviao)desenharAviao(R,cx,cy);
}
/* aviãozinho percorrendo a rota em loop (8 s por trecho, no máximo 20 s a volta toda) */
function desenharAviao(R,cx,cy){
  var arc=estadoDistancia.arc,n=arc.pts.length;if(n<2)return;
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var dur=Math.min(20000,8000*(arc.pontos.length-1)),t=(performance.now()%dur)/dur,f=t*(n-1),k=Math.floor(f);
  var a=naTela(arc.pts[k],R,cx,cy),b=naTela(arc.pts[Math.min(n-1,k+1)],R,cx,cy);
  if(!a||!b||salto(a,b))return;
  var fr=f-k,x=a.x+(b.x-a.x)*fr,y=a.y+(b.y-a.y)*fr,ang=Math.atan2(b.y-a.y,b.x-a.x);
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(1.3,1.3);
  ctx.fillStyle='#ffffff';ctx.strokeStyle='#1a2340';ctx.lineWidth=1;
  ctx.beginPath(); /* silhueta de avião, nariz para a direita */
  ctx.moveTo(11,0);ctx.lineTo(6,-1.6);ctx.lineTo(1,-1.6);ctx.lineTo(-3,-9);ctx.lineTo(-6,-9);ctx.lineTo(-3,-1.6);
  ctx.lineTo(-8,-1.6);ctx.lineTo(-10,-4.5);ctx.lineTo(-12,-4.5);ctx.lineTo(-11,0);ctx.lineTo(-12,4.5);ctx.lineTo(-10,4.5);
  ctx.lineTo(-8,1.6);ctx.lineTo(-3,1.6);ctx.lineTo(-6,9);ctx.lineTo(-3,9);ctx.lineTo(1,1.6);ctx.lineTo(6,1.6);ctx.closePath();
  ctx.fill();ctx.stroke();ctx.restore();
}
function fillCountrySelect(sel,first){
  D.slice().sort(function(a,b){return short(a).localeCompare(short(b),'pt');}).forEach(function(d){
    var o=document.createElement('option');o.value=d.i;o.textContent=d.flag+' '+short(d);sel.appendChild(o);
  });
  sel.value=byName[norm(first)];
}
function fmtKm(km){return Math.round(km).toLocaleString('pt-BR')+' km';}
/* tempo de voo: cruzeiro a 850 km/h mais ~30 min de subida e descida por trecho */
function fmtVoo(km,trechos){
  var min=Math.round(km/VELOCIDADE*60+30*trechos),h=Math.floor(min/60),m=min%60;
  return h?(h+' h'+(m?' '+m+' min':'')):(m+' min');
}
function letra(n){return String.fromCharCode(65+n);}

/* ---------- página do menu: lista de paradas ---------- */
function montarParadas(){
  var box=$('dstops');box.innerHTML='';
  paradas.forEach(function(i,n){
    var row=document.createElement('div');row.className='dstop';
    var l=document.createElement('b');l.textContent=letra(n);row.appendChild(l);
    var sel=document.createElement('select');sel.setAttribute('aria-label','Parada '+letra(n));
    fillCountrySelect(sel,'Brasil');sel.value=i;sel.onchange=function(){paradas[n]=+sel.value;};
    row.appendChild(sel);
    if(paradas.length>2){
      var x=document.createElement('button');x.textContent='✕';x.setAttribute('aria-label','Tirar a parada '+letra(n));
      x.onclick=function(){paradas.splice(n,1);montarParadas();};row.appendChild(x);
    }
    box.appendChild(row);
  });
  $('dadd').hidden=paradas.length>=MAX_PARADAS;
}

/* ---------- tela da Distância ---------- */
/** Abre a tela da Distância com a rota pelas paradas (índices em D). */
function mostrarDistancia(lista){
  lista=lista.filter(function(i,n){return n===0||i!==lista[n-1];});
  if(lista.length<2){$('dres').textContent='Escolha pelo menos dois países diferentes.';return;}
  /* tela própria: sai do Treino, fecha o menu, o cartão e a lista de países */
  if($('quiz').style.display==='block')$('qclose').click();
  closeCard();hidePick();$('msheet').style.display='none';$('dres').textContent='';
  var pts=[],tot=0,trechos=[],k;
  for(k=1;k<lista.length;k++){
    var a=D[lista[k-1]],b=D[lista[k]],km=haversine(a,b);tot+=km;
    trechos.push({a:a,b:b,km:km});
    for(var t=0;t<=1.0001;t+=1/80)pts.push(slerp(xyz(a),xyz(b),Math.min(1,t)));
  }
  estadoDistancia.arc={pts:pts,pontos:lista.slice(),aviao:true};
  estadoDistancia.ativo=true;document.body.classList.add('dist');
  var ida=D[lista[0]],fim=D[lista[lista.length-1]];
  $('dbtit').textContent='📏 '+ida.flag+' '+capShort(ida)+' → '+(lista.length>2?'… → ':'')+fim.flag+' '+capShort(fim);
  $('dbtot').textContent=fmtKm(tot)+' · ✈️ ~'+fmtVoo(tot,trechos.length)+' de voo';
  var lg=$('dblegs');lg.innerHTML='';
  trechos.forEach(function(tr,n){
    var li=document.createElement('div');
    li.textContent=letra(n)+' → '+letra(n+1)+': '+tr.a.flag+' '+capShort(tr.a)+' → '+tr.b.flag+' '+capShort(tr.b)+' · '+fmtKm(tr.km);
    lg.appendChild(li);
  });
  $('dbmais').hidden=trechos.length<2;lg.hidden=true;$('dbmais').textContent=trechos.length+' trechos ▾';
  fitTo(lista);
}
/** Fecha a tela da Distância e apaga a rota. */
function sairDistancia(){
  if(estadoDistancia.arc&&!estadoDistancia.arc.quiz)estadoDistancia.arc=null;
  if(!estadoDistancia.ativo)return;
  estadoDistancia.ativo=false;document.body.classList.remove('dist');
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  ganchos.desenharArco = drawArc;
  ganchos.distanciaAberta = function(){return estadoDistancia.ativo;};
  paradas=[byName[norm('Brasil')],byName[norm('Japão')]];
  montarParadas();
  $('dadd').onclick=function(){if(paradas.length<MAX_PARADAS){paradas.push(paradas[paradas.length-1]);montarParadas();}};
  $('dgo').onclick=function(){mostrarDistancia(paradas);};
  $('dexit').onclick=sairDistancia;
  $('dbmais').onclick=function(){var l=$('dblegs'),n=l.children.length;l.hidden=!l.hidden;this.textContent=n+' trechos '+(l.hidden?'▾':'▴');};
}

export { drawArc, estadoDistancia, fillCountrySelect, iniciar, mostrarDistancia, sairDistancia, slerp };
