# Decisões pendentes

Este arquivo contém somente pontos que o Documento-Mestre Consolidado ainda não resolveu. Nenhuma opção abaixo deve ser inferida durante o desenvolvimento. Ao resolver uma pendência, atualizar também `docs/documento-mestre.md`.

## Vocabulário, CDU, Cutter e MARC 21

- **CDU:** após uso piloto, avaliar se a fórmula simples `2:1` precisa de curadoria ou refinamento, mantendo a ausência de IA.
- **Vocabulário:** definir futuramente o fluxo administrativo de mesclagem de termos; o cadastro bilíngue, a normalização inicial e a prevenção de novas duplicidades já estão decididos.
- **MARC 21:** na fase posterior, mapear campos/subcampos e o formato útil ao fluxo real do Pergamum.

## DSpace/RI-UFBA

- O mapeamento das telas de TCC, dissertação e tese foi validado em 23/08/2026 com capturas do fluxo real e tutoriais oficiais do RI/UFBA. Permanecem pendentes somente decisões futuras explicitadas abaixo.
- Decidir futuramente se a página pública do QR Code redirecionará automaticamente ou exibirá um botão para a URL/Handle.

## Coordenação, Magic Link e comunicações

- Avaliar após o piloto se a página da coordenação precisa de outros dados além da identificação básica do trabalho, status, SLA e timeline operacional já implementados.
- Cadastrar os e-mails oficiais das coordenações por curso/programa.
- Confirmar a viabilidade e as políticas do SMTP institucional da biblioteca; se inviável, escolher o serviço transacional externo gratuito.
- Após o MVP, avaliar integração das notificações da equipe com notificações nativas do navegador/sistema e Web Push, inclusive com a aba do Pronto! fechada; definir consentimento, compatibilidade, operação e retenção das assinaturas antes de implementar.
- Antes da publicação da exigência de data de nascimento no cadastro, validar institucionalmente a minuta v1.1 da Política de Privacidade, que descreve esse dado e o uso opcional do ano na ficha. A v1.0 aprovada e seus registros de ciência permanecem preservados.

## Atendimento e operação

- Refinar os textos dos templates de justificativas após uso piloto, sem alterar a decisão de bloquear campos já aprovados.

## Interface

- Detalhar telas e componentes do MVP dentro do design system consolidado.
- Escolher entre as alternativas tipográficas sugeridas quando necessário, sem descaracterizar a identidade da BIB/FA.
- Definir a lista, a descoberta e as combinações de atalhos globais para acelerar a análise bibliotecária, respeitando a regra já aprovada de não executar ações críticas sem confirmação explícita.

## Lançamento

- Confirmar as URLs de callback de produção do Supabase para `https://prontobib.vercel.app`.
- Confirmar o SMTP institucional antes do lançamento público.
- Executar a validação assistida com estudantes e bibliotecários e registrar o aceite sem dados pessoais.
