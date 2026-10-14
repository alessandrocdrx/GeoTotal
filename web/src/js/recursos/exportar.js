/**
 * @arquivo js/recursos/exportar.js
 * Camada: Recursos
 * Salvar arquivo (ou mostrar o texto para copiar) e folha de estudo.
 */

import { D, qcapDisp, REG } from '../dados/paises.js';
import { short } from '../dados/vizinhos.js';
import { folhaPdf } from './pdf.js';
import { $, setStatus } from '../nucleo/utilitarios.js';
import { estadoMapa } from '../visualizacao/tela.js';

/* ---------- salvar arquivo e folha de estudo ---------- */
let dlNS = null;
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

/* Imprimir: no app Android abre a impressão do sistema (dá para salvar em PDF). Dentro de uma página
   embutida (iframe, como no claude.ai) o navegador bloqueia a impressão sem avisar; aí a folha vira um
   PDF para baixar (recursos/pdf.js), com as bandeiras. */
function gruposDaFolha(){
  var out=[];
  REG.forEach(function(rg,ri){
    var list=D.filter(function(d){return d.r===ri&&estadoMapa.on[d.i];});
    if(list.length)out.push({titulo:rg.n+' ('+list.length+')',linhas:list.map(function(d){return [d.flag,short(d),qcapDisp(d)];})});
  });
  return out;
}
function imprimirFolha(){
  var embutido=false;try{embutido=window.self!==window.top;}catch(e){embutido=true;}
  if(window.AndroidBridge||!embutido){try{window.print();return;}catch(e){}}
  if(!dlNS){setStatus('Aqui não dá para baixar arquivos. Use o app no celular para imprimir.',5000);return;}
  setStatus('Gerando o PDF…');
  folhaPdf('Folha de estudo · geoTotal',gruposDaFolha()).then(function(pdf){
    setStatus('');
    return dlNS.save({filename:'folha-de-estudo-geototal.pdf',data:pdf}).then(function(){setStatus('PDF salvo.',3000);});
  }).catch(function(e){if(e&&e.code==='declined')return;setStatus('Não consegui gerar o PDF.',4000);});
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
  $('expStudy').onclick=function(){$('msheet').style.display='none';buildStudy();$('study').style.display='block';};
  $('studyclose').onclick=function(){$('study').style.display='none';};
  $('studyprint').onclick=imprimirFolha;
}

export { iniciar, offerFile };
