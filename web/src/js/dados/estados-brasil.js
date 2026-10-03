/**
 * @arquivo js/dados/estados-brasil.js
 * Camada: Dados
 * Estados do Brasil e suas regiões (sigla, capital, área, população, vizinhos).
 */

import { D, norm } from './paises.js';

/* =====================================================================
   BRASIL: ESTADOS E CAPITAIS
   ===================================================================== */
const BRREG = [{n:'Sul',c:'#b57cff'},{n:'Sudeste',c:'#4da3ff'},{n:'Centro-Oeste',c:'#f6c800'},{n:'Nordeste',c:'#ff8a3d'},{n:'Norte',c:'#2fd67f'}];
const STSHAPES = ['c','d','s','t','c'];
/* Ordem de navegação: Sul → Sudeste → Centro-Oeste → Nordeste (da Bahia para cima, vizinho a vizinho) → Norte.
   sigla|estado|capital|lat|lng|região|área km²|população (Censo 2022)|código IBGE|lat centro|lng centro|meia-extensão (°)|estados vizinhos|nota|países vizinhos */
const BR_RAW = `
RS|Rio Grande do Sul|Porto Alegre|-30.03|-51.23|0|281708|10882965|43|-29.7|-53.5|4.5|SC|Faz fronteira com a Argentina e o Uruguai|AR,UY
SC|Santa Catarina|Florianópolis|-27.60|-48.55|0|95730|7610361|42|-27.3|-50.5|3|PR,RS|A capital fica em grande parte numa ilha|AR
PR|Paraná|Curitiba|-25.43|-49.27|0|199298|11444380|41|-24.6|-51.5|3.5|SP,MS,SC||PY,AR
SP|São Paulo|São Paulo|-23.55|-46.63|1|248219|44411238|35|-22.3|-48.6|4|MG,RJ,MS,PR|Estado mais populoso do Brasil|
RJ|Rio de Janeiro|Rio de Janeiro|-22.91|-43.17|1|43750|16055174|33|-22.3|-42.7|2.5|ES,MG,SP|A cidade do Rio foi a capital do Brasil até 1960|
ES|Espírito Santo|Vitória|-20.32|-40.34|1|46074|3833712|32|-19.6|-40.5|2.5|BA,MG,RJ||
MG|Minas Gerais|Belo Horizonte|-19.92|-43.94|1|586513|20538718|31|-18.5|-44.6|6|BA,ES,RJ,SP,MS,GO,DF|É o estado com mais municípios do país|
GO|Goiás|Goiânia|-16.68|-49.25|2|340242|7056495|52|-15.9|-49.8|5|TO,BA,MG,MS,MT,DF||
DF|Distrito Federal|Brasília|-15.79|-47.88|2|5760|2817381|53|-15.78|-47.8|0.5|GO,MG|Sede do governo federal; não é estado nem município|
MT|Mato Grosso|Cuiabá|-15.60|-56.10|2|903208|3658649|51|-13.0|-56.0|7|AM,PA,TO,GO,MS,RO||BO
MS|Mato Grosso do Sul|Campo Grande|-20.44|-54.65|2|357142|2757013|50|-20.5|-54.5|5|MT,GO,MG,SP,PR||BO,PY
BA|Bahia|Salvador|-12.97|-38.51|3|564760|14136417|29|-12.5|-41.7|7|SE,AL,PE,PI,TO,GO,MG,ES|Salvador foi a primeira capital do Brasil (1549–1763)|
SE|Sergipe|Aracaju|-10.91|-37.07|3|21938|2210004|28|-10.6|-37.4|1.2|AL,BA|Menor estado do Brasil em área|
AL|Alagoas|Maceió|-9.67|-35.74|3|27830|3127683|27|-9.6|-36.6|1.5|PE,SE,BA||
PE|Pernambuco|Recife|-8.05|-34.88|3|98067|9058931|26|-8.3|-37.9|4.5|PB,CE,PI,BA,AL|Inclui o arquipélago de Fernando de Noronha|
PB|Paraíba|João Pessoa|-7.12|-34.86|3|56467|3974687|25|-7.1|-36.8|2|RN,CE,PE||
RN|Rio Grande do Norte|Natal|-5.79|-35.21|3|52809|3302729|24|-5.8|-36.6|2|PB,CE||
CE|Ceará|Fortaleza|-3.73|-38.52|3|148894|8794957|23|-5.2|-39.3|3|RN,PB,PE,PI||
PI|Piauí|Teresina|-5.09|-42.80|3|251616|3271199|22|-7.7|-42.7|5.5|MA,TO,BA,PE,CE||
MA|Maranhão|São Luís|-2.53|-44.30|3|329651|6776699|21|-5.0|-45.3|5|PI,TO,PA||
TO|Tocantins|Palmas|-10.18|-48.33|4|277423|1511460|17|-10.2|-48.3|5.5|MA,PA,MT,GO,BA,PI|Estado mais novo do Brasil (1988); Palmas foi planejada e fundada em 1989|
PA|Pará|Belém|-1.46|-48.50|4|1245871|8120131|15|-4.0|-52.5|8|AP,AM,RR,MT,TO,MA||GY,SR
AP|Amapá|Macapá|0.03|-51.07|4|142471|733759|16|1.4|-51.8|3.5|PA|Macapá é cortada pela linha do Equador|GF,SR
RR|Roraima|Boa Vista|2.82|-60.67|4|223645|636707|14|2.0|-61.4|4|AM,PA||VE,GY
AM|Amazonas|Manaus|-3.12|-60.02|4|1559256|3941613|13|-4.5|-64.5|9|RR,PA,MT,RO,AC|Maior estado do Brasil em área|CO,VE,PE
AC|Acre|Rio Branco|-9.97|-67.81|4|164173|830018|12|-9.0|-70.5|4.5|AM,RO||PE,BO
RO|Rondônia|Porto Velho|-8.76|-63.90|4|237754|1581196|11|-10.9|-62.8|4|AC,AM,MT||BO
`;
let BRS;
const BRBY = {};

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  BRS = BR_RAW.trim().split('\n').map(function(l,i){
    var p=l.split('|'),la=+p[3]*Math.PI/180,lo=+p[4]*Math.PI/180;
    return {i:i,sigla:p[0],name:p[1],cap:p[2],lat:+p[3],lng:+p[4],x:Math.cos(la)*Math.sin(lo),y:Math.sin(la),z:Math.cos(la)*Math.cos(lo),
      reg:+p[5],r:+p[5],area:+p[6],pop:+p[7],ibge:p[8],clat:+p[9],clng:+p[10],ext:+p[11],nbs:p[12].split(','),note:p[13]||'',cnc:p[14]?p[14].split(','):[],
      key:norm(p[1]+' '+p[2]+' '+p[0])};
  });BRS.forEach(function(s){BRBY[s.sigla]=s.i;});
  BRS.forEach(function(s){
    s.nb=s.nbs.map(function(x){return BRBY[x];});
    s.cn=s.cnc.map(function(cc){for(var k=0;k<D.length;k++)if(D[k].cc===cc)return k;return -1;}).filter(function(k){return k>=0;});
  });
}

export { BRBY, BRREG, BRS, iniciar, STSHAPES };
