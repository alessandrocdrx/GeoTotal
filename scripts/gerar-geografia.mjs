// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
// Gera web/src/js/dados/regioes-naturais.js a partir do Natural Earth (domínio público):
// desertos, cordilheiras e planaltos (ne_50m_geography_regions_polys), simplificados para caber
// no app, mais as florestas principais, desenhadas à mão aqui embaixo (o Natural Earth não tem
// florestas; no mapa elas são recortadas pela terra, então o contorno no mar não aparece).
// Uso: node scripts/gerar-geografia.mjs <pasta com os .geojson do Natural Earth>
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const pasta = process.argv[2];
if (!pasta) { console.error('uso: node scripts/gerar-geografia.mjs <pasta>'); process.exit(1); }

/* Douglas-Peucker: tira pontos que mudam o contorno menos que tol graus */
function simplificar(pts, tol) {
  if (pts.length < 5) return pts;
  const manter = new Uint8Array(pts.length); manter[0] = manter[pts.length - 1] = 1;
  const pilha = [[0, pts.length - 1]];
  while (pilha.length) {
    const [a, b] = pilha.pop(); let max = 0, idx = -1;
    const [ax, ay] = pts[a], [bx, by] = pts[b], dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i];
      let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
      const ex = ax + t * dx - px, ey = ay + t * dy - py, d = ex * ex + ey * ey;
      if (d > max) { max = d; idx = i; }
    }
    if (max > tol * tol) { manter[idx] = 1; pilha.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => manter[i]);
}
const r1 = (v) => Math.round(v * 10) / 10;
/* área com sinal: positiva = anti-horário (lng para a direita, lat para cima) */
function areaSinal(anel) { let s = 0; for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) s += (anel[j][0] + anel[i][0]) * (anel[j][1] - anel[i][1]); return -s / 2; }
/* o d3 do globo quer a borda de fora no sentido horário e os buracos no anti-horário; ao contrário,
   ele entende "o mundo inteiro menos esta área" */
function orientar(anel, fora) { const ccw = areaSinal(anel) > 0; return ccw === fora ? anel.slice().reverse() : anel; }
function area(anel) { let s = 0; for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) s += (anel[j][0] + anel[i][0]) * (anel[j][1] - anel[i][1]); return Math.abs(s / 2); }
function centro(anel) {
  let a = 0, x = 0, y = 0;
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
    const f = anel[j][0] * anel[i][1] - anel[i][0] * anel[j][1];
    a += f; x += (anel[j][0] + anel[i][0]) * f; y += (anel[j][1] + anel[i][1]) * f;
  }
  return a ? [r1(x / (3 * a)), r1(y / (3 * a))] : [r1(anel[0][0]), r1(anel[0][1])];
}
/** Polígonos → [[anel plano lng,lat,…], …] por polígono; tira anéis minúsculos. */
function compactar(geom, tol, minArea) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const out = []; let maior = null, maiorA = 0;
  for (const p of polys) {
    const aneis = [];
    p.forEach((anel, k) => {
      const a = area(anel);
      if (a < minArea) return;
      if (k === 0 && a > maiorA) { maiorA = a; maior = anel; }
      const s = orientar(simplificar(anel, tol), k === 0);
      if (s.length >= 4) aneis.push(s.flatMap((c) => [r1(c[0]), r1(c[1])]));
    });
    if (aneis.length) out.push(aneis);
  }
  return { polys: out, rotulo: maior ? centro(maior) : null };
}

/* nomes em português do Brasil, quando o do Natural Earth não serve */
const NOMES = {
  'SAHARA': 'Deserto do Saara', 'HIMALAYAS': 'Himalaia', 'GREAT DIVIDING RANGE': 'Grande Cordilheira Divisória',
  'ANDES': 'Cordilheira dos Andes', 'CORD. CENTRAL': 'Cordilheira Central', 'RUB’ AL KHALI': 'Rub al-Khali (Quarteirão Vazio)',
  'KALAHARI DESERT': 'Deserto do Kalahari', 'TAKLIMAKAN DESERT': 'Deserto de Taklamakan', 'QIZILQUM DESERT': 'Deserto de Kyzylkum',
  'CAATINGAS': 'Caatinga (semiárido)', 'DECCAN PLATEAU': 'Planalto do Decão', 'Grand Erg Occidental': 'Grande Erg Ocidental',
  'GOBI DESERT': 'Deserto de Gobi', 'BETPAQDALA DESERT': 'Deserto de Betpak-Dala', 'CANADIAN SHIELD': 'Escudo Canadense',
  'ETHIOPIAN HIGHLANDS': 'Planalto da Etiópia', 'PLANALTO CENTRAL': 'Planalto Central', 'BRAZILIAN HIGHLANDS': 'Planalto Brasileiro',
  'Southern Ghats': 'Gates do Sul', 'LUT DESERT': 'Deserto de Lut', 'S. Nevada': 'Serra Nevada (Espanha)',
  'SIERRA NEVADA': 'Serra Nevada (EUA)', 'GUIANA HIGHLANDS': 'Planalto das Guianas', 'GUIANA SHIELD': 'Escudo das Guianas',
};
const FORA = new Set(['PUNJAB', 'PENÍNSULA IBÉRICA', 'Sarïr Kalanshiyu ar Ramli al Kabi', 'Superior Upland', 'Campos Sertão', 'Talos Dome',
  'Dome C (Charlie)', 'Dome A (Argus)', 'Dome F (Fuji)', 'American Highland', 'Hollick-Kenyon Plateau', 'Rockefeller Plateau']);
const TIPO = { 'Desert': 'd', 'Range/mtn': 'm', 'Plateau': 'p' };
const LIMITE = { d: 9, m: 4, p: 3 };   /* até que "scalerank" entra (desertos: todos) */

const itens = [];
const reg = JSON.parse(readFileSync(join(pasta, 'ne_50m_geography_regions_polys.geojson'), 'utf8'));
for (const f of reg.features) {
  const p = f.properties, t = TIPO[p.FEATURECLA];
  if (!t || p.SCALERANK > LIMITE[t] || FORA.has(p.NAME) || !f.geometry) continue;
  const c = compactar(f.geometry, 0.12, 0.05);
  if (!c.polys.length) continue;
  itens.push([t, NOMES[p.NAME] || p.NAME_PT || p.NAME, p.SCALERANK <= 2 ? 1 : 2, c.rotulo[0], c.rotulo[1], c.polys]);
}

/* florestas: contornos aproximados (o mapa recorta pela terra) — lng,lat */
const FLORESTAS = [
  ['Floresta Amazônica', 1, [-78,1,-75,4,-70,5,-66,6,-61,8,-58,7,-54,5,-51,4,-50,1,-48,-1,-44,-2.5,-46,-5,-48,-8,-50,-10,-53,-12,-57,-13,-61,-13.5,-64,-15,-66,-15,-68,-13.5,-70,-12.5,-73,-11,-75,-8,-76.5,-5,-78,-2.5]],
  ['Floresta do Congo', 1, [8.8,4,10,6,14,5.5,16,5,19,5,23,5.5,27,5,30,3.5,30.5,0,29.5,-3,28,-5,25,-6,21,-6.5,17,-5.5,13,-5,11.5,-3.5,9.3,-1,9.5,1.5]],
  ['Taiga (floresta boreal)', 1, [8,62,15,68,25,70,35,67,45,66.5,60,67,75,67,90,69,105,70,120,70,135,69,150,67,165,64,160,58,150,58,140,54,135,50,128,47,120,50,110,51,100,51,90,51,85,53,75,55,65,56,55,56,45,57,35,56,28,58,22,58,16,58,12,58.5]],
  ['Floresta Boreal da América do Norte', 1, [-165,63,-150,66,-140,67,-130,68,-118,67.5,-105,64,-95,60.5,-88,57,-80,57,-75,58,-68,58,-60,55,-56,52,-60,49,-66,48,-72,46.5,-78,46,-84,46.5,-92,48,-97,50,-103,52.5,-110,54,-115,55,-120,56,-125,57,-132,58,-140,60,-150,60,-160,59,-165,61]],
  ['Mata Atlântica', 2, [-35,-5.5,-35.5,-9,-38,-13,-39,-17,-40.5,-21,-42.5,-23.2,-46,-24,-48.5,-26.5,-49,-29.5,-50.5,-29.5,-52,-27,-54.5,-25.5,-53,-23,-50,-22,-47,-21,-44,-19,-42,-16,-40.5,-12,-38,-8]],
  ['Florestas de Bornéu', 2, [109,1.5,111,2.5,113.5,4,116,6.8,119,5,118,2,117.5,0,116.5,-2.5,114.5,-3.5,111,-3,110,-1.5]],
  ['Florestas de Sumatra', 2, [95.3,5.6,98,4,101,2,104,-1,106,-3,105.5,-6,103,-4.5,100,-1,97.5,2]],
  ['Florestas da Nova Guiné', 2, [131,-1,135,-3,138,-1.5,141,-2.5,145,-4,147.5,-6,150,-10.5,147,-9.5,143.5,-9,141,-9,138,-8.5,137,-5,133,-4]],
  ['Floresta Valdiviana', 2, [-74,-37,-72,-37,-71.5,-41,-72,-45,-73,-47.5,-75.5,-47.5,-74,-43,-74,-40]],
  ['Floresta Temperada do Pacífico', 2, [-136,59,-130,56,-124,49,-122,44,-123.5,40,-124.5,40,-124.5,44,-125,49,-130,54,-136,58.5,-140,60]],
  ['Florestas de Madagascar', 2, [49.5,-12.5,50.5,-15.5,49.5,-18,48.5,-21,47.5,-24.5,47,-25,46.5,-23,47.5,-19,48.5,-15,49,-13]],
];
for (const [nome, nivel, plano] of FLORESTAS) {
  const anel = []; for (let i = 0; i < plano.length; i += 2) anel.push([plano[i], plano[i + 1]]);
  anel.push(anel[0]);
  const c = centro(anel);
  itens.push(['f', nome, nivel, c[0], c[1], [[orientar(anel, true).flat()]]]);
}

const js = `/**
 * @arquivo js/dados/regioes-naturais.js
 * Camada: Dados
 * Gerado por scripts/gerar-geografia.mjs — não edite à mão.
 * Desertos (d), cordilheiras (m) e planaltos (p) do Natural Earth (domínio público) e florestas (f)
 * com contorno aproximado. Cada item: [tipo, nome, nível, lng do nome, lat do nome, polígonos],
 * polígonos = [[anel], …] e anel = [lng, lat, lng, lat, …].
 */

const REGIOES_RAW = ${JSON.stringify(itens)};

/** Converte para o formato GeoJSON que o desenho das fronteiras já entende. */
const REGIOES = REGIOES_RAW.map(function(r){
  var polys=r[5].map(function(p){return p.map(function(a){var o=[];for(var k=0;k<a.length;k+=2)o.push([a[k],a[k+1]]);return o;});});
  var lat=r[4]*Math.PI/180,lng=r[3]*Math.PI/180;
  return {type:'Feature',tipo:r[0],nome:r[1],nivel:r[2],lng:r[3],lat:r[4],
    x:Math.cos(lat)*Math.sin(lng),y:Math.sin(lat),z:Math.cos(lat)*Math.cos(lng),
    geometry:{type:'MultiPolygon',coordinates:polys}};
});

export { REGIOES };
`;
writeFileSync(new URL('../web/src/js/dados/regioes-naturais.js', import.meta.url), js);
const cont = {}; itens.forEach((i) => { cont[i[0]] = (cont[i[0]] || 0) + 1; });
console.log('regioes-naturais.js:', itens.length, 'itens', cont, Math.round(js.length / 1024) + ' KB');
