# Estado atual e passagem para o Codex Desktop

Este arquivo oferece contexto curto para iniciar uma conversa nova sem depender do histórico do Codex Cloud. O Documento-Mestre continua sendo a fonte da verdade das regras de negócio.

## Concluído

- Fundação Next.js/React/TypeScript, design system, páginas públicas e painel inicial.
- Modelos fundacionais, cursos/programas iniciais, CPF e matriz de papéis.
- Supabase Auth para cadastro de estudante, confirmação de e-mail, login, logout e recuperação de senha.
- Criação automática de `profiles` e `student_profiles`, com unicidade de CPF e e-mail.
- Proteção da área interna e recusa de contas não ativas.
- Solicitação autenticada de alteração do e-mail institucional.
- Migrações iniciais de RLS e provisionamento administrativo de equipe.

## Ação operacional pendente

A migração `supabase/migrations/202608220000_auth_authorization_hardening.sql` precisa ser incorporada e, depois, aplicada ao projeto Supabase seguindo `docs/configuracao-supabase.md`. Antes de aplicá-la, conferir no GitHub se o PR correspondente foi aprovado e incorporado à `master`.

Depois da aplicação, validar com contas de teste separadas:

1. estudante ativo lê somente seus próprios perfis;
2. Catalogador ativo lê os dados operacionais autorizados, mas não administra usuários;
3. Administrador ativo acessa as operações administrativas previstas;
4. contas `blocked` e `inactive` não obtêm dados pela Data API;
5. uma conta interna somente é provisionada por Administrador ativo e gera log.

## Limitação conhecida dos testes

Os testes automatizados atuais verificam regras TypeScript e garantias estáticas das migrações. Ainda falta uma suíte integrada executando Auth, PostgreSQL e RLS contra um Supabase local ou projeto exclusivo de testes.

## Próximo passo de produto

Não iniciar um novo incremento com base apenas neste resumo. Obter a relação aprovada de incrementos, conferir o escopo com `docs/documento-mestre.md` e resolver somente as decisões pendentes necessárias à entrega escolhida.
