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

- `scripts/build-web.mjs` junta `web/src/` em `web/geototal.html`.
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
└── js/                     JavaScript, por camada
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
regra ainda tem exceções históricas (ver "Próxima fase").

## Regras do código

1. **Cada arquivo começa com o cabeçalho `@arquivo`** dizendo a camada e a responsabilidade.
   O build remove esses cabeçalhos do arquivo final e recusa arquivos sem eles.
2. **A ordem do `index.html` é a ordem de execução.** Todo o JavaScript roda num único
   `<script>`: funções podem ser chamadas antes de declaradas, mas variáveis globais precisam
   ser criadas antes de serem usadas. Ao mover código, rode os testes.
3. **Nenhum nome global pode ser declarado em dois arquivos.** O build verifica isso (foi assim
   que encontramos o conflito de `hist`, que quebrava o filtro por continente e o Desfazer).
4. **Todo arquivo de `web/src/` precisa estar no `index.html`** (o build avisa se sobrar algum).
5. **Dados ficam em `js/dados/`**, no formato de texto com campos separados por `|`, comentados
   no topo de cada bloco.
6. **Sem internet:** o app não pode depender de nada fora do pacote. Os testes de ponta a ponta
   falham se a página tentar acessar outro endereço.
7. **Comentários em português**, explicando o porquê, não o óbvio.

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

1. **testes**: `npm run check`, testes de dados e testes de ponta a ponta;
2. **apk** (só se os testes passarem): gera APK e AAB assinados com a chave de upload
   (Secrets `GEOTOTAL_*`);
3. se a mensagem do commit tiver `[release]`, publica a versão em *Releases*.

Para lançar uma versão: aumente `versionCode` e `versionName` em `android/app/build.gradle`
(e `version` no `package.json`) e faça um commit com `[release]`.

## Como adicionar uma funcionalidade

1. Crie o arquivo na camada certa (ex.: `web/src/js/treino/novo-modo.js`) com o cabeçalho
   `@arquivo`.
2. Inclua-o no `web/src/index.html`, depois dos arquivos de que ele depende.
3. Se tiver tela, crie o HTML em `web/src/componentes/` e o estilo em `web/src/estilos/`.
4. Escreva um teste em `tests/e2e/` (ou em `tests/unidade/`, se for dado).
5. `npm run test:all`.

## Próxima fase

A divisão em arquivos e camadas foi feita sem mudar o comportamento do app (o arquivo gerado
é igual ao anterior, exceto pela correção do `hist`). O código ainda compartilha variáveis
globais entre camadas. Os próximos passos, um módulo por vez e sempre protegidos pelos testes:

1. transformar cada camada em módulo com interface explícita (`const Treino = {...}`),
   expondo só o necessário;
2. ativar `'use strict'`;
3. trocar o estado global solto por objetos de estado por domínio (globo, treino, filtros);
4. migrar para módulos ES com um empacotador (esbuild), mantendo a saída em arquivo único.
