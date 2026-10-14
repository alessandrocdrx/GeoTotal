/**
 * @arquivo js/interface/distancia.js
 * Camada: Interface
 * Distância entre capitais numa tela própria: de 2 a 6 paradas (A → B → C…), rota no globo e no mapa
 * 2D com um aviãozinho voando, e uma barra em cima com o total. Enquanto ela está aberta, o cartão,
 * a busca e os toques nos países ficam de fora (não misturam com o modo Livre nem com o Treino).
 */

import { AEROPORTO_DA_CAPITAL, HUBS } from '../dados/aeroportos.js';
import { escalasOpenFlights } from '../dados/voos.js';
import { D, dflag, norm } from '../dados/paises.js';
import { byName, capShort, short } from '../dados/vizinhos.js';
import { haversine } from '../nucleo/geo.js';
import { $, lsGet, lsSet } from '../nucleo/utilitarios.js';
import { fitTo } from '../visualizacao/animacao.js';
import { ganchos } from '../visualizacao/ganchos.js';
import { proj2D, R2now } from '../visualizacao/mapa-2d.js';
import { estadoRender } from '../visualizacao/projecao.js';
import { ctx, estadoCamera, rot, W } from '../visualizacao/tela.js';
import { closeCard } from './cartao-detalhes.js';
import { buscaNoSelect } from './escolha-pais.js';
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
const COR = {reta:'#ffffff',voo:'#ffe066'};
/* no atlas o mar e as terras são claros: traço escuro, com contorno branco por baixo */
const COR_ATLAS = {reta:'#1d3557',voo:'#d62828'};
function corRota(modo){return (estadoRender.atlas&&estadoRender.feats?COR_ATLAS:COR)[modo]||COR.voo;}
/* etiqueta escura com o código do aeroporto, embaixo do ponto */
/* onde cada sigla foi desenhada neste quadro, para o toque saber qual aeroporto é */
let siglas = [];
function etiqueta(txt,x,y,info){
  ctx.font='800 11px system-ui,sans-serif';var w=ctx.measureText(txt).width+10;
  if(info)siglas.push({x:x-w/2-6,y:y+3,w:w+12,h:28,cx:x,cy:y,info:info});
  ctx.fillStyle='rgba(10,16,30,.85)';ctx.fillRect(x-w/2,y+9,w,16);ctx.fillStyle='#fff';ctx.fillText(txt,x,y+17.5);
}
function drawArc(R,cx,cy){
  siglas=[];
  var arc=estadoDistancia.arc;if(!arc)return;
  var cor=corRota(arc.modo),atlas=estadoRender.atlas&&!!estadoRender.feats,larg=arc.modo==='reta'?2:2.4;
  ctx.save();ctx.lineJoin='round';
  ctx.beginPath();
  var prev=null,k,s;
  for(k=0;k<arc.pts.length;k++){
    s=naTela(arc.pts[k],R,cx,cy);
    if(s&&prev&&!salto(s,prev))ctx.lineTo(s.x,s.y);else if(s)ctx.moveTo(s.x,s.y);
    prev=s;
  }
  ctx.lineWidth=larg+3;ctx.strokeStyle=atlas?'rgba(255,255,255,.9)':'rgba(4,16,36,.55)';ctx.stroke();
  ctx.setLineDash(arc.modo==='reta'?[]:[7,5]);ctx.lineWidth=atlas?larg+.6:larg;ctx.strokeStyle=cor;ctx.stroke();
  ctx.restore();
  ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
  /* escalas: bolinha branca com o código do aeroporto */
  (arc.escalas||[]).forEach(function(h){
    var p=naTela(xyz(h),R,cx,cy);if(!p)return;
    ctx.beginPath();ctx.arc(p.x,p.y,5,0,7);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#ff9f43';ctx.stroke();
    etiqueta(h.cod,p.x,p.y,{cod:h.cod,txt:'Escala em '+h.cidade+(arc.fontes&&arc.fontes.indexOf('of')>=0?' (OpenFlights 2014)':' (estimativa)')});
  });
  /* paradas: a mesma capital duas vezes (ida e volta) ganha as duas letras, ex.: A·E */
  var pontos=arc.pontos||[],letras={};
  pontos.forEach(function(i,n){(letras[i]=letras[i]||[]).push(letra(n));});
  Object.keys(letras).forEach(function(i){
    var p=naTela(xyz(D[i]),R,cx,cy);if(!p)return;
    ctx.beginPath();ctx.arc(p.x,p.y,8,0,7);ctx.lineWidth=2.4;ctx.strokeStyle=cor;ctx.stroke();
    var c=codAero(D[i]);if(c&&arc.modo==='voo')etiqueta(c,p.x,p.y+2,infoCapital(D[i]));
    if(pontos.length>2){
      var t=letras[i].join('·');ctx.font='800 12px system-ui,sans-serif';
      var w=Math.max(18,ctx.measureText(t).width+10);
      ctx.fillStyle=cor;ctx.beginPath();
      if(ctx.roundRect)ctx.roundRect(p.x-w/2,p.y-27,w,18,9);else ctx.rect(p.x-w/2,p.y-27,w,18);
      ctx.fill();ctx.fillStyle=atlas?'#fff':'#1a1400';ctx.fillText(t,p.x,p.y-17.5);
    }
  });
  ctx.restore();
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
  buscaNoSelect(sel);
}
function fmtKm(km){return Math.round(km).toLocaleString('pt-BR')+' km';}
function letra(n){return String.fromCharCode(65+n);}

/* ---------- rotas: linha reta ou voo (direto quando dá, com escalas quando precisa) ---------- */
const MODOS = [['reta','📏 Reta'],['voo','✈️ Voo']];
const DESVIO = 1.05;           /* voos reais fazem ~5% a mais que a linha reta (rotas aéreas, vento) */
const ALC_REGIONAL = 3500, ALC_LONGO = 13000, CUSTO_ESCALA = 1500;
let modo = 'voo';
/** Código do aeroporto da capital (ex.: BSB), ou '' se não houver um por perto. */
/** Toque na tela da Distância: numa sigla, diz que aeroporto é (balão perto dela). Devolve true se tratou. */
function toqueNaRota(x,y){
  var b=$('dbaero');
  /* a sigla mais perto do toque, até uns 44 px (dedo não é mouse) */
  var melhor=null,md=44*44;
  siglas.forEach(function(g){var gx=g.x+g.w/2,gy=g.y+g.h/2,dd=(gx-x)*(gx-x)+(gy-y)*(gy-y);if(dd<md){md=dd;melhor=g;}});
  if(melhor){mostrarAeroporto(melhor.info,melhor.cx,melhor.cy+34);return true;}
  b.hidden=true;
  return false;
}
/** Balão com o que é a sigla, perto de (x, y) da tela do mapa. */
function mostrarAeroporto(info,x,y){
  var b=$('dbaero');b.innerHTML='';
  var t=document.createElement('b');t.textContent='✈️ '+info.cod;
  var p=document.createElement('span');p.textContent=info.txt;
  b.appendChild(t);b.appendChild(p);b.hidden=false;
  b.style.left=Math.max(8,Math.min(W-228,x-110))+'px';b.style.top=Math.max(8,y)+'px';
  clearTimeout(b._t);b._t=setTimeout(function(){b.hidden=true;},6000);
}
/* sigla como botão no texto da barra: toca e aparece o balão logo abaixo da barra */
function botaoSigla(info){
  var s=document.createElement('button');s.className='sigla';s.textContent=info.cod;
  s.setAttribute('aria-label','Aeroporto '+info.cod);
  s.onclick=function(e){
    e.stopPropagation();
    var st=$('stage').getBoundingClientRect(),r=s.getBoundingClientRect();
    mostrarAeroporto(info,r.left-st.left+r.width/2,r.bottom-st.top+6);
  };
  return s;
}
function infoCapital(d){return {cod:codAero(d),txt:'Aeroporto que atende '+capShort(d)+', capital de '+dflag(d)+' '+short(d)};}
function codAero(d){return AEROPORTO_DA_CAPITAL[d.cc]||'';}
function rotulo(d){var c=codAero(d);return (c?c+' ':'')+capShort(d);}
function km(a,b){return haversine(a,b);}
/* hub da própria cidade (capital a menos de 80 km do aeroporto), ou null */
function maisPerto(c){var m=HUBS[0];HUBS.forEach(function(h){if(km(c,h)<km(c,m))m=h;});return m;}
function hubDaCidade(c){for(var k=0;k<HUBS.length;k++)if(km(c,HUBS[k])<80)return HUBS[k];return null;}
/** Escalas típicas entre duas capitais: caminho mais barato pelos grandes aeroportos de conexão,
    onde cada voo a mais "custa" 1.500 km (as companhias evitam escalas, mas não voltas enormes). */
function rotaComEscalas(a,b){
  var ha=hubDaCidade(a),hb=hubDaCidade(b),nos=[a,b].concat(HUBS),n=nos.length;
  /* capital sem hub próprio: o primeiro voo vai para o hub mais perto (de Brasília, São Paulo) */
  var pa=ha||maisPerto(a),pb=hb||maisPerto(b);
  function custo(i,j){
    var u=nos[i],v=nos[j],d=km(u,v);
    if((i===0&&v===ha)||(i===1&&v===hb)||(j===0&&u===ha)||(j===1&&u===hb))return 0;
    if(i<2&&j<2)return (d<=ALC_REGIONAL||(ha&&hb&&d<=ALC_LONGO))?d+CUSTO_ESCALA:Infinity;
    if(i<2)return (ha||v===(i===0?pa:pb))?(ha&&d>ALC_LONGO?Infinity:d+CUSTO_ESCALA):Infinity;
    if(j<2)return (hb||u===(j===0?pa:pb))?(hb&&d>ALC_LONGO?Infinity:d+CUSTO_ESCALA):Infinity;
    return d<=ALC_LONGO?d+CUSTO_ESCALA:Infinity;
  }
  var dist=[],ant=[],feito=[],k,i;
  for(k=0;k<n;k++){dist[k]=Infinity;ant[k]=-1;}
  dist[0]=0;
  for(;;){
    var u=-1;for(k=0;k<n;k++)if(!feito[k]&&dist[k]<Infinity&&(u<0||dist[k]<dist[u]))u=k;
    if(u<0||u===1)break;feito[u]=1;
    for(i=0;i<n;i++){if(feito[i]||i===u)continue;var c=custo(u,i);if(dist[u]+c<dist[i]){dist[i]=dist[u]+c;ant[i]=u;}}
  }
  if(dist[1]===Infinity)return [a,b];
  var cam=[];for(k=1;k>=0;k=ant[k]){cam.unshift(nos[k]);if(k===0)break;}
  /* o aeroporto da própria capital não é escala */
  return cam.filter(function(x){return !(x===ha&&x!==a)&&!(x===hb&&x!==b);});
}
/* nome da cidade de uma escala do OpenFlights: em português quando é um dos grandes hubs ou a capital
   de um país do jogo; senão, como vem do OpenFlights */
let capitalPorAero = null;
function cidadeDaEscala(e){
  for(var k=0;k<HUBS.length;k++)if(HUBS[k].cod===e.cod)return HUBS[k].cidade;
  if(!capitalPorAero){capitalPorAero={};D.forEach(function(d){var c=codAero(d);if(c&&!capitalPorAero[c])capitalPorAero[c]=d;});}
  var d=capitalPorAero[e.cod];
  return d?capShort(d)+' ('+short(d)+')':e.cidade+' ('+e.pais+')';
}
/** Voo entre duas capitais: pelas rotas do OpenFlights (2014) quando há dado; senão, a estimativa. */
function rotaVoo(a,b){
  var ca=codAero(a),cb=codAero(b),of=ca&&cb?escalasOpenFlights(ca,cb):null;
  if(of)return {fonte:'of',nos:[a].concat(of.map(function(e){
    var r=Math.PI/180,la=e.lat*r,lo=e.lng*r;
    return {cod:e.cod,cidade:cidadeDaEscala(e),lat:e.lat,lng:e.lng,x:Math.cos(la)*Math.sin(lo),y:Math.sin(la),z:Math.cos(la)*Math.cos(lo)};
  }),[b])};
  return {fonte:'est',nos:rotaComEscalas(a,b)};
}
function fmtHoras(h){var min=Math.round(h*60),hh=Math.floor(min/60),m=min%60;return hh?(hh+' h'+(m?' '+m+' min':'')):(m+' min');}

/* ---------- tela da Distância ---------- */
/** Abre (ou refaz) a tela da Distância com a rota pelas paradas (índices em D). */
function mostrarDistancia(lista){
  lista=(lista||paradas).filter(function(i,n,l){return n===0||i!==l[n-1];});
  if(lista.length<2){paradas=lista.concat(lista[0]===byName[norm('Brasil')]?byName[norm('Japão')]:byName[norm('Brasil')]);lista=paradas.slice();}
  paradas=lista.slice();
  /* tela própria: sai do Treino, fecha o menu, o cartão e a lista de países */
  if($('quiz').style.display==='block')$('qclose').click();
  closeCard();hidePick();$('msheet').style.display='none';
  var pts=[],trechos=[],escalas=[],tot=0,horas=0,k,j;
  for(k=1;k<lista.length;k++){
    var a=D[lista[k-1]],b=D[lista[k]];
    /* voo: sem escala quando dá; senão, pelos grandes aeroportos de conexão. Cada voo faz uns 5% a mais
       que a linha reta (rotas aéreas e vento) e leva ~30 min a mais para subir e descer */
    var rv=modo==='voo'?rotaVoo(a,b):{fonte:'reta',nos:[a,b]},nos=rv.nos,kmTrecho=0;
    for(j=1;j<nos.length;j++){
      var d=km(nos[j-1],nos[j])*(modo==='voo'?DESVIO:1);kmTrecho+=d;
      for(var t=0;t<=1.0001;t+=1/80)pts.push(slerp(xyz(nos[j-1]),xyz(nos[j]),Math.min(1,t)));
      if(modo==='voo')horas+=d/VELOCIDADE+0.5;
      if(j<nos.length-1){escalas.push(nos[j]);horas+=2;}
    }
    tot+=kmTrecho;
    trechos.push({a:a,b:b,km:kmTrecho,via:nos.slice(1,-1),fonte:rv.fonte});
  }
  estadoDistancia.arc={pts:pts,pontos:lista.slice(),aviao:modo!=='reta',modo:modo,escalas:escalas,fontes:trechos.map(function(t){return t.fonte;})};
  estadoDistancia.ativo=true;document.body.classList.add('dist');
  var ida=D[lista[0]],fim=D[lista[lista.length-1]];
  $('dbtit').textContent=ida.flag+' '+rotulo(ida)+' → '+(lista.length>2?'… → ':'')+fim.flag+' '+rotulo(fim);
  var txt=fmtKm(tot);
  if(modo==='reta')txt+=' em linha reta pela superfície';
  else txt+=' · ~'+fmtHoras(horas)+(escalas.length?' com '+escalas.length+(escalas.length===1?' escala':' escalas'):' sem escala');
  $('dbtot').textContent=txt;
  var nOf=trechos.filter(function(t){return t.fonte==='of';}).length,nEst=trechos.length-nOf;
  var nota=modo==='reta'?'O caminho mais curto pela superfície da Terra, sem pensar em aviões.':
    ((nOf?(nEst?'Trechos marcados "OpenFlights": voos que existiam em 2014, nos dados abertos do OpenFlights. Trechos marcados "estimativa": sem dado, montados pelos grandes aeroportos de conexão. ':'Rota com voos que existiam em 2014, segundo os dados abertos do OpenFlights. As companhias mudam as rotas o tempo todo: confira antes de viajar. '):'Estimativa: sem dado do OpenFlights para esta rota, ela foi montada pelos grandes aeroportos de conexão. ')+
    (escalas.length?'Escalas: '+escalas.map(function(h){return h.cod+' '+h.cidade;}).join(', ')+'. ':'')+
    'Km e horas são estimados (5% a mais que a linha reta, 30 min para subir e descer e 2 h em cada escala).');
  $('dbnota').textContent=nota;
  Array.prototype.forEach.call($('dbmodo').children,function(bt){bt.setAttribute('aria-pressed',bt.dataset.v===modo?'true':'false');});
  var lg=$('dblegs');lg.innerHTML='';
  /* editar as paradas aqui mesmo: trocar o país, tirar qualquer uma; entre elas, os km do trecho */
  lista.forEach(function(i,n){
    var row=document.createElement('div');row.className='dstop';
    var l=document.createElement('b');l.textContent=letra(n);row.appendChild(l);
    var sel=document.createElement('select');sel.setAttribute('aria-label','Parada '+letra(n));
    fillCountrySelect(sel,'Brasil');sel.value=i;sel.onchange=function(){paradas[n]=+sel.value;mostrarDistancia();};
    row.appendChild(sel);
    if(lista.length>2){
      var x=document.createElement('button');x.textContent='✕';x.setAttribute('aria-label','Tirar a parada '+letra(n));
      x.onclick=function(){paradas.splice(n,1);mostrarDistancia();};row.appendChild(x);
    }
    lg.appendChild(row);
    var tr=trechos[n];
    if(tr){
      var li=document.createElement('div');li.className='dleg';
      li.appendChild(document.createTextNode('↓ '+fmtKm(tr.km)+(modo==='voo'?' · ':'')));
      if(modo==='voo'){
        /* siglas destacadas e tocáveis: capital de saída, escalas e capital de chegada */
        var fonteTxt=tr.fonte==='of'?' (OpenFlights 2014)':' (estimativa)';
        var cods=[codAero(tr.a)?infoCapital(tr.a):null].concat(tr.via.map(function(h){return {cod:h.cod,txt:'Escala em '+h.cidade+fonteTxt};}),[codAero(tr.b)?infoCapital(tr.b):null]);
        cods.forEach(function(c,k){
          if(k)li.appendChild(document.createTextNode(' → '));
          if(c)li.appendChild(botaoSigla(c));else li.appendChild(document.createTextNode(capShort(k?tr.b:tr.a)));
        });
        var f=document.createElement('span');f.className='dfonte '+(tr.fonte==='of'?'of':'est');f.textContent=tr.fonte==='of'?'OpenFlights 2014':'estimativa';
        li.appendChild(document.createTextNode(' '));li.appendChild(f);
      }
      lg.appendChild(li);
    }
  });
  /* um botão só: cada parada nova já aparece na lista acima; no limite, ele dá lugar ao aviso */
  var cheio=lista.length>=MAX_PARADAS;
  $('dbadd').hidden=cheio;$('dbmax').hidden=!cheio;$('dbmax').textContent='Máximo de '+MAX_PARADAS+' paradas: tire uma para trocar.';
  $('dbadd').options[0].textContent='＋ Adicionar parada ('+lista.length+' de '+MAX_PARADAS+')';
  fitTo(lista);
}
/** Fecha a tela da Distância e apaga a rota. */
function sairDistancia(){
  if(estadoDistancia.arc&&!estadoDistancia.arc.quiz)estadoDistancia.arc=null;
  if(!estadoDistancia.ativo)return;
  estadoDistancia.ativo=false;document.body.classList.remove('dist');$('dbaero').hidden=true;
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  ganchos.desenharArco = drawArc;
  ganchos.distanciaAberta = function(){return estadoDistancia.ativo;};
  ganchos.alturaDistancia = function(){var b=$('dbar');return b.offsetTop+b.offsetHeight;};
  paradas=[byName[norm('Brasil')],byName[norm('Japão')]];
  /* menu ⋯ > Distância abre direto a tela, com as paradas à vista para editar */
  $('mdist').onclick=function(){mostrarDistancia(paradas);};
  $('dexit').onclick=sairDistancia;
  modo=lsGet('globo.dist.modo','voo');if(!MODOS.some(function(m){return m[0]===modo;}))modo='voo';
  MODOS.forEach(function(m){
    var bt=document.createElement('button');bt.dataset.v=m[0];bt.textContent=m[1];
    bt.onclick=function(){modo=m[0];lsSet('globo.dist.modo',modo);mostrarDistancia();};
    $('dbmodo').appendChild(bt);
  });
  /* mais uma parada direto da barra, sem voltar ao menu */
  var add=$('dbadd');fillCountrySelect(add,'Brasil');add.dataset.titulo='Adicionar parada';
  var o=document.createElement('option');o.value='';o.textContent='＋ Parada';add.insertBefore(o,add.firstChild);add.value='';
  add.onchange=function(){if(add.value!==''){paradas.push(+add.value);add.value='';mostrarDistancia();}};
}

export { drawArc, estadoDistancia, fillCountrySelect, iniciar, mostrarDistancia, sairDistancia, slerp, toqueNaRota };
