/**
 * @arquivo js/recursos/progresso.js
 * Camada: Recursos
 * Salvar e restaurar o progresso (XP, sequência, conquistas, histórico) num arquivo, para trocar de celular.
 */

import { $, setStatus } from '../nucleo/utilitarios.js';
import { offerFile } from './exportar.js';

/*
 * O app não tem conta nem servidor: tudo fica no aparelho. Para não perder o progresso ao trocar
 * de celular ou reinstalar, a pessoa salva um arquivo (no Drive, por exemplo) e depois o abre aqui.
 * O arquivo leva só as chaves "globo.*" do armazenamento local.
 */

const MARCA = 'geoTotal-progresso';

function coletar(){
  var dados={};
  try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf('globo.')===0)dados[k]=localStorage.getItem(k);}}catch(e){}
  return dados;
}
function salvarProgresso(){
  var d=new Date(),dia=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  offerFile('geototal-progresso-'+dia+'.json',JSON.stringify({tipo:MARCA,versao:1,data:dia,dados:coletar()}));
}
/** Restaura a partir do texto do arquivo; devolve uma mensagem de erro ou '' se deu certo. */
function restaurarDeTexto(texto){
  var o;try{o=JSON.parse(texto);}catch(e){return 'Este arquivo não é um progresso do geoTotal.';}
  if(!o||o.tipo!==MARCA||!o.dados||typeof o.dados!=='object')return 'Este arquivo não é um progresso do geoTotal.';
  try{
    Object.keys(o.dados).forEach(function(k){if(k.indexOf('globo.')===0&&typeof o.dados[k]==='string')localStorage.setItem(k,o.dados[k]);});
  }catch(e){return 'Não consegui gravar o progresso neste aparelho.';}
  return '';
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  $('msave').onclick=salvarProgresso;
  $('mload').onchange=function(){
    var f=this.files&&this.files[0];this.value='';if(!f)return;
    var r=new FileReader();
    r.onload=function(){
      var erro=restaurarDeTexto(String(r.result||''));
      if(erro){setStatus(erro,5000);return;}
      setStatus('Progresso restaurado! Abrindo de novo…',2000);
      setTimeout(function(){location.reload();},900);
    };
    r.readAsText(f);
  };
}

export { iniciar, restaurarDeTexto };
