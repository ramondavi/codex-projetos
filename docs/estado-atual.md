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

## Estado operacional do Supabase

As migrações versionadas abaixo estão registradas no histórico remoto e reproduzem localmente o esquema atual:

1. `202608060000_foundation.sql`;
2. `202608060001_auth_accounts.sql`;
3. `202608220000_auth_authorization_hardening.sql`.

O hardening está aplicado no projeto `Pronto!`, a comparação de esquema não encontrou divergências nos objetos versionados e o *dry-run* remoto confirmou que não há migrações pendentes.

## Testes integrados de banco

A suíte pgTAP em `supabase/tests/database` contém 36 testes integrados executados no CI contra o Supabase local. Ela valida com identidades sintéticas as decisões existentes de autorização, RLS e provisionamento administrativo, sem depender de credenciais ou dados reais. O lint do banco foi aprovado tanto localmente quanto no projeto remoto.

## Próximo passo de produto

Não iniciar um novo incremento com base apenas neste resumo. Obter a relação aprovada de incrementos, conferir o escopo com `docs/documento-mestre.md` e resolver somente as decisões pendentes necessárias à entrega escolhida.
