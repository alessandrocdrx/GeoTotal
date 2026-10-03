# geoTotal — APK Android

App Android que abre o geoTotal (`web/geototal.html`)
num WebView. Tudo fica dentro do APK, então funciona **sem internet**: d3, topojson, as fronteiras
do mundo (datamaps) e os estados do Brasil (amCharts geodata) estão em `app/src/main/assets/www/lib/`.

## Baixar o APK pronto (sem instalar nada no computador)

1. No GitHub, abra a aba **Actions** → workflow **APK Android** → a execução mais recente (verde).
2. Em **Artifacts**, baixe `geototal-apk` (vem num .zip; o `.apk` está dentro).
3. Passe o `.apk` para o celular, toque nele e permita **"Instalar apps desconhecidos"** para o
   app que você usou para abrir (Arquivos, Chrome, Drive...).

Para rodar o build manualmente: Actions → APK Android → **Run workflow**.
**Link direto da versão mais recente** (abre no celular e baixa o APK, sem zip):
https://github.com/alessandrocdrx/GeoTotal/releases/latest/download/geototal.apk

Para publicar uma versão nova em Releases: aumente `versionName` em `app/build.gradle` e faça um
commit com `[release]` na mensagem (o workflow cria a tag `v<versionName>`), ou envie você mesmo
uma tag (`git tag v1.1 && git push origin v1.1`).

## Compilar no próprio computador

Com o Android Studio (ou o Android SDK + JDK 17):

```bash
npm run build   # gera o index.html do app a partir de web/src/
cd android
./gradlew assembleDebug
# APK em android/app/build/outputs/apk/debug/app-debug.apk
```

Ou abra a pasta `android/` no Android Studio e use **Run ▶** com o celular conectado por USB.

## Atualizar o app

1. Edite o código em `web/src/` (veja [`docs/ARQUITETURA.md`](../docs/ARQUITETURA.md)).
2. Rode `npm run build` e `npm run test:all`.
3. Aumente `versionCode` / `versionName` em `android/app/build.gradle` para o Android aceitar
   instalar por cima da versão anterior sem perder os dados.
4. Faça commit e push; o workflow roda os testes e, se passarem, gera o APK e o AAB (com
   `[release]` na mensagem, ele também publica em Releases).

## Ícone

O ícone "Monograma G" (um G dourado abraçando o globo, com o Brasil marcado) é desenhado em
`scripts/icone/icone.html`, com os contornos reais dos continentes. O script
`node scripts/icone/gerar.cjs` (requer Playwright) gera o ícone adaptativo em
`app/src/main/res/mipmap-*/ic_launcher_{background,foreground,monochrome}.png` e as imagens da
Play Store em `playstore/` (ícone 512×512 e destaque 1024×500).

## O que muda em relação ao artefato no navegador

O script de preparação injeta `scripts/android-shim.js` no HTML, que liga a página ao Android:

- **Exportar CSV / CSV para Anki / CSV dos estados**: abre o seletor do Android para salvar o arquivo.
- **Imprimir** (folha de estudo): abre a impressão do Android, que também salva em PDF.
- **Importar textura / fronteiras / contornos**: abre o seletor de arquivos do celular.
- **Botão voltar**: fecha o painel aberto (Mais, Filtros, Treino, cartão do país...) antes de sair.
- O tema claro/escuro segue o do sistema; progresso do treino, favoritos e mapas importados ficam
  salvos no aparelho.

O APK gerado é de **debug** (assinado com a chave de depuração): serve para instalar no seu celular
e compartilhar diretamente. Para publicar na Play Store é preciso gerar um build de release
assinado com a sua própria chave.

## Licença

Copyright 2026 alessandrocdrx — Apache License 2.0. Veja [`LICENSE`](../LICENSE) e [`NOTICE`](../NOTICE)
na raiz do repositório; os dois também vão dentro do APK (`assets/www/`).
