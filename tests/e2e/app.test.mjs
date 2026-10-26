// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
//
// Testes de ponta a ponta: abrem o app (o mesmo index.html que vai no APK) num Chromium
// sem tela e conferem os fluxos principais. O estado interno é lido por window.__geoTotal
// (exposto por web/src/js/main.js). Rodam depois de `npm run build` e de
// `node scripts/prepare-android-web.mjs` (o script `npm run test:e2e` já faz os dois).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { iniciarServidor, abrirApp as abrir } from './apoio.mjs';

let ambiente;
before(async () => { ambiente = await iniciarServidor(); });
after(async () => { await ambiente?.encerrar(); });
const abrirApp = (opcoes) => abrir(ambiente, opcoes);

test('abre no Treino, sem erros e sem acessar a internet', async () => {
  const { pagina, erros, externos, fechar } = await abrirApp();
  const estado = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    return {
      treino: g.quiz.open,
      paises: g.availCount(),
      fronteiras: !!g.estadoRender.feats,
      treinoMarcado: document.getElementById('qbtn').getAttribute('aria-pressed'),
    };
  });
  assert.equal(estado.treino, true);
  assert.equal(estado.treinoMarcado, 'true');
  assert.equal(estado.paises, 204, 'países disponíveis por padrão (inclui a Guiana Francesa)');
  assert.ok(estado.fronteiras, 'fronteiras dos países carregadas do próprio app');
  assert.deepEqual(erros, []);
  assert.deepEqual(externos, [], 'o app não deve acessar nada fora do próprio pacote');
  await fechar();
});

test('troca entre Treino e Livre pelo cabeçalho', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#qclose');
  assert.equal(await pagina.evaluate(() => window.__geoTotal.quiz.open), false);
  await pagina.click('#qbtn');
  assert.equal(await pagina.evaluate(() => window.__geoTotal.quiz.open), true);
  assert.deepEqual(erros, []);
  await fechar();
});

test('filtro por continente e Desfazer funcionam no modo Livre (regressão: "hist.push")', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#qclose');
  const ligados = () => pagina.evaluate(() => {
    const g = window.__geoTotal;
    return g.D.filter((d) => g.estadoMapa.on[d.i]).length;
  });
  const total = await ligados();
  await pagina.evaluate(() => document.querySelectorAll('#chips button')[2].click());
  const umContinente = await ligados();
  assert.ok(umContinente > 0 && umContinente < total, 'filtrar por continente reduz a lista');
  await pagina.evaluate(() => document.getElementById('ubtn').click());
  assert.equal(await ligados(), total, 'Desfazer volta ao filtro anterior');
  assert.deepEqual(erros, []);
  await fechar();
});

test('⚙️ abre os ajustes da partida em listas com bolinha (sobrevivência é chave) e vale na hora', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#qbtn');
  await pagina.click('#qajustb');
  const linhas = await pagina.evaluate(() => [...document.querySelectorAll('#ajbody .ajrow > b')].map((b) => b.textContent));
  assert.deepEqual(linhas, ['Nível', 'Responder', 'Meta do dia', 'Perguntas', 'Ordem', 'Tamanho da rodada', 'Cronômetro']);
  assert.equal(await pagina.locator('#ajbody label.mswrow:has(b:text-is("Sobrevivência")) input[role="switch"]').count(), 1);
  const linha = (t) => `#ajbody .ajrow:has(> b:text-is("${t}"))`;
  await pagina.click('#ajbody .ajmais summary');
  await pagina.locator(`${linha('Cronômetro')} .mradio button`).nth(2).click();
  const r = await pagina.evaluate(() => {
    const achar = (t) => [...document.querySelectorAll('#ajbody .ajrow')].find((x) => x.querySelector('b').textContent === t);
    return {
      tempo: window.__geoTotal.quiz.timerLen,
      marcado: achar('Cronômetro').querySelectorAll('.mradio button')[2].getAttribute('aria-pressed'),
      rodada: achar('Tamanho da rodada').querySelector('.mradio button[aria-pressed="true"]').textContent,
      aberto: document.getElementById('ajsheet').style.display,
    };
  });
  assert.deepEqual(r, { tempo: 60, marcado: 'true', rodada: 'Sem fim', aberto: 'block' }, 'cronômetro liga, desliga a rodada fechada e a tela continua aberta');
  await pagina.click('#ajok');
  assert.equal(await pagina.evaluate(() => document.getElementById('ajsheet').style.display), 'none');
  assert.deepEqual(erros, []);
  await fechar();
});

test('partida: cada país aparece uma vez por volta e a ordem muda entre partidas', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const jogar = () => pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.applyScopeChange({ t: 'reg', r: 1 });
    const n = g.poolIdx().length, ordem = [];
    for (let k = 0; k < n; k++) {
      ordem.push(g.D[g.quiz.cur].cc);
      g.quiz.answered = false; g.finishQ(true); g.nextQ();
    }
    const zerou = !g.runPool().length;
    g.runRestart();
    return { n, ordem, zerou };
  });
  const p1 = await jogar();
  const p2 = await jogar();
  assert.equal(new Set(p1.ordem).size, p1.n, 'nenhum país repetido acertando todos');
  assert.ok(p1.zerou, 'acertar todos zera a região');
  assert.notDeepEqual(p1.ordem, p2.ordem, 'duas partidas seguidas não têm a mesma ordem');
  assert.deepEqual(erros, []);
  await fechar();
});

test('territórios dependentes seguem a rota: República Dominicana → Porto Rico', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#qclose');
  await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.setIncludeDep(true);
    g.select(g.D.find((d) => d.cc === 'DO'), true);
  });
  await pagina.waitForTimeout(500);
  await pagina.click('#next');
  await pagina.waitForTimeout(500);
  assert.equal(await pagina.evaluate(() => document.getElementById('cname').textContent), 'Porto Rico');
  assert.deepEqual(erros, []);
  await fechar();
});

test('desabitados e Antártida: desligados por padrão e só em "Achar no mapa"', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    const antes = g.availCount();
    g.setIncludeUni(true);
    g.quizSetMode('cap');
    const naCapital = g.poolIdx().some((i) => g.D[i].uni);
    g.quizSetMode('map');
    const noMapa = g.poolIdx().filter((i) => g.D[i].uni).length;
    return { antes, depois: g.availCount(), naCapital, noMapa };
  });
  assert.equal(r.antes, 204);
  assert.equal(r.depois, 219);
  assert.equal(r.naCapital, false, 'sem perguntas de capital para lugares sem capital');
  assert.equal(r.noMapa, 15);
  assert.deepEqual(erros, []);
  await fechar();
});

test('ganchos do globo estão registrados pelas camadas de cima', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    const k = g.ganchos;
    const abertoNoTreino = k.treinoAberto();
    document.getElementById('qclose').click();
    return {
      abertoNoTreino,
      abertoNoLivre: k.treinoAberto(),
      arco: k.desenharArco === g.drawArc,
      pulso: k.desenharPulsoEscopo === g.drawScopePulse,
      selo: k.desenharSeloResposta === g.drawBadge,
      ocultar: k.ocultarMarcadores === g.qHide,
      alturaCartao: typeof k.alturaCartao() === 'number',
    };
  });
  assert.deepEqual(r, { abertoNoTreino: true, abertoNoLivre: false, arco: true, pulso: true, selo: true, ocultar: true, alturaCartao: true });
  assert.deepEqual(erros, []);
  await fechar();
});

test('toques e categorias passam pelos ganchos da interface', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    const k = g.ganchosInterface;
    g.quizSetMode('cap');
    const ignoraNoTreino = k.toqueAntes(10, 10);
    document.getElementById('qclose').click();
    const livre = k.toqueAntes(10, 10) || k.toqueNoGlobo(10, 10, []) || k.toqueEstados(10, 10);
    const antes = g.availCount();
    document.getElementById('oDep').click();
    return { ignoraNoTreino, livre, cresceu: g.availCount() > antes, marcada: document.getElementById('oDep').checked && g.estadoMapa.includeDep };
  });
  assert.deepEqual(r, { ignoraNoTreino: true, livre: false, cresceu: true, marcada: true });
  assert.deepEqual(erros, []);
  await fechar();
});

test('página Mapa: foto de satélite, noite e camadas; época em lista; mudar lugares no meio da rodada avisa e recomeça', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(async () => {
    const g = window.__geoTotal, $ = (id) => document.getElementById(id);
    const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));
    $('mbtn').click();$('mmapa').click();
    const aberto = $('mtitle').textContent === 'Mapa';
    $('cSat').click();
    const atlas = g.estadoRender.atlas && !$('cSat').checked;
    /* ligar a noite no mapa colorido volta para a foto de satélite */
    $('oNight').disabled = false;$('oNight').click();
    const luz = $('oNight').checked && !g.estadoRender.atlas && $('cSat').checked;
    $('oNight').click();
    const dia = !$('oNight').checked;
    document.querySelector('[data-p="mp-epoca"]').click();
    document.querySelector('#cMes [data-v="6"]').click();
    const epoca = g.estadoRender.mesMapa === 6 && $('cMesV').textContent.startsWith('Julho');
    document.querySelector('#cMes [data-v=""]').click();
    $('mback').click();
    const voltou = $('mtitle').textContent === 'Mapa';
    /* camadas de nomes */
    $('cMar').click();
    const semMares = g.estadoRender.camadas.mares === false;
    $('cMar').click();
    ['cZon', 'cDes', 'cFlo', 'cMon'].forEach((i) => $(i).click());
    const c = g.estadoRender.camadas;
    const natureza = c.zonas && c.desertos && c.florestas && c.montanhas;
    $('flat2d').click();await espera(200);$('flat2d').click();
    /* treino com uma resposta dada: mudar territórios pergunta antes */
    $('mclose').click();
    $('qbtn').click();await espera(300);
    g.quiz.answered = false;g.finishQ(true);g.nextQ();
    const dep = g.estadoMapa.includeDep;
    $('oDep').click();
    const aviso = document.querySelector('.avisolug');
    const naoMudouAinda = g.estadoMapa.includeDep === dep;
    aviso.querySelector('button:not(.avsim)').click();
    const cancelou = !document.querySelector('.avisolug') && g.estadoMapa.includeDep === dep;
    $('oDep').click();
    document.querySelector('.avisolug .avsim').click();
    const n = g.poolIdx().length, feitos = n - g.runPool().length;
    return { aberto, atlas, luz, dia, epoca, voltou, semMares, natureza, aviso: !!aviso, naoMudouAinda, cancelou, mudou: g.estadoMapa.includeDep === !dep, zerou: feitos === 0 && $('oDep').checked === !dep };
  });
  assert.deepEqual(r, { aberto: true, atlas: true, luz: true, dia: true, epoca: true, voltou: true, semMares: true, natureza: true, aviso: true, naoMudouAinda: true, cancelou: true, mudou: true, zerou: true });
  assert.deepEqual(erros, []);
  await fechar();
});

test('som: efeitos e música ligam e desligam pelo menu, sem erros', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#mbtn');
  await pagina.click('[data-p="mp-visual"]');
  const antes = await pagina.evaluate(() => ({ e: document.getElementById('msfx').checked, m: document.getElementById('mmusic').checked }));
  await pagina.click('label:has(#mmusic)');
  await pagina.evaluate(() => { const g = window.__geoTotal; ['acerto', 'erro', 'toque', 'nivel', 'meta', 'conquista'].forEach(g.tocar); });
  await pagina.waitForTimeout(3500);
  await pagina.click('label:has(#msfx)');
  const depois = await pagina.evaluate(() => ({ e: document.getElementById('msfx').checked, efeitos: window.__geoTotal.estadoSom.efeitos, musica: window.__geoTotal.estadoSom.musica }));
  assert.deepEqual(antes, { e: true, m: true });
  assert.deepEqual([depois.e, depois.efeitos], [false, false]);
  assert.equal(depois.musica, false, 'tocar em Música desliga (começa ligada)');
  assert.deepEqual(erros, []);
  await fechar();
});

test('primeira vez: cartão Treino leva à América do Sul; alternativas sem lugares disputados', async () => {
  const { pagina, erros, fechar } = await abrirApp({ novato: true });
  assert.equal(await pagina.isVisible('#welcome'), true, 'boas-vindas aparecem na primeira vez');
  await pagina.click('#wtreino');
  await pagina.waitForTimeout(500);
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    let disputados = 0;
    for (let k = 0; k < 40; k++) {
      const i = g.D.findIndex((d) => !d.dis && d.r === k % 9);
      if (i >= 0) disputados += g.makeOptions(i).filter((x) => g.D[x].dis).length;
    }
    return { escopo: g.estadoTreino.quizScope, aberto: !document.getElementById('welcome').hidden, disputados };
  });
  assert.deepEqual(r.escopo, { t: 'reg', r: 0 });
  assert.equal(r.aberto, false);
  assert.equal(r.disputados, 0, 'resposta certa comum não tem alternativa disputada');
  assert.deepEqual(erros, []);
  await fechar();
});

test('rodada de 10: termina com estrelas, XP e "Jogar de novo"', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.definirRodada(10); g.nextQ(); // o padrão é sem fim
    for (let k = 0; k < 10; k++) { g.quiz.answered = false; g.finishQ(true); if (k < 9) g.nextQ(); }
    document.getElementById('qnext').click();
    const fim = document.querySelector('.rodadafim');
    return {
      len: g.quiz.sessionLen,
      fim: !!fim,
      estrelas: fim ? fim.querySelectorAll('.estrelas .on').length : -1,
      combo: document.getElementById('qcomb').textContent,
      jogar: !!document.querySelector('.rfjogar'),
    };
  });
  assert.equal(r.len, 10, 'rodada de 10 escolhida nos ajustes');
  assert.equal(r.fim, true, 'tela de fim de rodada aparece');
  assert.equal(r.estrelas, 3, '10 de 10 = 3 estrelas');
  assert.equal(r.combo, '🔥 x10');
  assert.equal(r.jogar, true);
  await pagina.click('.rfjogar');
  assert.equal(await pagina.evaluate(() => !!document.querySelector('.rodadafim')), false, '"Jogar de novo" começa outra rodada');
  assert.deepEqual(erros, []);
  await fechar();
});

test('desafio do dia: 10 países iguais para todos, uma vez por dia, com resultado para copiar', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#qmodeb');
  await pagina.click('#jr-desafio');
  assert.match(await pagina.textContent('.jogointro'), /mesmos para todo mundo/, 'explica o desafio antes de começar');
  await pagina.click('.jogointro .rfjogar');
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    const fila = g.estadoTreino.desafio.fila.slice();
    const vistos = [];
    for (let k = 0; k < 10; k++) { vistos.push(g.quiz.cur); g.quiz.answered = false; g.finishQ(k % 3 !== 0); if (k < 9) g.nextQ(); }
    document.getElementById('qnext').click();
    return {
      mesmaFila: JSON.stringify(fila) === JSON.stringify(vistos),
      titulo: document.querySelector('.rftit').textContent,
      grade: document.querySelector('.rfgrade').textContent,
      copiar: !!document.querySelector('.rfcopiar'),
      encerrou: g.estadoTreino.desafio === null,
      salvo: JSON.parse(localStorage.getItem('globo.desafio.v1')).certas,
    };
  });
  assert.equal(r.mesmaFila, true, 'as perguntas seguem a fila do dia');
  assert.match(r.titulo, /Desafio do dia #\d+/);
  assert.equal(r.grade, '🟥🟩🟩🟥🟩🟩🟥🟩🟩🟥');
  assert.equal(r.copiar, true);
  assert.equal(r.encerrou, true);
  assert.equal(r.salvo, 6);
  assert.deepEqual(erros, []);
  await fechar();
});

test('conquistas mostram progresso; cartão leva ao treino da região; curiosidade usa dados reais', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#mbtn');
  await pagina.click('#mbadges');
  const barras = await pagina.evaluate(() => document.querySelectorAll('#badgesbody .bprog').length);
  assert.ok(barras >= 10, 'conquistas bloqueadas têm barra de progresso');
  await pagina.evaluate(() => { document.getElementById('badgesclose').click(); document.getElementById('mclose').click(); document.getElementById('qclose').click(); });
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.select(g.D.find((d) => d.cc === 'JP'), true);
    const b = document.querySelector('#cstat .cstreinar');
    const texto = b && b.textContent;
    b.click();
    const jp = g.D.find((d) => d.cc === 'JP');
    return { texto, aberto: g.quiz.open, escopo: g.estadoTreino.quizScope, regJP: jp.r, curio: g.curiosidade(jp) };
  });
  assert.match(r.texto, /^Treinar /);
  assert.equal(r.aberto, true);
  assert.deepEqual(r.escopo, { t: 'reg', r: r.regJP });
  assert.match(r.curio, /Japão/);
  assert.deepEqual(erros, []);
  await fechar();
});

test('título do jogador, quase-acerto pelo vizinho e países dominados no globo', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    const titulo = document.getElementById('qlevel').textContent;
    const br = g.D.findIndex((d) => d.cc === 'BR'), ar = g.D.findIndex((d) => d.cc === 'AR');
    g.quiz.cur = br; g.quiz.escolhido = ar;
    const quase = g.fbText(g.D[br], false);
    g.estadoTreino.QS.m.cap.BR = { r: 3, w: 0, s: 3 };
    return { titulo, quase, dominado: g.ganchos.dominado(br), naoDominado: g.ganchos.dominado(ar) };
  });
  assert.match(r.titulo, /Nv 1 · Turista/);
  assert.match(r.quase, /Quase! .*Argentina é vizinho/);
  assert.equal(r.dominado, true);
  assert.equal(r.naoDominado, false);
  assert.deepEqual(erros, []);
  await fechar();
});

test('progresso: salvar e restaurar; música pausa no treino; legenda no Livre', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.evaluate(() => localStorage.removeItem('globo.legenda.vista'));
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    // progresso: o arquivo leva as chaves globo.* e volta igual
    localStorage.setItem('globo.teste', 'x1');
    const arquivo = JSON.stringify({ tipo: 'geoTotal-progresso', versao: 1, dados: { 'globo.teste': 'restaurado' } });
    const ruim = g.restaurarDeTexto('{"oi":1}');
    const bom = g.restaurarDeTexto(arquivo);
    return {
      ruim, bom, valor: localStorage.getItem('globo.teste'),
      pausadaNoTreino: g.estadoSom.pausada,
    };
  });
  assert.match(r.ruim, /não é um progresso/);
  assert.equal(r.bom, '');
  assert.equal(r.valor, 'restaurado');
  assert.equal(r.pausadaNoTreino, true, 'no treino a música fica pausada');
  await pagina.click('#qclose');
  await pagina.waitForTimeout(900);
  const livre = await pagina.evaluate(() => ({ pausada: window.__geoTotal.estadoSom.pausada, legenda: !document.getElementById('legenda').hidden, itens: document.querySelectorAll('#legitens span').length }));
  assert.equal(livre.pausada, false, 'no Livre a música pode tocar');
  assert.equal(livre.legenda, true, 'legenda aparece na primeira visita ao Livre');
  assert.equal(livre.itens, 6, 'as 6 regiões com países (Américas: Sul e Central e do Norte)');
  await pagina.click('#legok');
  assert.equal(await pagina.evaluate(() => document.getElementById('legenda').hidden), true);
  assert.deepEqual(erros, []);
  await fechar();
});

test('boas-vindas: cartão Livre abre o Livre; tour passa por todos os passos e fica no menu', async () => {
  const { pagina, erros, fechar } = await abrirApp({ novato: true });
  await pagina.click('#wlivre');
  await pagina.waitForTimeout(600);
  assert.equal(await pagina.evaluate(() => window.__geoTotal.quiz.open), false, 'Livre aberto');
  await pagina.click('#mbtn');
  await pagina.click('#mtour');
  await pagina.waitForTimeout(900);
  assert.equal(await pagina.isVisible('#guia'), true, 'tour aparece');
  assert.equal(await pagina.evaluate(() => window.__geoTotal.quiz.open), true, 'tour abre o Treino');
  const passos = [];
  for (let k = 0; k < 20 && await pagina.isVisible('#guia'); k++) {
    passos.push(await pagina.textContent('#guiapasso'));
    await pagina.click('#guiaprox');
    await pagina.waitForTimeout(150);
  }
  assert.ok(passos.length >= 6, 'passa por pelo menos 6 passos: ' + passos.join(', '));
  assert.equal(await pagina.isVisible('#guia'), false, 'tour fecha no fim');
  assert.deepEqual(erros, []);
  await fechar();
});

test('giro e passeio: escondidos no Treino; no Livre explicam o que fazem', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  assert.equal(await pagina.isVisible('#tour'), false, 'passeio escondido no Treino');
  assert.equal(await pagina.isVisible('#spin'), false, 'giro escondido no Treino');
  await pagina.click('#qclose');
  await pagina.waitForTimeout(400);
  await pagina.click('#spin');
  assert.match(await pagina.textContent('#status'), /Giro automático desligado/);
  await pagina.click('#tour');
  assert.match(await pagina.textContent('#status'), /Passeio/);
  assert.equal(await pagina.textContent('#tour'), '⏹');
  await pagina.click('#tour');
  assert.equal(await pagina.textContent('#tour'), '🎬');
  assert.deepEqual(erros, []);
  await fechar();
});

test('passeio continua ao fechar o cartão; giro funciona no mapa plano', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#qclose');
  await pagina.waitForTimeout(400);
  await pagina.click('#tour');
  await pagina.waitForTimeout(600);
  await pagina.click('#close');
  const antes = await pagina.evaluate(() => window.__geoTotal.estadoMapa.selected.cc);
  await pagina.waitForTimeout(4800);
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    return { passeio: !!g.estadoCartao.passeio, depois: g.estadoMapa.selected.cc, cartao: document.getElementById('card').style.display };
  });
  assert.equal(r.passeio, true, 'passeio segue depois de fechar o cartão');
  assert.notEqual(r.depois, antes, 'foi para o próximo país');
  assert.equal(r.cartao, 'none', 'sem o cartão');
  await pagina.click('#tour');
  await pagina.evaluate(() => { const g = window.__geoTotal; g.estadoMapa.selected = null; g.estadoCamera.auto = true; g.estadoCamera.lastInteract = 0; document.getElementById('flat2d').click(); });
  const l0 = await pagina.evaluate(() => window.__geoTotal.estadoCamera.lam);
  await pagina.waitForTimeout(1500);
  const l1 = await pagina.evaluate(() => window.__geoTotal.estadoCamera.lam);
  assert.notEqual(l1, l0, 'o mapa plano desliza com o giro automático');
  assert.deepEqual(erros, []);
  await fechar();
});

test('zerou a região: duas próximas paradas e entra sozinho na primeira', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.quiz.sessionLen = 0;
    g.applyScopeChange({ t: 'reg', r: 0 });
    for (let k = 0; k < 40 && g.runPool().length; k++) { g.quiz.answered = false; g.finishQ(true); g.nextQ(); }
  });
  await pagina.waitForTimeout(300);
  const r = await pagina.evaluate(() => ({ botoes: [...document.querySelectorAll('.proxbtn b')].map((b) => b.textContent), cont: (document.querySelector('.proxcont') || {}).textContent }));
  assert.equal(r.botoes.length, 2, 'duas sugestões: ' + r.botoes.join(', '));
  assert.ok(!r.botoes.includes('América do Sul'), 'não sugere a região que acabou de zerar');
  assert.match(r.cont, /começa em \d+s/);
  await pagina.waitForTimeout(14500); // até 3,2 s do avanço automático da última resposta (com curiosidade) + 10 s de contagem
  const depois = await pagina.evaluate(() => window.__geoTotal.estadoTreino.quizScope);
  assert.equal(depois.t, 'reg');
  assert.notEqual(depois.r, 0, 'entrou sozinho na próxima região');
  assert.deepEqual(erros, []);
  await fechar();
});

test('voltar a uma região já zerada começa uma partida nova, sem a tela antiga de "Você zerou"', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.quiz.sessionLen = 0;
    g.applyScopeChange({ t: 'reg', r: 6 });
    for (let k = 0; k < 40 && g.runPool().length; k++) { g.quiz.answered = false; g.finishQ(true); g.nextQ(); }
    const fimAgora = !!document.querySelector('.rundone');
    g.applyScopeChange({ t: 'reg', r: 0 });
    g.applyScopeChange({ t: 'reg', r: 6 });
    return { fimAgora, fimDepois: !!document.querySelector('.rundone'), pool: g.runPool().length, n: g.poolIdx().length };
  });
  assert.equal(r.fimAgora, true, 'logo depois de zerar mostra a tela de fim');
  assert.equal(r.fimDepois, false, 'ao voltar depois, não mostra a tela antiga');
  assert.equal(r.pool, r.n, 'partida nova, com todos os países de novo');
  assert.deepEqual(erros, []);
  await fechar();
});

test('região zerada que ganhou um país novo recomeça inteira e mantém a medalha', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.quiz.sessionLen = 0;
    g.applyScopeChange({ t: 'reg', r: 0 });
    for (let k = 0; k < 40 && g.runPool().length; k++) { g.quiz.answered = false; g.finishQ(true); g.nextQ(); }
    /* simula a partida antiga, zerada antes de a Guiana Francesa entrar na região */
    const run = g.curRun(); delete run.d.GF; g.saveRuns();
    g.applyScopeChange({ t: 'reg', r: 1 });
    g.applyScopeChange({ t: 'reg', r: 0 });
    const k = Object.keys(JSON.parse(localStorage.getItem('globo.recs.v1'))).find((x) => x.includes('"r":0'));
    return { pool: g.runPool().length, n: g.poolIdx().length, medalha: JSON.parse(localStorage.getItem('globo.recs.v1'))[k].medal };
  });
  assert.equal(r.pool, r.n, 'partida nova com todos os países, não só o que faltava');
  assert.equal(r.medalha, 1, 'medalha de ouro continua guardada');
  assert.deepEqual(erros, []);
  await fechar();
});

test('Antártida (só bases, sem capital): explica e oferece "Achar no mapa"', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.applyScopeChange({ t: 'reg', r: 7 });
    const txt = document.getElementById('qbody').textContent;
    const b = [...document.querySelectorAll('#qbody button')].find((x) => /Achar no mapa/.test(x.textContent));
    if (b) b.click();
    return { txt, temBotao: !!b, modo: g.quiz.mode, pool: g.poolIdx().length };
  });
  assert.match(r.txt, /não tem países com capital/);
  assert.equal(r.temBotao, true);
  assert.equal(r.modo, 'map');
  assert.ok(r.pool > 0, 'no Achar no mapa há o que treinar');
  assert.deepEqual(erros, []);
  await fechar();
});

test('treino sem entregar a resposta: bandeira sem bandeiras nas opções, capital marcada no globo, sem sigla de país', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.applyScopeChange({ t: 'world' });
    g.quizSetMode('flag');
    const opsFlag = [...document.querySelectorAll('#qbody .qopts button')].map((b) => b.textContent);
    g.quizSetMode('pais');
    const pino = g.estadoTreino.qPino === g.quiz.cur;
    g.quizSetMode('neighbor');
    const d = g.D.find((x) => x.cc === 'BR');
    g.estadoTreino.qEspia = null;
    const modos = [...document.querySelectorAll('#qmodes button')].map((b) => b.textContent);
    return { opsFlag, pino, modos, flags: g.D.map((x) => x.flag).filter(Boolean).slice(0, 50), d: !!d };
  });
  assert.equal(r.opsFlag.length, 4);
  for (const o of r.opsFlag) assert.ok(!r.flags.some((f) => o.includes(f)), 'opção sem bandeira: ' + o);
  assert.equal(r.pino, true, 'Capital → País marca a capital no globo');
  assert.ok(!r.modos.includes('País → Sigla'), 'sem País → Sigla');
  assert.deepEqual(erros, []);
  await fechar();
});

test('zerar tudo também zera nível e conquistas', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.evaluate(() => {
    const g = window.__geoTotal;
    for (let k = 0; k < 12; k++) { g.quiz.answered = false; g.finishQ(true); g.nextQ(); }
  });
  const antes = await pagina.evaluate(() => JSON.parse(localStorage.getItem('globo.prog.v1')));
  await pagina.evaluate(() => { const b = document.getElementById('qreset'); b.click(); b.click(); });
  const depois = await pagina.evaluate(() => JSON.parse(localStorage.getItem('globo.prog.v1')));
  assert.ok(antes.xp > 0 && antes.badges.length > 0, 'tinha XP e conquista');
  assert.equal(depois.xp, 0);
  assert.equal(depois.badges.length, 0);
  assert.deepEqual(erros, []);
  await fechar();
});

test('noite no globo pela página Mapa do menu; coluna do mapa igual no Treino e no Livre; tema numa lista', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.waitForFunction(() => !document.getElementById('oNight').disabled, null, { timeout: 15000 });
  const botoes = () => pagina.evaluate(() => [...document.querySelectorAll('.tools button')].filter((b) => b.getClientRects().length).map((b) => b.id));
  const noTreino = await botoes();
  await pagina.click('#qclose');
  const noLivre = (await botoes()).filter((id) => id !== 'spin' && id !== 'tour');
  assert.deepEqual(noLivre, noTreino, 'a coluna do mapa tem os mesmos botões nos dois modos (giro e passeio só no Livre)');
  await pagina.click('#mbtn');
  await pagina.click('#mmapa');
  await pagina.click('label:has(#oNight)');
  const noite = await pagina.evaluate(() => window.__geoTotal.optNight && document.getElementById('oNight').checked);
  await pagina.click('label:has(#oNight)');
  await pagina.click('#mback');
  await pagina.click('[data-p="mp-visual"]');
  await pagina.click('#mtema [data-v="dark"]');
  const r = await pagina.evaluate(() => ({
    tema: document.documentElement.getAttribute('data-theme'),
    marcado: document.querySelector('#mtema [aria-pressed="true"]').textContent,
    guardado: localStorage.getItem('globo.theme'),
  }));
  assert.equal(noite, true, 'a chave liga a noite');
  assert.deepEqual(r, { tema: 'dark', marcado: 'Escuro', guardado: '"dark"' });
  assert.deepEqual(erros, []);
  await fechar();
});

test('fim da partida diz quantas partidas sem erro faltam para dominar a região', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const txt = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.quiz.sessionLen = 0;
    g.applyScopeChange({ t: 'reg', r: 0 });
    for (let k = 0; k < 40 && g.runPool().length; k++) { g.quiz.answered = false; g.finishQ(true); g.nextQ(); }
    return document.querySelector('.rundone .recline').textContent;
  });
  assert.match(txt, /Mais 2 partidas sem errar e você domina América do Sul/);
  assert.deepEqual(erros, []);
  await fechar();
});

test('recomeçar só a partida: volta a contagem a zero e mantém XP, medalhas e conquistas', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.applyScopeChange({ t: 'reg', r: 0 });
    for (let k = 0; k < 4; k++) { g.quiz.answered = false; g.finishQ(true); g.nextQ(); }
    const xp = JSON.parse(localStorage.getItem('globo.prog.v1')).xp;
    document.getElementById('qscopeb').click();
    const b = document.getElementById('qrestart');
    const visivel = !b.hidden;
    b.click();
    const armado = g.runPool().length < g.poolIdx().length;
    b.click();
    return { visivel, armado, pool: g.runPool().length, n: g.poolIdx().length, xp, xp2: JSON.parse(localStorage.getItem('globo.prog.v1')).xp };
  });
  assert.equal(r.visivel, true, 'botão aparece na tela de região depois de responder');
  assert.equal(r.armado, true, 'o primeiro toque só pede confirmação');
  assert.equal(r.pool, r.n, 'partida voltou ao começo');
  assert.equal(r.xp2, r.xp, 'XP continua');
  assert.deepEqual(erros, []);
  await fechar();
});

test('Américas: só América do Sul e América Central e do Norte, com os 23 países juntos', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    document.getElementById('qscopeb').click();
    const cartoes = [...document.querySelectorAll('#scopetiles .stile b')].map((b) => b.textContent);
    const lista = document.getElementById('scopelist').textContent;
    g.applyScopeChange({ t: 'reg', r: 1 });
    return { cartoes, temCaribeSeparado: /América Central e Caribe/.test(lista), n: g.poolIdx().length, eua: g.D.find((d) => d.cc === 'US').r };
  });
  assert.ok(r.cartoes.includes('América do Sul') && r.cartoes.includes('América Central e do Norte'));
  assert.equal(r.temCaribeSeparado, false);
  assert.equal(r.eua, 1, 'Estados Unidos na região 1');
  assert.equal(r.n, 23);
  assert.deepEqual(erros, []);
  await fechar();
});

test('passaporte: carimbo ao dominar um país e tela com as bandeiras por região', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.applyScopeChange({ t: 'world' });
    g.quizSetMode('cap');
    /* um país reconhecido (os não reconhecidos ficam no Passaporte alternativo) */
    g.quiz.cur = g.QD().findIndex((x) => x.cc === 'BR');
    const d = g.QD()[g.quiz.cur];
    g.estadoTreino.QS.m.cap[d.cc] = { r: 2, w: 0, s: 2, l: 0 };
    g.quiz.answered = false; g.finishQ(true);
    const toast = [...document.querySelectorAll('.qtoast')].map((x) => x.textContent).join(' | ');
    document.getElementById('mpassaporte').click();
    return { toast, head: document.getElementById('passhead').textContent, on: document.querySelectorAll('#passbody .carimbo.on').length, total: document.querySelectorAll('#passbody .carimbo').length };
  });
  assert.match(r.toast, /Carimbo novo no passaporte/);
  assert.match(r.head, /1 de 198/);
  assert.equal(r.on, 1);
  /* 198 países + 11 do Passaporte alternativo (6 não reconhecidos e 5 micronações) */
  assert.equal(r.total, 209);
  assert.deepEqual(erros, []);
  await fechar();
});

test('jogos rápidos: Relâmpago de 60 s com recorde e Misto com tipos variados', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    document.getElementById('qmodeb').click();
    document.getElementById('jr-misto').click();
    const modos = new Set();
    for (let k = 0; k < 9; k++) { modos.add(g.quiz.mode); g.quiz.answered = false; g.finishQ(true); g.nextQ(); }
    const rotuloMisto = document.getElementById('qmodev').textContent;
    document.getElementById('qmodeb').click();
    document.getElementById('jr-relampago').click();
    const intro = !!document.querySelector('.jogointro');
    document.querySelector('.jogointro .rfjogar').click();
    const timer = intro && g.quiz.timerLen, rotulo = document.getElementById('qmodev').textContent;
    for (let k = 0; k < 3; k++) { g.quiz.answered = false; g.finishQ(true); g.nextQ(); }
    const placar = document.getElementById('qruntxt').textContent;
    g.quiz.timerStart = Date.now() - 61000;
    return { modos: [...modos], rotuloMisto, timer, rotulo, placar };
  });
  await pagina.waitForTimeout(600);
  const fim = await pagina.evaluate(() => ({ txt: document.querySelector('.rodadafim') ? document.querySelector('.rodadafim').textContent : '', rec: localStorage.getItem('globo.relampago.recorde') }));
  assert.ok(r.modos.length >= 2, 'o Misto variou o tipo: ' + r.modos.join(','));
  assert.equal(r.rotuloMisto, '🎲 Misto');
  assert.equal(r.timer, 60);
  assert.equal(r.rotulo, '⚡ Relâmpago');
  assert.equal(r.placar, '✔ 3 certas');
  assert.match(fim.txt, /Fim do Relâmpago/);
  assert.match(fim.txt, /Novo recorde: 3/);
  assert.equal(fim.rec, '3');
  const depois = await pagina.evaluate(() => { const g = window.__geoTotal; g.applyScopeChange({ t: 'reg', r: 0 }); return { jr: g.quiz.jogoRapido, timer: g.quiz.timerLen }; });
  assert.equal(depois.jr, null, 'escolher uma região sai do jogo rápido');
  assert.equal(depois.timer, 0);
  assert.deepEqual(erros, []);
  await fechar();
});

test('acerto avança sozinho e mostra a barrinha no botão Próxima', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    const antes = g.quiz.sessionAsked;
    g.quiz.answered = false; g.finishQ(true);
    return { auto: document.getElementById('qnext').classList.contains('auto'), antes };
  });
  assert.equal(r.auto, true);
  await pagina.waitForTimeout(3600);
  const depois = await pagina.evaluate(() => window.__geoTotal.quiz.sessionAsked);
  assert.ok(depois > r.antes, 'passou para a próxima sozinho');
  assert.deepEqual(erros, []);
  await fechar();
});

test('conquistas: medalha da região zerada aparece e a barra de domínio anda a cada acerto', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.quiz.sessionLen = 0;
    g.applyScopeChange({ t: 'reg', r: 0 });
    for (let k = 0; k < 40 && g.runPool().length; k++) { g.quiz.answered = false; g.finishQ(true); g.nextQ(); }
  });
  await pagina.waitForTimeout(300);
  await pagina.click('#mbtn');
  await pagina.click('#mbadges');
  const r = await pagina.evaluate(() => {
    const sec = document.querySelector('#badgesbody .medsec');
    const dom = [...document.querySelectorAll('#badgesbody .badgerow')].find((x) => /Domina América do Sul/.test(x.textContent));
    return { med: sec ? sec.textContent : '', dom: dom ? dom.querySelector('.bprogt').textContent : '' };
  });
  assert.match(r.med, /🥇América do Sul/, 'medalha de ouro na lista');
  assert.match(r.dom, /0 de 13 países dominados · 13 de 39 acertos/);
  assert.deepEqual(erros, []);
  await fechar();
});

test('estados do Brasil: o treino não entrega a resposta (etiqueta sem capital, pergunta sem sigla)', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.applyScopeChange({ t: 'br' });
    g.quizSetMode('cap');
    const st = g.QD()[g.quiz.cur];
    const capQ = document.querySelector('#qbody .qq').firstChild.textContent;
    const etiqueta = g.stBadgeMetrics(g.estadoBrasil.selSt);
    g.quizSetMode('code');
    const st2 = g.QD()[g.quiz.cur];
    const codeQ = document.querySelector('#qbody .qq').firstChild.textContent;
    return { capQ, cap: st.cap, t2: etiqueta.t2, codeQ, sigla: st2.sigla };
  });
  assert.ok(!r.capQ.includes(r.cap), 'a pergunta não mostra a capital');
  assert.equal(r.t2, '', 'etiqueta do mapa sem "Capital: …" durante o treino');
  assert.ok(!new RegExp('\\b' + r.sigla + '\\b').test(r.codeQ), 'a pergunta da sigla não mostra a sigla: ' + r.codeQ);
  assert.deepEqual(erros, []);
  await fechar();
});

test('numa região a rodada não corta em 10: vai até zerar', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.applyScopeChange({ t: 'br' });
    const antes = g.runPool().length;
    for (let k = 0; k < 12; k++) { g.quiz.answered = false; g.finishQ(true); document.getElementById('qnext').click(); }
    return { fim: !!document.querySelector('.rodadafim'), restam: g.runPool().length, antes };
  });
  assert.equal(r.fim, false, 'depois de 12 respostas nos estados, não interrompeu');
  assert.equal(r.restam, r.antes - 12);
  assert.deepEqual(erros, []);
  await fechar();
});

test('cabeçalho: logo; atalho de som no menu; começa sempre de dia; tocar num país no treino mostra só o nome', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    const logo = getComputedStyle(document.querySelector('h1 .marca-logo')).backgroundImage.startsWith('url("data:image/png');
    const noite = g.optNight === false && !document.getElementById('oNight').checked;
    document.getElementById('msom').click();
    const mudo = g.estadoSom.mudo && document.getElementById('msom').getAttribute('aria-checked') === 'false', icone = document.getElementById('msom').querySelector('.mi').textContent;
    document.getElementById('msom').click();
    return { logo, noite, mudo, icone, voltou: g.estadoSom.mudo };
  });
  assert.deepEqual(r, { logo: true, noite: true, mudo: true, icone: '🔇', voltou: false });
  const sobre = await pagina.evaluate(() => document.querySelector('#mp-sobre').textContent);
  assert.match(sobre, /Criado por alessandrocdrx/);
  assert.match(sobre, /versão \d+\.\d+/);
  assert.deepEqual(erros, []);
  await fechar();
});

test('cartão de estado não herda o selo "Não reconhecido" do país anterior; foguinho explica a sequência', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#qclose');
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.select(g.D.find((d) => d.dis), true);
    const antes = document.getElementById('cdis').style.display;
    g.enterStates(g.BRS.find((s) => s.sigla === 'RS'));
    return { antes, depois: document.getElementById('cdis').style.display };
  });
  assert.notEqual(r.antes, 'none', 'país disputado mostra o selo');
  assert.equal(r.depois, 'none', 'estado não mostra o selo');
  assert.deepEqual(erros, []);
  await fechar();
});

test('cartão mostra a hora agora e a diferença para Brasília (país e estado)', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#qclose');
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.select(g.D.find((d) => d.cc === 'JP'), true);
    const jp = document.getElementById('cfacts').textContent;
    g.enterStates(g.BRS.find((s) => s.sigla === 'AM'));
    const am = document.getElementById('cfacts').textContent;
    return { jp, am, brAgora: g.horaAgora('BR').dif };
  });
  assert.match(r.jp, /Hora agora/);
  assert.match(r.jp, /\+12h em relação a Brasília/);
  assert.match(r.am, /−1h em relação a Brasília/);
  assert.equal(r.brAgora, 'mesma hora de Brasília');
  assert.deepEqual(erros, []);
  await fechar();
});

test('"Onde treinar?": Guiana Francesa na América do Sul, Américas Central e do Norte juntas; lista das categorias no menu', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#qscopeb');
  const r = await pagina.evaluate(() => {
    const tiles = [...document.querySelectorAll('.stile b')].map((b) => b.textContent);
    const d = document.getElementById('catlista');
    d.open = true; d.dispatchEvent(new Event('toggle'));
    const ultra = [...document.querySelectorAll('.catrow')].filter((x) => x.querySelector('.catultra')).length;
    const g = window.__geoTotal;
    return { tiles, ultra, sul: g.D.filter((d) => d.r === 0 && g.avail(d)).map((d) => d.cc).includes('GF') };
  });
  assert.ok(r.tiles.includes('América Central e do Norte'));
  assert.ok(!r.tiles.includes('América do Norte'));
  assert.ok(r.sul, 'Guiana Francesa entra na América do Sul');
  assert.ok(r.ultra >= 5, 'territórios ultramarinos marcados');
  await pagina.click('.stile:nth-child(3)');
  assert.equal(await pagina.evaluate(() => window.__geoTotal.scopeLabel()), 'América Central e do Norte');
  assert.deepEqual(erros, []);
  await fechar();
});

test('dica na múltipla escolha tira 2 erradas sem dar a letra; a meta do dia abre os ajustes', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.quizSetMode('cap');
    document.querySelector('.qhintbtn').click();
    const certo = g.optLabel(g.quiz.cur);
    const elim = [...document.querySelectorAll('#qbody .qopts button.elim')].map((b) => b.textContent);
    return { elim, certo, texto: document.querySelector('.qhintbtn').textContent };
  });
  assert.equal(r.elim.length, 2, 'duas opções eliminadas');
  assert.ok(!r.elim.includes(r.certo), 'a certa nunca é eliminada');
  assert.doesNotMatch(r.texto, /começa com/);
  await pagina.click('#goalgo');
  assert.equal(await pagina.evaluate(() => document.getElementById('ajsheet').style.display), 'block', 'abre Ajustes da partida');
  assert.deepEqual(erros, []);
  await fechar();
});

test('avaliação: pede depois de um momento bom, só para quem já jogou 3 dias, e uma vez por mês', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(async () => {
    let n = 0;
    window.AndroidBridge.requestReview = () => { n++; };
    localStorage.setItem('globo.dias.uso', JSON.stringify(['2026-10-1']));
    const g = window.__geoTotal;
    g.emitir('partida-zerada', { medalha: 1 });
    await new Promise((ok) => setTimeout(ok, 2800));
    const poucosDias = n;
    localStorage.setItem('globo.dias.uso', JSON.stringify(['2026-10-1', '2026-10-2', '2026-10-3']));
    g.emitir('partida-zerada', { medalha: 1 });
    await new Promise((ok) => setTimeout(ok, 2800));
    const pediu = n;
    g.emitir('partida-zerada', { medalha: 1 });
    await new Promise((ok) => setTimeout(ok, 2800));
    return { poucosDias, pediu, repetiu: n };
  });
  assert.deepEqual(r, { poucosDias: 0, pediu: 1, repetiu: 1 });
  assert.deepEqual(erros, []);
  await fechar();
});

test('tela de início ao voltar depois de um tempo: continuar, desafio, relâmpago ou explorar', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  /* como se a última visita tivesse sido há 2 horas (o script roda antes do app, a cada carregamento) */
  await pagina.addInitScript(() => { localStorage.setItem('globo.ultima.visita', String(Date.now() - 2 * 3600e3)); });
  await pagina.reload();
  await pagina.waitForTimeout(1500);
  const visivel = await pagina.evaluate(() => !document.getElementById('inicio').hidden);
  assert.equal(visivel, true, 'mostra a tela de início');
  await pagina.click('#irelampago');
  await pagina.waitForTimeout(400);
  const r = await pagina.evaluate(() => ({ fechou: document.getElementById('inicio').hidden, jogo: window.__geoTotal.quiz.jogoRapido, intro: !!document.querySelector('.jogointro') }));
  assert.deepEqual(r, { fechou: true, jogo: 'relampago', intro: true });
  assert.deepEqual(erros, []);
  await fechar();
});
