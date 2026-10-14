// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
// Gera web/src/js/dados/regioes-naturais.js a partir do Natural Earth (domínio público):
// desertos, cordilheiras e planaltos (ne_50m_geography_regions_polys) e mares, golfos, baías e
// estreitos (ne_50m_geography_marine_polys), simplificados para caber no app, mais as florestas
// principais, desenhadas à mão aqui embaixo (o Natural Earth não tem florestas; no mapa elas são
// recortadas pela terra, então o contorno no mar não aparece). Para cada área calcula o tamanho
// em km² e os países que ela cobre (terra) ou banha (mar), com ne_50m_admin_0_countries.
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

/* ---------- países (para saber quem a área cobre ou banha) ---------- */
function dentroAnel(x, y, r) { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const xi = r[i][0], yi = r[i][1], xj = r[j][0], yj = r[j][1]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c; } return c; }
function poligonos(geom) { return geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates; }
function dentroGeom(polys, x, y) {
  for (const p of polys) { if (dentroAnel(x, y, p[0])) { let buraco = false; for (let h = 1; h < p.length; h++) if (dentroAnel(x, y, p[h])) buraco = true; if (!buraco) return true; } }
  return false;
}
function caixa(polys) { let a = 180, b = 90, c = -180, d = -90; for (const p of polys) for (const [x, y] of p[0]) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return [a, b, c, d]; }
const CODIGO_ESPECIAL = { 'Somaliland': 'XS', 'N. Cyprus': 'XN', 'Kosovo': 'XK' };
const PAISES = JSON.parse(readFileSync(join(pasta, 'ne_50m_admin_0_countries.geojson'), 'utf8')).features.map((f) => {
  const p = f.properties, cc = CODIGO_ESPECIAL[p.NAME] || (p.ISO_A2 !== '-99' ? p.ISO_A2 : p.ISO_A2_EH);
  const polys = poligonos(f.geometry);
  return { cc, polys, cx: caixa(polys) };
}).filter((p) => p.cc && p.cc !== '-99');
function paisEm(x, y) {
  for (const p of PAISES) if (x >= p.cx[0] && x <= p.cx[2] && y >= p.cx[1] && y <= p.cx[3] && dentroGeom(p.polys, x, y)) return p.cc;
  return null;
}
/* área na esfera (km²) */
function areaKm2(polys) {
  const R = 6371, rad = Math.PI / 180; let total = 0;
  for (const p of polys) p.forEach((anel, k) => {
    let s = 0; for (let i = 0; i < anel.length - 1; i++) { const [x1, y1] = anel[i], [x2, y2] = anel[i + 1]; s += (x2 - x1) * rad * (2 + Math.sin(y1 * rad) + Math.sin(y2 * rad)); }
    total += (k === 0 ? 1 : -1) * Math.abs(s * R * R / 2);
  });
  return Math.round(total);
}
/* países cobertos (terra): pontos de uma grade dentro da área */
function paisesCobertos(polys) {
  const cx = caixa(polys), passo = Math.max(0.1, Math.sqrt((cx[2] - cx[0]) * (cx[3] - cx[1])) / 45), cont = {};
  let n = 0;
  for (let y = cx[1] + passo / 2; y < cx[3]; y += passo) for (let x = cx[0] + passo / 2; x < cx[2]; x += passo) {
    if (!dentroGeom(polys, x, y)) continue; n++;
    const c = paisEm(x, y); if (c) cont[c] = (cont[c] || 0) + 1;
  }
  return Object.keys(cont).filter((c) => cont[c] >= Math.max(1, n * 0.02)).sort((a, b) => cont[b] - cont[a]);
}
/* países banhados (mar): terra logo ao lado da borda do mar */
function paisesBanhados(polys) {
  const cont = {}, d = 0.3;
  for (const p of polys) for (const anel of p) for (let i = 0; i < anel.length; i += 2) {
    const [x, y] = anel[i];
    for (const [dx, dy] of [[d, 0], [-d, 0], [0, d], [0, -d]]) { const c = paisEm(x + dx, y + dy); if (c) cont[c] = (cont[c] || 0) + 1; }
  }
  return Object.keys(cont).filter((c) => cont[c] >= 2).sort((a, b) => cont[b] - cont[a]);
}
/* onde escrever o nome: o ponto da área mais longe da borda (busca em grade) */
function pontoDoNome(polys) {
  let maior = null, ma = 0; for (const p of polys) { const a = area(p[0]); if (a > ma) { ma = a; maior = p; } }
  const cx = caixa([maior]), passo = Math.max(0.05, Math.max(cx[2] - cx[0], cx[3] - cx[1]) / 40);
  let melhor = centro(maior[0]), dist = -1;
  for (let y = cx[1]; y <= cx[3]; y += passo) for (let x = cx[0]; x <= cx[2]; x += passo) {
    if (!dentroGeom([maior], x, y)) continue;
    let m = Infinity; for (const anel of maior) for (const [vx, vy] of anel) { const dd = (vx - x) * (vx - x) + (vy - y) * (vy - y); if (dd < m) m = dd; }
    if (m > dist) { dist = m; melhor = [r1(x), r1(y)]; }
  }
  return melhor;
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
  const polys = poligonos(f.geometry), pn = pontoDoNome(polys);
  itens.push([t, NOMES[p.NAME] || p.NAME_PT || p.NAME, p.SCALERANK <= 2 ? 1 : 2, pn[0], pn[1], areaKm2(polys), paisesCobertos(polys), c.polys]);
}

/* mares, golfos, baías, estreitos (oceanos ficam só com o nome; rios ficam de fora) */
const NOMES_MAR = {
  'Caribbean Sea': 'Mar do Caribe', 'Greenland Sea': 'Mar da Groenlândia', 'Arabian Sea': 'Mar da Arábia',
  'Inner Sea': 'Mar Interior de Seto', 'Viscount Melville Sound': 'Estreito Visconde Melville', 'Gulf of Honduras': 'Golfo de Honduras',
  'Inner Seas': 'Mar das Hébridas', 'Shelikhova Gulf': 'Golfo de Shelikhov', 'Bo Hai': 'Mar de Bohai',
};
const TIPO_MAR = { sea: 'mar', gulf: 'golfo', bay: 'baía', strait: 'estreito', channel: 'canal', sound: 'estreito', reef: 'recife' };
const vistos = new Set();
const mar = JSON.parse(readFileSync(join(pasta, 'ne_50m_geography_marine_polys.geojson'), 'utf8'));
for (const f of mar.features) {
  const p = f.properties, k = TIPO_MAR[p.featurecla];
  if (!k || p.scalerank > 4 || !f.geometry) continue;
  const nome = NOMES_MAR[p.name] || (p.name_pt ? p.name_pt[0].toUpperCase() + p.name_pt.slice(1) : p.name);
  if (vistos.has(nome)) continue; vistos.add(nome);
  const c = compactar(f.geometry, 0.1, 0.02);
  if (!c.polys.length) continue;
  const polys = poligonos(f.geometry), pn = pontoDoNome(polys);
  itens.push(['w', nome, p.scalerank <= 2 ? 1 : 2, pn[0], pn[1], areaKm2(polys), paisesBanhados(polys), c.polys, k]);
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
  const pn = pontoDoNome([[anel]]);
  itens.push(['f', nome, nivel, pn[0], pn[1], areaKm2([[anel]]), paisesCobertos([[anel]]), [[orientar(anel, true).flat()]]]);
}

const js = `/**
 * @arquivo js/dados/regioes-naturais.js
 * Camada: Dados
 * Gerado por scripts/gerar-geografia.mjs — não edite à mão.
 * Desertos (d), cordilheiras (m), planaltos (p) e mares/golfos/baías/estreitos (w) do Natural Earth
 * (domínio público) e florestas (f) com contorno aproximado. Cada item: [tipo, nome, nível, lng do nome,
 * lat do nome, área em km², países (código), polígonos, espécie de água], polígonos = [[anel], …] e
 * anel = [lng, lat, lng, lat, …]. A área das florestas é aproximada como o contorno.
 */

const REGIOES_RAW = ${JSON.stringify(itens)};

/** Converte para o formato GeoJSON que o desenho das fronteiras já entende. */
const REGIOES = REGIOES_RAW.map(function(r){
  var polys=r[7].map(function(p){return p.map(function(a){var o=[];for(var k=0;k<a.length;k+=2)o.push([a[k],a[k+1]]);return o;});});
  var lat=r[4]*Math.PI/180,lng=r[3]*Math.PI/180;
  var cx=[180,90,-180,-90];polys.forEach(function(p){p[0].forEach(function(c){cx[0]=Math.min(cx[0],c[0]);cx[1]=Math.min(cx[1],c[1]);cx[2]=Math.max(cx[2],c[0]);cx[3]=Math.max(cx[3],c[1]);});});
  return {type:'Feature',tipo:r[0],nome:r[1],nivel:r[2],lng:r[3],lat:r[4],area:r[5],paises:r[6],especie:r[8]||'',caixa:cx,
    x:Math.cos(lat)*Math.sin(lng),y:Math.sin(lat),z:Math.cos(lat)*Math.cos(lng),
    geometry:{type:'MultiPolygon',coordinates:polys}};
});

export { REGIOES };
`;
writeFileSync(new URL('../web/src/js/dados/regioes-naturais.js', import.meta.url), js);
const cont = {}; itens.forEach((i) => { cont[i[0]] = (cont[i[0]] || 0) + 1; });
console.log('regioes-naturais.js:', itens.length, 'itens', cont, Math.round(js.length / 1024) + ' KB');
