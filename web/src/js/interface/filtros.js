/**
 * @arquivo js/interface/filtros.js
 * Camada: Interface
 * Quais países aparecem no globo: "Só vizinhos no mapa" do cartão, os chips dos estados do Brasil e as
 * categorias de lugares (não reconhecidos, micronações, territórios, desabitados).
 */

import { D, N_DEP, N_MIC, N_UNI, REG } from '../dados/paises.js';
import { NB } from '../dados/vizinhos.js';
import { closeCard, tourStop } from './cartao-detalhes.js';
import { ganchosInterface } from './ganchos.js';
import { emitir, ouvir } from '../nucleo/eventos.js';
import { $, lsSet } from '../nucleo/utilitarios.js';
import { fitTo, flyTo } from '../visualizacao/animacao.js';
import { estadoBrasil } from '../visualizacao/estados.js';
import { allOn, avail, availCount, estadoCamera, estadoMapa, PI } from '../visualizacao/tela.js';

/** Estado compartilhado com outros módulos (leitura e escrita por estadoFiltros.nome). */
const estadoFiltros = {
  nbSaved: null,
};

function updateNbBtn(){
  var b=document.getElementById('nbtn');
  if(estadoBrasil.statesMode){
    if(estadoBrasil.stSaved){b.style.visibility='visible';b.textContent='↩ Mostrar todos';}
    else{b.style.visibility=estadoBrasil.selSt?'visible':'hidden';b.textContent='Só vizinhos';}
    return;
  }
  if(estadoFiltros.nbSaved){b.style.visibility='visible';b.textContent='↩ Mostrar todos';}
  else{b.style.visibility=(estadoMapa.selected&&NB[estadoMapa.selected.i].length)?'visible':'hidden';b.textContent='Só vizinhos';}
}
function toggleNb(){
  if(estadoBrasil.statesMode){ganchosInterface.alternarVizinhosEstado();return;}
  if(estadoFiltros.nbSaved){
    estadoMapa.on=estadoFiltros.nbSaved.slice();estadoFiltros.nbSaved=null;afterFilter();
    var vis=[];estadoMapa.on.forEach(function(v,k){if(v)vis.push(k);});
    if(allOn())flyTo(estadoCamera.phi*180/PI,estadoCamera.lam*180/PI,1);else fitTo(vis);
    return;
  }
  if(!estadoMapa.selected)return;
  var i=estadoMapa.selected.i,keep=estadoMapa.on.slice(),idxs=[i].concat(NB[i]);
  estadoMapa.on=D.map(function(){return 0;});idxs.forEach(function(k){estadoMapa.on[k]=1;});
  estadoFiltros.nbSaved=keep;afterFilter();fitTo(idxs);
}
function soloOf(r){return D.every(function(d){return !avail(d)||estadoMapa.on[d.i]===(d.r===r?1:0);});}
function afterFilter(){
  tourStop();
  D.forEach(function(d){if(!avail(d)&&(!estadoMapa.selected||d.i!==estadoMapa.selected.i))estadoMapa.on[d.i]=0;});
  if(estadoBrasil.statesMode){buildChips();updateNbBtn();return;}
  buildChips();
  updateNbBtn();
  if(estadoMapa.selected&&!estadoMapa.on[estadoMapa.selected.i])closeCard();
  emitir('visao-mudou');
}
let chips;
function mkChip(label,color,val,count){
  var b=document.createElement('button');b.className='chip';
  b.setAttribute('aria-pressed',(val<0?allOn():soloOf(val))?'true':'false');
  if(color){var s=document.createElement('span');s.className='dot';s.style.background=color;b.appendChild(s);}
  b.appendChild(document.createTextNode(label+' ('+count+')'));
  b.onclick=function(){
    estadoFiltros.nbSaved=null;
    if(val<0||soloOf(val)){estadoMapa.on=D.map(function(d){return avail(d)?1:0;});afterFilter();flyTo(estadoCamera.phi*180/PI,estadoCamera.lam*180/PI,1);}
    else{estadoMapa.on=D.map(function(d){return d.r===val&&avail(d)?1:0;});afterFilter();var g=REG[val];flyTo(g.lat,g.lng,g.z);}
  };
  return b;
}
function buildChips(){
  if(estadoBrasil.statesMode){ganchosInterface.montarChipsEstados();return;}
  chips.innerHTML='';
  chips.appendChild(mkChip('Todas',null,-1,availCount()));
  for(var r=0;r<REG.length;r++){var nr=D.filter(function(d){return d.r===r&&avail(d);}).length;if(nr)chips.appendChild(mkChip(REG[r].n,REG[r].c,r,nr));}
}

function setIncludeDisputed(v){
  estadoMapa.includeDisputed=v;lsSet('globo.includeDisputed',v);
  $('oDisputed').checked=v;
  if(v)D.forEach(function(d){if(d.dis&&!d.mic)estadoMapa.on[d.i]=1;});
  afterFilter();
  emitir('categorias-mudaram',{placar:false});
}
function setIncludeDep(v){
  estadoMapa.includeDep=v;lsSet('globo.includeDep',v);
  $('oDep').checked=v;
  if(v)D.forEach(function(d){if(d.dep)estadoMapa.on[d.i]=1;});
  afterFilter();
  emitir('categorias-mudaram',{placar:true});
}
function setIncludeMic(v){
  estadoMapa.includeMic=v;lsSet('globo.includeMic',v);
  $('oMic').checked=v;
  if(v)D.forEach(function(d){if(d.mic)estadoMapa.on[d.i]=1;});
  afterFilter();
  emitir('categorias-mudaram',{placar:true});
}
function setIncludeUni(v){
  estadoMapa.includeUni=v;lsSet('globo.includeUni',v);
  $('oUni').checked=v;
  if(v)D.forEach(function(d){if(d.uni)estadoMapa.on[d.i]=1;});
  afterFilter();
  emitir('categorias-mudaram',{placar:true});
}
/** Chave de um tipo de lugar (menu ⋯ ou botão 🏷️): no meio de uma rodada do treino, pergunta antes. */
function ligarLugar(cb,definir){
  cb.onclick=function(){var v=cb.checked;cb.checked=!v;ganchosInterface.antesDeMudarLugares(function(){definir(v);});};
}
/** Lista dos lugares especiais, com bandeira e o que cada um é (ultramarino de quem, etc.). */
function buildCatList(){
  var box=$('catbody');if(!box||box.dataset.ok)return;box.dataset.ok='1';
  function grupo(titulo,lista){
    var h=document.createElement('div');h.className='cath';h.textContent=titulo+' ('+lista.length+')';box.appendChild(h);
    lista.forEach(function(d){
      var r=document.createElement('div');r.className='catrow';
      var f=document.createElement('span');f.className='catflag';f.textContent=d.dis?'🏳️':d.flag;
      var t=document.createElement('div');var n=document.createElement('b');n.textContent=d.name;
      var o=document.createElement('small');o.textContent=(d.obs||'').split(/[;—]/)[0].trim();
      var ultra=/ultramarin/i.test(d.obs||'');
      if(ultra){var u=document.createElement('em');u.className='catultra';u.textContent='ultramarino';n.appendChild(u);}
      t.appendChild(n);t.appendChild(o);r.appendChild(f);r.appendChild(t);box.appendChild(r);
    });
  }
  grupo('⚠️ Não reconhecidos pela ONU',D.filter(function(d){return d.dis&&!d.mic;}));
  grupo('🏴 Micronações',D.filter(function(d){return d.mic;}));
  grupo('◇ Territórios dependentes',D.filter(function(d){return d.dep;}));
  grupo('❄️ Desabitados e Antártida',D.filter(function(d){return d.uni;}));
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  ouvir('fronteiras-carregadas',afterFilter);
  chips = document.getElementById('chips');
  /* lugares especiais (menu ⋯ → Lugares no jogo e no mapa): valem para o Livre e para o treino */
  $('catlista').addEventListener('toggle',buildCatList);
  $('nDis').textContent='('+D.filter(function(d){return d.dis&&!d.mic;}).length+')';$('nMic').textContent='('+N_MIC+')';$('nDep').textContent='('+N_DEP+')';$('nUni').textContent='('+N_UNI+')';
  $('oDisputed').checked=estadoMapa.includeDisputed;
  $('oUni').checked=estadoMapa.includeUni;
  $('oDep').checked=estadoMapa.includeDep;
  $('oMic').checked=estadoMapa.includeMic;
  ligarLugar($('oDisputed'),setIncludeDisputed);ligarLugar($('oUni'),setIncludeUni);ligarLugar($('oDep'),setIncludeDep);ligarLugar($('oMic'),setIncludeMic);
}

export { afterFilter, ligarLugar, setIncludeMic, buildChips, chips, estadoFiltros, iniciar, setIncludeDep, setIncludeDisputed, setIncludeUni, toggleNb, updateNbBtn };
