# Arquitetura do geoTotal

Este documento explica como o projeto é organizado, como ele é montado e quais regras seguir ao
mexer no código.

## Visão geral

O geoTotal é um app web (HTML, CSS e JavaScript, sem framework) empacotado em um app Android
nativo mínimo, que só abre a página num WebView e oferece alguns recursos do sistema (salvar
arquivo, compartilhar, imprimir, botão Voltar).

```
web/src/  ──(npm run build)──▶  web/geototal.html  ──▶  android/app/src/main/assets/www/index.html  ──▶  APK / AAB
 código-fonte                    arquivo único            + bibliotecas locais, shim Android, CSP
 organizado                      (também é a versão
                                  publicada no navegador)
```

- `scripts/build-web.mjs` junta `web/src/` em `web/geototal.html`: inclui o CSS e o HTML e
  empacota o JavaScript (módulos ES) com o **esbuild** num único script.
- `scripts/prepare-android-web.mjs` copia esse arquivo para dentro do app Android, troca os
  endereços das bibliotecas pelas cópias locais, injeta `scripts/android-shim.js` e a
  Content-Security-Policy.
- O Gradle (em `android/`) gera o APK e o AAB da Play Store.

**Nunca edite `web/geototal.html` nem `android/app/src/main/assets/www/index.html` à mão:** os
dois são gerados. Edite `web/src/` e rode `npm run build`.

## Estrutura de pastas

```
web/src/
├── index.html              Molde da página: <head>, e a lista ordenada de @include
├── estilos/                CSS, na ordem da cascata
│   ├── tema.css            cores (claro/escuro), reset e base
│   ├── layout.css          cabeçalho, chips, palco do globo
│   ├── componentes.css     cartão, painéis, filtros, folha de estudo
│   ├── treino.css          painel do treino e respostas
│   ├── complementos.css    estados, escopo, histórico, conquistas
│   └── ux.css              camada visual mais recente (menu, partida, cabeçalho)
├── componentes/            HTML de cada parte da tela (cabeçalho, menu, treino, painéis)
└── js/                     JavaScript em módulos ES, por camada
    ├── main.js             ponto de entrada: chama o iniciar() de cada módulo, na ordem
    ├── dados/              dados puros: países, territórios, extras, religiões, línguas, vizinhos
    ├── nucleo/             utilitários e armazenamento (localStorage, IndexedDB)
    ├── visualizacao/       globo 3D, WebGL, textura, fronteiras, mapa 2D, dia e noite
    ├── interface/          gestos, cartão, filtros, busca, menu e ferramentas
    ├── treino/             estado do treino, partida, perguntas, dicas, estatísticas, progressão
    ├── brasil/             modo estados do Brasil
    ├── recursos/           exportação (CSV, Anki) e folha de estudo
    └── app/                compatibilidade, memória da última visão e ponto de entrada

android/app/src/main/java/io/github/alessandrocdrx/geototal/
├── MainActivity.java       ciclo de vida da tela, configuração do WebView, botão Voltar
├── ShareProvider.java      entrega a imagem do resultado a outros apps (só leitura)
├── web/
│   ├── AssetWebViewClient  serve assets/ em https://appassets.androidplatform.net/
│   ├── FileChooserClient   seletor de arquivos para os botões "Importar"
│   ├── WebBridge           ponte window.AndroidBridge (salvar, compartilhar, imprimir)
│   └── MimeTypes           tipo MIME por extensão
├── files/
│   ├── FileSaver           "Salvar como" para exportações
│   └── ImageSharer         compartilhamento da imagem do resultado
└── ui/
    └── EdgeToEdge          tela inteira respeitando barras do sistema e teclado

scripts/                    build, preparação do Android, gerador de ícone
tests/unidade/              testes de integridade dos dados (Node, sem navegador)
tests/e2e/                  testes de ponta a ponta no Chromium (Playwright)
playstore/                  textos e imagens da ficha da Play Store
docs/                       esta documentação
```

### Camadas e dependências

As camadas do JavaScript seguem esta direção (de baixo para cima):

```
dados  →  nucleo  →  visualizacao  →  interface / treino / brasil / recursos  →  app
```

Uma camada pode usar as de baixo; as de baixo não deveriam conhecer as de cima. Hoje essa
regra ainda tem exceções históricas (ver "Situação e próximos passos").

## Como um módulo é escrito

Cada arquivo de `web/src/js/` é um módulo ES com esta forma:

```js
/**
 * @arquivo js/treino/estado.js
 * Camada: Treino
 * Estado do treino (QS, escopo, foco, sessão) carregado do armazenamento.
 */

import { norm, REG } from '../dados/paises.js';          // o que o módulo usa de outros
import { $, lsGet } from '../nucleo/utilitarios.js';

/** Estado compartilhado com outros módulos (leitura e escrita por estadoTreino.nome). */
const estadoTreino = { quizScope: undefined, quizFocus: undefined, /* ... */ };

const AMERICAS_R = [0, 1, 2];                             // constantes puras
function inScope(d) { /* ... */ }                         // funções (públicas ou privadas)

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  estadoTreino.quizFocus = lsGet('globo.quiz.focus', 'mix');
  $('qnext').onclick = nextQ;                             // ligar botões, ler preferências...
}

export { AMERICAS_R, estadoTreino, iniciar, inScope };    // a interface pública do módulo
```

- **Ao carregar, um módulo só define coisas** (funções, constantes, objetos de estado). Tudo o
  que "faz algo" (ligar botões, ler preferências, desenhar) fica em `iniciar()`.
- **`main.js` é o único lugar onde a execução começa** (padrão *composition root*): chama os
  `iniciar()` numa ordem fixa. Assim a ordem em que o navegador carrega os módulos não importa.
- **Estado compartilhado mora num objeto do domínio dono**, por exemplo `estadoCamera.zoom`,
  `estadoMapa.on`, `estadoTreino.quizScope`, `estadoBrasil.statesMode`. Módulos ES não deixam
  um módulo reatribuir a variável de outro, então quem precisa alterar usa o objeto.
- **A interface pública fica na última linha** (`export { ... }`). O que não está ali é
  privado do módulo.
- **Modo estrito** vale em todo o código (módulos ES são sempre estritos).

## Regras do código

1. **Cada arquivo começa com o cabeçalho `@arquivo`** dizendo a camada e a responsabilidade
   (o build recusa arquivos sem ele).
2. **Imports explícitos:** use só o que importou. O esbuild recusa nomes que não existem e o
   ESLint aponta o que sobra.
3. **Nada executa no nível do módulo** além de declarações; o resto vai para `iniciar()`.
4. **Um módulo novo entra em `main.js`** (import e chamada do `iniciar()`, se tiver).
5. **Camadas só importam de camadas iguais ou de baixo** (ver abaixo). Hoje há exceções
   históricas; `npm run camadas` mede e a CI não deixa o número aumentar.
6. **Dados ficam em `js/dados/`**, no formato de texto com campos separados por `|`.
7. **Sem internet:** o app não pode depender de nada fora do pacote. Os testes de ponta a ponta
   falham se a página tentar acessar outro endereço.
8. **Comentários em português**, explicando o porquê, não o óbvio.

### Integrações externas

- `window.setStatus(texto, ms)`: usado pelo Android (MainActivity) para mostrar avisos.
- `window.__geoTotal`: interface de depuração e testes; cada nome exportado por um módulo pode
  ser lido por ela (`window.__geoTotal.quiz`, `window.__geoTotal.estadoMapa.on`).

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run build` | gera `web/geototal.html` e o `index.html` do Android |
| `npm run check` | confere se `web/geototal.html` está em dia (usado na CI) |
| `npm test` | testes de dados |
| `npm run test:e2e` | build + testes de ponta a ponta no Chromium |
| `npm run test:all` | tudo acima |
| `npm run icone` | regera o ícone do app e as imagens da Play Store |

Na primeira vez: `npm install` e `npx playwright install chromium`.

## Integração contínua e versões

O workflow `.github/workflows/android-apk.yml` roda em todo push:

1. **testes**: `npm run check`, ESLint, relatório de camadas, testes de dados e testes de ponta
   a ponta (inclusive um que percorre todas as funcionalidades);
2. **apk** (só se os testes passarem): gera APK e AAB assinados com a chave de upload
   (Secrets `GEOTOTAL_*`);
3. se a mensagem do commit tiver `[release]`, publica a versão em *Releases*.

Para lançar uma versão: aumente `versionCode` e `versionName` em `android/app/build.gradle`
(e `version` no `package.json`) e faça um commit com `[release]`.

## Como adicionar uma funcionalidade

1. Crie o módulo na camada certa (ex.: `web/src/js/treino/novo-modo.js`) com o cabeçalho
   `@arquivo`, os `import` do que usa e o `export` do que oferece.
2. Se ele precisar fazer algo ao abrir o app, escreva um `iniciar()` e chame-o em `main.js`.
3. Se tiver tela, crie o HTML em `web/src/componentes/` e o estilo em `web/src/estilos/`.
4. Escreva um teste em `tests/e2e/` (ou em `tests/unidade/`, se for dado).
5. `npm run test:all`.

## Situação e próximos passos

Feito:

1. ~~Dividir o arquivo único em arquivos por camada~~ (versão 1.17).
2. ~~Módulos ES com interface explícita, modo estrito, objetos de estado por domínio e
   empacotamento com esbuild~~ (versão 1.18).
3. ~~ESLint e testes que percorrem todas as funcionalidades~~ (versão 1.18).

Próximo: **desembaraçar as dependências.** Ainda há funções na camada errada (herança do
arquivo único: por exemplo, `setIncludeDep`, que é regra de filtro, está em
`visualizacao/textura.js`) e por isso 70 importações sobem de camada e 35 módulos formam um
grupo circular. O caminho, um passo por versão e sempre com os testes:

1. mover cada função para o módulo do seu domínio;
2. onde uma camada de baixo precisa avisar uma de cima (ex.: o globo avisar o treino de um
   toque), trocar a chamada direta por um evento ou callback registrado no `iniciar()`;
3. a cada passo, baixar o limite de `npm run camadas` na CI.
