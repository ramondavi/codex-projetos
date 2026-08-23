# Decisões pendentes

Este arquivo contém somente pontos que o Documento-Mestre Consolidado ainda não resolveu. Nenhuma opção abaixo deve ser inferida durante o desenvolvimento. Ao resolver uma pendência, atualizar também `docs/documento-mestre.md`.

## Autenticação e contas

- Elaborar uma proposta de aviso de privacidade para posterior validação institucional e, depois da aprovação, definir sua forma de aceite no cadastro.

## Catalogação e ficha

- **Ano de nascimento:** decidir obrigatoriedade e regra de exibição do ano do autor.
- **Ficha:** refinar layout milimétrico, largura institucional, métricas e exemplos reais, preservando as regras já consolidadas.
- **PDF/A:** definir a orientação final ao estudante, sem prometer validação automática.

## Vocabulário, CDU, Cutter e MARC 21

- **CDU:** detalhar o algoritmo simples de sugestão por histórico, respeitando o peso maior do termo principal e a ausência de IA.
- **Vocabulário:** definir regras de capitalização, idioma e merge.
- **Cutter:** avaliar a confiabilidade e adequação da listagem do repositório público `veralvx/cutter-sanborn-table` antes de incorporá-la.
- **Cutter:** explicitar se o dropdown de aproximação entra no MVP ou se, no MVP, permanece apenas o campo manual, pois a implementação completa está classificada para a Fase 2.
- **MARC 21:** na fase posterior, mapear campos/subcampos e o formato útil ao fluxo real do Pergamum.

## DSpace/RI-UFBA

- Completar e validar o mapeamento dos campos das telas reais de autodepósito que serão auxiliados por botões de copiar.
- Decidir futuramente se a página pública do QR Code redirecionará automaticamente ou exibirá um botão para a URL/Handle.

## Arquivos e segurança

- **Nada Consta:** definir o valor inicial do limite máximo configurável durante os testes.
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
