# Prompt para melhorar o geoTotal (fácil, divertido e que faz voltar)

Cole este texto numa conversa com o Claude (ou outro assistente) quando quiser uma nova rodada de
melhorias. Ele pede para **questionar** o que existe antes de **acrescentar**, e para justificar
cada mudança com o que funcionou (e o que deu errado) em apps e jogos de sucesso.

---

Você é designer de jogos educativos e pesquisador de UX. Analise o **geoTotal** (jogo de países e
capitais num globo 3D, Android, offline, gratuito, sem anúncios, público de 12 a 60 anos) como um
**jogador leigo, no celular, que nunca viu o app**, e depois como um **jogador veterano** (nível 20,
quase todos os países já vistos).

## 1. Questione antes de acrescentar
Para cada tela (primeira abertura, pergunta, acerto, erro, fim de rodada, modo Livre, menu):
- O que **confunde, cansa ou trava** nos primeiros 60 segundos? E depois de 1 semana?
- O que pode **sair** (texto, número, botão, opção) sem perda nenhuma?
- O que está **fácil demais** (tédio) ou **difícil demais** (frustração)?

## 2. Fácil e divertido (e divertido e fácil)
- **Fácil:** menos toques, menos texto, linguagem de conversa, botões grandes, nada que exija ler
  instruções. Um iniciante deve vencer a primeira rodada.
- **Divertido:** vitória rápida, feedback com som e animação na medida certa ("juice"),
  rodadas curtas com fim claro, vontade de "só mais uma", surpresa de vez em quando.

## 3. Compare com quem deu certo (e com quem errou)
Para cada sugestão, diga **onde** isso funcionou e **por quê**, citando a fonte:
- Duolingo (sequência, metas, sons, rodadas curtas), Wordle (desafio diário, resultado
  compartilhável), Seterra e GeoGuessr (geografia), Candy Crush (combo, feedback),
  Kahoot e Quizlet (quiz e memorização).
- Teorias: autodeterminação (competência, autonomia, pertencimento), fluxo (desafio na medida da
  habilidade), prática de recuperação e repetição espaçada (aprendizagem), "game feel".
- O que **deu errado** em outros apps: gamificação rasa (só pontos e medalhas), recompensa demais
  (efeito de superjustificação), ranking que humilha, sequência que gera ansiedade.

## 4. Recompensa variável, do jeito ético
A mecânica que prende nas apostas é a **recompensa imprevisível**. No geoTotal ela só pode existir
**sem dinheiro**: nada de Pix, crédito, compra, aposta, caixa-surpresa paga, roleta ou qualquer
coisa que imite jogo de azar (Lei 14.790/2023, menores de idade e regras da Play Store).
Permitido: bônus de XP surpresa, curiosidade rara, conquista inesperada.

## 5. Regras do projeto
- Não adicionar funcionalidade pesada; melhorar o que existe.
- Continuar offline, sem anúncios, sem permissões e sem coleta de dados.
- Seguir docs/ARQUITETURA.md (camadas, sem ciclos, testes).
- Toda mudança com teste automático.

## 6. Entrega
1. Lista do que confunde, cansa ou trava, por tela e por tipo de jogador.
2. Mudanças propostas, cada uma com "onde funcionou e por quê" e fonte.
3. O que **não** fazer, e por quê.
4. Implementação, testes e prints de **antes e depois** com uma frase explicando cada mudança.
