# Decisões pendentes

Este arquivo contém somente pontos que o Documento-Mestre Consolidado ainda não resolveu. Nenhuma opção abaixo deve ser inferida durante o desenvolvimento. Ao resolver uma pendência, atualizar também `docs/documento-mestre.md`.

## Autenticação e contas

- Definir se o cadastro de estudantes será aberto a qualquer pessoa ou terá algum critério de elegibilidade.
- Definir se o e-mail precisa ser confirmado antes do primeiro acesso e o comportamento do fluxo enquanto estiver pendente.
- Definir a política de senha aplicável além dos controles oferecidos pelo Supabase Auth.
- Definir o fluxo de recuperação de senha e os limites da redefinição de senha pelo Administrador.
- Definir como será criada a primeira conta de Administrador e como contas de Catalogador serão provisionadas, sem promover perfis por dados controlados pelo cliente.
- Especificar o efeito de `active`, `blocked` e `inactive` sobre sessão existente, novos acessos e recuperação de conta.
- Esclarecer se CPF e e-mail são, individualmente, chaves únicas ou se “CPF/e-mail” representa alguma regra combinada, inclusive para alteração de e-mail.
- Definir proteção, acesso, exibição e eventual mascaramento do CPF persistido, além do princípio já consolidado de coleta mínima.
- Definir o conteúdo e a forma de aceite do aviso de privacidade apresentado no cadastro.

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

- Redigir os templates de justificativas de pendência.
- Detalhar quando campos corretos ficarão travados ou apenas preservados após uma devolução.

## Interface

- Detalhar telas e componentes do MVP dentro do design system consolidado.
- Escolher entre as alternativas tipográficas sugeridas quando necessário, sem descaracterizar a identidade da BIB/FA.
