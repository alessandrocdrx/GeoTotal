/**
 * @arquivo js/brasil/menu.js
 * Camada: Brasil
 * Itens do menu específicos do Brasil.
 */
/* ---------- menu Mais: Brasil ---------- */
BRS.forEach(function(s){var o=document.createElement('option');o.value=s.i;o.textContent=s.sigla+' — '+s.name+' ('+s.cap+')';$('stSel').appendChild(o);});
$('stGo').onclick=function(){$('msheet').style.display='none';enterStates(BRS[+$('stSel').value]);};
$('stAll').onclick=function(){$('msheet').style.display='none';enterStates(null);};
fillCountrySelect($('cmpA'),'Brasil');fillCountrySelect($('cmpB'),'Argentina');
function cmpRow(box,label,va,vb){
  var r=document.createElement('div');r.className='cmprow';
  var l=document.createElement('div');l.className='cmpv';l.textContent=va;
  var m=document.createElement('div');m.className='cmpl';m.textContent=label;
  var rr=document.createElement('div');rr.className='cmpv';rr.textContent=vb;
  r.appendChild(l);r.appendChild(m);r.appendChild(rr);box.appendChild(r);
}
function cmpDens(x){return (x&&x.pop&&x.area)?Math.round(x.pop*1000/x.area).toLocaleString('pt-BR')+' hab./km²':'—';}
function cmpRelTop(d){return (d.rel&&d.rel.items[0])?(d.rel.items[0].n+(d.rel.items[0].p!=null?' '+d.rel.items[0].p+'%':'')):'—';}
$('cmpGo').onclick=function(){
  var a=D[+$('cmpA').value],b=D[+$('cmpB').value],box=$('cmpres');box.innerHTML='';
  if(a===b){box.textContent='Escolha dois países diferentes.';return;}
  var h=document.createElement('div');h.className='cmphead';
  var ha=document.createElement('div');ha.textContent=dflag(a)+' '+short(a);
  var hc=document.createElement('div');hc.textContent='';
  var hb=document.createElement('div');hb.textContent=dflag(b)+' '+short(b);
  h.appendChild(ha);h.appendChild(hc);h.appendChild(hb);box.appendChild(h);
  var ia=a.info,ib=b.info;
  cmpRow(box,'População',ia?fmtPop(ia.pop):'—',ib?fmtPop(ib.pop):'—');
  cmpRow(box,'Área',ia?fmtArea(ia.area):'—',ib?fmtArea(ib.area):'—');
  cmpRow(box,'Densidade',cmpDens(ia),cmpDens(ib));
  cmpRow(box,'Idioma(s) oficial(is)',ia?ia.lang:'—',ib?ib.lang:'—');
  cmpRow(box,'Moeda',ia?ia.cur:'—',ib?ib.cur:'—');
  cmpRow(box,'Fuso horário',ia?ia.tz:'—',ib?ib.tz:'—');
  cmpRow(box,'Religião predominante',cmpRelTop(a),cmpRelTop(b));
  var n=document.createElement('div');n.className='inote';n.style.marginTop='8px';
  n.textContent='Valores aproximados. Confira em fonte oficial antes de citar.';
  box.appendChild(n);
};
$('expBR').onclick=function(){
  $('msheet').style.display='none';
  var rows=[['Estado','Sigla','Capital','Região','Área (km²)','População (Censo 2022)','Código IBGE','Estados vizinhos']];
  BRS.forEach(function(s){rows.push([s.name,s.sigla,s.cap,BRREG[s.reg].n,s.area,s.pop,s.ibge,s.nb.map(function(k){return BRS[k].sigla;}).join(' / ')]);});
  offerFile('estados-e-capitais-do-brasil.csv','\uFEFF'+rows.map(function(r){return r.map(csvCell).join(',');}).join('\n'));
};

document.addEventListener('visibilitychange',function(){if(document.hidden)tourStop();});
