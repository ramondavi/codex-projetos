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
- Incremento 4 implementado localmente: painéis da equipe, fila pesquisável e filtrável, posse atômica do atendimento, devolução à fila, reatribuição administrativa e workspace de análise com autosave.
- Ticket locking e autorização de edição impostos no PostgreSQL; observações internas permanecem invisíveis ao estudante e o ciclo de atribuição gera logs de auditoria.
- Incremento 5 implementado localmente: pendências por campo, seis justificativas padronizadas com complemento livre, destaque e edição exclusiva dos campos devolvidos, histórico imutável de rodadas e correções e caixa de saída de e-mails.
- Entrega local de e-mails preparada no Mailpit para abertura, pendência e futura liberação; nenhum provedor externo de e-mail está habilitado.
- Incremento 6 implementado localmente: autoridades reutilizáveis de pessoas com formas transcrita e autorizada, vocabulário controlado bilíngue, CDU e Cutter manuais, sugestão CDU explicável pelo histórico e preparação estruturada para futuro MARC 21.
- Incremento 7 implementado localmente: revisão final, homologação imutável com data, horário, bibliotecário e CRB, geração isolada da ficha em PDF e layout CIP provisório com as regras catalográficas já confirmadas.
- Revisão institucional da ficha implementada em `institutional-v2`: modelos de TCC de graduação, MP-CECRE, dissertação e tese; título com recurso eletrônico condicionado ao subtítulo, extensão por páginas ou volumes, anos de depósito e defesa, ilustrações, notas transcritas, traçados autorizados e geometria compartilhada entre prévia e PDF. Snapshots antigos `provisional-v1` permanecem imutáveis.
- Incremento 8 implementado localmente: Nada Consta em bucket privado, validações de extensão, MIME, assinatura PDF e limite inicial de 5 MB, aprovação ou devolução pelo responsável, liberação condicionada e expurgo programado para 60 dias após o encerramento.
- Incremento 9 implementado localmente: ficha isolada e mesclagem integral no navegador, confirmação do arquivo analisado e da folha de rosto, fonte TTF/OTF local opcional, geometria compartilhada e orientação explícita sobre PDF/A.
- Incremento 10 implementado localmente: guia passo a passo do autodepósito no RI/UFBA, mapeamento confirmado por tipo de trabalho, cópia apenas de metadados aplicáveis, registro do início, configuração administrativa por programa e TFG de graduação inicialmente desativado.
- Incremento 11 implementado localmente: verificação da publicação no RI/UFBA, URL/Handle permanente, encerramento transacional, timeline completa, comunicações finais e Magic Link somente leitura da coordenação com token armazenado apenas como hash.
- O acesso da coordenação omite CPF, documentos e comentários internos e é inutilizado somente depois que as comunicações finais enfileiradas forem entregues. O encerramento aciona a contagem já existente de 60 dias para expurgo do Nada Consta.
- Incremento 12 implementado localmente: gestão auditada de contas, bloqueio/inativação e perfis, coordenações, Magic Link, guia do RI, mural, SLA, templates básicos, indicadores, exportações CSV/JSON, expurgo assistido do Nada Consta e consulta aos logs.
- Incremento 13 em estabilização: Playwright e axe cobrem páginas públicas em desktop claro/escuro e celular, teclado, acessibilidade, responsividade, persistência de tema e latência simulada. A rodada autenticada dos três perfis aprovou 9/9 cenários e as sessões temporárias permaneceram fora do Git e foram apagadas depois do teste.
- Refinamento catalográfico em implementação local: Cutter sem inicial do título, subtítulo normalizado, ficha ancorada na região inferior, designações livres, prévia reativa, validação por campo na mesma tela, autoridades e vocabulário com aproximação, termos reordenáveis e nome padronizado do PDF mesclado.
- Runbook operacional, matriz de validação assistida e revisão técnica de segurança/LGPD estão versionados. Implantação remota e validação com pessoas reais ainda não foram executadas.
- Dependências de produção atualizadas para Next.js 16.3.2 e Drizzle ORM 0.45.2 após auditoria de segurança; `npm audit --omit=dev` não aponta vulnerabilidades conhecidas. A convenção de proteção de rotas foi migrada de `middleware` para `proxy` sem alteração da política de acesso.

## Estado operacional do Supabase

As migrações versionadas abaixo estão registradas no histórico remoto e reproduzem localmente o esquema atual:

1. `202608060000_foundation.sql`;
2. `202608060001_auth_accounts.sql`;
3. `202608220000_auth_authorization_hardening.sql`;
4. `202608230000_student_requests.sql`;
5. `202608230001_staff_queue.sql`;
6. `202608230002_issues_communications.sql`;
7. `202608230003_assisted_cataloging.sql`;
8. `202608230004_cataloging_card.sql`;
9. `202608230005_nada_consta_release.sql`;
10. `202608230006_browser_pdf_delivery.sql`;
11. `202608230007_repository_deposit_guide.sql`;
12. `202608230008_protocol_closure_coordination.sql`;
13. `202608230009_administration_operations.sql`;
14. `202608230010_stabilization_release.sql`.
15. `202608260000_cataloging_card_institutional_models.sql`.

As 14 primeiras migrações estão aplicadas no projeto remoto `Pronto!`. A migração 15 está aplicada somente no Supabase local e não será enviada ao remoto sem revisão de impacto e confirmação explícita.

## Testes integrados de banco

A suíte pgTAP em `supabase/tests/database` contém 209 testes integrados contra o Supabase local. Ela valida com identidades sintéticas as decisões existentes de autorização, RLS, provisionamento administrativo, abertura de solicitações, ticket locking, reatribuição, devolução por campo, reenvio restrito, histórico, caixa de saída de e-mails, autoridades de pessoas, vocabulário bilíngue, sugestão CDU, homologação imutável da ficha, ciclo privado do Nada Consta, liberação restrita do snapshot ao estudante, autodepósito assistido, operações administrativas e regressão da edição do mural, sem depender de credenciais ou dados reais. A estabilização acrescenta 24 cenários E2E públicos e 9 autenticados dos três perfis.

## Próximo passo de produto

Concluir os testes com PDFs institucionais anonimizados, executar a validação assistida e resolver os bloqueadores institucionais de lançamento. O Preview da Vercel e o Supabase remoto estão implantados; a promoção pública ainda depende desses aceites.
