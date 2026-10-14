/**
 * @arquivo js/interface/camadas.js
 * Camada: Interface
 * Botão 🏷️ na tela: o que aparece no mapa (oceanos, mares, zonas climáticas, desertos, florestas,
 * cordilheiras) e quais lugares entram no
 * jogo (não reconhecidos, territórios dependentes, desabitados). Os lugares são as mesmas chaves do menu ⋯.
 */

import { ouvir } from '../nucleo/eventos.js';
import { $, lsGet, lsSet, setStatus } from '../nucleo/utilitarios.js';
import { trocarMes } from '../visualizacao/carregamento.js';
import { ganchos } from '../visualizacao/ganchos.js';
import { estadoRender } from '../visualizacao/projecao.js';
import { estadoMapa } from '../visualizacao/tela.js';
import { ligarLugar, setIncludeDep, setIncludeDisputed, setIncludeMic, setIncludeUni } from './filtros.js';

/* chave na tela → camada (o valor inicial de cada uma está em estadoRender.camadas) */
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
/* estação no hemisfério sul (Brasil) */
const ESTACAO = ['verão','verão','outono','outono','outono','inverno','inverno','inverno','primavera','primavera','primavera','verão'];
const CHAVES = [['cOce','oceanos'],['cMar','mares'],['cZon','zonas'],['cDes','desertos'],['cFlo','florestas'],['cMon','montanhas']];

function mostrar(){
  CHAVES.forEach(function(c){$(c[0]).checked=estadoRender.camadas[c[1]];});
  $('cDis').checked=estadoMapa.includeDisputed;$('cDep').checked=estadoMapa.includeDep;$('cUni').checked=estadoMapa.includeUni;$('cMic').checked=estadoMapa.includeMic;
}
function abrir(v){
  var cx=$('camadas');cx.hidden=!v;$('camb').setAttribute('aria-expanded',v?'true':'false');
  if(!v)return;
  mostrar();
  /* no treino o cartão de perguntas cobre a parte de baixo da tela: o painel termina acima dele */
  var st=$('stage').getBoundingClientRect(),livre=ganchos.treinoAberto()?ganchos.alturaTreino():0;
  cx.style.maxHeight=Math.max(160,st.height-livre-16)+'px';
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  CHAVES.forEach(function(c){estadoRender.camadas[c[1]]=lsGet('globo.cam.'+c[1],estadoRender.camadas[c[1]])===true;});
  CHAVES.forEach(function(c){
    $(c[0]).onchange=function(){estadoRender.camadas[c[1]]=this.checked;lsSet('globo.cam.'+c[1],this.checked);};
  });
  ligarLugar($('cDis'),setIncludeDisputed);ligarLugar($('cDep'),setIncludeDep);ligarLugar($('cUni'),setIncludeUni);ligarLugar($('cMic'),setIncludeMic);
  ouvir('categorias-mudaram',mostrar);
  /* época do ano: a neve do globo muda com o mês (no Brasil, as estações ao contrário do norte) */
  var sel=$('cMes'),hoje=new Date().getMonth(),agora=document.createElement('option');
  agora.value='';agora.textContent='Agora ('+MESES[hoje]+')';sel.appendChild(agora);
  MESES.forEach(function(m,k){var o=document.createElement('option');o.value=k;o.textContent=m+' · '+ESTACAO[k];sel.appendChild(o);});
  var salvo=lsGet('globo.mes',null);estadoRender.mesMapa=(salvo===null||salvo==='')?null:+salvo;
  sel.value=estadoRender.mesMapa==null?'':String(estadoRender.mesMapa);
  sel.onchange=function(){
    estadoRender.mesMapa=sel.value===''?null:+sel.value;lsSet('globo.mes',sel.value===''?null:+sel.value);
    if(estadoRender.atlas)setStatus('A neve aparece no mapa de satélite (🛰️).',3000);
    trocarMes();
  };
  $('camb').onclick=function(){abrir($('camadas').hidden);};
  $('camfechar').onclick=function(){abrir(false);};
  /* toque fora do painel fecha */
  document.addEventListener('pointerdown',function(e){
    if(!$('camadas').hidden&&!$('camadas').contains(e.target)&&e.target!==$('camb'))abrir(false);
  },true);
  mostrar();
}

export { abrir, iniciar };
