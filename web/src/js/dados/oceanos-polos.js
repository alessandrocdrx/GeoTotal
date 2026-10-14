/**
 * @arquivo js/dados/oceanos-polos.js
 * Camada: Dados
 * Rótulos de oceanos, mares, golfos e baías.
 */

/* ---------- Oceanos e mares ---------- */
let OC;
let MARES;

/* nome|latitude|longitude|nível (1 = aparece de longe; 2 = só com o mapa mais perto) */
const MARES_RAW = `
Mar do Caribe|15|-75|1
Golfo do México|25|-90|1
Mar Mediterrâneo|35|18|1
Mar Negro|43.3|34|1
Mar Cáspio|42|50.5|1
Mar Vermelho|20|38.5|1
Golfo Pérsico|27|51.5|2
Mar da Arábia|15|63|1
Golfo de Bengala|15|88|1
Mar da China Meridional|13|114|1
Mar da China Oriental|29|125|2
Mar Amarelo|36|123|2
Mar do Japão|40|135|1
Mar de Okhotsk|54|148|1
Mar de Bering|58|-178|1
Golfo do Alasca|56|-145|1
Mar do Norte|56|3|1
Mar Báltico|58|20|1
Mar da Noruega|68|2|1
Mar de Barents|74|40|1
Mar da Groenlândia|76|-8|2
Baía de Hudson|60|-85|1
Mar do Labrador|58|-55|2
Mar de Kara|76|68|2
Mar de Laptev|76|125|2
Mar da Sibéria Oriental|73|160|2
Mar de Beaufort|72|-140|2
Mar de Chukchi|70|-170|2
Mar de Weddell|-72|-45|1
Mar de Ross|-75|-175|1
Mar da Tasmânia|-40|160|1
Mar de Coral|-18|155|1
Mar de Arafura|-9.5|135|2
Mar de Timor|-11.5|126|2
Mar de Java|-5|111|2
Mar de Banda|-5.5|127|2
Mar das Filipinas|20|130|1
Mar de Celebes|3|122|2
Mar de Andamão|10|96|2
Mar dos Sargaços|31|-64|1
Golfo da Guiné|1.5|4|1
Canal de Moçambique|-18|41|1
Golfo de Áden|12.5|48|2
Mar de Scotia|-57|-45|2
Mar Adriático|43|15|2
Mar Egeu|38.8|25|2
Mar Tirreno|40|12|2
Mar Jônico|37.5|18.5|2
Golfo da Biscaia|45.5|-4.5|2
Canal da Mancha|50|-2|2
Mar da Irlanda|53.8|-5|2
Golfo de Bótnia|62|20|2
Mar de Azov|46|36.6|2
Mar de Mármara|40.7|28.2|2
Golfo da Califórnia|27|-111|2
Mar de Salomão|-8|153|2
Mar de Bismarck|-4|148|2
Mar de Sulu|8|120|2`;

function xyz(lat,lng){var a=lat*Math.PI/180,b=lng*Math.PI/180;return {lat:lat,lng:lng,x:Math.cos(a)*Math.sin(b),y:Math.sin(a),z:Math.cos(a)*Math.cos(b)};}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  OC = [
   ['OCEANO','ATLÂNTICO',24,-38],['OCEANO','ATLÂNTICO',-22,-10],
   ['OCEANO','PACÍFICO',5,-140],['OCEANO','PACÍFICO',-30,-125],['OCEANO','PACÍFICO',15,170],
   ['OCEANO','ÍNDICO',-15,78],
   ['OCEANO GLACIAL','ÁRTICO',80,-150],
   ['OCEANO','AUSTRAL',-63,20],['OCEANO','AUSTRAL',-63,140],['OCEANO','AUSTRAL',-62,-100]
  ].map(function(o){var p=xyz(o[2],o[3]);p.l1=o[0];p.l2=o[1];return p;});
  MARES = MARES_RAW.trim().split('\n').map(function(l){
    var c=l.split('|'),p=xyz(+c[1],+c[2]);p.nome=c[0];p.nivel=+c[3];return p;
  });
}

export { iniciar, MARES, OC };
