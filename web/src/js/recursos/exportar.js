/**
 * @arquivo js/recursos/exportar.js
 * Camada: Recursos
 * Exportação CSV/Anki e folha de estudo.
 */

import { langText, relText } from '../dados/linguas.js';
import { D, qcapDisp, REG } from '../dados/paises.js';
import { NB, short } from '../dados/vizinhos.js';
import { fmtArea, fmtPop } from '../interface/cartao-detalhes.js';
import { $ } from '../nucleo/utilitarios.js';
import { setStatus } from '../visualizacao/fronteiras.js';
import { estadoMapa } from '../visualizacao/globo.js';

/* ---------- exportar e folha de estudo ---------- */
let dlNS = null;
function csvCell(v){v=String(v==null?'':v);return /[",\n;]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}
function buildCSV(kind){
  var rows=[],i,d,x;
  if(kind==='anki'){
    for(i=0;i<D.length;i++){
      if(!estadoMapa.on[i])continue;d=D[i];
      var tag=REG[d.r].n.replace(/\s+/g,'_');
      rows.push([d.flag+' '+short(d)+' — qual é a capital?',qcapDisp(d),tag]);
      rows.push(['Qual país tem como capital '+qcapDisp(d)+'?',d.flag+' '+short(d),tag]);
    }
    return rows.map(function(r){return r.map(csvCell).join(',');}).join('\n');
  }
  rows.push(['País','Bandeira','Capital','Região','Sub-região','Vizinhos por terra','População (aprox.)','Área','Idioma(s)','Moeda','Fuso','DDI','Domínio','Religiões (aprox.)','Línguas (aprox.)']);
  for(i=0;i<D.length;i++){
    if(!estadoMapa.on[i])continue;d=D[i];x=d.info;
    rows.push([short(d),d.flag,d.cap,REG[d.r].n,d.sub,NB[i].map(function(k){return short(D[k]);}).join(' / '),x?fmtPop(x.pop):'',x?fmtArea(x.area):'',x?x.lang:'',x?x.cur:'',x?x.tz:'',x?x.dial:'',x?x.tld:'',relText(d),langText(d)]);
  }
  return '\uFEFF'+rows.map(function(r){return r.map(csvCell).join(',');}).join('\n');
}
function showText(name,text){
  $('txtname').textContent=name;$('txta').value=text;$('txtd').style.display='block';
}
function offerFile(name,text){
  if(dlNS){dlNS.save({filename:name,data:text}).then(function(){setStatus('Arquivo salvo.',3000);},function(e){if(e&&e.code==='declined')return;showText(name,text);});}
  else showText(name,text);
}
function buildStudy(){
  var box=$('studybody');box.innerHTML='';
  var n=0;
  REG.forEach(function(rg,ri){
    var list=D.filter(function(d){return d.r===ri&&estadoMapa.on[d.i];});
    if(!list.length)return;
    var h=document.createElement('h3');h.textContent=rg.n+' ('+list.length+')';box.appendChild(h);
    var t=document.createElement('table');
    list.forEach(function(d){
      var tr=document.createElement('tr');
      [d.flag,short(d),qcapDisp(d)].forEach(function(v,k){var td=document.createElement('td');td.textContent=v;if(k===0)td.className='fl';tr.appendChild(td);});
      t.appendChild(tr);n++;
    });
    box.appendChild(t);
  });
  if(!n)box.textContent='Nenhum país ligado nos filtros.';
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  setTimeout(function(){try{if(window.claude&&claude.use)claude.use('downloads').then(function(n){dlNS=n;},function(){});}catch(e){}},900);
  $('txtcopy').onclick=function(){
    var ta=$('txta');ta.focus();ta.select();
    var ok=false;try{ok=document.execCommand('copy');}catch(e){}
    if(!ok&&navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(ta.value).then(function(){setStatus('Copiado.',2000);},function(){setStatus('Selecione o texto e copie manualmente.',4000);});}
    else setStatus(ok?'Copiado.':'Selecione o texto e copie manualmente.',3000);
  };
  $('txtclose').onclick=function(){$('txtd').style.display='none';};
  $('expCsv').onclick=function(){$('msheet').style.display='none';offerFile('paises-e-capitais.csv',buildCSV('full'));};
  $('expAnki').onclick=function(){$('msheet').style.display='none';offerFile('paises-capitais-anki.csv',buildCSV('anki'));};
  $('expStudy').onclick=function(){$('msheet').style.display='none';buildStudy();$('study').style.display='block';};
  $('studyclose').onclick=function(){$('study').style.display='none';};
  $('studyprint').onclick=function(){try{window.print();}catch(e){setStatus('Impressão indisponível aqui. Tire uma captura de tela da folha.',5000);}};
}

export { csvCell, iniciar, offerFile };
