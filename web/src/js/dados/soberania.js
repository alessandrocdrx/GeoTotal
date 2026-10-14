/**
 * @arquivo js/dados/soberania.js
 * Camada: Dados
 * De quem é cada território dependente ou desabitado (código do país soberano), para o cartão mostrar
 * logo de cara "Dependente de 🇩🇰 Dinamarca". REIVINDICA = partes da Antártida (só reivindicações).
 */

const SOBERANO = {
  PR:'US',VI:'US',GU:'US',MP:'US',AS:'US',UM:'US',
  VG:'GB',AI:'GB',MS:'GB',KY:'GB',TC:'GB',BM:'GB',FK:'GB',SH:'GB',GI:'GB',IM:'GB',JE:'GB',GG:'GB',PN:'GB',QU:'GB',IO:'GB',GS:'GB',QN:'GB',
  AW:'NL',CW:'NL',SX:'NL',BQ:'NL',
  GP:'FR',MQ:'FR',MF:'FR',BL:'FR',PM:'FR',RE:'FR',YT:'FR',PF:'FR',NC:'FR',WF:'FR',CP:'FR',TF:'FR',
  GL:'DK',FO:'DK',AX:'FI',SJ:'NO',QT:'NO',BV:'NO',QO:'NO',QP:'NO',
  HK:'CN',MO:'CN',
  CK:'NZ',NU:'NZ',TK:'NZ',QQ:'NZ',
  NF:'AU',CX:'AU',CC:'AU',QR:'AU',QS:'AU',HM:'AU',QM:'AU',
};
const REIVINDICA = {QN:1,QO:1,QM:1,QQ:1,QP:1};
const ASSOCIADO = {CK:1,NU:1};
const REGIAO_ESPECIAL = {HK:1,MO:1};

/** Texto curto: "Dependente de", "Reivindicado por"… (o país vem depois). */
function relacaoSoberana(cc){
  if(REIVINDICA[cc])return 'Reivindicado por';
  if(ASSOCIADO[cc])return 'Associado à';
  if(REGIAO_ESPECIAL[cc])return 'Região especial da';
  return 'Dependente de';
}

export { relacaoSoberana, SOBERANO };
