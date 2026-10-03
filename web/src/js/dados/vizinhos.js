/**
 * @arquivo js/dados/vizinhos.js
 * Camada: Dados
 * Fronteiras terrestres entre países (lista de vizinhos NB).
 */
/* ---------- Vizinhos (fronteiras terrestres) ---------- */
var NB_RAW=`
Chipre:Chipre do Norte
Brasil:Guiana Francesa,Suriname,Guiana,Venezuela,Colômbia,Peru,Bolívia,Paraguai,Argentina,Uruguai
Guiana Francesa:Suriname
Suriname:Guiana
Guiana:Venezuela
Venezuela:Colômbia
Colômbia:Equador,Peru,Panamá
Equador:Peru
Peru:Bolívia,Chile
Bolívia:Chile,Argentina,Paraguai
Chile:Argentina
Argentina:Paraguai,Uruguai
Panamá:Costa Rica
Costa Rica:Nicarágua
Nicarágua:Honduras
Honduras:El Salvador,Guatemala
El Salvador:Guatemala
Guatemala:Belize,México
Belize:México
Haiti:República Dominicana
México:Estados Unidos
Estados Unidos:Canadá
África do Sul:Lesoto,Essuatíni,Botsuana,Namíbia,Moçambique,Zimbábue
Essuatíni:Moçambique
Botsuana:Namíbia,Zâmbia,Zimbábue
Namíbia:Angola,Zâmbia
Zâmbia:Zimbábue,Moçambique,Malawi,Tanzânia,República Democrática do Congo,Angola
Zimbábue:Moçambique
Moçambique:Malawi,Tanzânia
Malawi:Tanzânia
Tanzânia:Burundi,Ruanda,Uganda,Quênia,República Democrática do Congo
Burundi:Ruanda,República Democrática do Congo
Ruanda:Uganda,República Democrática do Congo
Uganda:Quênia,Sudão do Sul,República Democrática do Congo
Quênia:Somália,Etiópia,Sudão do Sul
Somália:Somalilândia
Somalilândia:Djibuti,Etiópia
Somália:Djibuti,Etiópia
Djibuti:Eritreia,Etiópia
Eritreia:Etiópia,Sudão
Etiópia:Sudão do Sul,Sudão
Sudão do Sul:Sudão,República Democrática do Congo,República Centro-Africana
Angola:República Democrática do Congo,República do Congo
República Democrática do Congo:República do Congo,República Centro-Africana
República do Congo:Gabão,Camarões,República Centro-Africana
Gabão:Guiné Equatorial,Camarões
Guiné Equatorial:Camarões
Camarões:República Centro-Africana,Chade,Nigéria
República Centro-Africana:Chade,Sudão
Chade:Níger,Nigéria,Líbia,Sudão
Níger:Nigéria,Benim,Burquina Fasso,Mali,Argélia,Líbia
Nigéria:Benim
Benim:Togo,Burquina Fasso
Togo:Burquina Fasso,Gana
Burquina Fasso:Gana,Costa do Marfim,Mali
Gana:Costa do Marfim
Costa do Marfim:Libéria,Guiné,Mali
Libéria:Serra Leoa,Guiné
Serra Leoa:Guiné
Guiné:Guiné-Bissau,Senegal,Mali
Guiné-Bissau:Senegal
Gâmbia:Senegal
Senegal:Mauritânia,Mali
Mauritânia:Mali,Argélia,Saara Ocidental
Mali:Argélia
Saara Ocidental:Marrocos,Argélia
Marrocos:Argélia
Argélia:Tunísia,Líbia
Tunísia:Líbia
Líbia:Egito,Sudão
Egito:Sudão,Israel,Palestina
Portugal:Espanha
Espanha:Andorra,França
Andorra:França
Mônaco:França
San Marino:Itália
Itália:França,Suíça,Áustria,Eslovênia,San Marino,Vaticano
Grécia:Albânia,Macedônia do Norte,Bulgária,Turquia
Turquia:Bulgária,Geórgia,Armênia,Azerbaijão,Irã,Iraque,Síria
França:Bélgica,Luxemburgo,Alemanha,Suíça
Irlanda:Reino Unido
Países Baixos:Bélgica,Alemanha
Bélgica:Luxemburgo,Alemanha
Alemanha:Luxemburgo,Suíça,Áustria,Tchéquia,Polônia,Dinamarca
Liechtenstein:Suíça,Áustria
Suíça:Áustria
Áustria:Tchéquia,Eslováquia,Hungria,Eslovênia
Suécia:Noruega,Finlândia
Noruega:Finlândia,Rússia
Finlândia:Rússia
Estônia:Letônia,Rússia
Letônia:Lituânia,Rússia,Bielorrússia
Lituânia:Polônia,Bielorrússia,Rússia
Rússia:Bielorrússia,Polônia,Ucrânia,Geórgia,Azerbaijão,Cazaquistão,China,Mongólia,Coreia do Norte
Bielorrússia:Polônia,Ucrânia
Polônia:Tchéquia,Eslováquia,Ucrânia
Tchéquia:Eslováquia
Eslováquia:Hungria,Ucrânia
Hungria:Eslovênia,Croácia,Sérvia,Romênia,Ucrânia
Eslovênia:Croácia
Croácia:Bósnia e Herzegovina,Sérvia,Montenegro
Bósnia e Herzegovina:Sérvia,Montenegro
Montenegro:Albânia,Sérvia,Kosovo
Kosovo:Sérvia,Albânia,Macedônia do Norte
Albânia:Macedônia do Norte
Macedônia do Norte:Sérvia,Bulgária
Sérvia:Romênia,Bulgária
Romênia:Bulgária,Moldávia,Ucrânia
Moldávia:Ucrânia,Transnístria
Transnístria:Ucrânia
Geórgia:Armênia,Azerbaijão,Abecásia,Ossétia do Sul
Abecásia:Rússia
Ossétia do Sul:Rússia
Armênia:Azerbaijão,Irã
Azerbaijão:Irã
Síria:Líbano,Israel,Jordânia,Iraque
Líbano:Israel
Palestina:Israel,Jordânia
Israel:Jordânia
Jordânia:Arábia Saudita,Iraque
Arábia Saudita:Iêmen,Omã,Emirados Árabes Unidos,Catar,Kuwait,Iraque
Iêmen:Omã
Omã:Emirados Árabes Unidos
Kuwait:Iraque
Iraque:Irã
Irã:Afeganistão,Paquistão,Turcomenistão
Afeganistão:Paquistão,Turcomenistão,Uzbequistão,Tajiquistão,China
Cazaquistão:Uzbequistão,Quirguistão,Turcomenistão,China
Uzbequistão:Turcomenistão,Quirguistão,Tajiquistão
Quirguistão:Tajiquistão,China
Tajiquistão:China
Paquistão:Índia,China
Índia:China,Nepal,Butão,Bangladesh,Mianmar
Bangladesh:Mianmar
Butão:China
Nepal:China
Mongólia:China
China:Coreia do Norte,Vietnã,Laos,Mianmar
Coreia do Norte:Coreia do Sul
Mianmar:Tailândia,Laos
Tailândia:Laos,Camboja,Malásia
Laos:Vietnã,Camboja
Vietnã:Camboja
Malásia:Brunei,Indonésia
Indonésia:Timor-Leste,Papua-Nova Guiné
Brunei:Malásia
`;
var NB=D.map(function(){return [];});
var byName={};
D.forEach(function(d){byName[norm(d.name.split(' (')[0])]=d.i;});
NB_RAW.trim().split('\n').forEach(function(l){
  var p=l.split(':'),a=byName[norm(p[0].trim())];
  if(a===undefined){console.warn('país?',p[0]);return;}
  (p[1]||'').split(',').forEach(function(n){
    n=n.trim();if(!n)return;
    var b=byName[norm(n)];
    if(b===undefined){console.warn('vizinho?',n);return;}
    if(NB[a].indexOf(b)<0)NB[a].push(b);
    if(NB[b].indexOf(a)<0)NB[b].push(a);
  });
});
function short(d){return d.name.split(' (')[0];}
function capShort(d){return d.cap.split(' (')[0].split(' · ')[0].split(' / ')[0];}

