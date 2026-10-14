/**
 * @arquivo js/interface/cartao-natural.js
 * Camada: Interface
 * Cartão de uma área natural (mar, golfo, deserto, floresta, cordilheira, planalto), aberto ao tocar
 * nela com a camada ligada no botão 🏷️: tamanho, países que cobre ou banha e uma curiosidade.
 */

import { OCEANOS, TEXTOS } from '../dados/natureza-textos.js';
import { D, dflag } from '../dados/paises.js';
import { short } from '../dados/vizinhos.js';
import { $ } from '../nucleo/utilitarios.js';
import { estadoCartao } from './cartao-detalhes.js';
import { folhaArrastavel } from './folha-arrastavel.js';
import { flyTo } from '../visualizacao/animacao.js';
import { TIPOS, tipoDaArea } from '../visualizacao/natureza.js';
import { estadoRender } from '../visualizacao/projecao.js';
import { estadoCamera } from '../visualizacao/tela.js';

const AREA_BRASIL = 8515767;
let folhaN = null;
let porCodigo = null;

function tamanho(km2){
  var t='~'+(km2>=1e6?(km2/1e6).toLocaleString('pt-BR',{maximumFractionDigits:1})+' milhões de km²':Math.round(km2/1000)*1000>0?(Math.round(km2/1000)*1000).toLocaleString('pt-BR')+' km²':km2.toLocaleString('pt-BR')+' km²');
  var r=km2/AREA_BRASIL;
  var comp=r>=1.05?(r.toLocaleString('pt-BR',{maximumFractionDigits:1})+' vezes o Brasil'):(r>=0.95?'quase o tamanho do Brasil':(r>=0.01?Math.round(r*100)+'% do Brasil':''));
  return [t,comp];
}
function fato(rot,val){
  var f=document.createElement('div');f.className='fact';
  var a=document.createElement('span');a.textContent=rot;var b=document.createElement('b');b.textContent=val;
  f.appendChild(a);f.appendChild(b);return f;
}

/** Fecha o cartão e tira o destaque do mapa. */
function fecharArea(){if(!estadoRender.areaSel)return;$('ncard').hidden=true;if(folhaN)folhaN.soltar();estadoRender.areaSel=null;estadoCartao.cardH=0;}

/** Abre o cartão da área. escolherPais(d) abre o cartão de um país (os botões da lista). */
function abrirArea(r,escolherPais){
  if(!porCodigo){porCodigo={};D.forEach(function(d){if(!porCodigo[d.cc])porCodigo[d.cc]=d;});}
  estadoRender.areaSel=r;
  var agua=r.tipo==='w';
  $('ncico').textContent=TIPOS[r.tipo][1];
  $('nctipo').textContent=tipoDaArea(r)+(r.tipo==='f'?' · contorno aproximado':'');
  $('ncnome').textContent=r.nome;
  var fx=$('ncfatos');fx.innerHTML='';
  var tm=tamanho(r.area);
  fx.appendChild(fato('📐 Tamanho',tm[0]));
  if(tm[1])fx.appendChild(fato('🇧🇷 Comparando',tm[1]));
  var tx=TEXTOS[r.nome];
  $('nctexto').textContent=tx||'';$('nctexto').hidden=!tx;
  var box=$('ncpaises');box.innerHTML='';
  var lista=r.paises.map(function(c){return porCodigo[c];}).filter(Boolean);
  if(lista.length){
    var st=document.createElement('div');st.className='st';
    st.textContent=(agua?'Países banhados':'Países onde fica')+' ('+lista.length+')';box.appendChild(st);
    var w=document.createElement('div');w.className='chipsx';
    lista.forEach(function(d){
      var b=document.createElement('button');b.textContent=dflag(d)+' '+short(d);
      b.onclick=function(){fecharArea();escolherPais(d);};w.appendChild(b);
    });
    box.appendChild(w);
  }
  $('ncnota').textContent=agua?'Contornos do Natural Earth. Mares vizinhos (como o Adriático) são contados à parte.':'Contornos do Natural Earth (florestas: desenho aproximado).';
  $('ncard').hidden=false;$('ncard').scrollTop=0;
  /* o globo sobe para a área não ficar escondida atrás do cartão */
  estadoCartao.cardH=$('ncard').offsetHeight+10;
  flyTo(r.lat,r.lng,Math.max(estadoCamera.zoom,1.4));
}

/** Abre o cartão de um oceano (chave como "PACÍFICO"); sem contorno no mapa, só o cartão. */
function abrirOceano(chave){
  var o=OCEANOS[chave];if(!o)return false;
  estadoRender.areaSel={oceano:true,nome:o.nome};
  $('ncico').textContent='🌊';$('nctipo').textContent='Oceano';$('ncnome').textContent=o.nome;
  var fx=$('ncfatos');fx.innerHTML='';
  var tm=tamanho(o.area);
  fx.appendChild(fato('📐 Tamanho',tm[0]));fx.appendChild(fato('🇧🇷 Comparando',tm[1]));
  fx.appendChild(fato('⬇️ Mais fundo',o.fundo));fx.appendChild(fato('🌍 Banha',o.banha));
  $('nctexto').textContent=o.texto;$('nctexto').hidden=false;
  $('ncpaises').innerHTML='';
  $('ncnota').textContent='Números aproximados; o tamanho dos oceanos muda conforme o que se conta como mar.';
  $('ncard').hidden=false;$('ncard').scrollTop=0;estadoCartao.cardH=$('ncard').offsetHeight+10;
  return true;
}
/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  $('ncfechar').onclick=fecharArea;
  /* o cartão da área abre médio; a alça aumenta, diminui ou fecha (puxando até embaixo) */
  var grande=false;
  folhaN=folhaArrastavel($('ncard'),{chave:'globo.area.altura',
    grande:function(){grande=true;$('ncard').classList.add('grande');},
    pequeno:function(){grande=false;$('ncard').classList.remove('grande');},
    ehGrande:function(){return grande;},
    mudou:function(){estadoCartao.cardH=$('ncard').offsetHeight+10;},
    fechar:fecharArea});
}

export { abrirArea, abrirOceano, fecharArea, iniciar };
