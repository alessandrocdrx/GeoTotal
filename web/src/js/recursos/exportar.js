/**
 * @arquivo js/recursos/exportar.js
 * Camada: Recursos
 * Salvar arquivo (ou mostrar o texto para copiar) e folha de estudo.
 */

import { D, qcapDisp, REG } from '../dados/paises.js';
import { short } from '../dados/vizinhos.js';
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
   arquivo .html para baixar, que abre a impressão sozinho. */
function imprimirFolha(){
  var embutido=false;try{embutido=window.self!==window.top;}catch(e){embutido=true;}
  if(window.AndroidBridge||!embutido){try{window.print();return;}catch(e){}}
  /* colunas com a mesma largura em todas as tabelas; bandeiras pela fonte Noto Color Emoji (o Windows
     não desenha bandeira em emoji); a impressão abre depois que a fonte carregar */
  var css='body{font-family:system-ui,sans-serif;margin:24px;color:#000}h1{font-size:20px}h3{margin:16px 0 4px;font-size:15px;break-after:avoid}table{width:100%;border-collapse:collapse;table-layout:fixed}tr{break-inside:avoid}td{padding:5px 6px;border-bottom:1px solid #ccc;font-size:13px;overflow-wrap:anywhere}td.fl{width:40px;font-size:20px;font-family:"Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif}td:nth-child(2){width:45%}';
  var abrir='window.onload=function(){var p=function(){window.print();};if(document.fonts&&document.fonts.load){document.fonts.load(\'20px "Noto Color Emoji"\',\'\\uD83C\\uDDE7\\uD83C\\uDDF7\').then(p,p);}else p();};';
  var html='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Folha de estudo · geoTotal</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap"><style>'+css+'</style></head><body><h1>Folha de estudo · geoTotal</h1>'+$('studybody').innerHTML+'<script>'+abrir+'<'+'/script></body></html>';
  offerFile('folha-de-estudo.html',html);
  setStatus('Abra o arquivo baixado: ele abre a impressão (dá para salvar em PDF).',6000);
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
