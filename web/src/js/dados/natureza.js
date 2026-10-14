/**
 * @arquivo js/dados/natureza.js
 * Camada: Dados
 * Desertos, florestas e cordilheiras (nome no ponto central aproximado) e as linhas das zonas climáticas.
 */

/* tipo|nome|latitude|longitude|nível (1 = aparece de longe; 2 = só com o mapa mais perto) */
const NATUREZA_RAW = `
d|Deserto do Saara|23|12|1
d|Deserto da Arábia|21|48|1
d|Deserto de Gobi|43|105|1
d|Deserto do Kalahari|-23|22|1
d|Deserto do Namibe|-23|15|2
d|Deserto do Atacama|-24|-69.5|1
d|Deserto da Patagônia|-45|-69|2
d|Grande Deserto de Vitória|-29|129|1
d|Grande Deserto Arenoso|-20.5|123|2
d|Deserto de Taklamakan|38.5|83|1
d|Deserto de Thar|27|71|2
d|Deserto de Karakum|39|60|2
d|Deserto de Kyzylkum|42|64|2
d|Deserto Sírio|33|39|2
d|Deserto de Sonora|31|-112|2
d|Deserto de Chihuahua|29|-105|2
d|Deserto de Mojave|35|-116|2
d|Grande Bacia|40|-117|2
d|Deserto da Líbia|25|25|2
d|Deserto da Núbia|20.5|33|2
d|Deserto do Danakil|13.5|41|2
d|Deserto de Dasht-e Kavir|34.5|54|2
f|Floresta Amazônica|-4|-62|1
f|Floresta do Congo|0|20|1
f|Taiga Siberiana|61|100|1
f|Floresta Boreal do Canadá|55|-100|1
f|Mata Atlântica|-21|-42.5|2
f|Florestas de Bornéu|0.5|114|2
f|Florestas da Nova Guiné|-5|142|2
f|Florestas de Sumatra|0|102|2
f|Floresta da Indochina|17|104|2
f|Floresta Valdiviana|-40|-73|2
f|Floresta Negra|48.2|8.2|2
f|Florestas de Madagascar|-17|49|2
f|Sequoias da Califórnia|40.5|-123.8|2
f|Floresta do Pacífico Norte|50|-125|2
m|Cordilheira dos Andes|-17|-68|1
m|Montanhas Rochosas|44|-110|1
m|Himalaia|28.5|84|1
m|Alpes|46.5|10|1
m|Montes Urais|58|59.5|1
m|Montes Atlas|31.5|-6|1
m|Montes Apalaches|38|-80|2
m|Cordilheira do Cáucaso|42.5|44|2
m|Montes Zagros|33|48|2
m|Pamir e Hindu Kush|37|71.5|2
m|Tian Shan|42|80|2
m|Planalto do Tibete|33|88|1
m|Montes Cárpatos|47.5|25|2
m|Pirineus|42.7|0.5|2
m|Alpes Escandinavos|65|14|2
m|Grande Cordilheira Divisória|-30|150|2
m|Alpes do Sul|-43.5|170.5|2
m|Montanhas Etíopes|10|38.5|2
m|Monte Kilimanjaro|-3.07|37.35|2
m|Serra do Mar|-23.5|-46|2
m|Sierra Madre|23|-105.5|2
m|Montes Altai|49|88|2`;

/** Itens com tipo d (deserto), f (floresta) ou m (cordilheira). Coordenadas prontas para o globo. */
const NATUREZA = NATUREZA_RAW.trim().split('\n').map(function(l){
  var c=l.split('|'),lat=+c[2],lng=+c[3],a=lat*Math.PI/180,b=lng*Math.PI/180;
  return {tipo:c[0],nome:c[1],lat:lat,lng:lng,nivel:+c[4],x:Math.cos(a)*Math.sin(b),y:Math.sin(a),z:Math.cos(a)*Math.cos(b)};
});

/** Paralelos que dividem as zonas climáticas (latitude, nome). */
const LINHAS_ZONAS = [
  [66.56,'Círculo Polar Ártico'],[23.44,'Trópico de Câncer'],[0,'Equador'],
  [-23.44,'Trópico de Capricórnio'],[-66.56,'Círculo Polar Antártico']
];
/** Faixas entre as linhas: [de, até, nome, cor]. */
const FAIXAS_ZONAS = [
  [66.56,90,'Zona polar norte','#bfe3ff'],[23.44,66.56,'Zona temperada norte','#9be38f'],
  [-23.44,23.44,'Zona tropical','#ffb347'],[-66.56,-23.44,'Zona temperada sul','#9be38f'],[-90,-66.56,'Zona polar sul','#bfe3ff']
];

export { FAIXAS_ZONAS, LINHAS_ZONAS, NATUREZA };
