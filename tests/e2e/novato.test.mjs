// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
//
// Usuário leigo: quem nunca usou o app, não entende de Android nem de "navegação". Os testes só
// tocam no que aparece na tela, pelo nome escrito no botão (como a pessoa faria), e conferem:
// que em poucos toques ela já está jogando, que todo toque tem resposta clara, que toda tela tem
// saída à vista e fecha com o Voltar do celular, e que nenhum texto vem com lixo ("undefined",
// "NaN"), palavra técnica ou letra pequena demais.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { iniciarServidor, abrirApp as abrir } from './apoio.mjs';

let ambiente;
before(async () => { ambiente = await iniciarServidor(); });
after(async () => { await ambiente.encerrar(); });
const abrirApp = (opcoes) => abrir(ambiente, opcoes);

/** Toca no primeiro botão visível com esse nome (o texto escrito nele ou o nome para leitor de tela). */
async function tocar(pagina, nome) {
  const botao = pagina.getByRole('button', { name: nome }).filter({ visible: true }).first();
  await botao.click({ timeout: 4000 });
  await pagina.waitForTimeout(450);
}

/** Telas que a pessoa abre tocando, e o caminho de toques até cada uma. */
const MENU = 'Mais opções';
/* "O que aparece no mapa" (camadas) só aparece com "Mais botões na tela": o teste da tela simples cobre */
const TELAS = [
  ['Menu ⋯', [MENU]],
  ['Passaporte', [MENU, /Passaporte/]],
  ['Conquistas', [MENU, /Conquistas/]],
  ['Histórico', [MENU, /Histórico/]],
  ['Estados do Brasil', [MENU, /Estados do Brasil/]],
  ['Comparar países', [MENU, /Comparar países/]],
  ['Distância entre capitais', [MENU, /Distância entre capitais/]],
  ['Folha de estudo', [MENU, /Folha de estudo/]],
  ['Personalizar', [MENU, /Personalizar/]],
  ['Lugares no jogo', [MENU, /Lugares no jogo/]],
  ['Seus dados', [MENU, /Seus dados/]],
  ['Escolher o jogo', [/^🎮 Jogo/]],
  ['Escolher a região', [/^🗺️ Região/]],
  ['Ajustes da partida', ['Ajustes da partida']],
];

/** Botões que a pessoa reconhece como "sair daqui". */
const SAIDA = /voltar|fechar|entendi|pronto|concluir|^ok$|^←|^✕|^×/i;

/** Palavras que só quem programa entende (cada exceção diz por que pode ficar). */
const JARGAO = /\b(undefined|NaN|null|Infinity|\[object|WebGL|GeoJSON|JSON|IndexedDB|localStorage|WebView|API|SVG|HTTP|debug|bug)\b/;
const JARGAO_PERMITIDO = [];

/** Leitura da tela: botões de saída, textos com problema e letras pequenas, só no que está visível. */
function lerTela() {
  const visivel = (el) => {
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05 &&
      r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  };
  const saidas = [...document.querySelectorAll('button,[role=button]')].filter(visivel)
    .map((b) => (b.getAttribute('aria-label') || b.textContent).trim().replace(/\s+/g, ' '));
  const textos = [];
  const pequenas = [];
  const andar = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = andar.nextNode(); n; n = andar.nextNode()) {
    const t = n.textContent.trim();
    if (!t || !n.parentElement || !visivel(n.parentElement)) continue;
    const pai = n.parentElement;
    if (pai.closest('script,style,svg,canvas,[aria-hidden=true]')) continue;
    textos.push(t);
    const tam = parseFloat(getComputedStyle(pai).fontSize);
    if (tam > 0 && tam < 12 && /[a-zà-ú]{3}/i.test(t)) pequenas.push(`${t.slice(0, 40)} (${tam}px)`);
  }
  return { saidas, texto: textos.join(' | '), pequenas };
}

/** O que está aberto por cima do mapa: painéis grandes e visíveis (para saber se "voltou ao início"). */
function abertos() {
  return [...document.querySelectorAll('body *')].filter((el) => {
    const s = getComputedStyle(el);
    if (!(s.position === 'fixed' || s.position === 'absolute') || s.display === 'none' || s.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width * r.height > innerWidth * innerHeight * 0.3 && el.id && !/^(app|stage|globe|gl|map|quiz|qwrap)$/.test(el.id) && !el.closest('#quiz');
  }).map((el) => '#' + el.id);
}

test('primeira vez: com um toque a pessoa já está jogando', async () => {
  const { pagina, erros, fechar } = await abrirApp({ novato: true });
  const boasVindas = pagina.getByRole('dialog');
  assert.ok(await boasVindas.isVisible(), 'as boas-vindas aparecem');
  const escolhas = await boasVindas.locator('.wmodo').filter({ visible: true }).count();
  assert.equal(escolhas, 2, 'duas escolhas grandes logo de cara: Treino ou Livre');
  assert.ok(await boasVindas.getByRole('button', { name: /Letra maior/ }).isVisible(), 'dá para aumentar a letra já na primeira tela');
  await boasVindas.getByRole('button', { name: /Treino/ }).click();
  await pagina.waitForTimeout(1200);
  const r = await pagina.evaluate(() => {
    const q = document.querySelector('#qbody .qq');
    const opcoes = [...document.querySelectorAll('.qopts button')].filter((b) => { const x = b.getBoundingClientRect(); return x.height > 0 && x.top >= 0 && x.bottom <= innerHeight; });
    return { pergunta: q ? q.textContent.trim() : '', opcoes: opcoes.length };
  });
  assert.match(r.pergunta, /\?/, 'já aparece uma pergunta');
  assert.ok(r.opcoes >= 2, `as respostas estão na tela, sem rolar (${r.opcoes})`);
  assert.deepEqual(erros, []);
  await fechar();
});

test('responder: acertar comemora, errar mostra a resposta certa, e o jogo segue', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const certa = () => pagina.evaluate(() => window.__geoTotal.qcapD(window.__geoTotal.QD()[window.__geoTotal.quiz.cur]));
  // acerto
  let resposta = await certa();
  await pagina.getByRole('button', { name: resposta, exact: true }).first().click();
  await pagina.waitForTimeout(300);
  let retorno = await pagina.locator('#qfb').textContent();
  assert.match(retorno, new RegExp(resposta), 'o retorno do acerto repete a resposta');
  const marcada = await pagina.evaluate((r) => { const b = [...document.querySelectorAll('.qopts button')].find((x) => x.textContent.includes(r)); return getComputedStyle(b, '::before').content; }, resposta);
  assert.match(marcada, /✓/, 'a resposta tocada ganha o ✓ verde de certo');
  const antes = await pagina.evaluate(() => window.__geoTotal.quiz.sessionAsked);
  const prox = pagina.getByRole('button', { name: /Próxima/ }).filter({ visible: true });
  if (await prox.count()) await prox.first().click();
  await pagina.waitForTimeout(500);
  assert.ok(await pagina.evaluate((a) => window.__geoTotal.quiz.sessionAsked > a, antes), 'veio a próxima pergunta');
  // erro
  resposta = await certa();
  const errada = await pagina.evaluate((c) => [...document.querySelectorAll('.qopts button')].map((b) => b.textContent.trim()).find((t) => t && t !== c), resposta);
  await pagina.getByRole('button', { name: errada, exact: true }).first().click();
  await pagina.waitForTimeout(300);
  retorno = await pagina.locator('#qfb').textContent();
  assert.match(retorno, new RegExp(resposta), `o erro mostra a resposta certa (${resposta}): "${retorno.trim().slice(0, 80)}"`);
  assert.deepEqual(erros, []);
  await fechar();
});

test('Livre: tocar num país no mapa abre o cartão com a capital, e dá para fechar', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await tocar(pagina, 'Livre');
  await pagina.waitForTimeout(1500);
  // procura na tela um ponto de terra que a pessoa poderia tocar (não coberto por botão nem cartão)
  const ponto = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    for (let y = 120; y < innerHeight - 120; y += 14) {
      for (let x = 30; x < innerWidth - 70; x += 14) {
        const c = document.elementFromPoint(x, y);
        if (!c || c.tagName !== 'CANVAS') continue;
        const r = c.getBoundingClientRect(), d = g.countryAt(x - r.left, y - r.top);
        if (d && d.cap) return { x, y, nome: d.name };
      }
    }
    return null;
  });
  assert.ok(ponto, 'há terra visível para tocar');
  await pagina.touchscreen.tap(ponto.x, ponto.y);
  await pagina.waitForTimeout(900);
  const cartao = await pagina.evaluate(() => { const c = document.getElementById('card'); return c && getComputedStyle(c).display !== 'none' ? c.textContent.replace(/\s+/g, ' ') : ''; });
  assert.ok(cartao.length > 0, `o cartão abre ao tocar em ${ponto.nome}`);
  assert.match(cartao, /capital/i, 'o cartão mostra a capital');
  await tocar(pagina, /Fechar/);
  assert.equal(await pagina.evaluate(() => getComputedStyle(document.getElementById('card')).display), 'none', '"Fechar" fecha o cartão');
  assert.deepEqual(erros, []);
  await fechar();
});

test('toda tela: saída à vista, Voltar do celular fecha, textos claros e letra legível', async () => {
  const problemas = [];
  for (const [nome, caminho] of TELAS) {
    const { pagina, erros, fechar } = await abrirApp({ esperar: 3500 });
    const base = await pagina.evaluate(abertos);
    try {
      for (const passo of caminho) await tocar(pagina, passo);
    } catch (e) {
      problemas.push(`${nome}: a pessoa não acha o botão para abrir (${e.message.split('\n')[0]})`);
      await fechar();
      continue;
    }
    const t = await pagina.evaluate(lerTela);
    if (!t.saidas.some((s) => SAIDA.test(s))) problemas.push(`${nome}: nenhum botão de sair à vista (Voltar/Fechar)`);
    const jargao = t.texto.match(JARGAO);
    if (jargao && !JARGAO_PERMITIDO.some((p) => p.tela.test(nome) && p.palavra === jargao[0])) {
      const i = t.texto.indexOf(jargao[0]);
      problemas.push(`${nome}: texto com "${jargao[0]}" — …${t.texto.slice(Math.max(0, i - 40), i + 30)}…`);
    }
    for (const p of t.pequenas.slice(0, 3)) problemas.push(`${nome}: letra pequena demais — ${p}`);
    // Voltar do celular: fecha o que abriu e, com mais toques, volta ao jogo sem sair do app no meio
    let fechou = false;
    for (let k = 0; k < 4; k++) {
      const r = await pagina.evaluate(() => (window.__androidBack ? window.__androidBack() : false));
      await pagina.waitForTimeout(350);
      if (r !== true) break;
      fechou = true;
      if (JSON.stringify(await pagina.evaluate(abertos)) === JSON.stringify(base)) break;
    }
    if (!fechou) problemas.push(`${nome}: o Voltar do celular fecharia o app em vez desta tela`);
    const depois = await pagina.evaluate(abertos);
    if (JSON.stringify(depois) !== JSON.stringify(base)) problemas.push(`${nome}: depois do Voltar ainda ficou aberto ${depois.filter((x) => !base.includes(x)).join(', ')}`);
    for (const e of erros) problemas.push(`${nome}: erro de JavaScript — ${e}`);
    await fechar();
  }
  assert.deepEqual(problemas, [], problemas.join('\n'));
});

test('nada fica "carregando" para sempre e a tela inicial não tem texto quebrado', async () => {
  const { pagina, erros, fechar } = await abrirApp({ esperar: 12000 });
  const t = await pagina.evaluate(lerTela);
  assert.doesNotMatch(t.texto, /carregando|aguarde|gerando a textura/i, 'depois de 12 s não há aviso de carregamento na tela');
  assert.doesNotMatch(t.texto, JARGAO, 'sem lixo nem palavra técnica na tela inicial');
  assert.deepEqual(t.pequenas, [], 'letras legíveis na tela inicial');
  assert.deepEqual(erros, []);
  await fechar();
});

test('tela simples por padrão: só o essencial à vista; "Mais botões na tela" traz o resto', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const EXTRAS = ['#mvisual', '#mestilotop', '#camb', '#flat2d'];
  const vistos = () => pagina.evaluate((ids) => ids.filter((id) => { const r = document.querySelector(id).getBoundingClientRect(); return r.width > 0 && r.height > 0; }), EXTRAS);
  assert.deepEqual(await vistos(), [], 'extras escondidos na tela simples');
  const topo = await pagina.evaluate(() => [...document.querySelectorAll('header button')].filter((b) => b.getBoundingClientRect().width > 0).length);
  assert.ok(topo <= 5, `poucos botões no topo (${topo})`);
  await tocar(pagina, MENU);
  await tocar(pagina, /Personalizar/);
  await pagina.getByText('Mais botões na tela', { exact: true }).click();
  await pagina.waitForTimeout(300);
  assert.deepEqual(await vistos(), EXTRAS, 'os extras voltam');
  await pagina.getByText('Mais botões na tela', { exact: true }).click();
  await pagina.waitForTimeout(300);
  assert.deepEqual(await vistos(), [], 'e somem de novo');
  assert.deepEqual(erros, []);
  await fechar();
});

test('letra grande: liga nas boas-vindas e no Personalizar, e a pergunta fica maior', async () => {
  const { pagina, erros, fechar } = await abrirApp({ novato: true });
  const tamanho = () => pagina.evaluate(() => { const q = document.querySelector('#qbody .qq'); return q ? q.getBoundingClientRect().height : 0; });
  await pagina.getByRole('button', { name: /Letra maior/ }).click();
  await pagina.getByRole('dialog').getByRole('button', { name: /Treino/ }).click();
  await pagina.waitForTimeout(1200);
  assert.equal(await pagina.evaluate(() => document.body.classList.contains('letra-grande')), true, 'letra grande ligada');
  const grande = await tamanho();
  await tocar(pagina, MENU);
  await tocar(pagina, /Personalizar/);
  await pagina.getByText('Letra grande', { exact: true }).click();
  await pagina.evaluate(() => window.__androidBack());
  await pagina.evaluate(() => window.__androidBack());
  await pagina.waitForTimeout(400);
  assert.ok(grande > await tamanho(), 'com a letra normal a pergunta ocupa menos espaço');
  assert.deepEqual(erros, []);
  await fechar();
});

test('tutorial: só mostra botões que estão na tela e a contagem não pula', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await tocar(pagina, MENU);
  await tocar(pagina, /Como jogar/);
  await pagina.waitForTimeout(800);
  const vistos = [];
  for (let k = 0; k < 15 && await pagina.isVisible('#guia'); k++) {
    vistos.push(await pagina.textContent('#guiapasso'));
    await pagina.click('#guiaprox');
    await pagina.waitForTimeout(150);
  }
  const total = vistos.length;
  assert.ok(total >= 5 && total <= 8, `tutorial curto (${total} passos)`);
  assert.deepEqual(vistos, vistos.map((_, i) => `${i + 1} de ${total}`), 'contagem 1, 2, 3… sem pular');
  assert.deepEqual(erros, []);
  await fechar();
});
