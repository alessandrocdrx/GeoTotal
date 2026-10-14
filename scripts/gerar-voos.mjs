// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
// Gera web/src/js/dados/voos.js com as rotas aéreas entre as capitais, a partir do OpenFlights
// (https://openflights.org/data, licença Open Database License — ODbL 1.0). Os dados de rotas do
// OpenFlights são de 2014: mostram voos que existiam naquele ano, não os de hoje.
// Calcula, para cada par de capitais, o caminho com menos voos e, entre esses, o mais curto; guarda só
// os aeroportos e voos que aparecem nesses caminhos (o app refaz a conta com eles, bem menor).
// Uso: node scripts/gerar-voos.mjs <pasta com airports.dat e routes.dat>
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { AEROPORTO_DA_CAPITAL } from '../web/src/js/dados/aeroportos.js';

const pasta = process.argv[2];
if (!pasta) { console.error('uso: node scripts/gerar-voos.mjs <pasta>'); process.exit(1); }

function csv(l) { const o = []; let c = '', q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === ',' && !q) { o.push(c); c = ''; } else c += ch; } o.push(c); return o; }
const AER = {};
for (const l of readFileSync(join(pasta, 'airports.dat'), 'utf8').split('\n')) {
  if (!l) continue; const p = csv(l);
  if (p[4] && p[4] !== '\\N' && p[4].length === 3) AER[p[4]] = { cod: p[4], cidade: p[2], pais: p[3], lat: +p[6], lng: +p[7] };
}
const SAI = {};
for (const l of readFileSync(join(pasta, 'routes.dat'), 'utf8').split('\n')) {
  if (!l) continue; const p = l.split(',');
  if (p[7] !== '0' || !AER[p[2]] || !AER[p[4]] || p[2] === p[4]) continue;
  (SAI[p[2]] = SAI[p[2]] || new Set()).add(p[4]);
}
function km(a, b) { const r = Math.PI / 180, s = Math.sin((b.lat - a.lat) * r / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin((b.lng - a.lng) * r / 2) ** 2; return 12742 * Math.asin(Math.sqrt(s)); }

/* aeroporto que o OpenFlights conhece para cada capital: o mesmo código, ou (aeroporto novo, como o
   BER de Berlim) o que funcionava em 2014 na mesma cidade */
const TROCA = { BER: 'TXL', XPL: 'TGU', SHO: 'MTS', NBJ: 'LAD', DSS: 'DKR', MJI: 'TIP', RMO: 'KIV', NQZ: 'TSE', UBN: 'ULN', KTI: 'PNH' };
const usar = {};
for (const cod of Object.values(AEROPORTO_DA_CAPITAL)) {
  const c = TROCA[cod] || cod;
  if (SAI[c]) usar[cod] = c;
}
console.log('capitais sem rota no OpenFlights:', Object.values(AEROPORTO_DA_CAPITAL).filter((c) => !usar[c]).join(' '));

/* Dijkstra com custo (voos, km): menos voos primeiro; empate, menos km. Até 4 voos (3 escalas). */
function caminhos(orig) {
  const voos = { [orig]: 0 }, dist = { [orig]: 0 }, ant = {}, fila = [orig], feito = new Set();
  while (fila.length) {
    let bi = 0; for (let i = 1; i < fila.length; i++) { const a = fila[i], b = fila[bi]; if (voos[a] < voos[b] || (voos[a] === voos[b] && dist[a] < dist[b])) bi = i; }
    const u = fila.splice(bi, 1)[0]; if (feito.has(u)) continue; feito.add(u);
    if (voos[u] >= 4) continue;
    for (const v of SAI[u] || []) {
      const nv = voos[u] + 1, nd = dist[u] + km(AER[u], AER[v]);
      if (voos[v] === undefined || nv < voos[v] || (nv === voos[v] && nd < dist[v])) { voos[v] = nv; dist[v] = nd; ant[v] = u; fila.push(v); }
    }
  }
  return ant;
}
const usados = new Set(Object.values(usar)), arestas = new Set();
let pares = 0, semRota = 0;
for (const a of new Set(Object.values(usar))) {
  const ant = caminhos(a);
  for (const b of new Set(Object.values(usar))) {
    if (a === b) continue;
    if (!ant[b]) { semRota++; continue; }
    pares++;
    for (let x = b; x !== a; x = ant[x]) { usados.add(x); usados.add(ant[x]); arestas.add(ant[x] + '>' + x); }
  }
}
const lista = [...usados].sort(), idx = {}; lista.forEach((c, i) => { idx[c] = i; });
const b36 = (n) => n.toString(36).padStart(2, '0');
const tabela = lista.map((c) => [c, AER[c].cidade, AER[c].pais, Math.round(AER[c].lat * 100) / 100, Math.round(AER[c].lng * 100) / 100, [...arestas].filter((e) => e.startsWith(c + '>')).map((e) => b36(idx[e.slice(4)])).join('')].join('|'));
const capital = {}; for (const [cod, c] of Object.entries(usar)) if (cod !== c) capital[cod] = c;
const js = `/**
 * @arquivo js/dados/voos.js
 * Camada: Dados
 * Gerado por scripts/gerar-voos.mjs — não edite à mão.
 * Rotas aéreas segundo o OpenFlights (openflights.org), dados de 2014, licença Open Database License
 * (ODbL 1.0): só os aeroportos e voos que formam os melhores caminhos entre as capitais. Cada linha:
 * código|cidade|país (em inglês, como no OpenFlights)|lat|lng|destinos (índices em base 36, 2 letras).
 * Pode haver rotas que não existem mais e rotas novas que faltam.
 */

const AEROPORTOS_RAW = ${JSON.stringify(tabela.join('\n'))};

/* aeroporto novo da capital → o que funcionava em 2014 na mesma cidade (ex.: BER → TXL em Berlim) */
const EM_2014 = ${JSON.stringify(capital)};

const AEROPORTOS = {}, LISTA = [];
AEROPORTOS_RAW.split('\\n').forEach(function(l){
  var p=l.split('|'),a={cod:p[0],cidade:p[1],pais:p[2],lat:+p[3],lng:+p[4],sai:[]};
  for(var k=0;k<p[5].length;k+=2)a.sai.push(parseInt(p[5].slice(k,k+2),36));
  AEROPORTOS[p[0]]=a;LISTA.push(a);
});
function km(a,b){var r=Math.PI/180,s=Math.pow(Math.sin((b.lat-a.lat)*r/2),2)+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.pow(Math.sin((b.lng-a.lng)*r/2),2);return 12742*Math.asin(Math.sqrt(s));}

/**
 * Escalas de um aeroporto de capital a outro, pelos voos do OpenFlights: lista de aeroportos de
 * escala ([] = voo direto), ou null quando não há dado. Menos voos primeiro; empate, menos km.
 */
function escalasOpenFlights(de,para){
  var a=AEROPORTOS[EM_2014[de]||de],b=AEROPORTOS[EM_2014[para]||para];
  if(!a||!b||a===b)return null;
  var n=LISTA.length,voos=[],dist=[],ant=[],feito=[],k;
  for(k=0;k<n;k++){voos[k]=Infinity;dist[k]=Infinity;ant[k]=-1;}
  var ia=LISTA.indexOf(a),ib=LISTA.indexOf(b);voos[ia]=0;dist[ia]=0;
  for(;;){
    var u=-1;
    for(k=0;k<n;k++)if(!feito[k]&&voos[k]<Infinity&&(u<0||voos[k]<voos[u]||(voos[k]===voos[u]&&dist[k]<dist[u])))u=k;
    if(u<0||u===ib)break;feito[u]=1;
    if(voos[u]>=4)continue;
    LISTA[u].sai.forEach(function(v){
      var nv=voos[u]+1,nd=dist[u]+km(LISTA[u],LISTA[v]);
      if(nv<voos[v]||(nv===voos[v]&&nd<dist[v])){voos[v]=nv;dist[v]=nd;ant[v]=u;}
    });
  }
  if(voos[ib]===Infinity)return null;
  var via=[];for(k=ant[ib];k!==ia;k=ant[k])via.unshift(LISTA[k]);
  return via;
}

export { AEROPORTOS, escalasOpenFlights };
`;
writeFileSync(new URL('../web/src/js/dados/voos.js', import.meta.url), js);
console.log('voos.js:', pares, 'pares com rota,', semRota, 'sem rota,', lista.length, 'aeroportos,', arestas.size, 'voos,', Math.round(js.length / 1024) + ' KB');
