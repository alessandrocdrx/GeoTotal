/**
 * @arquivo js/nucleo/hora.js
 * Camada: Núcleo
 * Hora oficial agora em cada país (fuso da capital) e em cada estado do Brasil, comparada a Brasília.
 */

/*
 * Usa o banco de fusos do próprio aparelho (Intl, com horário de verão), sem internet. A tabela diz
 * qual fuso vale na capital de cada país; onde não há fuso oficial (ilhas desabitadas), usa o
 * deslocamento "UTC±N" escrito nos dados do país.
 */

const FUSO_PAIS = {
  BR:'America/Sao_Paulo',GF:'America/Cayenne',SR:'America/Paramaribo',GY:'America/Guyana',VE:'America/Caracas',CO:'America/Bogota',EC:'America/Guayaquil',PE:'America/Lima',BO:'America/La_Paz',CL:'America/Santiago',AR:'America/Argentina/Buenos_Aires',PY:'America/Asuncion',UY:'America/Montevideo',
  PA:'America/Panama',CR:'America/Costa_Rica',NI:'America/Managua',HN:'America/Tegucigalpa',SV:'America/El_Salvador',GT:'America/Guatemala',BZ:'America/Belize',CU:'America/Havana',JM:'America/Jamaica',BS:'America/Nassau',HT:'America/Port-au-Prince',DO:'America/Santo_Domingo',KN:'America/St_Kitts',AG:'America/Antigua',DM:'America/Dominica',LC:'America/St_Lucia',VC:'America/St_Vincent',BB:'America/Barbados',GD:'America/Grenada',TT:'America/Port_of_Spain',
  MX:'America/Mexico_City',US:'America/New_York',CA:'America/Toronto',
  ZA:'Africa/Johannesburg',LS:'Africa/Maseru',SZ:'Africa/Mbabane',BW:'Africa/Gaborone',NA:'Africa/Windhoek',ZM:'Africa/Lusaka',ZW:'Africa/Harare',MZ:'Africa/Maputo',MG:'Indian/Antananarivo',MU:'Indian/Mauritius',SC:'Indian/Mahe',KM:'Indian/Comoro',MW:'Africa/Blantyre',TZ:'Africa/Dar_es_Salaam',BI:'Africa/Bujumbura',RW:'Africa/Kigali',UG:'Africa/Kampala',KE:'Africa/Nairobi',SO:'Africa/Mogadishu',DJ:'Africa/Djibouti',ER:'Africa/Asmara',ET:'Africa/Addis_Ababa',SS:'Africa/Juba',
  AO:'Africa/Luanda',CD:'Africa/Kinshasa',CG:'Africa/Brazzaville',GA:'Africa/Libreville',ST:'Africa/Sao_Tome',GQ:'Africa/Malabo',CM:'Africa/Douala',CF:'Africa/Bangui',TD:'Africa/Ndjamena',NE:'Africa/Niamey',NG:'Africa/Lagos',BJ:'Africa/Porto-Novo',TG:'Africa/Lome',BF:'Africa/Ouagadougou',GH:'Africa/Accra',CI:'Africa/Abidjan',LR:'Africa/Monrovia',SL:'Africa/Freetown',GN:'Africa/Conakry',GW:'Africa/Bissau',GM:'Africa/Banjul',SN:'Africa/Dakar',CV:'Atlantic/Cape_Verde',MR:'Africa/Nouakchott',ML:'Africa/Bamako',
  EH:'Africa/El_Aaiun',MA:'Africa/Casablanca',DZ:'Africa/Algiers',TN:'Africa/Tunis',LY:'Africa/Tripoli',EG:'Africa/Cairo',SD:'Africa/Khartoum',
  PT:'Europe/Lisbon',ES:'Europe/Madrid',AD:'Europe/Andorra',MC:'Europe/Monaco',SM:'Europe/San_Marino',IT:'Europe/Rome',VA:'Europe/Vatican',MT:'Europe/Malta',GR:'Europe/Athens',TR:'Europe/Istanbul',
  FR:'Europe/Paris',IE:'Europe/Dublin',GB:'Europe/London',NL:'Europe/Amsterdam',BE:'Europe/Brussels',DE:'Europe/Berlin',LU:'Europe/Luxembourg',LI:'Europe/Vaduz',CH:'Europe/Zurich',AT:'Europe/Vienna',IS:'Atlantic/Reykjavik',DK:'Europe/Copenhagen',SE:'Europe/Stockholm',NO:'Europe/Oslo',FI:'Europe/Helsinki',EE:'Europe/Tallinn',LV:'Europe/Riga',LT:'Europe/Vilnius',
  RU:'Europe/Moscow',BY:'Europe/Minsk',PL:'Europe/Warsaw',CZ:'Europe/Prague',SK:'Europe/Bratislava',HU:'Europe/Budapest',SI:'Europe/Ljubljana',HR:'Europe/Zagreb',BA:'Europe/Sarajevo',ME:'Europe/Podgorica',AL:'Europe/Tirane',CY:'Asia/Nicosia',MK:'Europe/Skopje',RS:'Europe/Belgrade',RO:'Europe/Bucharest',BG:'Europe/Sofia',MD:'Europe/Chisinau',UA:'Europe/Kyiv',GE:'Asia/Tbilisi',AM:'Asia/Yerevan',AZ:'Asia/Baku',
  SY:'Asia/Damascus',LB:'Asia/Beirut',PS:'Asia/Gaza',IL:'Asia/Jerusalem',JO:'Asia/Amman',SA:'Asia/Riyadh',YE:'Asia/Aden',OM:'Asia/Muscat',AE:'Asia/Dubai',QA:'Asia/Qatar',BH:'Asia/Bahrain',KW:'Asia/Kuwait',IQ:'Asia/Baghdad',IR:'Asia/Tehran',AF:'Asia/Kabul',KZ:'Asia/Almaty',UZ:'Asia/Tashkent',TM:'Asia/Ashgabat',KG:'Asia/Bishkek',TJ:'Asia/Dushanbe',
  PK:'Asia/Karachi',IN:'Asia/Kolkata',MV:'Indian/Maldives',LK:'Asia/Colombo',BD:'Asia/Dhaka',BT:'Asia/Thimphu',NP:'Asia/Kathmandu',MN:'Asia/Ulaanbaatar',CN:'Asia/Shanghai',KP:'Asia/Pyongyang',KR:'Asia/Seoul',JP:'Asia/Tokyo',TW:'Asia/Taipei',MM:'Asia/Yangon',TH:'Asia/Bangkok',LA:'Asia/Vientiane',VN:'Asia/Ho_Chi_Minh',KH:'Asia/Phnom_Penh',MY:'Asia/Kuala_Lumpur',SG:'Asia/Singapore',ID:'Asia/Jakarta',BN:'Asia/Brunei',PH:'Asia/Manila',TL:'Asia/Dili',
  AU:'Australia/Sydney',NZ:'Pacific/Auckland',PG:'Pacific/Port_Moresby',SB:'Pacific/Guadalcanal',VU:'Pacific/Efate',FJ:'Pacific/Fiji',PW:'Pacific/Palau',FM:'Pacific/Pohnpei',MH:'Pacific/Majuro',NR:'Pacific/Nauru',KI:'Pacific/Tarawa',TV:'Pacific/Funafuti',WS:'Pacific/Apia',TO:'Pacific/Tongatapu',
  PR:'America/Puerto_Rico',VI:'America/St_Thomas',VG:'America/Tortola',AI:'America/Anguilla',MS:'America/Montserrat',KY:'America/Cayman',TC:'America/Grand_Turk',AW:'America/Aruba',CW:'America/Curacao',SX:'America/Lower_Princes',BQ:'America/Kralendijk',GP:'America/Guadeloupe',MQ:'America/Martinique',MF:'America/Marigot',BL:'America/St_Barthelemy',BM:'Atlantic/Bermuda',GL:'America/Nuuk',PM:'America/Miquelon',FK:'Atlantic/Stanley',
  RE:'Indian/Reunion',YT:'Indian/Mayotte',SH:'Atlantic/St_Helena',GI:'Europe/Gibraltar',FO:'Atlantic/Faroe',IM:'Europe/Isle_of_Man',JE:'Europe/Jersey',GG:'Europe/Guernsey',AX:'Europe/Mariehamn',SJ:'Arctic/Longyearbyen',HK:'Asia/Hong_Kong',MO:'Asia/Macau',
  GU:'Pacific/Guam',MP:'Pacific/Saipan',AS:'Pacific/Pago_Pago',PF:'Pacific/Tahiti',NC:'Pacific/Noumea',WF:'Pacific/Wallis',CK:'Pacific/Rarotonga',NU:'Pacific/Niue',TK:'Pacific/Fakaofo',NF:'Pacific/Norfolk',PN:'Pacific/Pitcairn',CX:'Indian/Christmas',CC:'Indian/Cocos',IO:'Indian/Chagos',GS:'Atlantic/South_Georgia',TF:'Indian/Kerguelen',
  XK:'Europe/Belgrade',XN:'Asia/Nicosia',XS:'Africa/Mogadishu',XT:'Europe/Chisinau',XA:'Europe/Moscow',XO:'Europe/Moscow',
};
const FUSO_ESTADO = {
  AC:'America/Rio_Branco',AM:'America/Manaus',RR:'America/Boa_Vista',RO:'America/Porto_Velho',MT:'America/Cuiaba',MS:'America/Campo_Grande',
  PA:'America/Belem',AP:'America/Belem',TO:'America/Araguaina',MA:'America/Fortaleza',PI:'America/Fortaleza',CE:'America/Fortaleza',RN:'America/Fortaleza',PB:'America/Fortaleza',PE:'America/Recife',AL:'America/Maceio',SE:'America/Maceio',BA:'America/Bahia',
};
const BRASILIA = 'America/Sao_Paulo';

/** Minutos de diferença entre o fuso e o UTC agora (com horário de verão). */
function deslocamento(fuso,agora){
  try{
    var p={};new Intl.DateTimeFormat('en-US',{timeZone:fuso,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric'}).formatToParts(agora).forEach(function(x){p[x.type]=+x.value;});
    var local=Date.UTC(p.year,p.month-1,p.day,p.hour%24,p.minute);
    return Math.round((local-Math.floor(agora.getTime()/6e4)*6e4)/6e4);
  }catch(e){return null;}
}
/** "UTC−3 (de −2 a −5)" → −180 (o primeiro número). */
function deslocamentoDoTexto(tz){
  var m=/UTC\s*([+−-])\s*(\d+)(?::(\d+))?/.exec(tz||'');
  if(!m)return /UTC/.test(tz||'')?0:null;
  var v=(+m[2])*60+(+(m[3]||0));return m[1]==='+'?v:-v;
}
function fmtHora(min){var h=Math.floor(((min%1440)+1440)%1440/60),m=((min%60)+60)%60;return h+'h'+(m<10?'0':'')+m;}
function fmtDif(d){
  if(d===0)return 'mesma hora de Brasília';
  var s=d>0?'+':'−',a=Math.abs(d),h=Math.floor(a/60),m=a%60;
  return s+h+'h'+(m?(m<10?'0':'')+m:'')+' em relação a Brasília';
}
/**
 * Hora oficial agora: { hora: "14h35", dif: "+4h em relação a Brasília", dia: "amanhã" | "ontem" | "" }.
 * cc = código do país ou "BR-XX" para estado; tz = texto de fuso dos dados (reserva).
 */
function horaAgora(cc,tz){
  var agora=new Date(),fuso=null;
  if(/^BR-/.test(cc))fuso=FUSO_ESTADO[cc.slice(3)]||BRASILIA;else fuso=FUSO_PAIS[cc]||null;
  var off=fuso?deslocamento(fuso,agora):null;
  if(off==null)off=deslocamentoDoTexto(tz);
  var bsb=deslocamento(BRASILIA,agora);
  if(off==null||bsb==null)return null;
  var utc=agora.getUTCHours()*60+agora.getUTCMinutes(),ali=utc+off,aqui=utc+bsb;
  var dd=Math.floor(ali/1440)-Math.floor(aqui/1440);
  return {hora:fmtHora(ali),dif:fmtDif(off-bsb),dia:dd>0?'amanhã':dd<0?'ontem':''};
}

export { horaAgora };
