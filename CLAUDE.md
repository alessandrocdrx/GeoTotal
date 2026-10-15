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
- Antes de commitar: `npm run test:all` (inclui a auditoria de layout).
- **Antes de publicar o artefato ou mandar versão**: `npm run test:all` tem que passar inteiro.
  Bug, quebra de layout ou falta de intuitividade se pega no teste, nunca no artefato.
- Todo bug achado vira teste automatizado (ou caso na auditoria de layout) antes da correção.
- **Prints e conferência visual sempre no perfil do celular do usuário** (Motorola Edge 60 Pro:
  450px de largura, tema escuro, Roboto): `npm run tela -- saida.png "js para abrir a tela"`.
  Nada de prints em 360px ou com fonte DejaVu.
- A cada versão, procurar ativamente o que melhorar em **intuição, navegação e diversão**
  (além do que foi pedido) e propor/aplicar.
- Para lançar versão: aumentar `versionCode`/`versionName` em `android/app/build.gradle` (e
  `version` no `package.json`) e usar `[release]` na mensagem do commit.
