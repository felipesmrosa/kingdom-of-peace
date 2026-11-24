# Kingdom of Peace

App de treinos feito pra usar no celular, na academia. Calendário com o plano da semana, check-in de presença, cronômetro e registro de carga, séries e repetições.

Por enquanto é só o front: tudo fica salvo no próprio aparelho (`localStorage`), sem conta e sem servidor. Dá pra instalar na tela inicial como se fosse um app (PWA) e ele abre mesmo sem internet.

## O que ele faz

- **Hoje**: mostra o treino do dia. Você pode começar o treino, marcar "Já fui" informando o tempo, ou "Hoje não vou". Resumo da semana (treinos, tempo, carga levantada) e sequência de treinos seguidos.
- **Treino ao vivo**: cronômetro, e cada série com carga e repetições ajustadas por `−`/`+` (ou digitando). As séries já vêm preenchidas com o que você fez da última vez, então muitas vezes é só tocar no check. Timer de descanso (60s, 90s, 2min, 3min) que vibra no fim, e a tela fica acesa durante o treino.
- **Calendário**: o mês inteiro com o que foi feito, o que faltou, o que está planejado e o que foi pulado. Tocando em um dia você vê o treino, confirma que foi (com o tempo), marca que não foi, ou abre o registro. Resumo do mês com a % do plano cumprido.
- **Treinos**: monta o plano. Cada treino tem nome, dias da semana e exercícios (séries e repetições alvo, ordem editável). Tem modelos prontos: ABC, corpo inteiro e superior/inferior.
- **Evolução**: treinos por semana, totais, e a curva de carga, 1RM estimado ou volume de cada exercício, com a melhor série.
- **Registro**: qualquer treino pode ser reaberto depois pra editar tempo, séries, cargas e observações.
- **Ajustes**: backup em arquivo `.json` (baixar e importar) e instruções de instalação.

## Rodando

Precisa de Node 20 ou mais novo.

```bash
npm install
npm run dev        # http://localhost:3000
```

Pra testar como app de verdade (service worker só roda em produção):

```bash
npm run build
npm start
```

Outros comandos:

```bash
npm run typecheck  # checa os tipos
npm run icons      # regera os ícones do app em public/icons e src/app
```

## Instalando no celular

Precisa abrir por `https` (ou `localhost`). Depois de publicar, por exemplo na Vercel:

- **iPhone**: abra no Safari, toque em Compartilhar e escolha Adicionar à Tela de Início.
- **Android**: abra no Chrome, toque no menu e escolha Instalar app.

## Sobre os dados

Os dados ficam só no aparelho em que você usou o app. Trocar de celular ou limpar os dados do navegador apaga tudo, então use **Ajustes → Baixar backup** de vez em quando. Pra sincronizar entre aparelhos vai ser preciso um back-end, que é o próximo passo natural.

## Estrutura

```
src/
  app/            telas (Hoje, calendario, treinos, sessao, registro, evolucao, config)
  components/     interface reaproveitada (painel do dia, cartão de exercício, gráficos...)
  lib/            dados e regras
    store.ts        estado salvo no aparelho (zustand + localStorage)
    stats.ts        sequência, status dos dias, histórico e recordes
    dates.ts        datas e formatação em pt-BR
    templates.ts    modelos de treino e sugestões de exercícios
public/
  sw.js           service worker (abre sem internet)
  icons/          ícones do app
```

## Tecnologias

Next.js (App Router), React, TypeScript, Tailwind CSS v4, zustand. Fonte Bricolage Grotesque.
