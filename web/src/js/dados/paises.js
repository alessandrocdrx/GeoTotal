/**
 * @arquivo js/dados/paises.js
 * Camada: Dados
 * Países, territórios dependentes e desabitados (nome, capital, coordenadas, região) e a rota de vizinhança D.
 */

/* ---------- Dados (ordem de vizinhança do documento) ----------
   país | capital | lat | lng | região | sub-região | observação  */
const REG = [
 {n:'América do Sul',c:'#f6c800',lat:-15,lng:-58,z:1.15},
 {n:'América Central e Caribe',c:'#ff4fa3',lat:16,lng:-78,z:1.9},
 {n:'América do Norte',c:'#2fd67f',lat:45,lng:-100,z:1.1},
 {n:'África',c:'#ff6b2c',lat:3,lng:20,z:1.05},
 {n:'Europa',c:'#4da3ff',lat:50,lng:15,z:1.7},
 {n:'Ásia',c:'#b57cff',lat:32,lng:88,z:1.05},
 {n:'Oceania',c:'#22d3ee',lat:-10,lng:160,z:1.15},
 {n:'Antártida',c:'#cbd5e1',lat:-72,lng:30,z:1.2}
];
const RAW = `
Brasil|Brasília|-15.79|-47.88|0|América do Sul||BR
Guiana Francesa|Caiena (Cayenne)|4.94|-52.33|0|América do Sul|Território ultramarino da França — não é país soberano nem membro da ONU|GF|dep
Suriname|Paramaribo|5.85|-55.20|0|América do Sul||SR
Guiana|Georgetown|6.80|-58.16|0|América do Sul||GY
Venezuela|Caracas|10.48|-66.90|0|América do Sul||VE
Colômbia|Bogotá|4.71|-74.07|0|América do Sul||CO
Equador|Quito|-0.18|-78.47|0|América do Sul||EC
Peru|Lima|-12.05|-77.04|0|América do Sul||PE
Bolívia|Sucre / La Paz|-19.03|-65.26|0|América do Sul|Sucre é a capital constitucional; La Paz é a sede do governo — caso raro de duas capitais|BO
Chile|Santiago|-33.45|-70.67|0|América do Sul||CL
Argentina|Buenos Aires|-34.60|-58.38|0|América do Sul||AR
Paraguai|Assunção (Asunción)|-25.26|-57.58|0|América do Sul||PY
Uruguai|Montevidéu|-34.90|-56.16|0|América do Sul||UY
Panamá|Cidade do Panamá|8.98|-79.52|1|Istmo (América Central)||PA
Costa Rica|San José|9.93|-84.08|1|Istmo (América Central)||CR
Nicarágua|Manágua|12.11|-86.24|1|Istmo (América Central)||NI
Honduras|Tegucigalpa|14.07|-87.19|1|Istmo (América Central)||HN
El Salvador|San Salvador|13.69|-89.19|1|Istmo (América Central)||SV
Guatemala|Cidade da Guatemala|14.63|-90.51|1|Istmo (América Central)||GT
Belize|Belmopan|17.25|-88.77|1|Istmo (América Central)||BZ
Cuba|Havana|23.11|-82.37|1|Caribe|Maior ilha do Caribe, a cerca de 150 km da Flórida (EUA)|CU
Jamaica|Kingston|18.00|-76.79|1|Caribe||JM
Bahamas|Nassau|25.05|-77.35|1|Caribe|Arquipélago com cerca de 700 ilhas, ao norte de Cuba|BS
Haiti|Porto Príncipe|18.54|-72.34|1|Caribe|Divide a ilha de Hispaniola com a República Dominicana|HT
República Dominicana|Santo Domingo|18.49|-69.93|1|Caribe||DO
São Cristóvão e Nevis|Basseterre|17.30|-62.72|1|Caribe|Pequenas Antilhas — a menor nação da ONU|KN
Antígua e Barbuda|St. John's|17.12|-61.85|1|Caribe|Pequenas Antilhas|AG
Dominica|Roseau|15.30|-61.39|1|Caribe|Pequenas Antilhas|DM
Santa Lúcia|Castries|14.01|-60.99|1|Caribe|Pequenas Antilhas|LC
São Vicente e Granadinas|Kingstown|13.16|-61.22|1|Caribe|Pequenas Antilhas|VC
Barbados|Bridgetown|13.10|-59.61|1|Caribe|Pequenas Antilhas|BB
Granada|St. George's|12.05|-61.75|1|Caribe|Pequenas Antilhas|GD
Trinidad e Tobago|Port of Spain|10.66|-61.51|1|Caribe|É a ilha do Caribe mais próxima da Venezuela|TT
México|Cidade do México|19.43|-99.13|2|América do Norte||MX
Estados Unidos|Washington, D.C.|38.90|-77.04|2|América do Norte||US
Canadá|Ottawa|45.42|-75.70|2|América do Norte||CA
África do Sul|Pretória · Cidade do Cabo · Bloemfontein|-25.75|28.19|3|África Austral|Único país com 3 capitais: administrativa, legislativa e judiciária|ZA
Lesoto|Maseru|-29.31|27.48|3|África Austral|Enclave dentro da África do Sul|LS
Essuatíni (Eswatini)|Mbabane · Lobamba|-26.32|31.14|3|África Austral|Mbabane é a capital administrativa; Lobamba, a real/legislativa|SZ
Botsuana|Gaborone|-24.65|25.91|3|África Austral||BW
Namíbia|Windhoek|-22.56|17.08|3|África Austral||NA
Zâmbia|Lusaka|-15.39|28.32|3|África Oriental||ZM
Zimbábue|Harare|-17.83|31.05|3|África Oriental||ZW
Moçambique|Maputo|-25.97|32.57|3|África Oriental||MZ
Madagascar|Antananarivo|-18.88|47.51|3|África Oriental|Ilha em frente a Moçambique|MG
Maurício|Port Louis|-20.16|57.50|3|África Oriental|Ilha a leste de Madagascar|MU
Seicheles|Vitória|-4.62|55.45|3|África Oriental|Arquipélago ao norte de Maurício e Madagascar|SC
Comores|Moroni|-11.70|43.26|3|África Oriental|Arquipélago entre Moçambique e Madagascar|KM
Malawi|Lilongwe|-13.96|33.79|3|África Oriental||MW
Tanzânia|Dodoma|-6.16|35.75|3|África Oriental||TZ
Burundi|Bujumbura|-3.38|29.36|3|África Oriental||BI
Ruanda|Kigali|-1.95|30.06|3|África Oriental||RW
Uganda|Campala (Kampala)|0.35|32.58|3|África Oriental||UG
Quênia|Nairóbi|-1.29|36.82|3|África Oriental||KE
Somália|Mogadíscio|2.05|45.32|3|África Oriental|Chifre da África|SO
Somalilândia|Hargeisa|9.56|44.065|3|África Oriental|Não reconhecida pela ONU — declarou independência da Somália em 1991 e tem governo, moeda e eleições próprios, mas nenhum país a reconhece oficialmente|XS
Djibuti|Djibuti|11.59|43.15|3|África Oriental|Chifre da África|DJ
Eritreia|Asmara|15.32|38.93|3|África Oriental|Litoral do Mar Vermelho|ER
Etiópia|Adis Abeba|9.03|38.74|3|África Oriental||ET
Sudão do Sul|Juba|4.85|31.58|3|África Oriental||SS
Angola|Luanda|-8.84|13.23|3|África Central|Litoral atlântico, ao sul da RD Congo|AO
República Democrática do Congo|Quinxassa (Kinshasa)|-4.44|15.27|3|África Central||CD
República do Congo|Brazzaville|-4.27|15.28|3|África Central|As duas capitais do Congo ficam frente a frente no rio Congo|CG
Gabão|Libreville|0.39|9.45|3|África Central||GA
São Tomé e Príncipe|São Tomé|0.34|6.73|3|África Central|Ilha próxima ao Gabão|ST
Guiné Equatorial|Malabo|3.75|8.78|3|África Central||GQ
Camarões|Iaundé (Yaoundé)|3.85|11.50|3|África Central||CM
República Centro-Africana|Bangui|4.36|18.56|3|África Central||CF
Chade|N'Djamena|12.13|15.05|3|África Central||TD
Níger|Niamey|13.51|2.11|3|África Ocidental||NE
Nigéria|Abuja|9.06|7.49|3|África Ocidental||NG
Benim|Porto Novo|6.50|2.63|3|África Ocidental||BJ
Togo|Lomé|6.13|1.22|3|África Ocidental||TG
Burquina Fasso|Uagadugu (Ouagadougou)|12.37|-1.52|3|África Ocidental||BF
Gana|Acra|5.60|-0.19|3|África Ocidental||GH
Costa do Marfim|Iamussucro (Yamoussoukro)|6.83|-5.28|3|África Ocidental||CI
Libéria|Monróvia|6.30|-10.80|3|África Ocidental||LR
Serra Leoa|Freetown|8.48|-13.23|3|África Ocidental||SL
Guiné|Conacri|9.64|-13.58|3|África Ocidental||GN
Guiné-Bissau|Bissau|11.86|-15.60|3|África Ocidental||GW
Gâmbia|Banjul|13.45|-16.58|3|África Ocidental|Menor país da África continental, encravado dentro do Senegal|GM
Senegal|Dacar (Dakar)|14.72|-17.47|3|África Ocidental|Seu território envolve quase toda a Gâmbia|SN
Cabo Verde|Praia|14.93|-23.51|3|África Ocidental|Arquipélago no Atlântico, em frente ao Senegal|CV
Mauritânia|Nuaquechote (Nouakchott)|18.09|-15.98|3|África Ocidental||MR
Mali|Bamaco|12.64|-8.00|3|África Ocidental||ML
Saara Ocidental|El Aaiún (capital proclamada pela RASD)|27.15|-13.20|3|África Setentrional|Território disputado, administrado majoritariamente por Marrocos; não é membro da ONU|EH
Marrocos|Rabat|34.02|-6.84|3|África Setentrional||MA
Argélia|Argel|36.75|3.06|3|África Setentrional||DZ
Tunísia|Túnis|36.81|10.18|3|África Setentrional||TN
Líbia|Trípoli|32.89|13.19|3|África Setentrional||LY
Egito|Cairo|30.04|31.24|3|África Setentrional||EG
Sudão|Cartum|15.50|32.56|3|África Setentrional||SD
Portugal|Lisboa|38.72|-9.14|4|Europa Meridional||PT
Espanha|Madri|40.42|-3.70|4|Europa Meridional||ES
Andorra|Andorra-a-Velha|42.51|1.52|4|Europa Meridional||AD
Mônaco|Mônaco|43.74|7.42|4|Europa Meridional||MC
San Marino|San Marino|43.94|12.45|4|Europa Meridional||SM
Itália|Roma|41.90|12.50|4|Europa Meridional||IT
Vaticano|Cidade do Vaticano|41.90|12.45|4|Europa Meridional|Menor país do mundo; é Estado observador da ONU, não membro|VA
Malta|Valeta|35.90|14.51|4|Europa Meridional||MT
Grécia|Atenas|37.98|23.73|4|Europa Meridional||GR
Turquia (Türkiye)|Ancara|39.93|32.86|4|Europa Meridional|País transcontinental: parte na Europa, parte na Ásia|TR
França|Paris|48.86|2.35|4|Europa Ocidental||FR
Irlanda|Dublin|53.35|-6.26|4|Europa Ocidental||IE
Reino Unido|Londres|51.51|-0.13|4|Europa Ocidental||GB
Países Baixos|Amsterdã (capital) · Haia (sede do governo)|52.37|4.90|4|Europa Ocidental||NL
Bélgica|Bruxelas|50.85|4.35|4|Europa Ocidental||BE
Alemanha|Berlim|52.52|13.40|4|Europa Ocidental||DE
Luxemburgo|Luxemburgo|49.61|6.13|4|Europa Ocidental||LU
Liechtenstein|Vaduz|47.14|9.52|4|Europa Ocidental||LI
Suíça|Berna (de fato)|46.95|7.45|4|Europa Ocidental||CH
Áustria|Viena|48.21|16.37|4|Europa Ocidental||AT
Islândia|Reykjavík|64.15|-21.94|4|Europa Setentrional||IS
Dinamarca|Copenhague|55.68|12.57|4|Europa Setentrional||DK
Suécia|Estocolmo|59.33|18.07|4|Europa Setentrional||SE
Noruega|Oslo|59.91|10.75|4|Europa Setentrional||NO
Finlândia|Helsinque|60.17|24.94|4|Europa Setentrional||FI
Estônia|Tallinn|59.44|24.75|4|Europa Setentrional||EE
Letônia|Riga|56.95|24.11|4|Europa Setentrional||LV
Lituânia|Vílnius|54.69|25.28|4|Europa Setentrional||LT
Rússia|Moscou|55.76|37.62|4|Europa Centro-Oriental|Maior país do mundo e transcontinental: parte na Europa, parte na Ásia|RU
Bielorrússia (Belarus)|Minsk|53.90|27.57|4|Europa Centro-Oriental||BY
Polônia|Varsóvia|52.23|21.01|4|Europa Centro-Oriental||PL
Tchéquia|Praga|50.08|14.44|4|Europa Centro-Oriental||CZ
Eslováquia|Bratislava|48.15|17.11|4|Europa Centro-Oriental||SK
Hungria|Budapeste|47.50|19.04|4|Europa Centro-Oriental||HU
Eslovênia|Liubliana|46.06|14.51|4|Europa Centro-Oriental||SI
Croácia|Zagreb|45.81|15.98|4|Europa Centro-Oriental||HR
Bósnia e Herzegovina|Sarajevo|43.86|18.41|4|Europa Centro-Oriental||BA
Montenegro|Podgorica|42.44|19.26|4|Europa Centro-Oriental||ME
Kosovo|Pristina|42.6629|21.1655|4|Europa Centro-Oriental|Reconhecido por cerca de 100 países da ONU; a Sérvia considera o território parte de si|XK
Albânia|Tirana|41.33|19.82|4|Europa Centro-Oriental||AL
Chipre|Nicósia|35.17|33.36|4|Europa Centro-Oriental|Ilha no Mediterrâneo oriental, geograficamente na Ásia, mas membro da União Europeia|CY
Chipre do Norte|Nicósia (Norte)|35.1856|33.3823|4|Europa Centro-Oriental|Reconhecido apenas pela Turquia; ocupa o norte da ilha de Chipre desde 1974|XN
Macedônia do Norte|Escópia (Skopje)|42.00|21.43|4|Europa Centro-Oriental||MK
Sérvia|Belgrado|44.79|20.45|4|Europa Centro-Oriental||RS
Romênia|Bucareste|44.43|26.10|4|Europa Centro-Oriental||RO
Bulgária|Sófia|42.70|23.32|4|Europa Centro-Oriental||BG
Moldávia|Chisinau|47.01|28.86|4|Europa Centro-Oriental||MD
Transnístria|Tiraspol|46.8403|29.6433|4|Europa Centro-Oriental|Não reconhecida pela ONU; faixa separatista entre a Moldávia e a Ucrânia, apoiada pela Rússia|XT
Ucrânia|Kiev|50.45|30.52|4|Europa Centro-Oriental||UA
Abecásia|Sukhumi|43.0034|41.0219|4|Europa Centro-Oriental|Separou-se da Geórgia nos anos 1990; reconhecida pela Rússia e poucos outros países|XA
Ossétia do Sul|Tskhinvali|42.2410|43.9668|4|Europa Centro-Oriental|Separou-se da Geórgia nos anos 1990; reconhecida pela Rússia e poucos outros países|XO
Geórgia|Tbilisi|41.72|44.79|4|Europa Centro-Oriental|País transcontinental, entre a Europa e a Ásia, no Cáucaso|GE
Armênia|Erevã|40.18|44.51|4|Europa Centro-Oriental|País transcontinental, entre a Europa e a Ásia, no Cáucaso|AM
Azerbaijão|Baku|40.41|49.87|4|Europa Centro-Oriental|País transcontinental, entre a Europa e a Ásia, no Cáucaso|AZ
Síria|Damasco|33.51|36.29|5|Oriente Médio||SY
Líbano|Beirute|33.89|35.50|5|Oriente Médio||LB
Palestina|Ramallah|31.90|35.20|5|Oriente Médio|Sede administrativa; Jerusalém Oriental é a capital proclamada, mas não exercida de fato|PS
Israel|Jerusalém|31.77|35.21|5|Oriente Médio|Capital proclamada; a maioria dos países mantém embaixadas em Tel Aviv|IL
Jordânia|Amã|31.95|35.93|5|Oriente Médio||JO
Arábia Saudita|Riade|24.71|46.68|5|Oriente Médio||SA
Iêmen|Sanaá|15.37|44.19|5|Oriente Médio|Capital constitucional; o governo reconhecido internacionalmente opera de Áden|YE
Omã|Mascate|23.59|58.41|5|Oriente Médio||OM
Emirados Árabes Unidos|Abu Dhabi|24.45|54.38|5|Oriente Médio||AE
Catar|Doha|25.29|51.53|5|Oriente Médio||QA
Bahrein|Manama|26.23|50.59|5|Oriente Médio||BH
Kuwait|Cidade do Kuwait|29.38|47.99|5|Oriente Médio||KW
Iraque|Bagdá|33.31|44.36|5|Oriente Médio||IQ
Irã|Teerã|35.69|51.39|5|Oriente Médio||IR
Afeganistão|Cabul|34.53|69.17|5|Oriente Médio||AF
Cazaquistão|Astana|51.17|71.43|5|Ásia Central||KZ
Uzbequistão|Tasquente|41.30|69.24|5|Ásia Central||UZ
Turcomenistão|Asgabate|37.95|58.38|5|Ásia Central||TM
Quirguistão|Bisqueque|42.87|74.59|5|Ásia Central||KG
Tajiquistão|Duchambe|38.56|68.77|5|Ásia Central||TJ
Paquistão|Islamabad|33.68|73.05|5|Ásia do Sul||PK
Índia|Nova Délhi|28.61|77.21|5|Ásia do Sul||IN
Maldivas|Malé|4.18|73.51|5|Ásia do Sul||MV
Sri Lanka|Sri Jayawardenepura Kotte|6.89|79.92|5|Ásia do Sul|Capital oficial; Colombo é o centro comercial|LK
Bangladesh|Daca|23.81|90.41|5|Ásia do Sul||BD
Butão|Timphu|27.47|89.64|5|Ásia do Sul||BT
Nepal|Catmandu|27.72|85.32|5|Ásia do Sul||NP
Mongólia|Ulã Bator|47.89|106.91|5|Leste Asiático||MN
China|Pequim|39.90|116.41|5|Leste Asiático||CN
Coreia do Norte|Pyongyang|39.04|125.76|5|Leste Asiático||KP
Coreia do Sul|Seul|37.57|126.98|5|Leste Asiático||KR
Japão|Tóquio|35.68|139.69|5|Leste Asiático||JP
Taiwan|Taipé|25.03|121.57|5|Leste Asiático|Não é membro da ONU; reivindicado pela China, mas administrado de forma independente|TW
Mianmar|Naypyidaw|19.76|96.08|5|Sudeste Asiático|Capital administrativa desde 2005; Yangon foi a anterior|MM
Tailândia|Bangcoc|13.76|100.50|5|Sudeste Asiático||TH
Laos|Vientiane|17.97|102.63|5|Sudeste Asiático||LA
Vietnã|Hanói|21.03|105.85|5|Sudeste Asiático||VN
Camboja|Phnom Penh|11.56|104.92|5|Sudeste Asiático||KH
Malásia|Kuala Lumpur|3.14|101.69|5|Sudeste Asiático|Putrajaya é o centro administrativo federal|MY
Singapura|Singapura|1.35|103.82|5|Sudeste Asiático||SG
Indonésia|Jacarta|-6.21|106.85|5|Sudeste Asiático||ID
Brunei|Bandar Seri Begawan|4.89|114.94|5|Sudeste Asiático||BN
Filipinas|Manila|14.60|120.98|5|Sudeste Asiático||PH
Timor-Leste|Díli|-8.56|125.57|5|Sudeste Asiático||TL
Austrália|Camberra|-35.28|149.13|6|Austrália e Nova Zelândia||AU
Nova Zelândia|Wellington|-41.29|174.78|6|Austrália e Nova Zelândia||NZ
Papua-Nova Guiné|Port Moresby|-9.44|147.18|6|Melanésia||PG
Ilhas Salomão|Honiara|-9.43|159.95|6|Melanésia||SB
Vanuatu|Port Vila|-17.73|168.32|6|Melanésia||VU
Fiji|Suva|-18.14|178.44|6|Melanésia||FJ
Palau|Ngerulmud|7.50|134.62|6|Micronésia||PW
Micronésia (Estados Federados da)|Palikir|6.92|158.16|6|Micronésia||FM
Ilhas Marshall|Majuro|7.09|171.38|6|Micronésia||MH
Nauru|Sem capital oficial (Yaren é o distrito de fato)|-0.55|166.92|6|Micronésia||NR
Kiribati|Tarawa Sul|1.33|172.98|6|Micronésia||KI
Tuvalu|Funafuti|-8.52|179.19|6|Polinésia||TV
Samoa|Apia|-13.83|-171.76|6|Polinésia||WS
Tonga|Nuku'alofa|-21.14|-175.20|6|Polinésia||TO
`;
/* territórios dependentes ou administrados por outro país: desligados por padrão (campo extra |dep) */
const RAW_DEP = `
Porto Rico|San Juan|18.47|-66.11|1|Caribe|Território dos Estados Unidos; seus moradores são cidadãos americanos, mas não votam para presidente|PR|dep
Ilhas Virgens Americanas|Charlotte Amalie|18.34|-64.93|1|Caribe|Território dos Estados Unidos, comprado da Dinamarca em 1917|VI|dep
Ilhas Virgens Britânicas|Road Town|18.43|-64.62|1|Caribe|Território ultramarino do Reino Unido|VG|dep
Anguila|The Valley|18.22|-63.05|1|Caribe|Território ultramarino do Reino Unido|AI|dep
Montserrat|Brades (de fato) · Plymouth (oficial)|16.79|-62.21|1|Caribe|Território ultramarino do Reino Unido; a capital oficial, Plymouth, foi abandonada após a erupção do vulcão Soufrière Hills em 1997|MS|dep
Ilhas Cayman|George Town|19.29|-81.38|1|Caribe|Território ultramarino do Reino Unido|KY|dep
Turks e Caicos|Cockburn Town|21.46|-71.14|1|Caribe|Território ultramarino do Reino Unido|TC|dep
Aruba|Oranjestad|12.52|-70.03|1|Caribe|País constituinte do Reino dos Países Baixos|AW|dep
Curaçao|Willemstad|12.11|-68.93|1|Caribe|País constituinte do Reino dos Países Baixos|CW|dep
Sint Maarten|Philipsburg|18.03|-63.05|1|Caribe|País constituinte do Reino dos Países Baixos; divide a ilha com o São Martinho francês|SX|dep
Caribe Neerlandês|Kralendijk|12.15|-68.27|1|Caribe|Bonaire, Santo Eustáquio e Saba: municípios especiais dos Países Baixos|BQ|dep
Guadalupe|Basse-Terre|16.00|-61.73|1|Caribe|Departamento ultramarino da França (parte da União Europeia)|GP|dep
Martinica|Fort-de-France|14.60|-61.07|1|Caribe|Departamento ultramarino da França (parte da União Europeia)|MQ|dep
São Martinho|Marigot|18.07|-63.08|1|Caribe|Coletividade ultramarina da França; divide a ilha com Sint Maarten|MF|dep
São Bartolomeu|Gustavia|17.90|-62.85|1|Caribe|Coletividade ultramarina da França|BL|dep
Bermudas|Hamilton|32.29|-64.78|2|América do Norte|Território ultramarino do Reino Unido, no Atlântico Norte|BM|dep
Groenlândia|Nuuk|64.18|-51.72|2|América do Norte|Território autônomo do Reino da Dinamarca; a maior ilha do mundo|GL|dep
São Pedro e Miquelão|Saint-Pierre|46.78|-56.18|2|América do Norte|Coletividade ultramarina da França, perto do Canadá|PM|dep
Ilhas Malvinas|Stanley|-51.69|-57.86|0|América do Sul|Território ultramarino do Reino Unido, reivindicado pela Argentina (Falklands)|FK|dep
Reunião|Saint-Denis|-20.88|55.45|3|África Oriental|Departamento ultramarino da França (parte da União Europeia)|RE|dep
Mayotte|Mamoudzou|-12.78|45.23|3|África Oriental|Departamento ultramarino da França; reivindicada por Comores|YT|dep
Santa Helena|Jamestown|-15.93|-5.72|3|África Ocidental|Território ultramarino do Reino Unido (com Ascensão e Tristão da Cunha); Napoleão morreu exilado aqui|SH|dep
Gibraltar|Gibraltar|36.14|-5.35|4|Europa Meridional|Território ultramarino do Reino Unido, reivindicado pela Espanha|GI|dep
Ilhas Faroé|Tórshavn|62.01|-6.77|4|Europa Setentrional|Território autônomo do Reino da Dinamarca|FO|dep
Ilha de Man|Douglas|54.15|-4.48|4|Europa Setentrional|Dependência da Coroa britânica; não faz parte do Reino Unido|IM|dep
Jersey|Saint Helier|49.19|-2.11|4|Europa Setentrional|Dependência da Coroa britânica, no Canal da Mancha|JE|dep
Guernsey|Saint Peter Port|49.46|-2.54|4|Europa Setentrional|Dependência da Coroa britânica, no Canal da Mancha|GG|dep
Ilhas Åland|Mariehamn|60.10|19.94|4|Europa Setentrional|Região autônoma da Finlândia onde se fala sueco|AX|dep
Svalbard|Longyearbyen|78.22|15.65|4|Europa Setentrional|Arquipélago da Noruega no Ártico|SJ|dep
Hong Kong|Hong Kong|22.28|114.16|5|Leste Asiático|Região administrativa especial da China; foi colônia britânica até 1997|HK|dep
Macau|Macau|22.20|113.55|5|Leste Asiático|Região administrativa especial da China; foi administrada por Portugal até 1999|MO|dep
Guam|Hagåtña|13.47|144.75|6|Micronésia|Território dos Estados Unidos|GU|dep
Ilhas Marianas do Norte|Saipan|15.21|145.75|6|Micronésia|Commonwealth associada aos Estados Unidos|MP|dep
Samoa Americana|Pago Pago|-14.28|-170.70|6|Polinésia|Território dos Estados Unidos|AS|dep
Polinésia Francesa|Papeete|-17.54|-149.57|6|Polinésia|Coletividade ultramarina da França; inclui o Taiti|PF|dep
Nova Caledônia|Nouméa|-22.28|166.46|6|Melanésia|Coletividade da França com estatuto especial|NC|dep
Wallis e Futuna|Mata-Utu|-13.28|-176.17|6|Polinésia|Coletividade ultramarina da França|WF|dep
Ilhas Cook|Avarua|-21.21|-159.78|6|Polinésia|Estado em livre associação com a Nova Zelândia|CK|dep
Niue|Alofi|-19.06|-169.92|6|Polinésia|Estado em livre associação com a Nova Zelândia|NU|dep
Tokelau|Sem capital fixa (sede rotativa entre os atóis)|-9.38|-171.22|6|Polinésia|Território da Nova Zelândia|TK|dep
Ilha Norfolk|Kingston|-29.06|167.96|6|Austrália e Nova Zelândia|Território externo da Austrália|NF|dep
Ilhas Pitcairn|Adamstown|-25.07|-130.10|6|Polinésia|Território ultramarino do Reino Unido; descendentes dos amotinados do Bounty|PN|dep
Ilha Christmas|Flying Fish Cove|-10.42|105.68|6|Austrália e Nova Zelândia|Território externo da Austrália, no Oceano Índico|CX|dep
Ilhas Cocos|West Island|-12.19|96.83|6|Austrália e Nova Zelândia|Território externo da Austrália, no Oceano Índico|CC|dep
Acrotíri e Deceleia|Episkopi|34.67|32.85|4|Europa Centro-Oriental|Bases militares soberanas do Reino Unido na ilha de Chipre|QU|dep|GB
`;
/* desabitados ou só com bases/cientistas, e reivindicações na Antártida: desligados por padrão (campo |uni). Sem capital: entram só em "Achar no mapa" */
const RAW_UNI = `
Território Britânico do Oceano Índico|Sem capital (base militar de Diego Garcia)|-7.31|72.41|5|Ásia do Sul|Território do Reino Unido sem população nativa (os chagossianos foram expulsos nos anos 1960–70); um acordo de 2025 prevê a soberania das Maurícias, mantendo a base|IO|uni
Ilha de Clipperton|Sem capital (desabitada)|10.30|-109.22|2|América do Norte|Atol da França no Pacífico, a cerca de 1.000 km do México|CP|uni
Ilhas Menores Distantes dos EUA|Sem capital (desabitadas)|19.29|166.62|6|Micronésia|Wake, Midway, Johnston, Baker, Howland, Jarvis, Kingman, Palmyra e Navassa: só bases e reservas naturais dos EUA|UM|uni
Ilhas Ashmore e Cartier|Sem capital (desabitadas)|-12.26|123.04|6|Austrália e Nova Zelândia|Território externo da Austrália no mar de Timor; reserva natural|QR|uni|AU
Ilhas do Mar de Coral|Sem capital (estação meteorológica na Ilha Willis)|-16.29|149.96|6|Austrália e Nova Zelândia|Território externo da Austrália, recifes e ilhotas espalhados pelo mar de Coral|QS|uni|AU
Jan Mayen|Sem capital (estação de Olonkinbyen)|70.98|-8.50|4|Europa Setentrional|Ilha vulcânica da Noruega no Atlântico Norte; só militares e meteorologistas|QT|uni|NO
Geórgia do Sul e Ilhas Sandwich do Sul|Sem capital (base de King Edward Point)|-54.28|-36.49|7|Ilhas subantárticas|Território ultramarino do Reino Unido; só cientistas e funcionários, sem população fixa|GS|uni
Ilha Bouvet|Sem capital (desabitada)|-54.42|3.36|7|Ilhas subantárticas|Dependência da Noruega; a ilha mais isolada do mundo, quase toda coberta de gelo|BV|uni
Ilhas Heard e McDonald|Sem capital (desabitadas)|-53.08|73.51|7|Ilhas subantárticas|Território externo da Austrália, com o vulcão ativo Big Ben; patrimônio mundial da UNESCO|HM|uni
Terras Austrais e Antárticas Francesas|Sem capital (base de Port-aux-Français)|-49.35|70.22|7|Ilhas subantárticas|Território da França: Kerguelen, Crozet, São Paulo e Amsterdã, Ilhas Esparsas e Terra Adélia|TF|uni
Território Antártico Britânico|Sem capital (base de Rothera)|-67.57|-68.13|7|Antártida|Reivindicação do Reino Unido, sobreposta às da Argentina e do Chile; congelada pelo Tratado da Antártida|QN|uni|GB
Terra da Rainha Maud|Sem capital (base de Troll)|-72.01|2.53|7|Antártida|Reivindicação da Noruega; congelada pelo Tratado da Antártida|QO|uni|NO
Território Antártico Australiano|Sem capital (base de Davis)|-68.58|77.97|7|Antártida|Reivindicação da Austrália, a maior da Antártida (cerca de 42% do continente); congelada pelo Tratado da Antártida|QM|uni|AU
Dependência de Ross|Sem capital (Scott Base)|-77.85|166.76|7|Antártida|Reivindicação da Nova Zelândia; congelada pelo Tratado da Antártida|QQ|uni|NZ
Ilha Pedro I|Sem capital (desabitada)|-68.78|-90.58|7|Antártida|Reivindicação da Noruega no mar de Bellingshausen, coberta de gelo|QP|uni|NO
`;
/* cada território entra na rota logo após o país-âncora mais próximo, continuando a sequência atual */
const DEP_AFTER = {DO:'PR VI VG AI SX MF BL',AG:'MS GP',DM:'MQ',TT:'AW CW BQ',JM:'KY',BS:'TC',US:'BM',CA:'PM GL',UY:'FK',MU:'RE',KM:'YT',CV:'SH',ES:'GI',IS:'FO',GB:'IM JE GG',FI:'AX',NO:'SJ QT',CN:'HK MO',AU:'CX CC NF QR QS',VU:'NC',PW:'GU MP UM',TV:'WF TK',WS:'AS',TO:'NU CK PF PN',MX:'CP',CY:'QU',MV:'IO'};
let D;
function norm(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
let N_BASE;
let N_DEP;
let N_UNI;

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  D = (function(){
    var base=RAW.trim().split('\n'),dep={},used={},out=[];
    (RAW_DEP.trim()+'\n'+RAW_UNI.trim()).split('\n').forEach(function(l){dep[l.split('|')[7]]=l;});
    base.forEach(function(l){out.push(l);var a=DEP_AFTER[l.split('|')[7]];
      if(a)a.split(' ').forEach(function(c){if(dep[c]){out.push(dep[c]);used[c]=1;}});});
    Object.keys(dep).forEach(function(c){if(!used[c])out.push(dep[c]);});
    return out;
  })().map(function(l,i){
    var p=l.split('|'); var lat=+p[2]*Math.PI/180, lng=+p[3]*Math.PI/180;
    return {i:i,name:p[0],cap:p[1],lat:+p[2],lng:+p[3],r:+p[4],sub:p[5],obs:p[6]||'',cc:p[7],flag:(function(c){return String.fromCodePoint(0x1F1E6+c.charCodeAt(0)-65,0x1F1E6+c.charCodeAt(1)-65);})(p[9]||p[7]),
      x:Math.cos(lat)*Math.sin(lng),y:Math.sin(lat),z:Math.cos(lat)*Math.cos(lng),
      dis:p[7].charAt(0)==='X'&&p[7].length===2,dep:p[8]==='dep',uni:p[8]==='uni',pseudo:!!p[9],
      key:norm(p[0]+' '+p[1])};
  });
  N_BASE = D.filter(function(d){return !d.dep&&!d.uni;}).length;
  N_DEP = D.filter(function(d){return d.dep;}).length;
  N_UNI = D.filter(function(d){return d.uni;}).length;
  document.getElementById('count').textContent=N_BASE;
}

export { D, iniciar, N_BASE, N_DEP, N_UNI, norm, REG };
