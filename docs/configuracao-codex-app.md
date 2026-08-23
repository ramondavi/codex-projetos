# Configuração do Codex App para o projeto Pronto!

Este guia considera que você já instalou no Windows:

- Codex App;
- Git e uma interface do GitHub;
- Node.js;
- Docker Desktop;
- e já clonou o repositório `ramondavi/codex-projetos`.

Você não precisa operar um terminal por conta própria. O Codex App pode executar os comandos do projeto; quando uma autenticação ou confirmação humana for necessária, ele deve parar e mostrar uma única instrução simples.

## O que o App poderá fazer

Depois da configuração inicial, o Codex poderá:

- atualizar a `master` e criar branches;
- editar o projeto, testar e gerar builds;
- criar commits e abrir PRs;
- consultar checks do GitHub;
- iniciar a aplicação e verificar páginas locais;
- iniciar Supabase/PostgreSQL local pelo Docker;
- validar migrações, Auth e RLS localmente;
- analisar previews e logs da Vercel;
- preparar operações remotas, sempre parando antes de alterações sensíveis.

O App não substitui as contas dos serviços. Você ainda precisará aprovar logins no navegador, fazer o merge de PRs e confirmar explicitamente qualquer migração remota.

## Etapa 1 — incorporar o PR atual

Antes de abrir este conjunto de mudanças localmente:

1. abra o PR atual no GitHub;
2. confirme que todos os checks estão verdes;
3. clique em **Squash and merge**;
4. clique em **Confirm squash and merge**;
5. confirme que o PR mostra **Merged**.

## Etapa 2 — atualizar o clone

Na interface do GitHub que você instalou:

1. abra o repositório `codex-projetos`;
2. selecione a branch `master`;
3. clique em **Fetch origin**;
4. se aparecer **Pull origin**, clique nele;
5. confirme que não existem alterações locais pendentes.

Não abra no Codex uma cópia ZIP nem a pasta antiga do Codex Cloud. Abra a pasta que está associada ao repositório no GitHub.

## Etapa 3 — abrir a pasta no Codex App

1. abra o Codex App;
2. use **Open folder**, **Open project** ou a opção equivalente;
3. escolha a pasta local `codex-projetos` clonada pelo GitHub;
4. confira o caminho antes de declarar a pasta confiável;
5. abra uma conversa nova no projeto.

Envie exatamente:

> Sou um usuário não-programador. Leia AGENTS.md, docs/estado-atual.md, docs/documento-mestre.md e docs/decisoes-pendentes.md. Não altere nada ainda. Verifique se este é o clone Git correto, se a branch master está atualizada e se Git, Node.js, npm e Docker estão disponíveis. Não leia nem exiba arquivos .env. Faça sozinho tudo o que for seguro; quando precisar de login, clique ou confirmação minha, pare e mostre somente uma instrução simples por vez.

## Etapa 4 — executar a preparação automática

Depois da verificação, envie:

> Execute scripts/preparar-codex-app.ps1 pelo PowerShell. Não exiba segredos. Se algo falhar, pare e explique em linguagem simples antes de corrigir.

O script:

- confirma Git, Node.js 22 ou superior e npm;
- verifica se Docker e GitHub CLI estão disponíveis;
- exige um clone limpo na branch `master`;
- atualiza a `master` somente por avanço direto (`pull --ff-only`);
- cria `.env.local` a partir de `.env.example` somente se ainda não existir;
- instala dependências;
- executa testes, typecheck, lint e build;
- não solicita nem imprime senhas ou chaves.

Se o Windows bloquear o script por política de execução, não altere permanentemente a segurança do sistema. Peça ao Codex para executá-lo apenas nesta vez com escopo limitado ao processo.

## Etapa 5 — autenticar o GitHub para PRs

Ter o GitHub Desktop ou outra interface instalada não garante que o comando `gh` esteja disponível. O Codex deve primeiro executar uma verificação de leitura:

```powershell
gh auth status
```

Se o GitHub CLI não estiver instalado, autorize o Codex a instalar o pacote oficial. Depois ele executará `gh auth login` e apresentará um código ou abrirá o navegador. Você deverá apenas:

1. confirmar **GitHub.com**;
2. escolher **HTTPS**;
3. autorizar pelo navegador;
4. voltar ao App e avisar que concluiu.

Não crie, copie ou envie tokens manualmente quando o login pelo navegador estiver disponível.

## Etapa 6 — configurar a aplicação com o Supabase remoto

Essa conexão serve inicialmente para executar a aplicação; não autoriza migrações.

No Dashboard do Supabase, obtenha:

- **Project URL**;
- chave **Publishable**.

Abra `.env.local` em um editor local e preencha:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Regras importantes:

- nunca use `service_role` no código da aplicação;
- não cole `.env.local` na conversa;
- não envie captura de tela mostrando chaves;
- confirme que `.env.local` permanece ignorado pelo Git;
- senha do banco e token do Supabase devem ser inseridos somente em telas ou prompts locais de autenticação.

Depois, peça:

> Inicie a aplicação local, verifique se ela responde e teste somente fluxos que não alterem dados importantes. Não mostre valores do .env.local.

## Etapa 7 — preparar Supabase e PostgreSQL local

O Docker Desktop deve estar aberto. Peça:

> Verifique o Docker. Depois configure o Supabase CLI como ferramenta local do projeto, inicie um Supabase local e valide todas as migrações, Auth e RLS. Não conecte ao projeto remoto, não execute db push e não altere arquivos sem antes mostrar um plano curto.

Essa etapa pode criar arquivos de configuração e dependências, portanto deve ocorrer em uma branch e em um PR próprio.

O Codex deverá:

1. verificar `docker version`;
2. instalar/configurar o Supabase CLI pelo método oficial atual;
3. iniciar serviços locais;
4. aplicar as migrações em banco descartável;
5. criar usuários de teste sem dados reais;
6. testar estudante, Catalogador, Administrador, conta bloqueada e conta inativa;
7. registrar comandos reproduzíveis no repositório;
8. encerrar os serviços quando terminar.

## Etapa 8 — Supabase remoto

As migrações antigas foram aplicadas pelo SQL Editor. Por isso, o histórico precisa ser reconciliado antes de usar `supabase db push`.

Quando chegar o momento, envie:

> Faça somente uma auditoria de leitura do histórico de migrações local e remoto. Não aplique mudanças. Explique em português simples quais migrações o Supabase reconhece, quais já existem no banco e proponha um procedimento com backup e retorno.

Qualquer aplicação remota deve seguir esta sequência:

1. plano e impacto apresentados pelo Codex;
2. backup confirmado;
3. validação prévia no Supabase local;
4. sua confirmação explícita;
5. aplicação;
6. testes posteriores;
7. registro do resultado sem segredos.

## Etapa 9 — Vercel

A integração principal da Vercel continua sendo pelo GitHub:

1. o Codex abre o PR;
2. a Vercel cria a Preview automaticamente;
3. o Codex consulta os checks e logs disponíveis;
4. você abre o link da Preview e confere visualmente;
5. você faz o merge;
6. a Vercel publica a `master` conforme a configuração do projeto.

Não é necessário instalar Vercel CLI agora. Se uma investigação futura exigir acesso direto, o Codex deve explicar por que precisa dele e iniciar login pelo navegador.

## Rotina de cada incremento

Abra uma conversa nova no Codex App e envie:

> Atualize a master e crie uma branch nova para o Incremento N. Leia os documentos do repositório e implemente somente o escopo abaixo. Mostre um plano curto, execute test, typecheck, lint e build, revise o diff para segredos, faça commit e abra um PR. Não faça merge e não altere serviços remotos sem minha confirmação.

Ao final, você fará apenas:

1. abrir o link do PR;
2. aguardar os checks verdes;
3. testar a Preview da Vercel;
4. clicar em **Squash and merge**;
5. atualizar a `master` no GitHub antes do incremento seguinte.

## Pedido de segurança para situações confusas

Se aparecer algo que você não entende, envie:

> Pare. Não altere arquivos, contas ou banco. Execute somente verificações de leitura, explique o estado em português simples e apresente no máximo três opções seguras, recomendando uma delas.

Nunca aprove comandos contendo `--force`, `reset --hard`, `clean -fd`, `push --force`, exclusão de banco ou exibição de segredos sem compreender exatamente o impacto.

## Como reduzir trabalho e tokens

- use uma conversa nova por incremento;
- mande o Codex ler os documentos, sem colá-los novamente;
- mantenha decisões duráveis no Documento-Mestre;
- mantenha `docs/estado-atual.md` curto;
- teste banco e Auth localmente;
- use o remoto somente na validação final;
- peça uma instrução humana por vez;
- evite solicitar logs completos quando um resumo e as linhas do erro bastarem.

## Referências oficiais

Use somente instruções atuais das páginas oficiais:

- Codex: `https://developers.openai.com/codex/`
- GitHub CLI: `https://cli.github.com/`
- Node.js: `https://nodejs.org/en/download`
- Docker Desktop: `https://docs.docker.com/desktop/`
- Supabase CLI: `https://supabase.com/docs/guides/local-development/cli/getting-started`
- Vercel: `https://vercel.com/docs`

Se uma página oficial divergir deste guia, o Codex deve parar, comparar as instruções e propor uma atualização do documento antes de executar a instalação.
