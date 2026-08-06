# Documento-Mestre Consolidado

## Projeto Pronto! — Assistente de Fichas Catalográficas e Autodepósito

> **Fonte única da verdade do projeto.** Não recuperar decisões antigas que não estejam neste documento. Toda decisão nova deve atualizá-lo. Em caso de ambiguidade, perguntar antes de inferir.

## 1. Identidade do sistema

| Item | Decisão consolidada |
| --- | --- |
| Nome | Pronto! |
| Subtítulo | Assistente de Fichas Catalográficas e Autodepósito |
| Instituição de referência | Universidade Federal da Bahia — UFBA |
| Unidade/biblioteca de referência | Biblioteca da Faculdade de Arquitetura — BIB/FA, vinculada ao Sistema Universitário de Bibliotecas — SIBI/UFBA |
| Público principal | Estudantes concluintes que precisam solicitar ficha catalográfica e realizar autodepósito no Repositório Institucional |
| Público operacional | Bibliotecários catalogadores e bibliotecário administrador |
| Foco do MVP | Reduzir trabalho repetitivo do bibliotecário e oferecer fluxo eficiente, claro e seguro para o estudante |

## 2. Premissas gerais

| Premissa | Decisão consolidada |
| --- | --- |
| Leveza | O sistema deve ser leve, responsivo, econômico e adequado a computadores simples, celulares e conexões lentas. |
| Baixo custo | A primeira versão deve considerar hospedagem gratuita ou de custo mínimo. |
| Processamento | Sempre que possível, operações de PDF, renderização e mesclagem devem ocorrer no navegador do usuário. |
| Servidor | Deve guardar apenas metadados, usuários, logs, configurações e arquivos leves estritamente necessários. |
| Trabalho completo | O PDF completo do trabalho acadêmico não deve ser enviado ao servidor do Pronto!. |
| Upload permitido | O sistema recebe o PDF do Nada Consta, arquivo leve e temporário. |
| Rigor | Não inventar regra catalográfica, institucional ou campo do DSpace sem confirmação. |
| Escopo | O sistema não substitui o Repositório Institucional nem automatiza integralmente o depósito; auxilia o estudante no autodepósito. |
| Papel profissional | A ficha catalográfica continua sendo validada/homologada por bibliotecário. |

## 3. Escopo geral do sistema

O Pronto! deve apoiar o ciclo:

1. estudante cadastra/acessa conta;
2. abre solicitação de ficha;
3. informa metadados e link público do trabalho completo;
4. envia o PDF do Nada Consta na etapa definida;
5. bibliotecário catalogador analisa os dados;
6. devolve pendências por campo, se necessário;
7. estudante corrige as pendências;
8. bibliotecário homologa a ficha;
9. valida o Nada Consta;
10. sistema libera a ficha isolada e, principalmente, sua mesclagem ao PDF do trabalho;
11. estudante faz o autodepósito no DSpace;
12. bibliotecário valida a publicação no DSpace e informa a URL/Handle no Pronto!;
13. protocolo é encerrado e e-mails finais são enviados ao estudante e à coordenação;
14. PDF do Nada Consta é expurgado 60 dias após o encerramento.

O estudante só pode solicitar ficha para trabalho já apresentado/defendido e aprovado por banca e deve marcar declaração explícita dessa condição. Não precisa informar a página da ata ou folha de aprovação. O trabalho disponibilizado por link deve conter a folha de aprovação assinada ou digitalizada, sem upload separado.

## 4. Perfis de acesso

### 4.1. Estudante

- Conta única vinculada a CPF e e-mail, reutilizável em ciclos acadêmicos futuros.
- O cadastro é permitido somente com endereço de e-mail do domínio `@ufba.br`.
- A confirmação do e-mail é obrigatória antes do primeiro acesso.
- O CPF é único e fica associado a um único e-mail. O mesmo usuário pode alterar seu endereço `@ufba.br` quando necessário, inclusive em situações institucionais como a adoção de nome social, mas o novo endereço precisa ser confirmado.
- A matrícula pertence ao vínculo acadêmico ou à solicitação, não permanentemente à conta. Em novo grau, pode cadastrar nova matrícula sem perder o histórico.
- Pode abrir solicitação se não houver protocolo ativo.
- Tem salvamento automático local durante o preenchimento.
- Visualiza status, pendências, SLA e etapas restantes; corrige apenas campos devolvidos, quando aplicável.
- Envia e acompanha a validação do Nada Consta.
- Baixa ficha isolada ou gera o trabalho completo com ficha mesclada.
- Recebe orientações e botões para copiar metadados homologados para o DSpace.

### 4.2. Bibliotecário Catalogador

- Acessa a fila e assume atendimento com *ticket locking*.
- Analisa metadados, link, termos, CDU, Cutter e demais dados.
- Marca pendências por campo e usa justificativas padrão ou texto livre.
- Homologa a ficha e valida o Nada Consta.
- Preenche CDU e Cutter manualmente, apoiado por sugestões.
- Pode registrar comentários internos e deve ter proteção contra perda de dados.
- A exportação MARC 21 fica para fase posterior; o MVP apenas estrutura os dados para futuro mapeamento.

### 4.3. Bibliotecário Administrador

- Herda 100% das funções do Catalogador.
- Cria contas, redefine senhas, bloqueia/desativa usuários e altera perfis.
- Contas de Catalogador e de Administrador somente podem ser criadas por um Administrador; não são obtidas pelo cadastro público nem por autoelevação de perfil.
- A primeira conta de Administrador deve ser provisionada internamente para permitir o primeiro acesso ao painel, sem depender da existência prévia de outro Administrador.
- Reatribui atendimentos, devolve chamados à fila e resolve travas.
- Cadastra curso/programa e e-mail da coordenação; ativa/desativa Magic Link.
- Gerencia mural/status, estatísticas, exportações JSON/CSV e vocabulário controlado.
- Poderá editar campos, condicionais e templates em fase posterior.

## 5. Anti-duplicidade e protocolo

| Item | Decisão consolidada |
| --- | --- |
| Chave principal | CPF/e-mail do estudante |
| Solicitação ativa | Bloquear nova solicitação enquanto houver protocolo em andamento |
| Reutilização | Após conclusão/cancelamento, permitir nova solicitação em futuro grau acadêmico |
| Formato | `FCANO-XXXX`, por exemplo `FC2026-0001` |
| Uso | Visível no ambiente logado e em comunicações internas/operacionais |
| Página pública | Não exibir o protocolo na autenticação pública do QR Code |
| Evolução | Possibilidade de prefixos futuros, como NC e DD |

## 6. Documentos e arquivos

### 6.1. Trabalho acadêmico completo

- Não haverá upload no servidor do Pronto!; o estudante informa link público de Google Drive, OneDrive, Dropbox, iCloud, Proton Drive, Nextcloud ou outro serviço.
- Deve ser o trabalho completo, finalizado, defendido e aprovado, com folha de aprovação assinada ou digitalizada.
- Não haverá envio separado de folha de rosto, folha de aprovação ou ata.
- O link deve permitir visualização por qualquer pessoa com o link e possibilitar ao bibliotecário conferir tudo em um único arquivo.
- O sistema informa que o PDF usado na mesclagem deve ser o mesmo disponibilizado para análise.

### 6.2. Consistência do arquivo mesclado

Antes da mesclagem, mostrar nome e tamanho do PDF selecionado localmente e exigir declaração explícita de que é o mesmo arquivo completo analisado. Alertar que arquivo diferente pode gerar inconsistência acadêmica/documental. Hash não é obrigatório no MVP; SHA-256 client-side pode ser estudado futuramente, sem upload.

### 6.3. Nada Consta

- É o único PDF armazenado pelo Pronto! e deve ser enviado diretamente pelo estudante.
- A ficha pode ser analisada/homologada em paralelo, mas download final e mesclagem ficam bloqueados até sua validação pelo bibliotecário.
- Deve ter limite máximo sensato e configurável, ajustável durante testes, e validação por extensão, MIME e *magic bytes*.
- Deve ser excluído definitivamente 60 dias após o encerramento; preservar apenas registro textual/log da validação.
- Não assumir regras de Pergamum, validade ou código sem confirmação futura.

### 6.4. Fontes tipográficas

- Arial, Verdana, Times New Roman e Tahoma não exigem envio.
- Fonte personalizada pode ser selecionada localmente pelo estudante na geração/mesclagem, sem armazenamento permanente no servidor; a renderização ocorre no navegador.
- Aplicar abordagem híbrida: compatibilidade tipográfica visual com geometria normativa protegida. Recuos, margens, largura, alinhamento relativo à quarta letra e demais posições permanecem controlados pelo template.

## 7. Formulário do estudante

- Exige login, instruções/microcopy, validação clara e rascunho automático local.
- Inclui link público multi-nuvem, Nada Consta na etapa definida e observação opcional.
- Palavras-chave são tags individuais, em português e inglês quando aplicável.
- Permite título, subtítulo, título em inglês, outros títulos, orientador, coorientador, cotutela, dupla titulação, título equivalente e múltiplos volumes quando aplicável.
- Permite formato/dimensão A4, A3, paisagem, livro/quadrado ou personalizado.
- Inclui declaração explícita de que o trabalho foi apresentado/defendido e aprovado por banca.

### 7.1. Níveis acadêmicos do MVP

Graduação, Especialização, Mestrado e Doutorado.

### 7.2. Programas iniciais

1. Bacharelado em Arquitetura e Urbanismo;
2. Especialização em Assistência Técnica, Habitação e Direito à Cidade;
3. Mestrado Profissional em Conservação e Restauração de Monumentos e Núcleos Históricos;
4. Programa de Pós-Graduação em Arquitetura e Urbanismo — Mestrado em Arquitetura e Urbanismo;
5. Programa de Pós-Graduação em Arquitetura e Urbanismo — Doutorado em Arquitetura e Urbanismo.

## 8. Ficha catalográfica

### 8.1. Elementos visuais e institucionais

- Cabeçalho “Dados Internacionais de Catalogação na Publicação (CIP)”, centralizado e em negrito.
- Identificar Universidade Federal da Bahia — UFBA, Sistema Universitário de Bibliotecas — SIBI e Biblioteca da Faculdade de Arquitetura — BIB/FA.
- Linha horizontal superior abaixo do cabeçalho e inferior antes do responsável técnico; sem bordas laterais.
- CDU à direita; nome e CRB do bibliotecário logado abaixo da ficha.
- Altura dinâmica, largura conforme padrão institucional da BIB/FA e ficha no quadrante inferior da página.
- Declaração de direitos/licenciamento no topo; página sem paginação e sem ser contabilizada.

### 8.2. Regras catalográficas e de conteúdo

- Estudante fornece dados; bibliotecário valida, corrige e homologa; sistema gera a ficha com os dados homologados.
- Parágrafos abaixo do autor seguem o padrão de recuo, incluindo referência à quarta letra do sobrenome.
- Autor pode incluir ano de nascimento como `Sobrenome, Nome, YYYY-`; obrigatoriedade permanece pendente.
- Usar `[recurso eletrônico]` e `p.` para versão digital conforme decisão baseada na Portaria 153/2023; usar “Traçados” com cedilha.
- Suportar títulos equivalentes com `=`, coorientação, cotutela, dupla titulação, múltiplos volumes e notas institucionais.
- A ficha usa termos controlados em português definidos pelo bibliotecário.

### 8.3. Pessoas e formas de nome

- Dados de autores, orientadores, coorientadores e demais pessoas devem ser armazenados, sanitizados e reutilizáveis para reduzir redigitação.
- Distinguir forma transcrita (como consta na folha de rosto) e autorizada (pontos de acesso/entradas).
- Para orientador/coorientador, a nota usa a forma transcrita e a entrada secundária, a autorizada.
- Para autor, a indicação de responsabilidade após `/` usa a forma transcrita e a entrada principal, a autorizada.
- Correções de forma autorizada não sobrescrevem automaticamente registros históricos; preservar rastreabilidade.

## 9. Vocabulário controlado, CDU, Cutter e MARC 21

### 9.1. Vocabulário controlado

- Estudante informa palavras-chave livres em PT/EN; bibliotecário transforma/valida termos controlados.
- Autocompletar sugere termos já usados. O sistema aprende pelo histórico de fichas homologadas, sem IA.
- Bibliotecário pode criar termo; admin pode corrigir e mesclar duplicados.
- Remover espaços duplos, padronizar caixa e evitar pontuação indevida.
- A ficha usa termos em português; DSpace poderá usar PT/EN conforme mapeamento.

### 9.2. Assistente CDU

- Preenchimento e decisão final são manuais pelo bibliotecário.
- Sugestões usam somente histórico de fichas e códigos associados a termos homologados, sem IA ou aprendizado de máquina externo.
- Solução C: termo principal tem peso maior; termos secundários, peso menor.
- Explicar a sugestão, por exemplo: “usado em X fichas com este termo”.
- Versão simples no MVP se possível; ranking refinado e curadoria termo-CDU depois.

### 9.3. Assistente Cutter-Sanborn/CAT

- Campo manual com dropdown de sugestões por aproximação; nunca atribuir automaticamente.
- Usar tabela estática local. O repositório público indicado para avaliação da listagem é `veralvx/cutter-sanborn-table`.
- A decisão final é sempre do bibliotecário.

### 9.4. MARC 21

- Fica para fase posterior, para exportar/copiar metadados e apoiar interoperabilidade com Pergamum por Catalogadores e Administradores.
- O MVP deve modelar dados estruturados para futuro mapeamento de campos/subcampos, sem exportação ou integração automática.

## 10. Atendimento bibliotecário

### 10.1. Fila e ticket locking

- Filtros: status, curso/programa, nível, tempo na fila, responsável, dúvida interna e busca textual.
- Busca: estudante, protocolo, título, orientador e outros metadados.
- Bibliotecário assume e trava o chamado para outros editores; pode devolvê-lo à fila.
- Admin pode reatribuir ou devolver à fila; registrar reatribuições e ações relevantes.

### 10.2. Devolução por pendência

- Marcar exatamente os campos incorretos, com template ou texto livre; gerar e-mail com campos e justificativas.
- Destacar pendências para o estudante; campos corretos podem ficar travados ou preservados para evitar alterações indevidas.
- Tratar especificamente pendência de Nada Consta.

### 10.3. Comentários internos

Permitir dúvidas técnicas invisíveis ao estudante, gerais ou ligadas a campo/área, em fluxo assíncrono e não bloqueante. No MVP podem ser observações simples; fórum completo fica para Fase 2.

## 11. Entrega final e mesclagem

- Liberar somente com ficha homologada e Nada Consta validado.
- Destacar “Gerar e baixar trabalho completo com ficha”; manter ficha isolada como link discreto.
- Mesclar no navegador, sem upload do trabalho, usando `pdf-lib` ou equivalente leve.
- Inserir a ficha depois da folha de rosto; bibliotecário pode informar/confirmar sua página.
- Antes, mostrar nome/tamanho e exigir confirmação do arquivo pelo estudante.
- Não prometer PDF/A garantido em JavaScript; orientar conferência/conversão final conforme exigência do repositório.

## 12. Autodepósito e DSpace/RI-UFBA

- O Pronto! assiste o preenchimento manual, não substitui o DSpace, não envia o trabalho ao RI/UFBA e não usa API/SWORD no MVP.
- Reutilizar metadados homologados e oferecer botões de copiar conforme mapeamento das telas reais.
- Estudante faz o depósito; bibliotecário valida a publicação e informa URL/Handle, encerrando o protocolo.
- Licença, acesso, embargo e licença de distribuição são escolhas/declarações do estudante no RI/UFBA; nunca preencher ou escolher automaticamente opções jurídicas ou institucionais.
- Não inventar campos do DSpace.

### 12.1. Guia para graduação

Os TCCs de graduação da Faculdade de Arquitetura são TFG — Trabalho Final de Graduação. Como seu depósito no RI/UFBA está atualmente suspenso por questões normativas, o admin pode ativar/desativar o guia por curso/programa; para TFG, começa desativado. Emissão e homologação da ficha independem do guia.

## 13. QR Code e autenticação pública

- Aprovado para Fase 2 como autenticação da ficha e ponte para o DSpace.
- URL usa hash/UUID, nunca protocolo.
- Página mostra selo, discente, título, curso/programa, data/hora de homologação, bibliotecário e CRB; não mostra protocolo ou dados sensíveis.
- Antes do DSpace, indica publicação pendente; depois, botão ou redirecionamento para URL/Handle (decisão ainda pendente).

## 14. Coordenação e Magic Link

- Entra no MVP, ativável/desativável pelo admin inclusive por curso/programa.
- Coordenação não tem login/senha; recebe token seguro e página somente leitura com linha do tempo, status e SLA.
- Não mostrar CPF completo, Nada Consta, documentos ou comentários internos.
- Se ativo, enviar e-mail de abertura e final; pendência é configurável.
- Admin cadastra e-mail, pode desativar a função/token; o token deixa de ser útil após conclusão integral e envio do e-mail final.
- Aplicar a solução mais simples e segura compatível com baixo custo. Portal institucional fica para fase futura.

## 15. Mural, status e SLA

- Admin gerencia aviso/status: normal, recesso, paralisação/greve ou outro aviso institucional.
- Estudante vê antes/durante a solicitação; estudante e coordenação veem prazo/status.
- Prazo inicial: três dias úteis, ajustável posteriormente pelo administrador.
- Mural e SLA entram no MVP em versão simples para reduzir cobranças e alinhar expectativas.

## 16. E-mails transacionais

- Abertura ao estudante; abertura à coordenação se Magic Link estiver ativo.
- Pendência ao estudante com campos/justificativas; para coordenação, opcional/configurável.
- Liberação da ficha e encerramento ao estudante; encerramento à coordenação com dados básicos e URL/Handle.
- Canal: e-mail; WhatsApp descartado. Textos finais serão redigidos em conjunto.
- Priorizar SMTP institucional da biblioteca quando configuração e políticas da UFBA permitirem; serviço transacional externo gratuito é alternativa.

## 17. Estatísticas, relatórios e backup

- Admin: versão simples com volume por período, status, curso/programa e bibliotecário.
- Exportação básica CSV/JSON e backup de dados essenciais.
- Relatórios avançados ficam para depois; não criar módulo separado de relatórios anuais.

## 18. Arquitetura e hospedagem

### 18.1. Fundação e hospedagem inicial

- Next.js, React, TypeScript, Node.js 22, Drizzle e GitHub Actions.
- Supabase Auth, PostgreSQL e Storage; hospedagem Vercel Free ou equivalente gratuito.
- O projeto Supabase Free usa a organização `BIB/FAUFBA`, o nome `Pronto!` e a região `South America (São Paulo)` (`sa-east-1`).
- O projeto usa o Postgres padrão estável, com Data API habilitada, exposição automática de novas tabelas desabilitada e RLS automático habilitado.
- Storage somente para Nada Consta e arquivos leves permitidos; fontes personalizadas são selecionadas localmente.
- E-mail por SMTP institucional, se viável, ou serviço externo gratuito.
- PDF com `pdf-lib` ou equivalente no navegador; UI com Tailwind CSS e componentes leves.
- Identificadores técnicos (estados, enums, variáveis, classes, tabelas etc.) em inglês; textos ao usuário em português.
- Aplicar Clean Code e organização que facilite transição para STI/UFBA.

### 18.2. Produção institucional futura

VM Linux UFBA/STI, Docker/Docker Compose, Nginx, Let's Encrypt ou certificado institucional, PostgreSQL e disco institucional ou S3 compatível. Referência mínima: 2 vCPU, 2–4 GB RAM e 20–40 GB SSD.

## 19. Segurança e LGPD

- HTTPS obrigatório; Supabase Auth com hash seguro; cookies seguros quando aplicável; controle por perfil.
- A política de senha do Pronto! é a política segura configurada no Supabase Auth, sem uma segunda política própria da aplicação.
- A recuperação de senha oferece autoatendimento por link enviado ao e-mail `@ufba.br` e assistência administrativa para casos excepcionais.
- ORM/prepared statements contra SQL injection; sanitização/escape contra XSS; proteção CSRF em rotas sensíveis quando aplicável.
- Validar uploads permitidos e registrar ações administrativas/operacionais relevantes.
- Coletar o mínimo, expurgar temporários e excluir Nada Consta 60 dias após encerramento.
- Magic Link imprevisível, somente leitura, sem documentos sensíveis e inútil após conclusão integral e envio final.
- Limites exatos, detalhes de logs e política de acesso que não estejam aqui permanecem pendentes.

## 20. Design system e interface

- Identidade institucional da UFBA, com destaque à identidade visual atual da BIB/FA.
- Linguagem predominantemente monocromática, arquitetônica, geométrica e técnica, inspirada no logotipo da biblioteca.
- Azul `#1A3B70` e ouro `#C5A059` como possíveis acentos; grafite `#1E293B`, concreto/prata `#E2E8F0`/`#F4F6F9`, linha `#CBD5E1` e vermelho `#991B1B` na paleta sugerida.
- Interface: Inter ou Fira Sans; títulos: Cinzel ou Playfair, se adequado; técnica: JetBrains Mono ou Fira Code.
- Temas claro, escuro e conforme sistema; preservar contraste, legibilidade, responsividade e identidade.
- Refinamento milimétrico da ficha e telas será feito depois.

## 21. Escopo por fase

### 21.1. Deve entrar no MVP

- identidade oficial; hospedagem gratuita/baixo custo; perfis Estudante, Catalogador e Administrador; Supabase Auth e controle de perfil;
- um protocolo ativo por CPF/e-mail e geração `FCANO-XXXX`;
- formulário, auto-save, link do trabalho sem upload, confirmação de trabalho defendido/aprovado e consistência do PDF;
- Nada Consta com upload, validação, trava e retenção de 60 dias;
- painéis do estudante e catalogador, fila, *ticket locking*, reatribuição, pendências por campo e templates;
- e-mails básicos, Magic Link configurável, coordenação, SLA e mural;
- ficha institucional básica, responsável técnico, vocabulário simples e sugestão CDU simples;
- mesclagem client-side, confirmação do PDF, download principal completo e ficha isolada secundária;
- guia de autodepósito configurável por programa, botões de copiar metadados;
- estatísticas simples, exportação JSON/CSV, autenticação, upload seguro, LGPD e logs básicos;
- dados estruturados para futuro MARC 21, sem exportação no MVP.

### 21.2. Pode ficar para Fase 2

- QR Code, página pública por hash/UUID e ligação/redirecionamento com DSpace;
- exportar/copiar MARC 21; Cutter completo; CDU refinado/explicável; vocabulário e merge avançados;
- mapeamento completo do DSpace; Magic Link avançado; relatórios completos; layout milimétrico;
- gestão avançada de templates e estudo de SHA-256 client-side.

### 21.3. Pode ficar para Fase 3

- construtor no-code de campos, condicionais e renderização ISBD;
- infraestrutura UFBA; portal robusto da coordenação; módulo docente/pesquisador;
- login único, bases acadêmicas e sistemas internos, se viável; auditoria institucional avançada.

## 22. Funcionalidades descartadas

- WhatsApp/API de mensagens; OCR no navegador; capturadores Lattes e Pergamum;
- API Pergamum e API DSpace/SWORD no MVP;
- upload do trabalho completo ou separado de folha de rosto/aprovação;
- validador automático de PDF, folha de rosto pré-gerada e split-screen com PDF;
- etiqueta de lombada, Google Agenda/`.ics` e tradução automática por IA/API;
- ficha totalmente automática sem bibliotecário;
- protocolo no QR público, página 2 fixa para ficha e Nada Consta permanente;
- login obrigatório para coordenação no MVP.

## 23. Regras de cautela

1. Não recuperar decisões antigas ausentes deste documento.
2. Não inventar regra sobre Nada Consta, Pergamum, DSpace, CDU, Cutter ou MARC 21.
3. Perguntar antes de inferir em caso de ambiguidade.
4. Priorizar redução do trabalho do bibliotecário e baixo custo no MVP.
5. Justificar impacto/custo de funcionalidades pesadas e diferenciar MVP, Fases 2 e 3 e descartados.
6. Não transformar o Pronto! em repositório institucional nem prometer PDF/A automático.
7. O sistema recebe o PDF do Nada Consta, mas não o trabalho completo.
8. Não repropor WhatsApp, OCR, Lattes, Pergamum API ou upload do trabalho.
9. Não expor protocolo interno publicamente.
10. Assistente CDU usa apenas histórico e contagem, nunca IA/machine learning.
11. Toda decisão nova deve atualizar este documento.

## 24. Sequência de planejamento

1. validar este documento como fonte única da verdade;
2. fechar o escopo final do MVP em tabela curta;
3. desenhar o fluxo passo a passo;
4. modelar telas mínimas;
5. modelar banco inicial;
6. detalhar a stack gratuita;
7. preparar plano de desenvolvimento por etapas;
8. só depois escrever o prompt técnico final para desenvolvimento.
