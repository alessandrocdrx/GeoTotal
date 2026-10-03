/**
 * @arquivo js/dados/linguas.js
 * Camada: Dados
 * Línguas por país (estimativas, % da população).
 */
/* ---------- Línguas (estimativas aproximadas; % da população por língua materna / falada em casa) ----------
   código|Língua:pct[Variante:pct];Língua:pct|nota */
var LANG_RAW=`
BR|Português:98;Outras (línguas indígenas, alemão, italiano, japonês, Libras etc.):2|Cerca de 270 línguas indígenas e comunidades de imigrantes
GF|Crioulo guianense:40;Francês:35;Português:8;Crioulos de base inglesa (sranan, saramaka):6;Línguas indígenas e outras:11|Dados escassos
SR|Holandês:52;Sarnami (híndi surinamês):17;Sranan Tongo:16;Javanês:8;Outras (línguas maroon e indígenas):7|Sranan Tongo é a língua franca; muitos são bilíngues
GY|Inglês (crioulo guianense):90;Línguas indígenas:6;Híndi e urdu:4
VE|Espanhol:97;Línguas indígenas (wayuu, warao etc.):2;Outras:1
CO|Espanhol:99;Línguas indígenas e crioulos:1
EC|Espanhol:93;Quíchua (kichwa):6;Outras:1
PE|Espanhol:83;Quíchua:13;Aimará:2;Outras:2
BO|Espanhol:61;Quíchua:21;Aimará:15;Guarani e outras:3|36 línguas indígenas são oficiais
CL|Espanhol:98;Outras (mapudungun, aimará, rapanui, imigrantes):2
AR|Espanhol:97;Outras (guarani, quíchua, italiano, inglês, línguas indígenas):3
PY|Guarani:46;Espanhol:37;Outras (alemão, português, línguas indígenas):17|Cerca de 90% falam guarani; muitos misturam guarani e espanhol (jopará)
UY|Espanhol:97;Português (dialetos da fronteira):2;Outras:1
PA|Espanhol:86;Línguas indígenas (ngäbere etc.):8;Crioulo inglês e outras:6
CR|Espanhol:95;Línguas indígenas, crioulo limonense e inglês:3;Outras:2
NI|Espanhol:90;Miskito e outras línguas indígenas:4;Crioulo inglês da costa:4;Outras:2
HN|Espanhol:95;Línguas indígenas e crioulo inglês:5
SV|Espanhol:99;Outras:1
GT|Espanhol:69;Línguas maias:30[K'iche':9,Q'eqchi':8,Kaqchikel:6,Mam:5,Outras maias:2];Outras:1
BZ|Kriol (crioulo inglês):45;Espanhol:33;Línguas maias:9;Inglês:4;Garífuna:3;Outras (plautdietsch etc.):6|O inglês é oficial e usado por cerca de 60%
CU|Espanhol:99;Outras:1
JM|Patuá jamaicano (crioulo):85;Inglês:14;Outras:1|Quase todos falam patuá; o inglês é a língua oficial
BS|Inglês (incl. crioulo bahamense):90;Crioulo haitiano:8;Outras:2
HT|Crioulo haitiano:97;Francês e outras:3|Francês oficial; falado com fluência por uma minoria
DO|Espanhol:98;Crioulo haitiano e outras:2
KN|Inglês (crioulo):97;Outras:3
AG|Inglês (crioulo antiguano):95;Espanhol:3;Outras:2
DM|Inglês:55;Kwéyòl (crioulo francês):40;Outras:5
LC|Kwéyòl (crioulo francês):50;Inglês:47;Outras:3
VC|Inglês (crioulo):97;Outras:3
BB|Inglês (crioulo bajan):98;Outras:2
GD|Inglês (crioulo):90;Patuá de base francesa:6;Outras:4
TT|Inglês (e crioulos ingleses):92;Híndi caribenho e outras:4;Espanhol:2;Outras:2
MX|Espanhol:93;Línguas indígenas (náhuatl, maia, mixteco, zapoteco etc.):6;Outras:1
US|Inglês:78;Espanhol:13;Chinês:1;Tagalo:1;Vietnamita:1;Outras:6|Língua falada em casa
CA|Inglês:54;Francês:20;Chinês:3;Punjabi:2;Espanhol:2;Árabe:2;Tagalo:2;Outras:15|Língua materna (censo de 2021)
ZA|Zulu:23;Xhosa:16;Africâner:14;Inglês:10;Sotho do Norte (sepedi):9;Tswana:8;Sotho do Sul:8;Tsonga:4;Suázi:3;Venda:2;Ndebele:2;Outras:1|11 línguas oficiais
LS|Sesoto:87;Zulu:5;Xhosa:2;Inglês:1;Outras:5
SZ|Suázi:82;Zulu:10;Tsonga:3;Inglês:1;Outras:4
BW|Tswana:78;Kalanga:8;Inglês:3;Outras (herero, san, kgalagadi):11
NA|Oshiwambo:49;Nama/damara:11;Africâner:10;Herero:9;Línguas do Kavango:9;Lozi:5;Inglês:3;Alemão:1;Outras:3
ZM|Bemba:33;Nyanja (chewa):15;Tonga:11;Lozi:6;Outras línguas locais (lunda, luvale, kaonde etc.):33;Inglês:2|O inglês é a língua oficial e franca
ZW|Shona:75;Ndebele:15;Inglês:2;Outras:8
MZ|Emakhuwa:26;Português:17;Xichangana:9;Cisena:7;Elomwe:7;Echuwabo:5;Outras:29|Cerca de metade da população fala português como segunda língua
MG|Malgaxe:99;Francês e outras:1|O francês é falado por parte da população como segunda língua
MU|Crioulo mauriciano:86;Bhojpuri:5;Francês:4;Outras:5
SC|Crioulo seichelense:91;Inglês:5;Francês:1;Outras:3
KM|Comoriano (shikomori):98;Francês e árabe:2
MW|Chewa:57;Yao:10;Tumbuka:9;Lomwe:8;Sena:3;Outras:13
TZ|Sukuma:16;Suaíli (língua materna):15;Outras línguas locais (cerca de 120):69|Suaíli é a língua franca: mais de 90% falam
BI|Kirundi:98;Francês, suaíli e outras:2
RW|Kinyarwanda:99;Outras:1|Francês, inglês e suaíli também são oficiais
UG|Luganda:17;Nyankole:10;Soga:8;Outras línguas locais (acholi, lango, teso etc.):62;Inglês e suaíli:3|Inglês é oficial; suaíli é usado por uma minoria
KE|Kikuyu:17;Luhya:14;Kalenjin:13;Luo:10;Kamba:10;Somali:6;Kisii:6;Mijikenda:5;Outras:19|Estimado por grupo étnico; suaíli e inglês são falados por quase todos
SO|Somali:90;Outras (suaíli, árabe, línguas bantas):10
DJ|Somali:60;Afar:35;Árabe e francês:5
ER|Tigrínia:55;Tigre:30;Afar:4;Saho:4;Bilen:2;Kunama:2;Outras:3|Não há língua oficial
ET|Oromo:34;Amárico:29;Somali:6;Tigrínia:6;Sidamo:4;Wolaita:2;Gurage:2;Afar:2;Outras:15
SS|Dinka:36;Nuer:16;Outras línguas locais (mais de 60):45;Árabe de Juba:2;Inglês:1
AO|Português:42;Umbundu:24;Quimbundo:8;Quicongo:8;Chócue:6;Outras:12|Muitos são bilíngues; no censo, cerca de 70% dizem falar português em casa
CD|Lingala:20;Suaíli:17;Quicongo:15;Tshiluba:14;Outras línguas locais (mais de 200):33;Francês:1|Francês é oficial e falado por cerca de metade da população
CG|Quicongo (kituba):40;Lingala:25;Teke:17;Outras:17;Francês:1
GA|Fang:32;Francês:30;Punu e outras línguas bantas:35;Inglês e outras:3
ST|Português:85;Forro:10;Angolar:4;Outras:1
GQ|Fang:56;Espanhol:20;Bubi:9;Outras (ndowé, annobonês, francês):15|Espanhol é falado por cerca de dois terços
CM|Línguas locais (fulfulde, ewondo, duala, bamileke etc.):65;Francês:22;Pidgin inglês:8;Inglês:5|Francês e inglês são oficiais
CF|Gbaya:25;Banda:23;Mandja:10;Sango:10;Outras:32|Sango é falado por cerca de 90% como língua franca
TD|Árabe chadiano:26;Sara:20;Outras línguas locais (mais de 120):50;Francês:4|O árabe é língua franca de cerca de metade da população
NE|Hauçá:55;Zarma-songai:21;Tuaregue:9;Fula:7;Kanúri:5;Outras:3
NG|Hauçá:30;Iorubá:20;Igbo:18;Fula:6;Outras (ijaw, kanúri, ibibio, tiv etc.):26|Inglês oficial e pidgin nigeriano amplamente usado
BJ|Fon:38;Iorubá:12;Adja:12;Bariba:10;Fula:6;Outras:20;Francês:2
TG|Ewe:22;Kabiyé:16;Mina (gen):6;Tem:5;Outras línguas locais:47;Francês:4
BF|Mooré:52;Fula:8;Gourmanchéma:6;Dioula:5;Bissa:4;Outras:24;Francês:1
GH|Akan:47;Mole-dagbani:17;Ewe:14;Ga-dangme:7;Outras:14;Inglês:1
CI|Baulê:18;Dioula:15;Outras línguas locais (mais de 60):52;Francês:15|Francês é a língua oficial e franca
LR|Kpelle:20;Inglês (incl. pidgin liberiano):15;Bassa:14;Grebo:10;Gio:8;Outras:33
SL|Temne:35;Mende:31;Krio:10;Limba:8;Outras:15;Inglês:1|Krio é a língua franca (cerca de 90% falam)
GN|Fula:32;Malinquê:29;Susu:20;Kissi:6;Kpelê:5;Outras:8
GW|Balanta:24;Fula:23;Crioulo da Guiné-Bissau:15;Mandinga:12;Manjaco:8;Papel:7;Outras:10;Português:1|O crioulo é a língua franca (cerca de 90% falam)
GM|Mandinka:34;Fula:22;Wolof:12;Jola:11;Soninquê:8;Outras:13
SN|Wolof:44;Pular (fula):24;Serer:15;Diola:5;Mandinga:4;Soninquê:1;Outras:7|Wolof é falado por cerca de 80% como língua franca
CV|Crioulo cabo-verdiano:95;Português:4;Outras:1
MR|Árabe hassanía:70;Pulaar (fula):17;Soninquê:6;Wolof:3;Outras:4
ML|Bambara:46;Fula:9;Senufo:8;Soninquê:7;Songai:6;Dogon:5;Outras:19
EH|Árabe hassanía:95;Espanhol e tamazight:5|Dados escassos
MA|Árabe marroquino (darija):70;Línguas berberes (tamazight, tachelhit, tarifit):27;Outras:3|O francês é muito usado como segunda língua
DZ|Árabe argelino (darija):72;Línguas berberes (cabila, chaoui, mzabi, tuaregue):27;Outras:1|O francês é muito usado como segunda língua
TN|Árabe tunisiano:98;Berbere:1;Outras:1
LY|Árabe líbio:95;Berbere (tamazigh, tuaregue etc.):4;Outras:1
EG|Árabe (variantes egípcia e saidi):97;Outras (núbio, berbere, beja, armênio):3
SD|Árabe sudanês:60;Beja:6;Fur:3;Núbio:3;Outras línguas locais (mais de 100):26;Inglês:2
PT|Português:96;Outras (mirandês, romeno, ucraniano, inglês etc.):4
ES|Espanhol (castelhano):74;Catalão (incl. valenciano):16;Galego:6;Basco:2;Outras:2|Em regiões bilíngues muitos falam duas línguas
AD|Espanhol:44;Catalão:33;Português:15;Francês:6;Outras:2
MC|Francês:47;Italiano:16;Monegasco:16;Inglês:15;Outras:6
SM|Italiano:96;Outras:4
IT|Italiano (e dialetos):93;Outras (sardo, alemão, friulano, albanês, romeno, árabe etc.):7
VA|Italiano e latim:100|Cerca de 800 pessoas; o italiano é de uso corrente e o latim, oficial em documentos
MT|Maltês:90;Inglês:6;Italiano:2;Outras:2
GR|Grego:98;Outras (albanês, búlgaro, romeno, turco, macedônio):2
TR|Turco:84;Curdo (kurmanji e zazaki):15;Outras:1
FR|Francês:90;Outras (árabe, português, alsaciano, bretão, occitano, corso etc.):10
IE|Inglês:93;Outras (polonês, romeno, lituano, irlandês etc.):7|Cerca de 40% dizem saber irlandês, mas poucos o usam no dia a dia
GB|Inglês:92;Outras (polonês, punjabi, urdu, bengali, galês etc.):8
NL|Holandês:89;Frísio:4;Outras (turco, árabe, polonês, inglês, papiamento etc.):7
BE|Holandês (flamengo):58;Francês:38;Alemão:1;Outras:3
DE|Alemão:87;Turco:2;Russo:2;Polonês:1;Árabe:1;Outras:7
LU|Luxemburguês:56;Português:16;Francês:16;Alemão:3;Outras:9|Trilíngue: luxemburguês, francês e alemão
LI|Alemão (alemânico):86;Italiano:3;Turco:2;Outras:9
CH|Alemão suíço:62;Francês:23;Italiano:8;Romanche:1;Outras:6
AT|Alemão:88;Bósnio-croata-sérvio:3;Turco:2;Outras:7
IS|Islandês:88;Polonês:5;Outras:7
DK|Dinamarquês:95;Outras (árabe, turco, polonês, alemão etc.):5
SE|Sueco:88;Minorias históricas (finlandês, sámi, meänkieli, iídiche, romani):3;Outras (árabe, curdo etc.):9
NO|Norueguês:91;Outras (polonês, sámi, árabe, lituano etc.):9|Bokmål domina; o nynorsk é escrito por cerca de 10%
FI|Finlandês:87;Sueco:5;Outras (russo, estoniano, sámi etc.):8
EE|Estoniano:68;Russo:29;Outras:3
LV|Letão:62;Russo:34;Outras:4
LT|Lituano:85;Russo:8;Polonês:5;Outras:2
RU|Russo:85;Tártaro:3;Outras (tchetcheno, baskir, tchuvache, ucraniano etc.):12|Cerca de 97% falam russo
BY|Russo:70;Bielorrusso:26;Outras:4
PL|Polonês:98;Outras (silesiano, alemão, ucraniano etc.):2
CZ|Tcheco:94;Eslovaco:2;Outras:4
SK|Eslovaco:78;Húngaro:8;Romani:2;Tcheco:1;Rutênio:1;Outras:10
HU|Húngaro:98;Outras (romani, alemão, romeno, eslovaco):2
SI|Esloveno:88;Servo-croata (sérvio, croata, bósnio):8;Outras:4
HR|Croata:96;Sérvio:1;Outras:3
BA|Bósnio:53;Sérvio:31;Croata:15;Outras:1
ME|Sérvio:43;Montenegrino:37;Bósnio:5;Albanês:5;Outras:10
AL|Albanês:98;Outras (grego, macedônio, romani, aromeno):2
CY|Grego:80;Turco:13;Outras (inglês, russo, árabe, armênio etc.):7
MK|Macedônio:62;Albanês:24;Turco:4;Romani:2;Sérvio:1;Outras:7
RS|Sérvio:88;Húngaro:3;Bósnio:2;Romani:1;Outras:6
RO|Romeno:85;Húngaro:6;Romani:1;Outras:8
BG|Búlgaro:85;Turco:9;Romani:4;Outras:2
MD|Romeno (moldavo):78;Russo:13;Ucraniano:4;Gagauz:4;Outras:1
UA|Ucraniano:68;Russo:30;Outras:2|A divisão varia por região e muitos são bilíngues; dados anteriores à guerra
GE|Georgiano:87;Azeri:6;Armênio:4;Russo:1;Outras:2
AM|Armênio:97;Outras (curdo, russo, assírio):3
AZ|Azeri:92;Lezgui:2;Russo:1;Armênio:1;Outras:4
SY|Árabe:87;Curdo:9;Outras (armênio, circassiano, arameu, turcomeno):4
LB|Árabe libanês:95;Armênio:4;Outras:1|O francês é falado por cerca de 40% como segunda língua
PS|Árabe:99;Outras:1
IL|Hebraico:49;Árabe:21;Russo:15;Outras (amárico, iídiche, francês, inglês, espanhol etc.):15|O inglês é muito difundido como segunda língua
JO|Árabe:98;Outras (circassiano, armênio, curdo):2
SA|Árabe:70;Outras (urdu, bengali, filipino, malaiala etc.):30|Inclui a grande população imigrante
YE|Árabe:99;Outras (mahri, socotri):1
OM|Árabe:65;Híndi e urdu:12;Bengali:10;Outras:7;Balúchi:6|Inclui a população imigrante
AE|Árabe:35;Híndi e urdu:25;Malaiala e tâmil:10;Bengali:8;Filipino:5;Inglês:5;Outras:12|Cerca de 88% da população é imigrante; estimativa grosseira
QA|Árabe:40;Híndi e urdu:20;Malaiala e tâmil:10;Bengali:8;Filipino:7;Inglês:5;Outras:10|Grande população imigrante; estimativa grosseira
BH|Árabe:55;Urdu e híndi:15;Malaiala e bengali:15;Inglês:5;Outras:10|Inclui a população imigrante
KW|Árabe:50;Híndi e urdu:15;Bengali e malaiala:15;Filipino:5;Inglês:5;Outras:10|Inclui a população imigrante
IQ|Árabe:76;Curdo:20;Neoaramaico e turcomeno:2;Outras:2
IR|Persa:53;Azeri:16;Curdo:10;Gilaki e mazandarani:7;Luri:6;Árabe:2;Balúchi:2;Turcomeno:2;Outras:2
AF|Pachto:40;Dari:35;Uzbeque:9;Turcomeno:3;Outras (balúchi, hazaragi etc.):13|Dari é a língua franca mais falada
KZ|Cazaque:63;Russo:31;Outras (uzbeque, uigur, alemão, ucraniano, tártaro):6|Cerca de 85% falam russo
UZ|Uzbeque:85;Cazaque:3;Tadjique:4;Russo:2;Outras:6
TM|Turcomeno:77;Uzbeque:9;Russo:7;Outras:7
KG|Quirguiz:71;Uzbeque:14;Russo:8;Outras:7
TJ|Tadjique:84;Uzbeque:12;Russo:1;Outras:3
PK|Punjabi:38;Pachto:18;Sindi:14;Seraiki:12;Urdu:8;Balúchi:3;Outras:7|O urdu e o inglês são oficiais; o urdu é a língua franca
IN|Híndi:44;Bengali:8;Marati:7;Telugu:7;Tâmil:6;Guzerate:5;Urdu:4;Canará:4;Odia:3;Malaiala:3;Punjabi:3;Outras:6|22 línguas reconhecidas; o inglês é falado por cerca de 10% como segunda língua
MV|Divehi:98;Inglês e outras:2
LK|Cingalês:75;Tâmil:24;Outras:1
BD|Bengali:98;Outras:2
BT|Sharchopka:28;Dzongkha:24;Nepalês:22;Outras línguas locais:26
NP|Nepalês:45;Maithili:11;Bhojpuri:6;Tharu:6;Tamang:5;Newar:3;Bajika:3;Outras:21
MN|Mongol:90;Cazaque:4;Outras:6
CN|Mandarim (e dialetos do norte):70;Wu:6;Cantonês (yue):5;Min:4;Xiang:3;Hakka:3;Gan:2;Outras (tibetano, uigur, zhuang, mongol etc.):7|Cerca de 80% falam o mandarim padrão (putonghua)
KP|Coreano:99;Outras:1
KR|Coreano:98;Outras:2
JP|Japonês:98;Outras (coreano, chinês, ainu, línguas ryukyuanas):2
TW|Mandarim:70;Hokkien taiwanês:14;Hakka:6;Línguas aborígenes e outras:10
MM|Birmanês:68;Shan:9;Karen:7;Rakhine:4;Mon:2;Kachin:1;Outras:9
TH|Tailandês central:32;Isan (laosiano do nordeste):23;Lanna (norte):9;Tailandês do sul:7;Malaio (pattani):3;Khmer, karen, chinês e outras:26
LA|Laosiano:52;Khmu:11;Hmong:9;Outras línguas locais:28
VN|Vietnamita:86;Outras (tay, mường, khmer, hmong, chinês etc.):14
KH|Khmer:96;Outras (cham, vietnamita, chinês etc.):4
MY|Malaio:55;Chinês (mandarim, hokkien, cantonês, hakka):22;Línguas indígenas de Sabah e Sarawak:10;Tâmil:6;Inglês:2;Outras:5
SG|Inglês:48;Mandarim:30;Malaio:9;Dialetos chineses (hokkien, cantonês etc.):9;Tâmil:3;Outras:1|Língua falada em casa (censo de 2020)
ID|Javanês:31;Indonésio:20;Sundanês:15;Malaio regional:4;Madurês:3;Minangkabau:3;Batak:3;Bugis:2;Outras (mais de 700 línguas):19|O indonésio é falado por cerca de 94% como língua franca
BN|Malaio:66;Chinês:10;Línguas indígenas:10;Inglês e outras:14
PH|Tagalo:28;Cebuano:13;Ilocano:8;Hiligaynon:7;Bicolano:6;Waray:3;Outras:35|Filipino e inglês são oficiais; o inglês é muito difundido
TL|Tétum:37;Mambae:12;Makasae:10;Outras línguas locais (mais de 15):37;Português e outras:4
AU|Inglês:72;Mandarim:3;Árabe:1;Vietnamita:1;Cantonês:1;Italiano:1;Outras:21|Língua falada em casa (censo de 2021)
NZ|Inglês:90;Maori:4;Samoano:2;Outras:4
PG|Línguas locais (mais de 800):85;Tok Pisin (língua materna):10;Outras:5|Tok pisin é falado por cerca de 60% como língua franca
SB|Línguas locais (mais de 70):98;Pijin:1;Inglês:1|Pijin é falado por cerca de 90% como língua franca
VU|Línguas locais (mais de 100):60;Bislama:35;Inglês e francês:5
FJ|Fijiano:54;Híndi fijiano:38;Outras (rotuma, inglês, chinês etc.):8
PW|Palauano:65;Filipino:15;Inglês:10;Outras:10
FM|Chuukês:45;Pohnpeiano:24;Kosraeano:8;Yapês:6;Outras:17|O inglês é a língua oficial
MH|Marshalês:95;Inglês e outras:5
NR|Nauruano:93;Inglês e outras:7
KI|Gilbertês (kiribati):98;Outras (tuvaluano, inglês):2
TV|Tuvaluano:96;Inglês e outras (samoano, kiribati):4
WS|Samoano:91;Inglês:2;Tonganês e outras:7
TO|Tonganês:96;Inglês e outras:4
`;
var LANG={};
LANG_RAW.trim().split('\n').forEach(function(l){
  var p=l.split('|'),items=[];
  p[1].split(';').forEach(function(it){
    var m=it.match(/^([^:\[]+)(?::([\d.]+))?(?:\[(.*)\])?$/);
    if(!m)return;
    var subs=[];
    if(m[3])m[3].split(',').forEach(function(s){var mm=s.match(/^([^:]+)(?::([\d.]+))?$/);if(mm)subs.push({n:mm[1].trim(),p:mm[2]?+mm[2]:null});});
    items.push({n:m[1].trim(),p:m[2]?+m[2]:null,subs:subs});
  });
  LANG[p[0]]={items:items,note:p[2]||''};
});
D.forEach(function(d){d.lang=LANG[d.cc]||null;});
var LPAL=['#4da3ff','#f59e0b','#2fd67f','#ef4444','#a78bfa','#22d3ee','#f472b6','#84cc16','#fb923c','#38bdf8','#e879f9','#facc15'];
function langColor(n){
  if(/^outras?\b/i.test(n))return '#94a3b8';
  var h=0;for(var i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))>>>0;
  return LPAL[h%LPAL.length];
}
function langText(d){
  if(!d.lang)return '';
  return d.lang.items.map(function(it){
    var s=it.n+(it.p!=null?' '+it.p+'%':'');
    if(it.subs.length)s+=' ('+it.subs.map(function(x){return x.n+(x.p!=null?' '+x.p+'%':'');}).join(', ')+')';
    return s;
  }).join('; ');
}
function appendDist(box,obj,title,colorFn,notePrefix){
  if(!obj)return;
  var h=document.createElement('div');h.className='rh';h.textContent=title;box.appendChild(h);
  var bar=document.createElement('div');bar.className='rbar';
  obj.items.forEach(function(it){
    if(it.p==null)return;
    var sg=document.createElement('span');sg.style.flex=it.p+' 0 0';sg.style.background=colorFn(it.n);sg.title=it.n+' '+it.p+'%';bar.appendChild(sg);
  });
  box.appendChild(bar);
  obj.items.forEach(function(it){
    var row=document.createElement('div');row.className='rrow';
    var dot=document.createElement('i');dot.style.background=colorFn(it.n);
    var t=document.createElement('span');t.textContent=it.n;
    var b=document.createElement('b');b.textContent=it.p!=null?it.p+'%':'';
    row.appendChild(dot);row.appendChild(t);row.appendChild(b);box.appendChild(row);
    if(it.subs.length){
      var sub=document.createElement('div');sub.className='rsub';
      sub.textContent=it.subs.map(function(x){return x.n+(x.p!=null?' '+x.p+'%':'');}).join(' · ');
      box.appendChild(sub);
    }
  });
  var n=document.createElement('div');n.className='inote';
  n.textContent=notePrefix+(obj.note?' '+obj.note+'.':'');
  box.appendChild(n);
}
function appendLang(box,d){
  appendDist(box,d.lang,'Línguas (aprox., % da população por língua materna)',langColor,'Estimativas aproximadas de censos e pesquisas (por volta de 2010–2023). Muitos falam mais de uma língua, então o uso real pode diferir da língua materna.');
}

function relColor(n){
  if(/sem religi/i.test(n))return '#94a3b8';
  if(/crist/i.test(n))return '#4da3ff';
  if(/mu[çc]ulman/i.test(n))return '#2fd67f';
  if(/hindu/i.test(n))return '#ff8a3d';
  if(/budist/i.test(n))return '#f6c800';
  if(/jude/i.test(n))return '#7dd3fc';
  if(/sikh/i.test(n))return '#f472b6';
  if(/tradic|popular|animist|vodu|xam|afro|kirat|modekngei|ásatr|taoí|chond|xinto/i.test(n))return '#b08968';
  return '#a78bfa';
}
function relText(d){
  if(!d.rel)return '';
  return d.rel.items.map(function(it){
    var s=it.n+(it.p!=null?' '+it.p+'%':'');
    if(it.subs.length)s+=' ('+it.subs.map(function(x){return x.n+(x.p!=null?' '+x.p+'%':'');}).join(', ')+')';
    return s;
  }).join('; ');
}
function appendRel(box,d){
  if(!d.rel)return;
  var h=document.createElement('div');h.className='rh';h.textContent='Religiões (aprox., % da população)';box.appendChild(h);
  var bar=document.createElement('div');bar.className='rbar';
  d.rel.items.forEach(function(it){
    if(it.p==null)return;
    var sg=document.createElement('span');sg.style.flex=it.p+' 0 0';sg.style.background=relColor(it.n);sg.title=it.n+' '+it.p+'%';bar.appendChild(sg);
  });
  box.appendChild(bar);
  d.rel.items.forEach(function(it){
    var row=document.createElement('div');row.className='rrow';
    var dot=document.createElement('i');dot.style.background=relColor(it.n);
    var t=document.createElement('span');t.textContent=it.n;
    var b=document.createElement('b');b.textContent=it.p!=null?it.p+'%':'';
    row.appendChild(dot);row.appendChild(t);row.appendChild(b);box.appendChild(row);
    if(it.subs.length){
      var sub=document.createElement('div');sub.className='rsub';
      sub.textContent=it.subs.map(function(x){return x.n+(x.p!=null?' '+x.p+'%':'');}).join(' · ');
      box.appendChild(sub);
    }
  });
  var n=document.createElement('div');n.className='inote';
  n.textContent='Subgrupos: % da população total. Estimativas aproximadas de censos e pesquisas (por volta de 2010–2023); mudam conforme a fonte e o critério (filiação × prática).'+(d.rel.note?' '+d.rel.note+'.':'');
  box.appendChild(n);
}



