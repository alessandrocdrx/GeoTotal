/**
 * @arquivo js/dados/religioes.js
 * Camada: Dados
 * Religiões por país (estimativas, % da população).
 */

import { D } from './paises.js';

/* ---------- Religiões (estimativas aproximadas; % da população) ----------
   código|Grupo:pct[Subgrupo:pct,Subgrupo];Grupo:pct|nota */
const REL_RAW = `
BR|Cristãos:86[Católicos:57,Evangélicos:27,Outros cristãos:2];Sem religião:9;Espíritas:2;Religiões afro-brasileiras:1;Outras:2
GF|Cristãos:80[Católicos:70,Protestantes:10];Outras:20|Dados escassos
SR|Cristãos:49[Protestantes:27,Católicos:21,Outros:1];Hindus:22;Muçulmanos:14[Sunitas];Sem religião:10;Outras:5
GY|Cristãos:63[Protestantes:48,Católicos:8,Outros:7];Hindus:25;Muçulmanos:7;Sem religião:2;Outras:3
VE|Cristãos:89[Católicos:71,Protestantes/evangélicos:17,Outros:1];Sem religião:8;Outras:3
CO|Cristãos:92[Católicos:79,Protestantes/evangélicos:13];Sem religião:7;Outras:1
EC|Cristãos:94[Católicos:79,Protestantes/evangélicos:14,Outros:1];Sem religião:4;Outras:2
PE|Cristãos:93[Católicos:76,Evangélicos:14,Outros:3];Sem religião:5;Outras:2
BO|Cristãos:93[Católicos:77,Evangélicos:16];Sem religião:4;Outras:3|Muitos combinam o catolicismo com crenças indígenas
CL|Cristãos:76[Católicos:57,Evangélicos:17,Outros:2];Sem religião:21;Outras:3
AR|Cristãos:81[Católicos:63,Evangélicos:15,Outros:3];Sem religião:17;Outras:2
PY|Cristãos:95[Católicos:86,Evangélicos:8,Outros:1];Sem religião:3;Outras:2
UY|Cristãos:47[Católicos:42,Protestantes:5];Sem religião:47;Outras:6
PA|Cristãos:92[Católicos:63,Protestantes:27,Outros:2];Sem religião:5;Outras:3
CR|Cristãos:87[Católicos:62,Evangélicos:22,Outros:3];Sem religião:10;Outras:3
NI|Cristãos:90[Católicos:50,Evangélicos:33,Outros:7];Sem religião:8;Outras:2
HN|Cristãos:91[Católicos:46,Evangélicos:41,Outros:4];Sem religião:8;Outras:1
SV|Cristãos:92[Católicos:50,Evangélicos:34,Outros:8];Sem religião:7;Outras:1
GT|Cristãos:93[Católicos:45,Evangélicos:42,Outros:6];Sem religião:5;Outras:2
BZ|Cristãos:82[Católicos:40,Protestantes:42];Sem religião:10;Outras:8
CU|Cristãos:59[Católicos:47,Protestantes:12];Sem religião:23;Religiões afro-cubanas (tradicionais):17;Outras:1|Muitos combinam o catolicismo com a santería
JM|Cristãos:69[Protestantes:66,Católicos:2,Outros:1];Sem religião:21;Rastafári:2;Outras:8
BS|Cristãos:93[Protestantes:70,Católicos:12,Outros:11];Sem religião:5;Outras:2
HT|Cristãos:96[Católicos:55,Protestantes:41];Vodu (tradicional):2;Sem religião:2|Muitos praticam o vodu junto com o cristianismo
DO|Cristãos:84[Católicos:57,Protestantes:24,Outros:3];Sem religião:14;Outras:2
KN|Cristãos:88[Protestantes:74,Católicos:8,Outros:6];Sem religião:6;Outras:6
AG|Cristãos:87[Protestantes:77,Católicos:8,Outros:2];Sem religião:6;Outras:7
DM|Cristãos:90[Católicos:52,Protestantes:34,Outros:4];Sem religião:4;Outras:6
LC|Cristãos:92[Católicos:62,Protestantes:30];Sem religião:6;Outras:2
VC|Cristãos:88[Protestantes:76,Católicos:8,Outros:4];Hindus:2;Sem religião:4;Outras:6
BB|Cristãos:78[Protestantes:71,Católicos:4,Outros:3];Sem religião:21;Outras:1
GD|Cristãos:92[Católicos:45,Protestantes:45,Outros:2];Sem religião:6;Outras:2
TT|Cristãos:64[Protestantes:41,Católicos:22,Outros:1];Hindus:18;Muçulmanos:5;Sem religião:6;Outras:7
MX|Cristãos:91[Católicos:78,Protestantes/evangélicos:11,Outros:2];Sem religião:8;Outras:1
US|Cristãos:62[Protestantes:40,Católicos:19,Outros:3];Sem religião:29;Judeus:2;Muçulmanos:1;Hindus:1;Budistas:1;Outras:4
CA|Cristãos:53[Católicos:30,Protestantes:15,Ortodoxos:2,Outros:6];Sem religião:35;Muçulmanos:5;Hindus:2;Sikhs:2;Budistas:1;Judeus:1;Outras:1
ZA|Cristãos:82[Protestantes e igrejas independentes:74,Católicos:7,Outros:1];Sem religião:13;Tradicionais:3;Muçulmanos:2
LS|Cristãos:91[Católicos:45,Protestantes/anglicanos:40,Outros:6];Tradicionais:6;Sem religião:2;Outras:1
SZ|Cristãos:88[Igrejas sionistas:40,Protestantes:30,Católicos:15,Outros:3];Tradicionais:5;Muçulmanos:2;Sem religião:5
BW|Cristãos:79[Protestantes e independentes:70,Católicos:5,Outros:4];Sem religião:15;Tradicionais:4;Outras:2
NA|Cristãos:91[Luteranos:45,Católicos:14,Outros protestantes:32];Tradicionais:3;Sem religião:5;Outras:1
ZM|Cristãos:95[Protestantes:75,Católicos:20];Muçulmanos:1;Tradicionais:2;Sem religião:2
ZW|Cristãos:87[Protestantes e apostólicos:76,Católicos:10,Outros:1];Tradicionais:5;Muçulmanos:1;Sem religião:7
MZ|Cristãos:66[Católicos:28,Igrejas sionistas:16,Protestantes:22];Muçulmanos:19;Sem religião:14;Outras:1
MG|Cristãos:85[Protestantes:44,Católicos:41];Tradicionais:7;Muçulmanos:3;Sem religião:3;Outras:2
MU|Hindus:48;Cristãos:32[Católicos:26,Protestantes:6];Muçulmanos:17[Sunitas];Outras:3
SC|Cristãos:94[Católicos:74,Protestantes:20];Hindus:2;Muçulmanos:2;Sem religião:1;Outras:1
KM|Muçulmanos:98[Sunitas];Cristãos:1;Outras:1
MW|Cristãos:87[Protestantes:67,Católicos:17,Outros:3];Muçulmanos:13[Sunitas]
TZ|Cristãos:61[Católicos:30,Protestantes:30,Outros:1];Muçulmanos:35[Sunitas];Tradicionais:3;Sem religião:1|Zanzibar é quase todo muçulmano
BI|Cristãos:92[Católicos:62,Protestantes:30];Muçulmanos:3;Tradicionais:3;Outras:2
RW|Cristãos:93[Católicos:43,Protestantes:45,Outros:5];Muçulmanos:2;Sem religião:3;Outras:2
UG|Cristãos:84[Católicos:39,Anglicanos:32,Pentecostais e outros:13];Muçulmanos:14[Sunitas];Tradicionais:1;Outras:1
KE|Cristãos:85[Protestantes:55,Católicos:22,Outros:8];Muçulmanos:11[Sunitas];Tradicionais:2;Sem religião:2
SO|Muçulmanos:99[Sunitas (xafeitas)];Outras:1
DJ|Muçulmanos:94[Sunitas];Cristãos:5;Outras:1
ER|Cristãos:50[Ortodoxos (Tewahedo):40,Católicos:4,Protestantes:6];Muçulmanos:48[Sunitas];Outras:2|Não há censo religioso; as estimativas divergem
ET|Cristãos:63[Ortodoxos (Tewahedo):43,Protestantes/pentecostais:19,Católicos:1];Muçulmanos:34[Sunitas];Tradicionais:2;Outras:1
SS|Cristãos:60[Católicos:26,Protestantes/anglicanos:34];Tradicionais:33;Muçulmanos:6;Outras:1|Dados escassos
AO|Cristãos:89[Católicos:55,Protestantes:32,Outros:2];Sem religião:7;Tradicionais:3;Outras:1
CD|Cristãos:93[Católicos:45,Protestantes:43,Kimbanguistas:3,Outros:2];Muçulmanos:2;Tradicionais:3;Outras:2
CG|Cristãos:89[Católicos:43,Protestantes:35,Outros:11];Muçulmanos:2;Tradicionais:3;Sem religião:6
GA|Cristãos:82[Católicos:42,Protestantes:35,Outros:5];Muçulmanos:10;Tradicionais:5;Sem religião:3
ST|Cristãos:93[Católicos:55,Protestantes:38];Sem religião:5;Outras:2
GQ|Cristãos:88[Católicos:80,Protestantes:8];Tradicionais:5;Muçulmanos:4;Sem religião:3
CM|Cristãos:70[Católicos:38,Protestantes:32];Muçulmanos:24[Sunitas];Tradicionais:4;Sem religião:2
CF|Cristãos:79[Protestantes:45,Católicos:30,Outros:4];Muçulmanos:10;Tradicionais:9;Sem religião:2
TD|Muçulmanos:55[Sunitas];Cristãos:41[Católicos:20,Protestantes:21];Tradicionais:3;Sem religião:1
NE|Muçulmanos:99[Sunitas];Outras:1
NG|Muçulmanos:50[Sunitas];Cristãos:48[Protestantes:30,Católicos:12,Outros:6];Tradicionais:1;Sem religião:1|Norte majoritariamente muçulmano; sul majoritariamente cristão
BJ|Cristãos:53[Católicos:26,Protestantes e outros:27];Muçulmanos:24;Vodu e tradicionais:18;Sem religião:5
TG|Cristãos:43[Católicos:22,Protestantes:21];Muçulmanos:14;Tradicionais:35;Sem religião:8
BF|Muçulmanos:63[Sunitas];Cristãos:23[Católicos:15,Protestantes:8];Tradicionais:12;Sem religião:2
GH|Cristãos:71[Pentecostais e carismáticos:32,Protestantes:20,Católicos:12,Outros:7];Muçulmanos:20;Tradicionais:5;Sem religião:4
CI|Muçulmanos:42;Cristãos:40[Católicos:20,Protestantes:17,Outros:3];Sem religião:13;Tradicionais:5
LR|Cristãos:85[Protestantes:76,Católicos:7,Outros:2];Muçulmanos:12;Tradicionais:2;Sem religião:1
SL|Muçulmanos:78[Sunitas];Cristãos:21[Protestantes:12,Católicos:8,Outros:1];Tradicionais:1
GN|Muçulmanos:86[Sunitas];Cristãos:9;Tradicionais:5
GW|Muçulmanos:46;Cristãos:19[Católicos:12,Protestantes:7];Tradicionais:31;Sem religião:4
GM|Muçulmanos:96[Sunitas];Cristãos:4
SN|Muçulmanos:96[Sunitas (irmandades sufis)];Cristãos:4[Católicos]
CV|Cristãos:91[Católicos:77,Protestantes:12,Outros:2];Sem religião:6;Outras:3
MR|Muçulmanos:100[Sunitas]
ML|Muçulmanos:95[Sunitas];Cristãos:3;Tradicionais:2
EH|Muçulmanos:99[Sunitas];Outras:1|Dados escassos
MA|Muçulmanos:99[Sunitas (malequitas)];Outras:1
DZ|Muçulmanos:99[Sunitas,Ibaditas (minoria)];Outras:1
TN|Muçulmanos:99[Sunitas];Outras:1
LY|Muçulmanos:96[Sunitas,Ibaditas (minoria)];Cristãos:3;Outras:1
EG|Muçulmanos:90[Sunitas];Cristãos:10[Ortodoxos coptas:9,Outros:1]
SD|Muçulmanos:91[Sunitas];Cristãos:5;Tradicionais:3;Outras:1
PT|Cristãos:84[Católicos:80,Outros:4];Sem religião:13;Outras:3
ES|Cristãos:60[Católicos:57,Outros:3];Sem religião:36;Muçulmanos:2;Outras:2
AD|Cristãos:90[Católicos:88,Outros:2];Sem religião:6;Outras:4
MC|Cristãos:87[Católicos:83,Outros:4];Sem religião:7;Judeus:2;Muçulmanos:2;Outras:2
SM|Cristãos:91[Católicos:90,Outros:1];Sem religião:8;Outras:1
IT|Cristãos:78[Católicos:74,Ortodoxos:3,Protestantes:1];Sem religião:15;Muçulmanos:4;Outras:3
VA|Cristãos:100[Católicos:100]|Estado da Igreja Católica; os residentes são clérigos e funcionários
MT|Cristãos:90[Católicos:88,Outros:2];Sem religião:7;Muçulmanos:2;Outras:1
GR|Cristãos:90[Ortodoxos:88,Católicos:1,Protestantes:1];Muçulmanos:3;Sem religião:6;Outras:1
TR|Muçulmanos:98[Sunitas:80,Alevitas e outros:18];Sem religião:1;Outras:1|A parcela alevita é muito debatida
FR|Cristãos:49[Católicos:45,Protestantes:3,Ortodoxos:1];Sem religião:40;Muçulmanos:9;Judeus:1;Outras:1
IE|Cristãos:76[Católicos:69,Outros:7];Sem religião:14;Muçulmanos:2;Outras/não declarada:8
GB|Cristãos:46[Anglicanos e igrejas nacionais:30,Católicos:9,Outros:7];Sem religião:37;Muçulmanos:7;Hindus:2;Sikhs:1;Judeus:1;Budistas:1;Outras:5|Base: censo de 2021 (Inglaterra e País de Gales)
NL|Cristãos:40[Católicos:20,Protestantes:15,Outros:5];Sem religião:52;Muçulmanos:5;Outras:3
BE|Cristãos:57[Católicos:52,Outros:5];Sem religião:33;Muçulmanos:7;Outras:3
DE|Cristãos:51[Católicos:25,Protestantes:23,Outros:3];Sem religião:38;Muçulmanos:7;Outras:4
LU|Cristãos:68[Católicos:65,Outros:3];Sem religião:25;Muçulmanos:3;Outras:4
LI|Cristãos:82[Católicos:74,Protestantes:8];Sem religião:9;Muçulmanos:6;Outras:3
CH|Cristãos:60[Católicos:33,Protestantes:21,Ortodoxos e outros:6];Sem religião:30;Muçulmanos:6;Outras:4
AT|Cristãos:66[Católicos:55,Ortodoxos:6,Protestantes:3,Outros:2];Sem religião:22;Muçulmanos:8;Outras:4
IS|Cristãos:71[Luteranos:58,Outros:13];Sem religião:22;Ásatrú (tradicional):3;Outras:4
DK|Cristãos:76[Luteranos:73,Católicos:1,Outros:2];Sem religião:17;Muçulmanos:5;Outras:2
SE|Cristãos:57[Luteranos:53,Outros:4];Sem religião:34;Muçulmanos:8;Outras:1
NO|Cristãos:72[Luteranos:66,Outros:6];Sem religião:20;Muçulmanos:5;Outras:3
FI|Cristãos:69[Luteranos:65,Ortodoxos:1,Outros:3];Sem religião:28;Muçulmanos:2;Outras:1
EE|Cristãos:29[Ortodoxos:16,Luteranos:8,Outros:5];Sem religião:58;Outras/não declarada:13
LV|Cristãos:60[Luteranos:25,Católicos:20,Ortodoxos:15];Sem religião:38;Outras:2
LT|Cristãos:80[Católicos:74,Ortodoxos:4,Outros:2];Sem religião:15;Outras:5
RU|Cristãos:73[Ortodoxos:68,Outros:5];Muçulmanos:10[Sunitas];Sem religião:15;Outras:2|Inclui budistas na Calmúquia, na Buriátia e em Tuva
BY|Cristãos:78[Ortodoxos:68,Católicos:8,Outros:2];Sem religião:20;Muçulmanos:1;Outras:1
PL|Cristãos:91[Católicos:87,Outros:4];Sem religião:7;Outras:2
CZ|Cristãos:20[Católicos:12,Protestantes:2,Outros:6];Sem religião:75;Outras:5
SK|Cristãos:68[Católicos (romanos e greco-católicos):60,Protestantes:7,Ortodoxos:1];Sem religião:24;Outras/não declarada:8
HU|Cristãos:55[Católicos:40,Calvinistas:12,Luteranos:2,Outros:1];Sem religião:30;Outras/não declarada:15
SI|Cristãos:62[Católicos:58,Ortodoxos:3,Outros:1];Muçulmanos:3;Sem religião:30;Outras:5
HR|Cristãos:84[Católicos:79,Ortodoxos:3,Outros:2];Muçulmanos:1;Sem religião:8;Outras/não declarada:7
BA|Muçulmanos:51[Sunitas];Cristãos:46[Ortodoxos:31,Católicos:15];Sem religião:2;Outras:1
ME|Cristãos:76[Ortodoxos:72,Católicos:3,Outros:1];Muçulmanos:19;Sem religião:3;Outras:2
AL|Muçulmanos:58[Sunitas:52,Bektashis:6];Cristãos:17[Católicos:10,Ortodoxos:7];Sem religião:5;Outras/não declarada:20
CY|Cristãos:76[Ortodoxos:72,Outros:4];Muçulmanos:18[Sunitas];Sem religião:4;Outras:2
MK|Cristãos:64[Ortodoxos:64];Muçulmanos:33[Sunitas];Outras:3
RS|Cristãos:91[Ortodoxos:84,Católicos:5,Protestantes:1,Outros:1];Muçulmanos:3;Sem religião:4;Outras:2
RO|Cristãos:84[Ortodoxos:73,Protestantes:6,Católicos:5];Sem religião:1;Outras/não declarada:15
BG|Cristãos:62[Ortodoxos:59,Outros:3];Muçulmanos:8;Sem religião:9;Outras/não declarada:21
MD|Cristãos:96[Ortodoxos:95,Outros:1];Sem religião:2;Outras:2
UA|Cristãos:78[Ortodoxos:67,Greco-católicos:8,Protestantes:2,Católicos:1];Sem religião:19;Muçulmanos:1;Outras:2|Dados anteriores à guerra; a composição pode ter mudado
GE|Cristãos:87[Ortodoxos:83,Outros:4];Muçulmanos:10;Sem religião:2;Outras:1
AM|Cristãos:93[Igreja Apostólica Armênia:92,Outros:1];Sem religião:3;Outras:4
AZ|Muçulmanos:96[Xiitas:65,Sunitas:31];Cristãos:3;Outras:1
SY|Muçulmanos:87[Sunitas:74,Alauitas:11,Ismaelitas e outros:2];Cristãos:10;Drusos:3|Dados anteriores à guerra civil
LB|Muçulmanos:63[Sunitas:31,Xiitas:32];Cristãos:32[Maronitas:21,Ortodoxos gregos:8,Outros:3];Drusos:5|Não há censo desde 1932; valores estimados
PS|Muçulmanos:85[Sunitas];Cristãos:2;Judeus:13|Judeus: moradores de assentamentos na Cisjordânia
IL|Judeus:74;Muçulmanos:18[Sunitas];Cristãos:2;Drusos:2;Outras/sem religião:4|Entre os judeus há seculares, tradicionais, ortodoxos e ultraortodoxos
JO|Muçulmanos:97[Sunitas];Cristãos:2;Outras:1
SA|Muçulmanos:93[Sunitas:82,Xiitas:11];Cristãos:4;Hindus:1;Outras:2|Sem censo religioso; inclui estimativas de imigrantes
YE|Muçulmanos:99[Sunitas (xafeitas):55,Zaiditas (xiitas):44];Outras:1
OM|Muçulmanos:88[Ibaditas:45,Sunitas:40,Xiitas:3];Hindus:6;Cristãos:4;Outras:2
AE|Muçulmanos:76[Sunitas:66,Xiitas:10];Cristãos:12;Hindus:7;Budistas:2;Outras:3|Inclui a grande população imigrante
QA|Muçulmanos:68[Sunitas];Cristãos:14;Hindus:14;Budistas:3;Outras:1|Inclui a grande população imigrante
BH|Muçulmanos:74[Xiitas:40,Sunitas:34];Cristãos:10;Hindus:10;Outras:6|Inclui a população imigrante
KW|Muçulmanos:74[Sunitas:45,Xiitas:29];Cristãos:18;Hindus:6;Outras:2|Inclui a população imigrante
IQ|Muçulmanos:98[Xiitas:62,Sunitas:36];Cristãos:1;Yazidis e outros:1
IR|Muçulmanos:99[Xiitas:90,Sunitas:9];Outras:1
AF|Muçulmanos:99[Sunitas:85,Xiitas:14];Outras:1
KZ|Muçulmanos:70[Sunitas];Cristãos:26[Ortodoxos:20,Outros:6];Sem religião:3;Outras:1
UZ|Muçulmanos:88[Sunitas];Cristãos:9[Ortodoxos:8,Outros:1];Outras:3
TM|Muçulmanos:89[Sunitas];Cristãos:9[Ortodoxos:8,Outros:1];Outras:2
KG|Muçulmanos:90[Sunitas];Cristãos:7;Sem religião:2;Outras:1
TJ|Muçulmanos:98[Sunitas:92,Ismaelitas (xiitas):6];Outras:2
PK|Muçulmanos:96[Sunitas:82,Xiitas:14];Hindus:2;Cristãos:2
IN|Hindus:79;Muçulmanos:14[Sunitas];Cristãos:2;Sikhs:2;Budistas:1;Outras (jainistas, tribais etc.):2
MV|Muçulmanos:100[Sunitas]
LK|Budistas:70[Theravada];Hindus:13;Muçulmanos:10[Sunitas];Cristãos:7[Católicos:6,Outros:1]
BD|Muçulmanos:91[Sunitas];Hindus:8;Outras:1
BT|Budistas:75[Budismo tibetano (Drukpa Kagyu e Nyingma)];Hindus:22;Outras:3
NP|Hindus:81;Budistas:9;Muçulmanos:5;Kirat (tradicional):3;Cristãos:2
MN|Budistas:51[Budismo tibetano (Gelug)];Sem religião:40;Muçulmanos:3[Sunitas];Xamanistas e tradicionais:3;Cristãos:3
CN|Sem religião:52;Religiões populares e tradicionais (taoísmo, culto aos ancestrais):22;Budistas:18;Cristãos:5[Protestantes:4,Católicos:1];Muçulmanos:2[Sunitas];Outras:1|Estimativas variam muito: não há censo religioso
KP|Sem religião:71;Religiões tradicionais e xamânicas:16;Chondoístas e outras:9;Budistas:2;Cristãos:2|Dados escassos e pouco confiáveis
KR|Sem religião:56;Cristãos:28[Protestantes:20,Católicos:8];Budistas:16
JP|Sem religião:57;Budistas:36;Xintoístas:4;Cristãos:1;Outras:2|Muitos japoneses praticam xintoísmo e budismo ao mesmo tempo
TW|Religiões populares e taoísmo:44;Sem religião:25;Budistas:21;Cristãos:5[Protestantes:3,Católicos:1,Outros:1];Outras:5
MM|Budistas:88[Theravada];Cristãos:6[Protestantes (batistas):4,Católicos:1,Outros:1];Muçulmanos:4[Sunitas];Hindus:1;Outras:1
TH|Budistas:93[Theravada];Muçulmanos:5[Sunitas];Cristãos:1;Outras:1
LA|Budistas:65[Theravada];Tradicionais e animistas:31;Cristãos:2;Outras:2
VN|Religiões populares:45;Sem religião:30;Budistas:16[Mahayana];Cristãos:8[Católicos:7,Protestantes:1];Outras (Cao Đài, Hòa Hảo etc.):1
KH|Budistas:97[Theravada];Muçulmanos:2[Sunitas (chams)];Outras:1
MY|Muçulmanos:64[Sunitas];Budistas:19;Cristãos:9;Hindus:6;Outras:2
SG|Budistas:31;Sem religião:20;Cristãos:19;Muçulmanos:16[Sunitas];Taoístas:9;Hindus:5
ID|Muçulmanos:87[Sunitas];Cristãos:10[Protestantes:7,Católicos:3];Hindus:2;Outras:1
BN|Muçulmanos:82[Sunitas];Cristãos:9;Budistas:7;Outras:2
PH|Cristãos:92[Católicos:79,Protestantes e outros:13];Muçulmanos:6[Sunitas];Outras:2
TL|Cristãos:98[Católicos:97,Protestantes:1];Muçulmanos:1;Outras:1
AU|Cristãos:44[Católicos:20,Anglicanos:10,Outros:14];Sem religião:39;Muçulmanos:3;Hindus:3;Budistas:2;Outras/não declarada:9
NZ|Cristãos:37[Católicos:10,Anglicanos:7,Presbiterianos:5,Outros:15];Sem religião:48;Hindus:3;Muçulmanos:1;Budistas:1;Outras/não declarada:10
PG|Cristãos:96[Protestantes:65,Católicos:26,Outros:5];Tradicionais:3;Outras:1
SB|Cristãos:96[Protestantes:76,Católicos:19,Outros:1];Tradicionais:3;Outras:1
VU|Cristãos:84[Protestantes:68,Católicos:12,Outros:4];Sem religião:6;Tradicionais:6;Outras:4
FJ|Cristãos:64[Metodistas:34,Católicos:9,Outros protestantes:21];Hindus:28;Muçulmanos:6;Sikhs:1;Outras:1
PW|Cristãos:84[Católicos:45,Protestantes:33,Outros:6];Modekngei (tradicional):6;Outras:10
FM|Cristãos:96[Católicos:55,Protestantes:41];Outras:4
MH|Cristãos:94[Protestantes:80,Católicos:9,Mórmons:3,Outros:2];Outras:6
NR|Cristãos:88[Protestantes:60,Católicos:28];Sem religião:8;Bahá'ís:3;Outras:1
KI|Cristãos:96[Católicos:55,Protestantes:33,Mórmons:5,Outros:3];Bahá'ís:2;Outras:2
TV|Cristãos:97[Congregacionais:87,Adventistas:3,Outros:7];Bahá'ís:1;Outras:2
WS|Cristãos:98[Congregacionais:32,Católicos:19,Mórmons:17,Metodistas:14,Assembleias de Deus:7,Outros:9];Bahá'ís:1;Outras:1
TO|Cristãos:97[Metodistas:45,Mórmons:18,Católicos:14,Outros:20];Outras:3
`;
const REL = {};

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  REL_RAW.trim().split('\n').forEach(function(l){
    var p=l.split('|'),items=[];
    p[1].split(';').forEach(function(it){
      var m=it.match(/^([^:[]+)(?::([\d.]+))?(?:\[(.*)\])?$/);
      if(!m)return;
      var subs=[];
      if(m[3])m[3].split(',').forEach(function(s){var mm=s.match(/^([^:]+)(?::([\d.]+))?$/);if(mm)subs.push({n:mm[1].trim(),p:mm[2]?+mm[2]:null});});
      items.push({n:m[1].trim(),p:m[2]?+m[2]:null,subs:subs});
    });
    REL[p[0]]={items:items,note:p[2]||''};
  });
  D.forEach(function(d){d.rel=REL[d.cc]||null;});
}

export { iniciar };
