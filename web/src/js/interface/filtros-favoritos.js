/**
 * @arquivo js/interface/filtros-favoritos.js
 * Camada: Interface
 * Filtros favoritos salvos pelo usuário.
 */
/* ---------- favoritos de filtro ---------- */
function favs(){return lsGet('globo.fav.v1',[]);}
function renderFavs(){
  var box=$('favs');box.innerHTML='';
  var fs=favs();
  if(!fs.length){box.textContent='Nenhum favorito salvo ainda.';box.className='inote';return;}
  box.className='';
  fs.forEach(function(f,k){
    var row=document.createElement('div');row.className='favrow';
    var nm=document.createElement('span');nm.textContent=f.n+' ('+f.c.length+')';
    var ap=document.createElement('button');ap.textContent='Aplicar';
    var del=document.createElement('button');del.textContent='×';del.setAttribute('aria-label','Apagar favorito');
    ap.onclick=function(){
      snap();nbSaved=null;var set={};f.c.forEach(function(c){set[c]=1;});
      on=D.map(function(d){return set[d.cc]?1:0;});afterFilter();
      var v=visIdx();if(v.length===D.length)flyTo(phi*180/PI,lam*180/PI,1);else if(v.length)fitTo(v);
      $('sheet').style.display='none';
    };
    del.onclick=function(){var a=favs();a.splice(k,1);lsSet('globo.fav.v1',a);renderFavs();};
    row.appendChild(nm);row.appendChild(ap);row.appendChild(del);box.appendChild(row);
  });
}
$('favsave').onclick=function(){
  var v=visIdx();if(!v.length){setStatus('Nenhum país ligado para salvar.',2500);return;}
  var a=favs(),name=$('favname').value.trim()||('Filtro '+(a.length+1));
  a.push({n:name,c:v.map(function(i){return D[i].cc;})});lsSet('globo.fav.v1',a);
  $('favname').value='';renderFavs();setStatus('Favorito salvo neste aparelho.',2500);
};
renderFavs();

