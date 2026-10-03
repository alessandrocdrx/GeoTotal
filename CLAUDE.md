# Instruções para o Claude neste projeto

## Idioma
- **Responda sempre em português do Brasil**, em todas as mensagens, sem exceção.
- Comentários de código, mensagens de commit e documentação também em português do Brasil.

## Como o usuário prefere ser guiado
- Passo a passo, **um passo por vez**, esperando o "ok" antes do próximo.
- Ao guiar por telas (Play Console, GitHub, celular), descrever posições como **em cima / embaixo**
  e pelo texto do botão, não "esquerda/direita".
- Mensagens curtas e diretas; nada de explicações longas quando ele só quer o próximo passo.

## Projeto
- Arquitetura, regras e comandos: [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).
- Antes de commitar: `npm run test:all`.
- Para lançar versão: aumentar `versionCode`/`versionName` em `android/app/build.gradle` (e
  `version` no `package.json`) e usar `[release]` na mensagem do commit.
