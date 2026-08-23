# Guia de migração do Codex Cloud para o Codex Desktop

Este guia foi escrito para Windows 11 e para uma pessoa sem experiência em programação. O código não será copiado manualmente do Cloud: o GitHub será o ponto seguro de transferência.

## Recomendação

Para este projeto, trabalhar localmente tende a ser mais eficiente porque o Codex pode usar, no mesmo computador, o repositório Git, o navegador autenticado, o Node.js, o Docker e as ferramentas do Supabase e do GitHub. Isso reduz mensagens destinadas apenas a contornar limitações do ambiente Cloud.

Isso não garante menor cobrança ou menor quantidade de tokens por si só. A economia esperada vem de menos tentativas interrompidas, menos cópia de resultados entre ferramentas e contexto persistente no próprio repositório (`AGENTS.md` e este guia).

## O que será migrado

- Código e histórico: pelo GitHub.
- Regras e contexto: pelos arquivos `AGENTS.md`, `docs/documento-mestre.md`, `docs/decisoes-pendentes.md` e `docs/estado-atual.md`.
- Configurações públicas: pelo `.env.example`.

Não serão migrados pelo GitHub:

- `.env.local`;
- senha do banco;
- tokens do GitHub ou Supabase;
- chaves secretas;
- histórico completo das conversas.

## Etapa 1 — concluir o trabalho no Cloud

1. Abra o PR atual no GitHub.
2. Confirme que todos os checks estão verdes.
3. Clique em **Squash and merge** e depois em **Confirm squash and merge**.
4. Confirme que o PR mostra **Merged**.
5. Não continue usando a branch antiga no Desktop.

## Etapa 2 — instalar os aplicativos

Instale pelos sites oficiais, aceitando as opções padrão:

1. **Codex para desktop** disponível para sua conta e sistema operacional.
2. **GitHub Desktop**, para clonar e visualizar branches sem depender do terminal.
3. **Node.js 22 LTS**, necessário para executar o projeto.
4. **Docker Desktop**, necessário somente para executar Supabase/PostgreSQL localmente.

O Supabase CLI e o GitHub CLI são úteis, mas podem ser instalados depois com ajuda do próprio Codex Desktop. Não é necessário configurar tudo no primeiro dia.

## Etapa 3 — clonar a versão correta

No GitHub Desktop:

1. Entre na sua conta do GitHub.
2. Abra **File → Clone repository**.
3. Na aba **GitHub.com**, escolha `ramondavi/codex-projetos`.
4. Em **Local path**, escolha uma pasta simples, por exemplo `C:\\Projetos\\codex-projetos`.
5. Clique em **Clone**.
6. No seletor **Current branch**, escolha `master`.
7. Clique em **Fetch origin** e, se aparecer, em **Pull origin**.

Não baixe ZIP e não copie a pasta temporária do Codex Cloud: isso perde a relação correta com branches e commits.

## Etapa 4 — abrir no Codex Desktop

1. Abra o Codex Desktop.
2. Escolha **Open folder** ou a opção equivalente para abrir uma pasta local.
3. Selecione `C:\\Projetos\\codex-projetos`.
4. Autorize o projeto como confiável somente depois de conferir que é a pasta clonada do seu GitHub.
5. Inicie uma conversa e envie:

> Leia AGENTS.md, docs/estado-atual.md, docs/documento-mestre.md e docs/decisoes-pendentes.md. Não altere nada ainda. Verifique o ambiente local e explique, em português simples, o que falta configurar.

O Codex deverá seguir automaticamente o `AGENTS.md` nas tarefas seguintes.

## Etapa 5 — preparar o projeto

No Codex Desktop, peça:

> Execute o script scripts/preparar-desktop.ps1 sem preencher ou exibir segredos. Pare e me explique se algum pré-requisito estiver ausente.

O script:

- verifica Git, Node.js e npm;
- cria `.env.local` a partir do modelo somente se o arquivo não existir;
- instala as dependências;
- executa testes, typecheck e lint;
- nunca solicita nem imprime senhas.

Depois, abra `.env.local` localmente e preencha apenas com dados obtidos no painel do seu Supabase. Nunca cole o conteúdo desse arquivo em uma conversa, issue ou PR.

## Etapa 6 — conectar os serviços aos poucos

### GitHub

O login no GitHub Desktop já resolve clone, pull e push. Para o Codex abrir PRs diretamente, peça que ele verifique `gh auth status`. Se necessário, ele orientará um login pelo navegador. Nunca envie um token por chat.

### Aplicação e Supabase remoto

Comece usando o projeto Supabase remoto já existente:

1. No Dashboard do Supabase, copie a **Project URL** e a chave **Publishable**.
2. Preencha somente estas variáveis em `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`;
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`;
   - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.
3. Não use a chave `service_role` no aplicativo.
4. Peça ao Codex: `Inicie npm run dev e verifique cadastro, confirmação, login, logout e recuperação sem alterar o banco.`

### PostgreSQL e migrações

Não dê ao Codex acesso imediato ao banco de produção. Primeiro:

1. instale e abra o Docker Desktop;
2. peça ao Codex para instalar/configurar o Supabase CLI no repositório;
3. peça para criar um Supabase local e testar as migrações nele;
4. somente depois autorize, explicitamente, uma migração remota;
5. faça backup antes de qualquer alteração remota importante.

Como as migrações anteriores foram executadas pelo SQL Editor, a adoção do Supabase CLI deve começar com uma reconciliação do histórico. Não execute `supabase db push` no projeto remoto antes dessa conferência, pois migrações já aplicadas podem ser tentadas novamente.

## Rotina recomendada para cada incremento

Envie uma solicitação por vez:

> Atualize a master, crie uma branch nova para o Incremento N e implemente somente o escopo abaixo. Leia os documentos do repositório, execute test, typecheck, lint e build, mostre o diff, faça commit e abra um PR. Não faça merge.

Depois:

1. confira o resumo do Codex;
2. abra o PR no GitHub;
3. aguarde os checks;
4. teste a Preview da Vercel;
5. faça o merge manualmente;
6. volte ao GitHub Desktop e clique em **Fetch/Pull origin** antes do incremento seguinte.

## Como economizar contexto e tokens

- Abra uma conversa nova por incremento, em vez de manter uma conversa indefinidamente.
- Não cole novamente o Documento-Mestre; mande o Codex lê-lo no repositório.
- Coloque decisões duráveis nos documentos, não apenas no chat.
- Peça primeiro um plano curto e só depois a implementação quando o escopo for grande.
- Use o Supabase local para testes repetíveis e reserve o remoto para validações finais.
- Não peça para repetir logs completos quando basta informar o erro e as últimas linhas relevantes.

## Plano de retorno

Se o Desktop não funcionar bem, nada fica preso nele. Faça commit e push da branch pelo GitHub Desktop e continue no Codex Cloud a partir do GitHub. Os segredos continuarão somente no seu computador e nos painéis dos serviços.
