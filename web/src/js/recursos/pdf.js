/**
 * @arquivo js/recursos/pdf.js
 * Camada: Recursos
 * Folha de estudo em PDF, sem biblioteca: cada página A4 é desenhada num canvas (com as bandeiras em
 * emoji) e vira uma imagem JPEG dentro de um PDF mínimo montado aqui mesmo.
 */

const LARG = 1240, ALT = 1754;                 /* A4 a 150 dpi */
const PT_L = 595.28, PT_A = 841.89;            /* A4 em pontos do PDF */
const MARGEM = 90, LINHA = 46;
const FONTE = 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif';
const EMOJI = '"Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif';

/* texto que cabe na largura: diminui a letra até 70%, depois corta com reticências */
function caber(c,txt,largura,tam,peso){
  var t=tam;
  c.font=peso+' '+t+'px '+FONTE;
  while(c.measureText(txt).width>largura&&t>tam*0.7){t--;c.font=peso+' '+t+'px '+FONTE;}
  if(c.measureText(txt).width<=largura)return txt;
  while(txt.length>1&&c.measureText(txt+'…').width>largura)txt=txt.slice(0,-1);
  return txt+'…';
}

/** Desenha as páginas. grupos: [{titulo, linhas: [[bandeira, país, capital], …]}]. Devolve canvases. */
function desenharPaginas(titulo,grupos){
  var paginas=[],c=null,y=0,num=0;
  function novaPagina(){
    var cv=document.createElement('canvas');cv.width=LARG;cv.height=ALT;
    c=cv.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,LARG,ALT);
    c.textBaseline='middle';c.fillStyle='#111';
    num++;y=MARGEM;
    if(num===1){c.font='800 40px '+FONTE;c.fillText(titulo,MARGEM,y+10);y+=80;}
    c.font='500 20px '+FONTE;c.fillStyle='#777';c.textAlign='right';c.fillText(String(num),LARG-MARGEM,ALT-50);c.textAlign='left';
    paginas.push(cv);
  }
  novaPagina();
  var colPais=MARGEM+64,colCap=MARGEM+64+(LARG-2*MARGEM-64)*0.48,fimCap=LARG-MARGEM;
  grupos.forEach(function(g){
    if(y+70+LINHA>ALT-MARGEM)novaPagina();
    c.fillStyle='#111';c.font='800 28px '+FONTE;c.fillText(g.titulo,MARGEM,y+22);y+=56;
    g.linhas.forEach(function(l){
      if(y+LINHA>ALT-MARGEM){novaPagina();}
      c.font='34px '+EMOJI;c.fillStyle='#000';c.fillText(l[0],MARGEM,y+LINHA/2);
      c.fillStyle='#111';c.fillText(caber(c,l[1],colCap-colPais-16,24,'600'),colPais,y+LINHA/2);
      c.fillStyle='#333';c.fillText(caber(c,l[2],fimCap-colCap,24,'400'),colCap,y+LINHA/2);
      c.strokeStyle='#d6d6d6';c.lineWidth=1.5;c.beginPath();c.moveTo(MARGEM,y+LINHA);c.lineTo(LARG-MARGEM,y+LINHA);c.stroke();
      y+=LINHA;
    });
    y+=22;
  });
  return paginas;
}

function bytesDe(str){var u=new Uint8Array(str.length);for(var k=0;k<str.length;k++)u[k]=str.charCodeAt(k)&255;return u;}
function jpeg(cv){var b=atob(cv.toDataURL('image/jpeg',0.86).split(',')[1]);return bytesDe(b);}

/** Monta o PDF com uma imagem JPEG por página. Devolve um Blob. */
function montarPdf(canvases){
  var partes=[],tam=0,offs=[];
  function por(x){var u=typeof x==='string'?bytesDe(x):x;partes.push(u);tam+=u.length;}
  function obj(n,corpo,fluxo){
    offs[n]=tam;por(n+' 0 obj\n'+corpo);
    if(fluxo){por('\nstream\n');por(fluxo);por('\nendstream');}
    por('\nendobj\n');
  }
  var n=canvases.length,kids=[];
  for(var k=0;k<n;k++)kids.push((3+k*3)+' 0 R');
  por('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
  obj(2,'<< /Type /Pages /Kids ['+kids.join(' ')+'] /Count '+n+' >>');
  canvases.forEach(function(cv,k){
    var p=3+k*3,img=jpeg(cv),conteudo='q '+PT_L+' 0 0 '+PT_A+' 0 0 cm /Im0 Do Q';
    obj(p,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+PT_L+' '+PT_A+'] /Resources << /XObject << /Im0 '+(p+2)+' 0 R >> >> /Contents '+(p+1)+' 0 R >>');
    obj(p+1,'<< /Length '+conteudo.length+' >>',conteudo);
    obj(p+2,'<< /Type /XObject /Subtype /Image /Width '+cv.width+' /Height '+cv.height+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+img.length+' >>',img);
  });
  var total=3+n*3,xref=tam,linhas='xref\n0 '+total+'\n0000000000 65535 f \n';
  for(var i=1;i<total;i++)linhas+=String(offs[i]).padStart(10,'0')+' 00000 n \n';
  por(linhas+'trailer\n<< /Size '+total+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF\n');
  return new Blob(partes,{type:'application/pdf'});
}

/** Gera a folha em PDF (espera a fonte das bandeiras carregar, onde ela é usada). */
function folhaPdf(titulo,grupos){
  var espera=Promise.resolve();
  try{if(document.fonts&&document.fonts.load)espera=document.fonts.load('34px "Noto Color Emoji"','🇧🇷').catch(function(){});}catch(e){}
  return espera.then(function(){return montarPdf(desenharPaginas(titulo,grupos));});
}

export { folhaPdf, montarPdf };
