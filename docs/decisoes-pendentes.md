# Decisões pendentes

Este arquivo contém somente pontos que o Documento-Mestre Consolidado ainda não resolveu. Nenhuma opção abaixo deve ser inferida durante o desenvolvimento. Ao resolver uma pendência, atualizar também `docs/documento-mestre.md`.

## Vocabulário, CDU, Cutter e MARC 21

- **CDU:** após uso piloto, avaliar se a fórmula simples `2:1` precisa de curadoria ou refinamento, mantendo a ausência de IA.
- **Vocabulário:** definir futuramente o fluxo administrativo de mesclagem de termos; o cadastro bilíngue, a normalização inicial e a prevenção de novas duplicidades já estão decididos.
- **Cutter:** avaliar a confiabilidade e adequação da listagem do repositório público `veralvx/cutter-sanborn-table` antes de incorporá-la.
- **Cutter:** explicitar se o dropdown de aproximação entra no MVP ou se, no MVP, permanece apenas o campo manual, pois a implementação completa está classificada para a Fase 2.
- **MARC 21:** na fase posterior, mapear campos/subcampos e o formato útil ao fluxo real do Pergamum.

## DSpace/RI-UFBA

- O mapeamento das telas de TCC, dissertação e tese foi validado em 23/08/2026 com capturas do fluxo real e tutoriais oficiais do RI/UFBA. Permanecem pendentes somente decisões futuras explicitadas abaixo.
- Decidir futuramente se a página pública do QR Code redirecionará automaticamente ou exibirá um botão para a URL/Handle.

## Arquivos e segurança

- **Segurança:** detalhar limites, ações cobertas pelos logs e política de acesso onde ainda não estiver definida no Documento-Mestre.

## Coordenação, Magic Link e comunicações

- Avaliar após o piloto se a página da coordenação precisa de outros dados além da identificação básica do trabalho, status, SLA e timeline operacional já implementados.
- Redigir em conjunto os textos dos e-mails transacionais.
- Definir o tratamento/configuração do e-mail de pendência para a coordenação no MVP.
- Cadastrar os e-mails oficiais das coordenações por curso/programa.
- Confirmar a viabilidade e as políticas do SMTP institucional da biblioteca; se inviável, escolher o serviço transacional externo gratuito.
- Definir retenção, preferências e a regra de arquivamento/leitura da central de notificações autenticadas, sem expor dados sensíveis.

## Atendimento e operação

- Refinar os textos dos templates de justificativas após uso piloto, sem alterar a decisão de bloquear campos já aprovados.

## Interface

- Detalhar telas e componentes do MVP dentro do design system consolidado.
- Escolher entre as alternativas tipográficas sugeridas quando necessário, sem descaracterizar a identidade da BIB/FA.
- Definir a lista, a descoberta e as combinações de atalhos globais para acelerar a análise bibliotecária, respeitando a regra já aprovada de não executar ações críticas sem confirmação explícita.

## Lançamento

- Confirmar as URLs de callback de produção do Supabase para `https://prontobib.vercel.app`.
- Aprovar o aviso de privacidade, o canal do titular, o SMTP institucional e os textos finais antes do lançamento público.
- Executar a validação assistida com estudantes e bibliotecários e registrar o aceite sem dados pessoais.
