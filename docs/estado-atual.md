# Estado atual e passagem para o Codex App

Este arquivo oferece contexto curto para iniciar uma conversa nova sem depender do histórico do Codex Cloud. O Documento-Mestre continua sendo a fonte da verdade das regras de negócio.

O ambiente local recomendado é o Codex App no Windows, conforme `docs/configuracao-codex-app.md`. Codex App, Git/GitHub, Node.js, Docker e o clone do repositório já estão configurados. O Supabase CLI também está configurado localmente e fixado no projeto, conforme `docs/configuracao-supabase.md`.

## Concluído

- Fundação Next.js/React/TypeScript, design system, páginas públicas e painel inicial.
- Modelos fundacionais, cursos/programas iniciais, CPF e matriz de papéis.
- Supabase Auth para cadastro de estudante, confirmação de e-mail, login, logout e recuperação de senha.
- Criação automática de `profiles` e `student_profiles`, com unicidade de CPF e e-mail.
- Proteção da área interna e recusa de contas não ativas.
- Solicitação autenticada de alteração do e-mail institucional.
- Migrações iniciais de RLS e provisionamento administrativo de equipe.
- Três migrações reproduzíveis no Supabase local, incluindo o hardening de autorização.
- Histórico remoto reconciliado e migração de hardening aplicada ao projeto `Pronto!`.
- Esquemas local e remoto alinhados, sem migrações pendentes.
- Suíte integrada com 36 testes pgTAP executada no CI para Auth, PostgreSQL, RLS e provisionamento.
- Lint do banco aprovado nos ambientes local e remoto.
- Incremento 3 implementado localmente em branch própria: vínculos acadêmicos, formulário completo da solicitação, rascunho automático local, validações, protocolo interno e acompanhamento inicial.
- Abertura da solicitação protegida por função transacional e RLS, com uma única solicitação ativa por estudante imposta no PostgreSQL.
- Cinco programas iniciais incorporados de forma idempotente ao fluxo de migrações para que o banco local seja reproduzível sem seed externo.

## Estado operacional do Supabase

As migrações versionadas abaixo estão registradas no histórico remoto e reproduzem localmente o esquema atual:

1. `202608060000_foundation.sql`;
2. `202608060001_auth_accounts.sql`;
3. `202608220000_auth_authorization_hardening.sql`;
4. `202608230000_student_requests.sql` (ainda não aplicada ao projeto remoto).

O hardening está aplicado no projeto `Pronto!`. A migração do Incremento 3 foi validada somente no Supabase local e permanece pendente no projeto remoto até confirmação explícita do usuário.

## Testes integrados de banco

A suíte pgTAP em `supabase/tests/database` contém 48 testes integrados contra o Supabase local. Ela valida com identidades sintéticas as decisões existentes de autorização, RLS, provisionamento administrativo e abertura de solicitações, sem depender de credenciais ou dados reais. O lint remoto citado acima corresponde ao estado anterior; a nova migração ainda não foi aplicada remotamente.

## Próximo passo de produto

Não iniciar um novo incremento com base apenas neste resumo. Obter a relação aprovada de incrementos, conferir o escopo com `docs/documento-mestre.md` e resolver somente as decisões pendentes necessárias à entrega escolhida.
