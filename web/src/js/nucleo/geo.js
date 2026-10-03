/**
 * @arquivo js/nucleo/geo.js
 * Camada: Núcleo
 * Cálculos geográficos puros (distância entre pontos na esfera).
 */

function haversine(a,b){
  var r=Math.PI/180,dl=(b.lat-a.lat)*r,dn=(b.lng-a.lng)*r;
  var h=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dn/2)*Math.sin(dn/2);
  return 2*6371*Math.asin(Math.min(1,Math.sqrt(h)));
}

export { haversine };
