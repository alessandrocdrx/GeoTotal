/**
 * @arquivo js/dados/aeroportos.js
 * Camada: Dados
 * Grandes aeroportos de conexão (hubs) do mundo, usados para montar rotas com escalas típicas na tela
 * da Distância. É uma aproximação: as companhias aéreas mudam as rotas o tempo todo.
 */

/* código|cidade|latitude|longitude */
const HUBS_RAW = `
GRU|São Paulo|-23.43|-46.47
EZE|Buenos Aires|-34.82|-58.54
SCL|Santiago|-33.39|-70.79
LIM|Lima|-12.02|-77.11
BOG|Bogotá|4.70|-74.15
PTY|Cidade do Panamá|9.07|-79.38
MEX|Cidade do México|19.44|-99.07
MIA|Miami|25.80|-80.29
ATL|Atlanta|33.64|-84.43
JFK|Nova York|40.64|-73.78
DFW|Dallas|32.90|-97.04
LAX|Los Angeles|33.94|-118.41
YYZ|Toronto|43.68|-79.63
LHR|Londres|51.47|-0.45
CDG|Paris|49.01|2.55
AMS|Amsterdã|52.31|4.76
FRA|Frankfurt|50.04|8.56
MAD|Madri|40.47|-3.56
LIS|Lisboa|38.77|-9.13
IST|Istambul|41.26|28.74
CMN|Casablanca|33.37|-7.59
CAI|Cairo|30.12|31.41
ADD|Adis Abeba|8.98|38.80
NBO|Nairóbi|-1.32|36.93
LOS|Lagos|6.58|3.32
JNB|Joanesburgo|-26.14|28.24
DXB|Dubai|25.25|55.36
DOH|Doha|25.27|51.61
DEL|Nova Délhi|28.56|77.10
BOM|Mumbai|19.09|72.87
BKK|Bangkok|13.69|100.75
SIN|Singapura|1.36|103.99
HKG|Hong Kong|22.31|113.92
PEK|Pequim|40.08|116.58
PVG|Xangai|31.14|121.81
ICN|Seul|37.46|126.44
NRT|Tóquio|35.77|140.39
SYD|Sydney|-33.94|151.18
AKL|Auckland|-37.01|174.79
HNL|Honolulu|21.32|-157.92
NAN|Nadi|-17.76|177.44`;

const HUBS = HUBS_RAW.trim().split('\n').map(function(l){
  var p=l.split('|'),lat=+p[2],lng=+p[3],r=Math.PI/180;
  return {cod:p[0],cidade:p[1],lat:lat,lng:lng,
    x:Math.cos(lat*r)*Math.sin(lng*r),y:Math.sin(lat*r),z:Math.cos(lat*r)*Math.cos(lng*r)};
});

/* aeroporto principal que atende cada capital (código IATA, por código do país); lugares sem aeroporto
   próprio usam o mais perto (Vaticano → FCO, Mônaco → NCE…); sem código = sem aeroporto por perto */
const AEROPORTO_DA_CAPITAL = {
BR:'BSB',GF:'CAY',SR:'PBM',GY:'GEO',VE:'CCS',CO:'BOG',EC:'UIO',PE:'LIM',BO:'LPB',CL:'SCL',AR:'EZE',PY:'ASU',UY:'MVD',
PA:'PTY',CR:'SJO',NI:'MGA',HN:'XPL',SV:'SAL',GT:'GUA',BZ:'BZE',CU:'HAV',JM:'KIN',BS:'NAS',HT:'PAP',DO:'SDQ',KN:'SKB',
AG:'ANU',DM:'DOM',LC:'SLU',VC:'SVD',BB:'BGI',GD:'GND',TT:'POS',MX:'MEX',US:'IAD',CA:'YOW',
ZA:'JNB',LS:'MSU',SZ:'SHO',BW:'GBE',NA:'WDH',ZM:'LUN',ZW:'HRE',MZ:'MPM',MG:'TNR',MU:'MRU',SC:'SEZ',KM:'HAH',MW:'LLW',
TZ:'DOD',BI:'BJM',RW:'KGL',UG:'EBB',KE:'NBO',SO:'MGQ',XS:'HGA',DJ:'JIB',ER:'ASM',ET:'ADD',SS:'JUB',AO:'NBJ',CD:'FIH',
CG:'BZV',GA:'LBV',ST:'TMS',GQ:'SSG',CM:'NSI',CF:'BGF',TD:'NDJ',NE:'NIM',NG:'ABV',BJ:'COO',TG:'LFW',BF:'OUA',GH:'ACC',
CI:'ASK',LR:'ROB',SL:'FNA',GN:'CKY',GW:'OXB',GM:'BJL',SN:'DSS',CV:'RAI',MR:'NKC',ML:'BKO',EH:'EUN',MA:'RBA',DZ:'ALG',
TN:'TUN',LY:'MJI',EG:'CAI',SD:'KRT',
PT:'LIS',ES:'MAD',AD:'LEU',MC:'NCE',SM:'RMI',IT:'FCO',VA:'FCO',MT:'MLA',GR:'ATH',TR:'ESB',FR:'CDG',IE:'DUB',GB:'LHR',
NL:'AMS',BE:'BRU',DE:'BER',LU:'LUX',LI:'ZRH',CH:'BRN',AT:'VIE',IS:'KEF',DK:'CPH',SE:'ARN',NO:'OSL',FI:'HEL',EE:'TLL',
LV:'RIX',LT:'VNO',RU:'SVO',BY:'MSQ',PL:'WAW',CZ:'PRG',SK:'BTS',HU:'BUD',SI:'LJU',HR:'ZAG',BA:'SJJ',ME:'TGD',XK:'PRN',
AL:'TIA',CY:'LCA',XN:'ECN',MK:'SKP',RS:'BEG',RO:'OTP',BG:'SOF',MD:'RMO',XT:'RMO',UA:'KBP',XA:'SUI',GE:'TBS',AM:'EVN',
AZ:'GYD',SY:'DAM',LB:'BEY',PS:'AMM',IL:'TLV',JO:'AMM',SA:'RUH',YE:'SAH',OM:'MCT',AE:'AUH',QA:'DOH',BH:'BAH',KW:'KWI',
IQ:'BGW',IR:'IKA',AF:'KBL',KZ:'NQZ',UZ:'TAS',TM:'ASB',KG:'FRU',TJ:'DYU',PK:'ISB',IN:'DEL',MV:'MLE',LK:'CMB',BD:'DAC',
BT:'PBH',NP:'KTM',MN:'UBN',CN:'PEK',KP:'FNJ',KR:'ICN',JP:'HND',TW:'TPE',MM:'NYT',TH:'BKK',LA:'VTE',VN:'HAN',KH:'KTI',
MY:'KUL',SG:'SIN',ID:'CGK',BN:'BWN',PH:'MNL',TL:'DIL',
AU:'CBR',NZ:'WLG',PG:'POM',SB:'HIR',VU:'VLI',FJ:'SUV',PW:'ROR',FM:'PNI',MH:'MAJ',NR:'INU',KI:'TRW',TV:'FUN',WS:'APW',TO:'TBU',
PR:'SJU',VI:'STT',VG:'EIS',AI:'AXA',MS:'MNI',KY:'GCM',TC:'GDT',AW:'AUA',CW:'CUR',SX:'SXM',BQ:'BON',GP:'PTP',MQ:'FDF',
MF:'SFG',BL:'SBH',BM:'BDA',GL:'GOH',PM:'FSP',FK:'MPN',RE:'RUN',YT:'DZA',SH:'HLE',GI:'GIB',FO:'FAE',IM:'IOM',JE:'JER',
GG:'GCI',AX:'MHQ',SJ:'LYR',HK:'HKG',MO:'MFM',GU:'GUM',MP:'SPN',AS:'PPG',PF:'PPT',NC:'NOU',WF:'WLS',CK:'RAR',NU:'IUE',
NF:'NLK',CX:'XCH',CC:'CCK'
};

export { AEROPORTO_DA_CAPITAL, HUBS };
