/**
 * @arquivo js/dados/info-paises.js
 * Camada: Dados
 * Dados extras por país: população, área, idioma, moeda, fuso, DDI e domínio.
 */
/* ---------- Dados extras (aproximados, ~2024) ----------
   código|população (milhares)|área km²|idioma(s)|moeda|fuso|DDI */
var INFO_RAW=`
BR|212000|8515767|Português|Real (BRL)|UTC−3 (de −2 a −5)|+55
GF|300|83534|Francês|Euro (EUR)|UTC−3|+594
SR|620|163820|Holandês|Dólar surinamês (SRD)|UTC−3|+597
GY|810|214969|Inglês|Dólar guianense (GYD)|UTC−4|+592
VE|28300|916445|Espanhol|Bolívar soberano (VES)|UTC−4|+58
CO|52000|1141748|Espanhol|Peso colombiano (COP)|UTC−5|+57
EC|18000|283561|Espanhol|Dólar americano (USD)|UTC−5|+593
PE|34000|1285216|Espanhol, quéchua e aimará|Sol (PEN)|UTC−5|+51
BO|12400|1098581|Espanhol e 36 idiomas indígenas|Boliviano (BOB)|UTC−4|+591
CL|19600|756102|Espanhol|Peso chileno (CLP)|UTC−4 (−3 no verão)|+56
AR|46000|2780400|Espanhol|Peso argentino (ARS)|UTC−3|+54
PY|6900|406752|Espanhol e guarani|Guarani (PYG)|UTC−3|+595
UY|3400|176215|Espanhol|Peso uruguaio (UYU)|UTC−3|+598
PA|4500|75320|Espanhol|Balboa e dólar americano (PAB/USD)|UTC−5|+507
CR|5200|51100|Espanhol|Colón (CRC)|UTC−6|+506
NI|7000|130373|Espanhol|Córdoba (NIO)|UTC−6|+505
HN|10600|112492|Espanhol|Lempira (HNL)|UTC−6|+504
SV|6300|21041|Espanhol|Dólar americano (USD)|UTC−6|+503
GT|17600|108889|Espanhol|Quetzal (GTQ)|UTC−6|+502
BZ|410|22966|Inglês|Dólar de Belize (BZD)|UTC−6|+501
CU|11000|109884|Espanhol|Peso cubano (CUP)|UTC−5|+53
JM|2800|10991|Inglês|Dólar jamaicano (JMD)|UTC−5|+1 876
BS|400|13943|Inglês|Dólar bahamense (BSD)|UTC−5|+1 242
HT|11700|27750|Francês e crioulo haitiano|Gourde (HTG)|UTC−5|+509
DO|11300|48671|Espanhol|Peso dominicano (DOP)|UTC−4|+1 809 / 829 / 849
KN|48|261|Inglês|Dólar do Caribe Oriental (XCD)|UTC−4|+1 869
AG|94|442|Inglês|Dólar do Caribe Oriental (XCD)|UTC−4|+1 268
DM|73|751|Inglês|Dólar do Caribe Oriental (XCD)|UTC−4|+1 767
LC|180|616|Inglês|Dólar do Caribe Oriental (XCD)|UTC−4|+1 758
VC|110|389|Inglês|Dólar do Caribe Oriental (XCD)|UTC−4|+1 784
BB|282|430|Inglês|Dólar de Barbados (BBD)|UTC−4|+1 246
GD|126|344|Inglês|Dólar do Caribe Oriental (XCD)|UTC−4|+1 473
TT|1500|5130|Inglês|Dólar de Trinidad e Tobago (TTD)|UTC−4|+1 868
MX|129000|1964375|Espanhol (de fato)|Peso mexicano (MXN)|UTC−6 (de −5 a −8)|+52
US|335000|9833517|Inglês (de fato)|Dólar americano (USD)|UTC−5 a −10|+1
CA|40000|9984670|Inglês e francês|Dólar canadense (CAD)|UTC−3:30 a −8|+1
ZA|60400|1221037|12 idiomas oficiais (zulu, xhosa, africâner, inglês…)|Rand (ZAR)|UTC+2|+27
LS|2300|30355|Sesoto e inglês|Loti (LSL)|UTC+2|+266
SZ|1200|17364|Suázi e inglês|Lilangeni (SZL)|UTC+2|+268
BW|2600|581730|Inglês e tswana|Pula (BWP)|UTC+2|+267
NA|2600|825615|Inglês|Dólar namibiano (NAD)|UTC+2|+264
ZM|20500|752612|Inglês|Kwacha zambiano (ZMW)|UTC+2|+260
ZW|16300|390757|16 idiomas (inglês, shona, ndebele…)|Dólar do Zimbábue (ZWG)|UTC+2|+263
MZ|33900|801590|Português|Metical (MZN)|UTC+2|+258
MG|30300|587041|Malgaxe e francês|Ariary (MGA)|UTC+3|+261
MU|1300|2040|Inglês, francês e crioulo|Rupia maurícia (MUR)|UTC+4|+230
SC|108|452|Crioulo, inglês e francês|Rupia seichelense (SCR)|UTC+4|+248
KM|850|1861|Comoriano, árabe e francês|Franco comoriano (KMF)|UTC+3|+269
MW|20900|118484|Inglês e chichewa|Kwacha malauiano (MWK)|UTC+2|+265
TZ|67400|945087|Suaíli e inglês|Xelim tanzaniano (TZS)|UTC+3|+255
BI|13200|27834|Kirundi, francês e inglês|Franco burundiano (BIF)|UTC+2|+257
RW|14100|26338|Kinyarwanda, francês, inglês e suaíli|Franco ruandês (RWF)|UTC+2|+250
UG|48600|241550|Inglês e suaíli|Xelim ugandense (UGX)|UTC+3|+256
KE|55100|580367|Suaíli e inglês|Xelim queniano (KES)|UTC+3|+254
SO|18100|637657|Somali e árabe|Xelim somali (SOS)|UTC+3|+252
DJ|1150|23200|Francês e árabe|Franco djibutiano (DJF)|UTC+3|+253
ER|3700|117600|Tigrínia, árabe e inglês (de fato)|Nakfa (ERN)|UTC+3|+291
ET|126500|1104300|Amárico (federal) e outros|Birr (ETB)|UTC+3|+251
SS|11100|619745|Inglês|Libra sul-sudanesa (SSP)|UTC+2|+211
AO|36700|1246700|Português|Kwanza (AOA)|UTC+1|+244
CD|102000|2344858|Francês|Franco congolês (CDF)|UTC+1 e +2|+243
CG|6100|342000|Francês|Franco CFA da África Central (XAF)|UTC+1|+242
GA|2400|267668|Francês|Franco CFA da África Central (XAF)|UTC+1|+241
ST|230|964|Português|Dobra (STN)|UTC+0|+239
GQ|1700|28051|Espanhol, francês e português|Franco CFA da África Central (XAF)|UTC+1|+240
CM|28600|475442|Francês e inglês|Franco CFA da África Central (XAF)|UTC+1|+237
CF|5700|622984|Francês e sango|Franco CFA da África Central (XAF)|UTC+1|+236
TD|18300|1284000|Francês e árabe|Franco CFA da África Central (XAF)|UTC+1|+235
NE|27000|1267000|Francês|Franco CFA da África Ocidental (XOF)|UTC+1|+227
NG|223800|923768|Inglês|Naira (NGN)|UTC+1|+234
BJ|13700|114763|Francês|Franco CFA da África Ocidental (XOF)|UTC+1|+229
TG|9000|56785|Francês|Franco CFA da África Ocidental (XOF)|UTC+0|+228
BF|23000|272967|Francês|Franco CFA da África Ocidental (XOF)|UTC+0|+226
GH|34100|238533|Inglês|Cedi (GHS)|UTC+0|+233
CI|28900|322463|Francês|Franco CFA da África Ocidental (XOF)|UTC+0|+225
LR|5400|111369|Inglês|Dólar liberiano (LRD)|UTC+0|+231
SL|8600|71740|Inglês|Leone (SLE)|UTC+0|+232
GN|14200|245857|Francês|Franco guineense (GNF)|UTC+0|+224
GW|2150|36125|Português|Franco CFA da África Ocidental (XOF)|UTC+0|+245
GM|2800|11295|Inglês|Dalasi (GMD)|UTC+0|+220
SN|18000|196722|Francês|Franco CFA da África Ocidental (XOF)|UTC+0|+221
CV|600|4033|Português|Escudo cabo-verdiano (CVE)|UTC−1|+238
MR|5000|1030700|Árabe|Uguia (MRU)|UTC+0|+222
ML|23300|1240192|Francês|Franco CFA da África Ocidental (XOF)|UTC+0|+223
EH|600|266000|Árabe (hassanía) e espanhol|Dirham marroquino (MAD), de fato|UTC+1|+212
MA|37800|446550|Árabe e tamazight|Dirham marroquino (MAD)|UTC+1|+212
DZ|45600|2381741|Árabe e tamazight|Dinar argelino (DZD)|UTC+1|+213
TN|12200|163610|Árabe|Dinar tunisiano (TND)|UTC+1|+216
LY|7000|1759540|Árabe|Dinar líbio (LYD)|UTC+2|+218
EG|112700|1002000|Árabe|Libra egípcia (EGP)|UTC+2|+20
SD|48100|1861484|Árabe e inglês|Libra sudanesa (SDG)|UTC+2|+249
PT|10400|92212|Português|Euro (EUR)|UTC+0 (Açores −1)|+351
ES|48600|505990|Espanhol (e catalão, basco, galego)|Euro (EUR)|UTC+1|+34
AD|80|468|Catalão|Euro (EUR)|UTC+1|+376
MC|39|2.02|Francês|Euro (EUR)|UTC+1|+377
SM|34|61|Italiano|Euro (EUR)|UTC+1|+378
IT|58800|301340|Italiano|Euro (EUR)|UTC+1|+39
VA|0.8|0.44|Italiano e latim|Euro (EUR)|UTC+1|+379 / +39 06
MT|540|316|Maltês e inglês|Euro (EUR)|UTC+1|+356
GR|10400|131957|Grego|Euro (EUR)|UTC+2|+30
TR|85300|783562|Turco|Lira turca (TRY)|UTC+3|+90
FR|68200|643801|Francês|Euro (EUR)|UTC+1 (ultramar: vários)|+33
IE|5300|70273|Irlandês e inglês|Euro (EUR)|UTC+0|+353
GB|68300|243610|Inglês|Libra esterlina (GBP)|UTC+0|+44
NL|17900|41543|Holandês|Euro (EUR)|UTC+1|+31
BE|11800|30689|Holandês, francês e alemão|Euro (EUR)|UTC+1|+32
DE|84500|357588|Alemão|Euro (EUR)|UTC+1|+49
LU|660|2586|Luxemburguês, francês e alemão|Euro (EUR)|UTC+1|+352
LI|40|160|Alemão|Franco suíço (CHF)|UTC+1|+423
CH|8800|41285|Alemão, francês, italiano e romanche|Franco suíço (CHF)|UTC+1|+41
AT|9100|83879|Alemão|Euro (EUR)|UTC+1|+43
IS|390|103000|Islandês|Coroa islandesa (ISK)|UTC+0|+354
DK|5950|42924|Dinamarquês|Coroa dinamarquesa (DKK)|UTC+1|+45
SE|10500|450295|Sueco|Coroa sueca (SEK)|UTC+1|+46
NO|5500|385207|Norueguês|Coroa norueguesa (NOK)|UTC+1|+47
FI|5600|338455|Finlandês e sueco|Euro (EUR)|UTC+2|+358
EE|1370|45228|Estoniano|Euro (EUR)|UTC+2|+372
LV|1880|64589|Letão|Euro (EUR)|UTC+2|+371
LT|2900|65300|Lituano|Euro (EUR)|UTC+2|+370
RU|144000|17098246|Russo|Rublo russo (RUB)|UTC+2 a +12 (11 fusos)|+7
BY|9200|207600|Bielorrusso e russo|Rublo bielorrusso (BYN)|UTC+3|+375
PL|36600|312696|Polonês|Zloty (PLN)|UTC+1|+48
CZ|10900|78871|Tcheco|Coroa tcheca (CZK)|UTC+1|+420
SK|5430|49035|Eslovaco|Euro (EUR)|UTC+1|+421
HU|9600|93028|Húngaro|Florim (HUF)|UTC+1|+36
SI|2120|20273|Esloveno|Euro (EUR)|UTC+1|+386
HR|3850|56594|Croata|Euro (EUR)|UTC+1|+385
BA|3200|51197|Bósnio, croata e sérvio|Marco conversível (BAM)|UTC+1|+387
ME|620|13812|Montenegrino|Euro (EUR)|UTC+1|+382
AL|2800|28748|Albanês|Lek (ALL)|UTC+1|+355
CY|1300|9251|Grego e turco|Euro (EUR)|UTC+2|+357
MK|1830|25713|Macedônio e albanês|Dinar macedônio (MKD)|UTC+1|+389
RS|6700|88361|Sérvio|Dinar sérvio (RSD)|UTC+1|+381
RO|19000|238397|Romeno|Leu romeno (RON)|UTC+2|+40
BG|6400|110879|Búlgaro|Euro (EUR), desde 2026|UTC+2|+359
MD|2500|33846|Romeno|Leu moldavo (MDL)|UTC+2|+373
UA|37000|603550|Ucraniano|Hryvnia (UAH)|UTC+2|+380
GE|3700|69700|Georgiano|Lari (GEL)|UTC+4|+995
AM|3000|29743|Armênio|Dram (AMD)|UTC+4|+374
AZ|10200|86600|Azerbaijano|Manat (AZN)|UTC+4|+994
SY|23200|185180|Árabe|Libra síria (SYP)|UTC+3|+963
LB|5400|10452|Árabe|Libra libanesa (LBP)|UTC+2|+961
PS|5500|6020|Árabe|Novo shekel (ILS) e outras|UTC+2|+970
IL|9900|22072|Hebraico e árabe|Novo shekel (ILS)|UTC+2|+972
JO|11300|89342|Árabe|Dinar jordaniano (JOD)|UTC+3|+962
SA|36900|2149690|Árabe|Riyal saudita (SAR)|UTC+3|+966
YE|34700|527968|Árabe|Rial iemenita (YER)|UTC+3|+967
OM|4600|309500|Árabe|Rial omanense (OMR)|UTC+4|+968
AE|9500|83600|Árabe|Dirham dos Emirados (AED)|UTC+4|+971
QA|2700|11586|Árabe|Riyal catariano (QAR)|UTC+3|+974
BH|1500|778|Árabe|Dinar bareinita (BHD)|UTC+3|+973
KW|4300|17818|Árabe|Dinar kuwaitiano (KWD)|UTC+3|+965
IQ|45500|438317|Árabe e curdo|Dinar iraquiano (IQD)|UTC+3|+964
IR|89200|1648195|Persa|Rial iraniano (IRR)|UTC+3:30|+98
AF|42200|652230|Pachto e dari|Afegani (AFN)|UTC+4:30|+93
KZ|20000|2724900|Cazaque e russo|Tenge (KZT)|UTC+5|+7
UZ|36000|448978|Uzbeque|Som uzbeque (UZS)|UTC+5|+998
TM|7400|488100|Turcomeno|Manat turcomeno (TMT)|UTC+5|+993
KG|7160|199951|Quirguiz e russo|Som quirguiz (KGS)|UTC+6|+996
TJ|10100|143100|Tadjique|Somoni (TJS)|UTC+5|+992
PK|240500|881913|Urdu e inglês|Rupia paquistanesa (PKR)|UTC+5|+92
IN|1428000|3287263|Híndi e inglês (mais 22 reconhecidos)|Rupia indiana (INR)|UTC+5:30|+91
MV|520|300|Divehi|Rufiyaa (MVR)|UTC+5|+960
LK|21900|65610|Cingalês e tâmil|Rupia do Sri Lanka (LKR)|UTC+5:30|+94
BD|173000|147570|Bengali|Taka (BDT)|UTC+6|+880
BT|790|38394|Dzongkha|Ngultrum (BTN)|UTC+6|+975
NP|30900|147516|Nepalês|Rupia nepalesa (NPR)|UTC+5:45|+977
MN|3400|1564116|Mongol|Tugrik (MNT)|UTC+8|+976
CN|1410000|9596961|Mandarim|Yuan renminbi (CNY)|UTC+8|+86
KP|26200|120538|Coreano|Won norte-coreano (KPW)|UTC+9|+850
KR|51700|100210|Coreano|Won sul-coreano (KRW)|UTC+9|+82
JP|124000|377975|Japonês|Iene (JPY)|UTC+9|+81
TW|23400|36193|Mandarim|Novo dólar taiwanês (TWD)|UTC+8|+886
MM|54500|676578|Birmanês|Quiate (MMK)|UTC+6:30|+95
TH|71800|513120|Tailandês|Baht (THB)|UTC+7|+66
LA|7600|236800|Laosiano|Kip (LAK)|UTC+7|+856
VN|100300|331212|Vietnamita|Dong (VND)|UTC+7|+84
KH|16900|181035|Khmer|Riel (KHR)|UTC+7|+855
MY|34300|330803|Malaio|Ringgit (MYR)|UTC+8|+60
SG|5900|734|Inglês, malaio, mandarim e tâmil|Dólar de Singapura (SGD)|UTC+8|+65
ID|277000|1904569|Indonésio|Rupia indonésia (IDR)|UTC+7 a +9|+62
BN|450|5765|Malaio|Dólar de Brunei (BND)|UTC+8|+673
PH|117300|300000|Filipino e inglês|Peso filipino (PHP)|UTC+8|+63
TL|1360|14919|Tétum e português|Dólar americano (USD)|UTC+9|+670
AU|26600|7692024|Inglês (de fato)|Dólar australiano (AUD)|UTC+8 a +10:30 (+11 no verão)|+61
NZ|5200|268838|Inglês, maori e língua de sinais|Dólar neozelandês (NZD)|UTC+12 (+13 no verão)|+64
PG|10300|462840|Inglês, tok pisin e hiri motu|Kina (PGK)|UTC+10|+675
SB|740|28896|Inglês|Dólar das Ilhas Salomão (SBD)|UTC+11|+677
VU|330|12189|Bislama, inglês e francês|Vatu (VUV)|UTC+11|+678
FJ|930|18274|Inglês, fijiano e híndi fijiano|Dólar fijiano (FJD)|UTC+12|+679
PW|18|459|Palauano e inglês|Dólar americano (USD)|UTC+9|+680
FM|115|702|Inglês|Dólar americano (USD)|UTC+10 e +11|+691
MH|42|181|Marshalês e inglês|Dólar americano (USD)|UTC+12|+692
NR|12|21|Nauruano e inglês|Dólar australiano (AUD)|UTC+12|+674
KI|133|811|Inglês e gilbertês|Dólar australiano (AUD)|UTC+12 a +14|+686
TV|11|26|Tuvaluano e inglês|Dólar australiano / tuvaluano|UTC+12|+688
WS|220|2842|Samoano e inglês|Tala (WST)|UTC+13|+685
TO|107|747|Tonganês e inglês|Paʻanga (TOP)|UTC+13|+676
PR|3200|9104|Espanhol e inglês|Dólar americano (USD)|UTC−4|+1 787 / 939
VI|87|347|Inglês|Dólar americano (USD)|UTC−4|+1 340
VG|31|153|Inglês|Dólar americano (USD)|UTC−4|+1 284
AI|16|91|Inglês|Dólar do Caribe Oriental (XCD)|UTC−4|+1 264
MS|4.4|102|Inglês|Dólar do Caribe Oriental (XCD)|UTC−4|+1 664
KY|69|264|Inglês|Dólar das Ilhas Cayman (KYD)|UTC−5|+1 345
TC|46|948|Inglês|Dólar americano (USD)|UTC−5|+1 649
AW|107|180|Holandês e papiamento|Florim arubano (AWG)|UTC−4|+297
CW|155|444|Holandês, papiamento e inglês|Florim do Caribe (XCG)|UTC−4|+599 9
SX|44|34|Holandês e inglês|Florim do Caribe (XCG)|UTC−4|+1 721
BQ|30|328|Holandês e papiamento|Dólar americano (USD)|UTC−4|+599
GP|380|1628|Francês|Euro (EUR)|UTC−4|+590
MQ|350|1128|Francês|Euro (EUR)|UTC−4|+596
MF|32|53|Francês|Euro (EUR)|UTC−4|+590
BL|11|25|Francês|Euro (EUR)|UTC−4|+590
BM|64|54|Inglês|Dólar bermudense (BMD)|UTC−4|+1 441
GL|57|2166086|Groenlandês|Coroa dinamarquesa (DKK)|UTC−2 (de −1 a −4)|+299
PM|6|242|Francês|Euro (EUR)|UTC−3|+508
FK|3.7|12173|Inglês|Libra das Malvinas (FKP)|UTC−3|+500
RE|880|2511|Francês|Euro (EUR)|UTC+4|+262
YT|320|374|Francês|Euro (EUR)|UTC+3|+262
SH|5.6|394|Inglês|Libra de Santa Helena (SHP)|UTC+0|+290
GI|33|6.8|Inglês|Libra de Gibraltar (GIP)|UTC+1|+350
FO|54|1393|Feroês e dinamarquês|Coroa feroesa (equivale à DKK)|UTC+0|+298
IM|84|572|Inglês|Libra esterlina (GBP)|UTC+0|+44 1624
JE|103|116|Inglês|Libra esterlina (GBP)|UTC+0|+44 1534
GG|64|78|Inglês|Libra esterlina (GBP)|UTC+0|+44 1481
AX|30|1580|Sueco|Euro (EUR)|UTC+2|+358 18
SJ|2.5|61022|Norueguês|Coroa norueguesa (NOK)|UTC+1|+47 79
HK|7500|1110|Chinês (cantonês) e inglês|Dólar de Hong Kong (HKD)|UTC+8|+852
MO|690|33|Chinês (cantonês) e português|Pataca (MOP)|UTC+8|+853
GU|170|541|Inglês e chamorro|Dólar americano (USD)|UTC+10|+1 671
MP|48|464|Inglês, chamorro e caroliniano|Dólar americano (USD)|UTC+10|+1 670
AS|45|199|Samoano e inglês|Dólar americano (USD)|UTC−11|+1 684
PF|280|4167|Francês e taitiano|Franco CFP (XPF)|UTC−10|+689
NC|270|18575|Francês|Franco CFP (XPF)|UTC+11|+687
WF|11|142|Francês e wallisiano|Franco CFP (XPF)|UTC+12|+681
CK|15|236|Inglês e maori das Ilhas Cook|Dólar neozelandês (NZD)|UTC−10|+682
NU|1.7|261|Niueano e inglês|Dólar neozelandês (NZD)|UTC−11|+683
TK|1.6|10|Toquelauano e inglês|Dólar neozelandês (NZD)|UTC+13|+690
NF|2.2|36|Inglês e norfuk|Dólar australiano (AUD)|UTC+11|+672 3
PN|0.05|47|Inglês e pitkern|Dólar neozelandês (NZD)|UTC−8|+64
CX|1.7|135|Inglês|Dólar australiano (AUD)|UTC+7|+61 8 9164
CC|0.6|14|Inglês e malaio de Cocos|Dólar australiano (AUD)|UTC+6:30|+61 8 9162
IO|0|60|Inglês|Dólar americano (USD)|UTC+6|+246
CP|0|6||Euro (EUR)|UTC−8|
UM|0|34|Inglês|Dólar americano (USD)|vários fusos|
QR|0|5|||UTC+8|
QS|0|3|Inglês|Dólar australiano (AUD)|UTC+10|
QT|0|377|Norueguês|Coroa norueguesa (NOK)|UTC+1|
QU|18|254|Grego e inglês|Euro (EUR)|UTC+2|+357
GS|0|3903|Inglês|Libra esterlina (GBP)|UTC−2|+500
BV|0|49|||UTC+1|
HM|0|372|||UTC+5|
TF|0|7747|Francês|Euro (EUR)|UTC+5|+262
QN|0|1709400|||UTC−3|
QO|0|2700000|||UTC+0|
QM|0|5896500|||vários fusos|
QQ|0|450000|||UTC+12|
QP|0|154|||UTC−6|
XK|1776|10887|Albanês e sérvio|Euro (EUR, uso não oficial)|UTC+1|+383
XN|380|3355|Turco|Lira turca (TRY)|UTC+2|+90 392
XS|5700|176120|Somali e árabe|Xelim somalilandês (não conversível)|UTC+3|+252
XT|350|4163|Russo, ucraniano e romeno|Rublo transnístrio (não conversível)|UTC+2|+373 (prefixo local 533)
XA|245|8660|Abecázio e russo|Rublo russo (RUB)|UTC+3|+7 840 / 940
XO|56|3900|Osseto, russo e georgiano|Rublo russo (RUB)|UTC+4|+995 34
`;
var INFO={};
INFO_RAW.trim().split('\n').forEach(function(l){
  var p=l.split('|');
  INFO[p[0]]={pop:+p[1],area:+p[2],lang:p[3],cur:p[4],tz:p[5],dial:p[6],
    tld:p[0]==='GB'?'.uk':p[0]==='EH'?'— (reservado)':(/^(X.|Q[M-Z]|UM|CP)$/.test(p[0]))?'— (sem domínio próprio)':'.'+p[0].toLowerCase()};
});
D.forEach(function(d){d.info=INFO[d.cc]||null;});
