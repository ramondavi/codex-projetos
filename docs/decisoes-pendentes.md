# Decisões pendentes

Este arquivo contém somente pontos que o Documento-Mestre Consolidado ainda não resolveu. Nenhuma opção abaixo deve ser inferida durante o desenvolvimento. Ao resolver uma pendência, atualizar também `docs/documento-mestre.md`.

## Autenticação e contas

- Elaborar uma proposta de aviso de privacidade para posterior validação institucional e, depois da aprovação, definir sua forma de aceite no cadastro.

## Catalogação e ficha

- **Ano de nascimento:** decidir obrigatoriedade e regra de exibição do ano do autor.
- **Ficha:** validar o layout provisório `provisional-v1` com exemplos institucionais reais e então refinar largura, métricas e espaçamentos, preservando as regras já consolidadas.

## Vocabulário, CDU, Cutter e MARC 21

- **CDU:** após uso piloto, avaliar se a fórmula simples `2:1` precisa de curadoria ou refinamento, mantendo a ausência de IA.
- **Vocabulário:** definir futuramente o fluxo administrativo de mesclagem de termos; o cadastro bilíngue, a normalização inicial e a prevenção de novas duplicidades já estão decididos.
- **Cutter:** avaliar a confiabilidade e adequação da listagem do repositório público `veralvx/cutter-sanborn-table` antes de incorporá-la.
- **Cutter:** explicitar se o dropdown de aproximação entra no MVP ou se, no MVP, permanece apenas o campo manual, pois a implementação completa está classificada para a Fase 2.
- **MARC 21:** na fase posterior, mapear campos/subcampos e o formato útil ao fluxo real do Pergamum.

## DSpace/RI-UFBA

- Completar e validar o mapeamento dos campos das telas reais de autodepósito que serão auxiliados por botões de copiar.
- Decidir futuramente se a página pública do QR Code redirecionará automaticamente ou exibirá um botão para a URL/Handle.

## Arquivos e segurança

- **Segurança:** detalhar limites, ações cobertas pelos logs e política de acesso onde ainda não estiver definida no Documento-Mestre.

## Coordenação, Magic Link e comunicações

- Definir os dados exatos exibidos na página da coordenação, além das restrições já consolidadas.
- Redigir em conjunto os textos dos e-mails transacionais.
- Definir o tratamento/configuração do e-mail de pendência para a coordenação no MVP.
- Cadastrar os e-mails oficiais das coordenações por curso/programa.
- Confirmar a viabilidade e as políticas do SMTP institucional da biblioteca; se inviável, escolher o serviço transacional externo gratuito.

## Atendimento e operação

- Refinar os textos dos templates de justificativas após uso piloto, sem alterar a decisão de bloquear campos já aprovados.

## Interface

- Detalhar telas e componentes do MVP dentro do design system consolidado.
- Escolher entre as alternativas tipográficas sugeridas quando necessário, sem descaracterizar a identidade da BIB/FA.
