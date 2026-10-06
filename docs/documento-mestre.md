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

O estudante só pode solicitar ficha para trabalho já apresentado/defendido e aprovado por banca e deve marcar declaração explícita dessa condição. Não precisa informar a página da ata ou folha de aprovação. O trabalho disponibilizado por link deve conter ata, página ou folha de aprovação datada, com assinatura manuscrita ou eletrônica de todos os membros da banca, sem upload separado.

## 4. Perfis de acesso

### 4.1. Estudante

- Conta única vinculada a CPF e e-mail, reutilizável em ciclos acadêmicos futuros. A data de nascimento completa é obrigatória no cadastro e permanece na conta, sem integrar a ficha.
- O cadastro é permitido somente com endereço de e-mail do domínio `@ufba.br`.
- Nos campos de e-mail das telas de entrada, cadastro e recuperação de senha, ao concluir a parte anterior ao `@`, o sistema completa `@ufba.br` e facilita a passagem ao próximo campo ou botão. Endereços completos informados pela pessoa são preservados para validação normal.
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
- Na assistência excepcional à recuperação de senha, pode conferir a situação da conta, orientar o usuário e reenviar o fluxo oficial. Nunca pode visualizar, solicitar ou definir uma senha conhecida por ele, nem dispensar a confirmação do novo e-mail; as ações administrativas relevantes devem ser registradas em log.
- Contas de Catalogador e de Administrador somente podem ser criadas por um Administrador; não são obtidas pelo cadastro público nem por autoelevação de perfil.
- A primeira conta de Administrador deve ser provisionada internamente para permitir o primeiro acesso ao painel, sem depender da existência prévia de outro Administrador.
- O provisionamento inicial ocorre em duas etapas: criação confirmada do usuário interno no Dashboard do Supabase e associação transacional dos perfis `administrator` e `staff_profiles` pelo SQL Editor, sem armazenar senha no repositório.
- Contas ativas têm acesso normal. Contas bloqueadas não podem iniciar ou manter sessões, preservam o histórico e podem ser desbloqueadas pelo Administrador. Contas inativas não podem acessar, preservam o histórico e podem ser reativadas pelo Administrador.
- Reatribui atendimentos, devolve chamados à fila e resolve travas.
- Cadastra curso/programa e e-mail da coordenação; ativa/desativa por curso o envio automático do Magic Link na abertura da solicitação.
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
- Deve ser o trabalho completo, finalizado, defendido e aprovado, com ata, página ou folha de aprovação datada e assinada, de forma manuscrita ou eletrônica, por todos os membros da banca.
- Não haverá envio separado de folha de rosto, folha de aprovação ou ata.
- O link deve permitir visualização por qualquer pessoa com o link e possibilitar ao bibliotecário conferir tudo em um único arquivo.
- O sistema informa que o PDF usado na mesclagem deve ser o mesmo disponibilizado para análise.

### 6.2. Consistência do arquivo mesclado

Antes da mesclagem, mostrar nome e tamanho do PDF selecionado localmente e exigir declaração explícita de que é o mesmo arquivo completo analisado. Alertar que arquivo diferente pode gerar inconsistência acadêmica/documental. Hash não é obrigatório no MVP; SHA-256 client-side pode ser estudado futuramente, sem upload.

### 6.3. Nada Consta

- É o único PDF armazenado pelo Pronto! e deve ser enviado diretamente pelo estudante.
- A ficha pode ser analisada/homologada em paralelo, mas download final e mesclagem ficam bloqueados até sua validação pelo bibliotecário.
- Deve ter limite máximo configurável, inicialmente definido em 5 MB e ajustável após os testes, e validação por extensão, MIME e *magic bytes*.
- Deve ser excluído definitivamente 60 dias após o encerramento; preservar apenas registro textual/log da validação.
- O estudante solicita/emite o Nada Consta no Meu Pergamum, sem pendências com as bibliotecas da UFBA. A emissão encerra o cadastro para empréstimos e outros serviços das bibliotecas; orientar a emissão na conclusão do curso e oferecer guia de ajuda. Fonte: guia de emissão da BIB/FA (2025).
- Não assumir validade ou código do documento sem confirmação futura.

### 6.4. Fontes tipográficas

- Arial, Verdana, Times New Roman e Tahoma não exigem envio.
- Fonte personalizada pode ser selecionada localmente pelo estudante na geração/mesclagem, sem armazenamento permanente no servidor; a renderização ocorre no navegador.
- Aplicar abordagem híbrida: compatibilidade tipográfica visual com geometria normativa protegida. Recuos, margens, largura, alinhamento relativo à quarta letra e demais posições permanecem controlados pelo template.

## 7. Formulário do estudante

- Exige login, instruções/microcopy, validação clara e rascunho automático local.
- Inclui link público multi-nuvem, Nada Consta na etapa definida e observação opcional.
- Palavras-chave são tags individuais, alinhadas por linha entre os idiomas. O estudante informa de três a cinco termos em cada idioma exigido: para original em português, português e inglês; para original em inglês, inglês e português; para original em espanhol, alemão, francês ou italiano, idioma original, português e inglês, nessa ordem. Um idioma estrangeiro adicional opcional acrescenta outro conjunto completo, com um termo em cada linha correspondente. O limite de cinco linhas vale somente para o preenchimento pelo estudante; o bibliotecário pode incluir mais de cinco assuntos durante a catalogação, conforme sua análise técnica.
- O título equivalente é obrigatório e estruturado por idioma, com título e subtítulo quando houver. Para original em português, exige-se equivalente em inglês; para original em inglês, equivalente em português; para original em espanhol, alemão, francês ou italiano, equivalentes em português primeiro e inglês depois. Admite-se ainda um equivalente opcional em um idioma estrangeiro diferente do original e dos obrigatórios.
- O idioma da interface é uma preferência independente: alterá-lo traduz os textos de orientação, sem mudar o idioma original, títulos ou palavras-chave. O idioma original é escolhido antes do título; sua alteração exige confirmação e orientação para conferir os textos já preenchidos. O idioma original não aparece entre as opções de título equivalente.
- O idioma da interface pertence à aplicação inteira, pública e autenticada. Na primeira visita, usa o idioma preferido do dispositivo quando disponível entre português, inglês, espanhol, alemão, francês e italiano; nos demais casos, português. A escolha explícita pelo menu com globo no canto superior esquerdo do rodapé persiste e prevalece sobre a detecção. Quando o idioma do dispositivo divergir da escolha, uma dica junto ao seletor abre automaticamente; pode ser fechada até a próxima sessão do navegador e reaberta pelo ícone. O formulário não tem seletor de idioma próprio.
- Cada linha de palavras-chave reúne termos equivalentes na ordem idioma original, idiomas equivalentes obrigatórios e, se escolhido, idioma estrangeiro adicional. Após a escolha explícita do idioma original, os campos dos títulos equivalentes obrigatórios surgem automaticamente, com os respectivos idiomas definidos e ordenados; somente o idioma estrangeiro adicional opcional precisa ser escolhido separadamente.
- A revisão lista somente itens com erro ou pendência, agrupados por etapa e seção. Cada item leva diretamente ao campo, que recebe foco e destaque temporário. O botão de envio permanece desativado até que todas as validações sejam atendidas; nesse estado, a explicação aparece dentro do botão, sem preenchimento de fundo e com as mesmas dimensões do estado ativo. Ao voltar a uma etapa já visitada, campos pendentes recebem fundo vermelho discreto.
- As abas do formulário ocupam toda a largura disponível. As quatro primeiras mostram a quantidade de pendências ou um sinal de conclusão; a aba Revisão não apresenta indicador. Ao focar uma aba com pendências, o indicador se expande para exibir o texto singular ou plural, com redistribuição das abas sem sobreposição.
- A abertura da solicitação é dividida em abas com avanço, retorno, acesso direto e uma tela final de revisão antes do envio. O rascunho automático informa claramente que o preenchimento pode ser interrompido e retomado. Rascunhos não enviados devem ser disponibilizados ao próprio estudante em outros dispositivos, sem gerar protocolo ou entrada na fila, e excluídos 60 dias após o último salvamento.
- Depois de iniciado um rascunho, a área “Sua próxima ação” da visão geral e a tela “Minha solicitação” do estudante apresentam, por categoria do formulário, um resumo dos campos preenchidos, pendentes e preenchidos com erro. O resumo usa as mesmas validações da revisão da solicitação e não exibe os valores pessoais no cartão. Na tela “Minha solicitação”, o resumo aparece quando não há protocolo ou quando o último protocolo está concluído ou cancelado.
- O resumo do rascunho e o formulário de submissão exibem uma barra percentual de preenchimento, calculada a partir dos campos exigidos pelas mesmas validações da revisão. O percentual é atualizado durante a digitação e quando o rascunho muda em outra aba; mostra a parte concluída e a restante até 100%.
- Quando todas as validações da solicitação estão satisfeitas, a barra chega a 100%, fica verde e se transforma em uma ação animada ao passar o mouse ou focar pelo teclado. Essa ação abre e posiciona a tela na etapa de revisão final, sem enviar automaticamente. Na visão geral e em “Minha solicitação”, o resumo deixa de listar os campos por categoria quando o rascunho chega a 100%.
- Nas mesmas duas telas, o botão do rascunho muda de “Continuar preenchimento” para “Revisar e enviar” ao chegar a 100%, abrindo diretamente a revisão final. O envio continua a depender da ação explícita da pessoa nessa etapa.
- Em “Minha solicitação”, a mensagem de ausência de solicitação aparece apenas quando não há protocolo nem rascunho. Com rascunho aberto, a tela mostra diretamente o resumo e a ação de continuar.
- O campo do estudante é somente “Título”; o subtítulo, quando houver, é informado separadamente. Cada título equivalente reúne título e subtítulo no mesmo campo. “Outro título” é uso catalográfico excepcional e fica disponível somente na análise bibliotecária.
- Nas telas que identificam o trabalho pelo título, exibir também o subtítulo quando houver, no formato “Título: subtítulo”. Os campos de edição e as regras específicas da ficha catalográfica permanecem separados.
- O formulário inicia com três linhas obrigatórias de palavras-chave; outras podem ser adicionadas até o máximo de cinco. Para títulos equivalentes, apresenta um campo para cada idioma obrigatório após a seleção do idioma original e permite acrescentar um campo opcional para outro idioma estrangeiro.
- O estudante informa somente os nomes transcritos de orientador e coorientador. As designações de orientação são de decisão/preenchimento exclusivo do bibliotecário; a presença do coorientador já caracteriza a coorientação, sem marcação adicional.
- A Especialização em Assistência Técnica, Habitação e Direito à Cidade (RAU+E) admite autoria compartilhada. O primeiro autor informado é a entrada principal da ficha; os demais são registrados como entradas secundárias. Os demais programas mantêm autoria única.
- A ordem catalográfica das pessoas relacionadas permanece explícita na análise: autor(es), orientador, coorientador quando houver e, por fim, demais membros da banca. O formulário do estudante não exibe essa numeração nos campos de autor e orientação. No RAU+E, autores podem ser reordenados somente entre si. Na banca, o orientador é o primeiro membro e o coorientador, quando houver, é o segundo; os demais seguem a ordem da ata, página ou folha de aprovação, com reordenação por arrastar ou por botões acessíveis.
- A orientação do link público deve citar Google Drive, OneDrive e serviços equivalentes e oferecer instruções curtas de compartilhamento público.
- O link do trabalho deve ser HTTPS e apontar para um recurso específico (arquivo ou pasta), não apenas para a página inicial do serviço. A validação estrutural ocorre no formulário e no banco; a biblioteca confere se o recurso existe e está acessível publicamente durante a análise.
- Permite formato/dimensão A4, A3, paisagem, livro/quadrado ou personalizado.
- Inclui declaração explícita de que o trabalho foi apresentado/defendido e aprovado por banca, além de ano de depósito, ano de defesa/apresentação, quantidade física e escolha explícita sobre ilustrações.
- Após as declarações sobre aprovação pela banca, arquivo final completo e ata, página ou folha de aprovação, o estudante assume em checkbox obrigatório o compromisso de manter acessível e não alterar, substituir nem remover o arquivo disponibilizado no link público após o envio da solicitação, até o encerramento do protocolo. Em um quinto checkbox obrigatório, destacado e em negrito, confirma estar ciente do cancelamento caso a biblioteca constate que uma ou mais das declarações anteriores não foram cumpridas. O banco exige e registra essas confirmações na abertura de novos protocolos.
- A data de nascimento completa é obrigatória no cadastro do estudante e fica na conta. Contas anteriores à mudança devem informá-la em Dados pessoais antes de abrir nova solicitação; esse primeiro preenchimento é único. Depois de informada, somente o Administrador pode corrigi-la, por ação própria na gestão de usuários e com registro de auditoria sem gravar a data no log. A correção não altera automaticamente dados de solicitações já enviadas ou fichas homologadas. Na submissão, o estudante não redigita a data: pode autorizar por checkbox o uso somente do ano de nascimento na ficha para diferenciar homônimos. Sem autorização, a solicitação segue normalmente e o ano não integra a ficha. Cada autorização vale para a solicitação correspondente.

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
- O ano de nascimento provém da data registrada na conta do estudante, somente quando seu uso foi autorizado naquela solicitação. Após validação manual pelo bibliotecário no Pergamum, aparece na entrada do autor como `Sobrenome, Nome, YYYY-`, sem ponto após o hífen; sem autorização ou validação, não é exibido. O bibliotecário pode desfazer essa validação antes da homologação. A data completa nunca integra a ficha.
- Usar `[recurso eletrônico]` e `p.` para versão digital conforme decisão baseada na Portaria 153/2023; usar “Traçados” com cedilha.
- Suportar títulos equivalentes com `=`, preservando idioma e ordem; para trabalho em língua estrangeira, o equivalente em português é obrigatório. Suportar também coorientação, cotutela, dupla titulação, múltiplos volumes e notas institucionais.
- A ficha usa termos controlados em português definidos pelo bibliotecário.
- A homologação da ficha exige ao menos três assuntos controlados em português, com exatamente um deles marcado como assunto principal.
- O título recebe `[recurso eletrônico]` imediatamente antes de ` : subtítulo`, quando houver subtítulo, ou de ` / responsabilidade`, quando não houver.
- A indicação de responsabilidade usa a forma transcrita do autor e é seguida de travessão, `Salvador` e ano de depósito da versão final.
- O ano de defesa/apresentação aparece ao final da nota acadêmica e é distinto do ano de depósito.
- A descrição física usa quantidade de páginas e `p.`; excepcionalmente, o MP-CECRE usa 2 ou 3 volumes e `v.`. A indicação `: il.` é acrescentada quando o trabalho possui ilustrações.
- A natureza e a nota acadêmica variam entre `Trabalho de Conclusão de Curso`, `Dissertação` e `Tese`. Uma meia-risca separa a natureza do trabalho da instituição.
- Subdivisões de assuntos e nomes usam hífen. Antes de Salvador usa-se travessão; na nota acadêmica usa-se meia-risca.
- O Cutter aparece isolado, sem o rótulo “Cutter”, e a CDU usa o prefixo `CDU:`.
- O Cutter não recebe a inicial do título depois da parte numérica.
- O subtítulo começa com letra minúscula, salvo quando a grafia exigir maiúscula por nome próprio ou outra exceção linguística conferida pelo bibliotecário.
- A ficha completa, do cabeçalho CIP ao responsável técnico, permanece sempre na região inferior da página.
- A ficha não imprime o rótulo “Traçados:”. Orientador e coorientador ocupam as entradas secundárias I e II quando presentes; o vínculo institucional do curso ocupa III e “Título” ocupa IV. Outros autores da RAU+E ocupam as entradas posteriores. Para bacharelado, RAU+E e MP-CECRE, a entrada III é “Universidade Federal da Bahia. Faculdade de Arquitetura.”; para dissertação e tese do PPGAU, acrescenta “Programa de Pós-Graduação em Arquitetura e Urbanismo.”. A prévia e o PDF deixam uma linha vazia antes da nota acadêmica, das pistas e da CDU.
- O bibliotecário seleciona a fonte de cada termo controlado entre Biblioteca Nacional, Tesauro de Arte e Arquitetura, Pergamum UFBA, Rede Pergamum e Library of Congress Authorities. A descrição da CDU reproduz exatamente o texto da CDU, 2ª edição impressa.

### 8.3. Pessoas e formas de nome

- Dados de autores, orientadores, coorientadores e demais pessoas devem ser armazenados, sanitizados e reutilizáveis para reduzir redigitação.
- Distinguir forma transcrita (como consta na folha de rosto) e autorizada (pontos de acesso/entradas).
- Para orientador/coorientador, a nota usa a forma transcrita e a entrada secundária, a autorizada. As designações são preenchidas ou ajustadas exclusivamente pelo bibliotecário durante a análise.
- As designações de orientação e coorientação são campos textuais editáveis e reproduzem fielmente a página de rosto, inclusive variantes como `co-orientador` e `coorientador`.
- A forma autorizada parte da forma transcrita, aproxima registros existentes e apresenta opções progressivamente filtradas durante a digitação, sem retirar do bibliotecário a decisão final.
- Para autor, a indicação de responsabilidade após `/` usa a forma transcrita e a entrada principal, a autorizada.
- Correções de forma autorizada não sobrescrevem automaticamente registros históricos; preservar rastreabilidade.
- A ordem de pessoas relacionadas é validada também no armazenamento: autores antecedem obrigatoriamente a orientação; orientador e coorientador não podem ser deslocados por membros da banca.

## 9. Vocabulário controlado, CDU, Cutter e MARC 21

### 9.1. Vocabulário controlado

- Estudante informa palavras-chave livres nos idiomas exigidos para o trabalho e, se escolhido, no idioma estrangeiro adicional; bibliotecário transforma/valida termos controlados.
- Autocompletar sugere termos já usados. O sistema aprende pelo histórico de fichas homologadas, sem IA.
- Bibliotecário pode criar termo; admin pode corrigir e mesclar duplicados.
- Remover espaços duplos, padronizar caixa e evitar pontuação indevida.
- A ficha usa termos em português; DSpace poderá usar PT/EN conforme mapeamento.
- O cadastro controlado é bilíngue: mantém termo preferido em português e, quando aplicável, seu equivalente em inglês. Ambos são reutilizáveis; a ficha continua usando somente a forma em português.
- Sanitização inicial: remover espaços excedentes e pontuação final, preservar acentos e usar inicial minúscula, exceto em nomes próprios e siglas. A comparação de duplicidade não diferencia maiúsculas de minúsculas.
- A mesclagem administrativa de termos duplicados fica para evolução posterior; neste incremento, o sistema evita novas duplicidades pela forma normalizada.
- A busca de termos segue a mesma aproximação e filtragem progressiva das autoridades de pessoas.
- Os termos selecionados podem ser reordenados por arrastar e soltar; a marcação independente de um termo principal é preservada para registro e sugestão de CDU.
- Cada termo controlado incluído em novos salvamentos deve ter uma fonte documentária indicada pelo bibliotecário: autoridades de assuntos da Biblioteca Nacional, Tesauro de Arte e Arquitetura (Getty), Pergamum UFBA ou autoridades da Rede Pergamum. A interface apresenta links para consulta e exige a fonte por termo. As palavras-chave livres do estudante servem de apoio à decisão profissional e não iniciam automaticamente o cadastro controlado. O banco registra a fonte usada em cada protocolo, preserva as fontes de um termo reutilizado, sanitiza os rótulos e rejeita termos repetidos no mesmo atendimento e equivalentes ingleses conflitantes. A seleção da fonte representa declaração do bibliotecário; confirmação automática de existência no catálogo externo depende de integração futura.

### 9.2. Assistente CDU

- Preenchimento e decisão final são manuais pelo bibliotecário.
- Sugestões usam somente histórico de fichas e códigos associados a termos homologados, sem IA ou aprendizado de máquina externo.
- Solução C: termo principal tem peso maior; termos secundários, peso menor.
- Explicar a sugestão, por exemplo: “usado em X fichas com este termo”.
- Versão simples no MVP se possível; ranking refinado e curadoria termo-CDU depois.
- No MVP, a pontuação é `2 × fichas com o termo principal + 1 × fichas com cada termo secundário`, considerando somente fichas homologadas ou concluídas e contando cada ficha uma vez por componente. Exibir até três sugestões, com as contagens separadas, sem preenchimento automático.
- Cada código CDU pode manter uma descrição técnica, memória de composição, auxiliares empregados, códigos relacionados, fonte consultada e observação. O catalogador registra um código inédito como pendente; o administrador revisa, edita e valida o repertório. Em novo atendimento, o sistema reutiliza o registro existente, mas nunca monta ou atribui automaticamente o código final.

### 9.3. Assistente Cutter-Sanborn/CAT

- Campo manual com dropdown de sugestões progressivas pelo sobrenome da entrada autorizada do autor; nunca atribuir automaticamente.
- Usar tabela estática local, incorporada do repositório público `veralvx/cutter-sanborn-table` sob licença MIT.
- A decisão final é sempre do bibliotecário.

### 9.4. MARC 21

- Fica para fase posterior, para exportar/copiar metadados e apoiar interoperabilidade com Pergamum por Catalogadores e Administradores.
- O MVP deve modelar dados estruturados para futuro mapeamento de campos/subcampos, sem exportação ou integração automática.

## 10. Atendimento bibliotecário

### 10.1. Fila e ticket locking

- Filtros: status, curso/programa, nível, tempo na fila, responsável, dúvida interna e busca textual.
- Busca: estudante, protocolo, título, orientador e outros metadados.
- Na Fila geral e em Meus atendimentos, protocolos encerrados não aparecem por padrão. Permanecem localizáveis ao selecionar o status Concluída ou por busca textual; um aviso junto aos filtros explica isso.
- Bibliotecário assume e trava o chamado para outros editores; pode devolvê-lo à fila.
- Admin pode reatribuir ou devolver à fila; registrar reatribuições e ações relevantes.
- Catalogadores e administradores ativos podem marcar uma solicitação aberta como prioritária, escolhendo uma justificativa obrigatória entre prazo institucional próximo, correção urgente após devolução, demanda da coordenação e outro motivo documentado (com descrição obrigatória). A equipe pode alterar ou retirar a marca; cada mudança registra a pessoa e a justificativa na auditoria. A marca aparece nas visualizações internas do protocolo, incluindo fila, ficha, avisos e mensagens; o feed registra a definição ou retirada da prioridade, sem etiqueta nos itens. No cabeçalho do atendimento, o próprio botão com estrela informa o estado prioritário. A etiqueta segue os raios e cores do design system. Nas listas de Fila geral e Meus atendimentos, os prioritários aparecem primeiro e, dentro de cada grupo, as solicitações mais recentes aparecem antes das antigas. A sinalização e a justificativa são internas: estudante e coordenação não as recebem nem as veem.
- Na visão geral da equipe, o bloco de prioridades lista protocolos prioritários ainda abertos, incluindo os que já têm responsável. A ordem é da marcação de prioridade mais antiga para a mais recente; cada item mostra protocolo, trabalho, data da marcação e acesso direto ao atendimento. Protocolos concluídos ou cancelados saem dessa lista.
- Na visão geral administrativa, o bloco “Equipe ativa” aparece somente quando há contas novas da equipe aguardando provisionamento. Os quatro indicadores rápidos apresentam seus ícones em espaço próprio no canto superior direito, sem sobreposição ao conteúdo, com destaque discreto ao passar o ponteiro ou focar o cartão.

### 10.2. Devolução por pendência

- A conferência de metadados cobre título, subtítulo e título em outro idioma. O link público não recebe ações de edição direta nem de confirmação como metadado: se estiver errado ou inacessível, o bibliotecário pede ajuste ao estudante. A mensagem opcional do estudante é contexto de leitura, não um metadado validável. Matrícula pertence ao vínculo acadêmico e não é objeto de validação, edição ou devolução nessa etapa. Autor, orientação, coorientação e palavras-chave são tratados exclusivamente na catalogação, onde recebem a validação técnica definitiva.
- O bibliotecário valida manualmente no Pergamum o ano de nascimento autorizado pelo estudante, consultando o registro acadêmico autorizado; o Pronto! não realiza integração, consulta automática ou armazenamento de credenciais desse sistema externo.
- Templates e justificativas aparecem somente para campos devolvidos. Correções diretas feitas pelo bibliotecário responsável são auditadas e exibem o valor anterior como informação corrigida e sem validade, com ação para restaurar individualmente aquele campo. Durante a análise em edição, o responsável pode restaurar apenas as correções diretas registradas naquela revisão aos valores enviados pelo estudante; o estorno também é auditado e nunca apaga o histórico.
- Marcar exatamente os campos incorretos, com template ou texto livre; gerar e-mail com campos e justificativas.
- Ao final da análise, o bibliotecário escolhe um único encaminhamento: quando houver campos marcados, envia o atendimento ao estudante para correção; sem pendências, registra a revisão e segue para a catalogação. A liberação para a fila é uma ação separada de troca de responsável, não uma etapa de revisão.
- Se o bibliotecário responsável constatar que uma ou mais declarações obrigatórias do estudante não foram cumpridas, registra quais são. Após confirmação da decisão, o sistema cancela o protocolo sem etapa de correção, audita a constatação e enfileira um e-mail padronizado com as declarações descumpridas. A verificação de integridade e acesso do arquivo do link público pode ocorrer em qualquer etapa do atendimento até o encerramento. Esse encaminhamento é distinto da devolução de campos corrigíveis.
- Decisões finais do bibliotecário durante a análise exigem confirmação em janela modal antes de serem executadas: devolver ao estudante, validar metadados, aprovar ou devolver Nada Consta, homologar ficha e encerrar protocolo.
- A análise organiza-se em três etapas: metadados, catalogação e ficha, e Nada Consta e liberação. O estudante pode enviar o Nada Consta desde a abertura do protocolo; o bibliotecário pode validá-lo em paralelo. A liberação ocorre imediatamente quando coexistirem ficha homologada e Nada Consta aprovado, independentemente de qual foi concluído primeiro.
- A terceira etapa reúne uma conferência operacional dos metadados, da ficha e do Nada Consta, mostrando explicitamente bloqueios e atalhos para os campos pendentes; ela não cria uma segunda decisão de revisão.
- Ao final da terceira etapa, quando a ficha ainda não foi homologada, o responsável pelo atendimento recebe uma ação explícita para revisar e homologar a ficha. Após a homologação, a mesma área esclarece a dependência restante do Nada Consta.
- Nas listas "Fila de solicitações" e "Meus atendimentos", exibir o estado operacional atual calculado pelos marcos registrados (análise, Nada Consta, ficha, autodepósito, publicação ou encerramento), além do status técnico. No atendimento da biblioteca, o histórico completo abre em janela pelo cabeçalho, sem ocupar uma etapa do fluxo.
- A Fila geral e Meus atendimentos têm alternância explícita na própria página; o menu lateral oferece um único acesso à fila. A busca permanece visível; filtros adicionais ficam recolhidos, com contagem e limpeza quando usados. Cada solicitação destaca título, estudante, estado operacional e uma ação principal, mantendo status técnico e dados de contexto legíveis. Um botão com engrenagem abre as ações secundárias e os detalhes do atendimento em menu contextual acessível. Na análise, as três etapas exibem orientação curta para a ação atual e resumo da conferência. Mensagens extensas, registros internos e ações secundárias ficam junto ao contexto pertinente ou em áreas recolhíveis; ações e estados importantes usam ícone acompanhado de texto. Essa organização não altera permissões, marcos ou confirmações obrigatórias.
- Destacar pendências para o estudante; após a devolução, os campos corretos ficam bloqueados e somente os campos marcados podem ser reenviados.
- Tratar especificamente pendência de Nada Consta.
- Templates iniciais: campo obrigatório não preenchido; informação divergente do trabalho; nome divergente da folha de rosto; link público indisponível ou sem permissão; informação incompleta; formatação ou padronização a ajustar. O bibliotecário pode complementar ou substituir por justificativa livre.
- Preservar histórico imutável de cada rodada, das justificativas enviadas e dos valores corrigidos.

### 10.3. Comentários internos

Permitir dúvidas técnicas invisíveis ao estudante, gerais ou ligadas a campo/área, em fluxo assíncrono e não bloqueante. No MVP podem ser observações simples; fórum completo fica para Fase 2.

Na tela anterior à análise, a mensagem enviada pelo estudante aparece como informação contextual, sem controles de validação ou edição de metadados. O bibliotecário pode guardar uma resposta nessa área, enviada por e-mail quando a validação dos metadados faz o protocolo avançar. O recado interno livre para a equipe deixa de receber novas entradas, pois a continuidade do atendimento ocorre pelas mensagens internas; recados anteriores continuam legíveis. O registro técnico da análise permanece. As três declarações verificáveis na abertura são conferidas em uma tela prévia, antes das abas de análise, na mesma largura delas. O bibliotecário marca explicitamente “Cumpriu” ou “Não cumpriu” em cada uma. Sem marcação, não há ação de avanço; com alguma declaração não cumprida, aparece apenas a ação de cancelamento; com todas cumpridas, aparece apenas a ação de continuar. A declaração de manter acessível e inalterado o arquivo do link público permanece verificável da catalogação até o encerramento do protocolo, com ação própria também na revisão da ficha. Seu descumprimento constatado cancela o protocolo, sem suspensão. Ambas as decisões exigem confirmação em janela modal. O estudante recebe um aviso padronizado por e-mail e no painel com as declarações não cumpridas, sem texto livre do bibliotecário. O protocolo cancelado não pode ser reaberto.
O sistema registra a conclusão da conferência inicial: ao retomar o atendimento, abre diretamente a etapa de análise. Enquanto a análise dos metadados não tiver sido concluída, um controle discreto permite rever as três decisões já marcadas; a constatação posterior de descumprimento segue o cancelamento definido acima.
O controle para rever declarações fica no menu de ações gerais do protocolo. A conferência inicial do link público ocorre na mesma tela anterior à análise, em bloco próprio e visualmente distinto das declarações e dos campos de metadados. O bibliotecário abre o arquivo, confirma que o trabalho correto está acessível para leitura ou pede ajuste do link ao estudante. Um problema do link gera somente correção, sem cancelamento automático. Enquanto o estudante não responder e o bibliotecário não conferir novamente o link, o atendimento permanece nessa tela e o botão verde para iniciar a análise não aparece, mesmo que as três declarações estejam cumpridas. A conferência é registrada para o link e a rodada de correção atuais; uma resposta do estudante a pedido de ajuste do link exige nova conferência mesmo se o endereço não mudar. A mensagem do estudante aparece recolhida na tela anterior à análise, com abertura sob demanda. A resposta usa apenas negrito, itálico, links HTTPS e listas com marcadores ou números; o salvamento confirma a ação e a formatação é preservada no e-mail enviado quando a análise avança.
Na etapa inicial de metadados não se exibe a verificação contínua do arquivo nem um botão para voltar. Depois da validação dos metadados, a verificação contínua aparece nas etapas posteriores. A referência ABNT é editada diretamente na visualização formatada; o bibliotecário pode selecionar o trecho e aplicar negrito pelo controle visual.

No painel interno, o menu de ações gerais, acionado por um ícone de engrenagem, aparece no canto superior direito do cabeçalho do atendimento e em cada protocolo da fila geral e de Meus atendimentos. Reúne histórico, prioridade, revisão das declarações somente fora da tela de conferência, liberação para a fila e reatribuição por administrador. O cabeçalho exibe a prioridade marcada com estrela e identifica pelo primeiro nome outro bibliotecário responsável pela análise. O ícone ao lado do título abre o trabalho completo em nova aba somente depois de confirmada a acessibilidade do link pelo bibliotecário.

### 10.4. E-mails durante o desenvolvimento

- Eventos de abertura, pendência e liberação geram registros em fila transacional.
- Durante o desenvolvimento, o envio externo permanece desativado e a entrega é testada somente no Mailpit local.
- A homologação da ficha não libera isoladamente a solicitação nem gera aviso de liberação: o envio depende também da validação do Nada Consta.

### 10.5. Revisão e homologação da ficha

- A prévia da ficha é atualizada em tempo real na mesma tela conforme pessoas, assuntos, classificação e descrição são editados.
- Na catalogação, as pessoas relacionadas usam cartões com identificação do papel, nomes transcrito e autorizado e controles de reordenação permitidos pela regra de cada papel. As palavras-chave recebidas podem ser reveladas na área de vocabulário controlado para apoiar a escolha profissional dos termos.
- O título equivalente só entra na prévia, no PDF e na ficha homologada quando o bibliotecário marca expressamente que ele também aparece na folha ou página de rosto. Sem essa marcação, continua registrado como metadado, mas não compõe o enunciado da ficha.
- A revisão final usa somente os metadados homologados pelo bibliotecário, incluindo CDU e Cutter informados manualmente.
- O Pronto! propõe a referência bibliográfica do próprio trabalho conforme ABNT NBR 6023:2025, usando autores na ordem informada, título, subtítulo, ano de depósito, natureza do trabalho, vínculo institucional, local e ano de apresentação/defesa. O bibliotecário confere, pode ajustar e valida a referência na etapa final da análise, antes de homologar a ficha; a validação dos metadados não exige essa referência. A aprovação é invalidada se os dados usados na geração mudarem. O título aparece em negrito e o subtítulo, quando houver, fora do negrito. A inversão automática de nomes é apenas proposta e requer conferência profissional.
- Modelos por programa: graduação em Arquitetura e Urbanismo usa `Trabalho Final de Graduação (Graduação em Arquitetura e Urbanismo) – Faculdade de Arquitetura, Universidade Federal da Bahia`; MP/CECRE usa `Trabalho de Conclusão de Curso (Mestrado Profissional em Conservação e Restauração de Monumentos e Núcleos Históricos) – Faculdade de Arquitetura, Universidade Federal da Bahia`; mestrado PPGAU usa `Dissertação (Mestrado em Arquitetura e Urbanismo) – Programa de Pós-Graduação em Arquitetura e Urbanismo, Faculdade de Arquitetura, Universidade Federal da Bahia`; doutorado PPGAU usa `Tese (Doutorado em Arquitetura e Urbanismo) – Programa de Pós-Graduação em Arquitetura e Urbanismo, Faculdade de Arquitetura, Universidade Federal da Bahia`; RAU+E (curso ATHDC cadastrado) usa `Trabalho de Conclusão de Curso (Residência em Arquitetura, Urbanismo e Engenharia) – Programa de Pós-Graduação em Arquitetura e Urbanismo, Faculdade de Arquitetura, Universidade Federal da Bahia`, incluindo todos os autores em ordem. Os modelos foram confirmados pelo usuário em 28/09/2026.
- Ao homologar, congelar um snapshot imutável do conteúdo, das formas autorizadas e transcritas, da classificação e da identidade profissional responsável.
- Registrar data, horário, bibliotecário e CRB, além da ação relevante no log.
- A ficha isolada identifica UFBA, SIBI e BIB/FA, usa cabeçalho institucional CIP, linhas superior e inferior sem bordas laterais, CDU à direita e altura capaz de acomodar conteúdo variável.
- A forma autorizada do autor abre a entrada principal; a forma transcrita aparece na responsabilidade. Orientador e coorientador usam a forma transcrita na nota e a autorizada nos traçados.
- O estudante não visualiza nem baixa a ficha antes da homologação e da aprovação do Nada Consta.
- O trabalho mesclado é baixado como `ultimosobrenome-nomedoautor-anodeposito-tipodetrabalho.pdf`, com caracteres normalizados para compatibilidade de arquivo.
- O layout `institutional-v2` deriva dos modelos institucionais validados de TCC de graduação, TCC do MP-CECRE, dissertação e tese. O conteúdo e a geometria são compartilhados entre a prévia e o PDF.
- O PPG-AU gera traçado institucional do programa; graduação e MP-CECRE, vinculados diretamente à Faculdade, não geram esse traçado. `Título` permanece como a última entrada secundária.
- Fichas homologadas anteriormente preservam o snapshot e a versão `provisional-v1`; nenhuma homologação histórica é reescrita.
- O ano de nascimento do autor só é exibido conforme a autorização do estudante e a validação profissional definidas na seção 8.2. A paginação não é exibida enquanto suas regras ou fontes de dados não estiverem confirmadas.

## 11. Entrega final e mesclagem

- Liberar somente com ficha homologada e Nada Consta validado.
- Destacar “Gerar e baixar trabalho completo com ficha”; manter ficha isolada como link discreto.
- Mesclar no navegador, sem upload do trabalho, usando `pdf-lib` ou equivalente leve.
- Inserir a ficha depois da folha de rosto; bibliotecário pode informar/confirmar sua página.
- Antes, mostrar nome/tamanho e exigir confirmação do arquivo pelo estudante.
- Não prometer PDF/A garantido em JavaScript. Informar que o navegador gera um PDF comum, não certifica conformidade PDF/A e que o estudante deve conferir ou converter o arquivo final conforme a exigência do Repositório Institucional.

## 12. Autodepósito e DSpace/RI-UFBA

- O Pronto! assiste o preenchimento manual, não substitui o DSpace, não envia o trabalho ao RI/UFBA e não usa API/SWORD no MVP.
- Reutilizar metadados homologados e oferecer botões de copiar conforme mapeamento das telas reais.
- Estudante faz o depósito; bibliotecário valida a publicação e informa URL/Handle, encerrando o protocolo.
- Licença, acesso, embargo e licença de distribuição são escolhas/declarações do estudante no RI/UFBA; nunca preencher ou escolher automaticamente opções jurídicas ou institucionais.
- Não inventar campos do DSpace.

### 12.1. Guia para graduação

Os TCCs de graduação da Faculdade de Arquitetura são TFG — Trabalho Final de Graduação. Como seu depósito no RI/UFBA está atualmente suspenso por questões normativas, o admin pode ativar/desativar o guia por curso/programa; para TFG, começa desativado. Emissão e homologação da ficha independem do guia.

### 12.2. Mapeamento confirmado das telas do RI/UFBA

O fluxo observado e confirmado é: coleção; tipo de documento; cinco grupos de descrição; upload; verificação; seleção de licença; licença de distribuição; conclusão. O guia registra somente o início do autodepósito e abre o RI/UFBA em nova aba.

- Copiar quando disponível e homologado: coleção configurada, tipo de documento, grau acadêmico, título e subtítulo, título equivalente, pessoas relacionadas, instituição, sigla, unidade, curso/programa, país, idioma e palavras-chave em português e inglês.
- Preencher e decidir diretamente no RI: data de defesa, acesso, data e razão de embargo, Lattes, ORCID, banca, referências, DOI, área CNPq, resumo, abstract, agência de fomento, relações, arquivo, descrição/formato/configuração do arquivo e arquivo primário. A citação do próprio trabalho é proposta pelo Pronto! e, após validação bibliotecária dos metadados, oferecida para copiar ao campo correspondente do RI; o estudante confere o resultado colado no RI.
- A área CNPq deve ser selecionada na taxonomia “Categorias de assuntos” do RI. Termos do vocabulário catalográfico do Pronto! não substituem essa classificação.
- Para TCC, as palavras-chave em inglês, o abstract e os membros da banca aparecem como opcionais no fluxo observado. Para dissertação e tese, palavras-chave em inglês e abstract são obrigatórios. Na dissertação, os três primeiros membros da banca são obrigatórios; na tese, os cinco primeiros são obrigatórios.
- O upload, a revisão, a escolha Creative Commons ou “Nenhuma licença” e a concessão da licença de distribuição ocorrem exclusivamente no RI. Recusar a licença mantém uma submissão não concluída no “Meu espaço”.
- PDF/A é orientação de preservação. O Pronto! referencia o tutorial oficial, mas não converte nem certifica conformidade.

## 13. QR Code e autenticação pública

- Aprovado para Fase 2 como autenticação da ficha e ponte para o DSpace.
- URL usa hash/UUID, nunca protocolo.
- Página mostra selo, discente, título, curso/programa, data/hora de homologação, bibliotecário e CRB; não mostra protocolo ou dados sensíveis.
- Antes do DSpace, indica publicação pendente; depois, botão ou redirecionamento para URL/Handle (decisão ainda pendente).

## 14. Coordenação e Magic Link

- Entra no MVP, ativável/desativável pelo admin inclusive por curso/programa.
- Coordenação não tem login/senha; recebe token seguro e página somente leitura com linha do tempo, status e SLA.
- A página acessada por Magic Link usa o título “Acompanhamento [protocolo] | Pronto!” quando o acesso é válido; descrição e demais metadados não incluem matrícula, nome nem token. A página não deve ser indexada, arquivada nem enviar o endereço do link como referência a outros sites.
- A página pública de acompanhamento segue o design system e apresenta os dados essenciais do atendimento com ícones, o prazo de referência e a linha do tempo completa no corpo da página. Nos históricos da coordenação, do estudante e da equipe, os marcos já registrados aparecem destacados, o marco atual pulsa e as etapas futuras aparecem esmaecidas; eventos de correção permanecem na cronologia real.
- Entre os dados essenciais da página da coordenação, mostrar a matrícula do vínculo acadêmico relacionado ao protocolo.
- O histórico mostra cada envio, devolução e novo envio do Nada Consta como eventos separados, preservando as variações ocorridas. Após uma devolução, o novo envio e a validação voltam a aparecer como etapas futuras. A justificativa da devolução não aparece na página pública da coordenação.
- Na mensagem de abertura, a coordenação recebe título e subtítulo no formato “Título: subtítulo” quando houver, matrícula, nome completo do estudante, protocolo, SLA em dias úteis e data estimada para a análise da biblioteca. O botão abre diretamente o Magic Link; o endereço aparece abaixo em fonte menor para uso alternativo.
- Não mostrar CPF completo, Nada Consta, documentos ou comentários internos.
- Se ativo para o curso/programa, o sistema gera o Magic Link e enfileira automaticamente o e-mail à coordenação na abertura da solicitação, sem ação do bibliotecário. Envia também o e-mail final; a coordenação não recebe e-mail de pendência no MVP.
- Admin cadastra e-mail, pode desativar a função/token; o token deixa de ser útil após conclusão integral e envio do e-mail final.
- Aplicar a solução mais simples e segura compatível com baixo custo. Portal institucional fica para fase futura.

## 15. Mural, status e SLA

- Admin gerencia aviso/status: normal, recesso, paralisação/greve ou outro aviso institucional.
- Estudante vê antes/durante a solicitação; estudante e coordenação veem prazo/status.
- Prazo inicial: três dias úteis, ajustável posteriormente pelo administrador.
- Na solicitação enviada, mostrar ao estudante a data estimada da análise e os dias úteis restantes conforme o SLA do curso/programa, descontando fins de semana, feriados, pontos facultativos, recessos e paralisações registrados no calendário operacional. Indicar que é prazo de referência da biblioteca, sujeito a alteração quando houver correções.
- Mural e SLA entram no MVP em versão simples para reduzir cobranças e alinhar expectativas.

## 16. E-mails transacionais

- Abertura ao estudante; abertura à coordenação se Magic Link estiver ativo.
- Pendência ao estudante com campos/justificativas; a coordenação não recebe e-mail de pendência no MVP, para evitar ruído operacional e exposição desnecessária. Ela acompanha o protocolo pelo Magic Link quando esse recurso estiver ativo.
- O e-mail de pendência apresenta os campos a corrigir e um botão para a tela de correção do painel estudantil; se for necessário entrar, o destino é preservado após o login.
- Liberação da ficha e encerramento ao estudante; encerramento à coordenação com dados básicos e URL/Handle.
- Canal: e-mail; WhatsApp descartado. Os textos transacionais aprovados estão em `docs/textos-emails-transacionais.md`. A coordenação recebe, nos eventos de abertura e encerramento, título, nome completo do estudante, protocolo, prazo de referência e, no encerramento, URL/Handle; não recebe CPF, documentos ou observações internas. A matrícula e a data estimada da análise também aparecem no e-mail de abertura.
- Na saudação dos e-mails enviados a pessoas usuárias, usar somente o primeiro nome. Manter o nome completo do estudante nos dados de identificação enviados à coordenação. Ao final das mensagens ao estudante, incluir um botão de acesso ao painel do Pronto!, além de eventuais ações específicas. No e-mail de Magic Link à coordenação, o botão abre o acompanhamento diretamente e o endereço é exibido abaixo em tamanho menor.
- Priorizar SMTP institucional da biblioteca quando configuração e políticas da UFBA permitirem; serviço transacional externo gratuito é alternativa.
- Após o lançamento público, a administração ativa uma pesquisa de experiência vinculada aos **50 primeiros protocolos encerrados** a partir da ativação. O estudante recebe convite na tela do protocolo concluído, na visão geral e no e-mail de encerramento. A pesquisa avalia funcionamento, organização das informações, usabilidade, atendimento e guia de autodepósito; para especialização, mestrado e doutorado, pergunta primeiro se houve experiência anterior com pedidos por e-mail e só então oferece comparação. A resposta não condiciona acesso ao resultado. Cada convite aceita uma resposta. Apenas o controle do convite registra se ela foi enviada; as respostas ficam em tabela separada, sem vínculo com nome, estudante ou protocolo e sem horário de envio. O questionário coleta faixa etária e local de residência em categorias amplas, além de frequência de uso dos serviços digitais da universidade e necessidade habitual de ajuda para etapas online, sempre com opção de não informar; o nível acadêmico do protocolo não é tratado como escolaridade da pessoa. O administrador vê somente respostas anônimas e distribuições gerais desses dados somente após cinco respostas, para reduzir a identificação por grupos pequenos. Caso não haja resposta, o sistema enfileira lembretes por e-mail nos dias 3, 10, 17 e 24 após o encerramento, interrompidos quando a resposta é recebida. O administrador acompanha convites, taxa e respostas em área protegida do painel. Somente depois que as 50 pessoas convidadas responderem, a administração pode exportar um CSV com respostas anônimas e um PDF com gráficos, distribuições e comentários; a restrição também é aplicada no servidor. A data de ativação e o endereço público definitivo são definidos na administração para que protocolos de testes anteriores ao lançamento não ocupem as 50 vagas.

### 16.1. Notificações autenticadas da equipe

- Bibliotecários/catalogadores e administradores ativos têm uma central persistente no painel, com contador de itens não lidos e atualização em tempo real durante a sessão. Estudantes não recebem esta central.
- No painel da equipe, a barra de acessibilidade é mais compacta e usa o fundo neutro; o cabeçalho branco com sino, identificação e saída fica separado por uma linha discreta. O sino e a central alinham-se à margem inicial da barra de acessibilidade; ao abrir a central, o sino e as abas ficam na mesma linha, com respiro interno coerente com a margem dos cartões.
- Em todos os perfis, clicar na saudação com o primeiro nome abre Dados pessoais.
- Os avisos iniciais cobrem solicitação nova na fila, atendimento reatribuído, correção reenviada pelo estudante, Nada Consta enviado, liberação de ficha/Nada Consta e conta interna pendente de provisionamento.
- À direita da central de avisos, há uma central própria de **Mensagens** para conversas entre catalogadores/bibliotecários e administradores ativos. Ela lista desde o início cada pessoa ativa da equipe, mesmo sem histórico; clicar nela abre o bate-papo individual dentro da central. O botão **Iniciar nova conversa** serve para escolher várias pessoas com `@` e criar um grupo persistente, onde todos os integrantes leem e respondem no mesmo histórico. O topo da central não repete ícone nem título. Cada pessoa e conversa apresenta um dos retratos ilustrados do catálogo de avatares; os avatares não representam fotografias reais da equipe. Mensagens podem ter protocolo opcional. O acesso ao conteúdo individual e aos grupos é restrito por RLS aos participantes. Ao abrir a central, as mensagens recebidas são consideradas lidas. O novo envio aciona o ícone de mensagens, contador, animação, som distinto dos avisos e janela flutuante, mas o aviso mostra apenas quem enviou, sem revelar o texto. O título da aba distingue mensagens de avisos; o favicon usa indicador azul para mensagens e vermelho para avisos. Mensagens e avisos correspondentes seguem a retenção de 90 dias; a limpeza dos avisos operacionais não apaga conversas.
- A central de mensagens usa a apresentação de um chat: a lista mostra avatar, nome, trecho da última mensagem e horário; a conversa abre com identificação do participante ou grupo na primeira linha ao lado do ícone da central, sem espaçador vazio. O histórico fica numa área rolável com bolhas recebidas à esquerda e enviadas à direita; o campo de mensagem e o botão circular de envio ficam na base. Enter envia e Shift+Enter quebra linha. O desenho segue as cores e os controles do Pronto!, sem simular interações sociais inexistentes.
- Cada integrante ativo da equipe escolhe em Dados pessoais um avatar de um catálogo fechado com **18 retratos ilustrados fornecidos para o projeto, sem variações de cor**. Ao escolher um retrato, a área de destaque mostra a imagem, o nome, os anos de nascimento e morte quando confirmados, uma breve biografia e uma obra principal publicada ou um feito relevante. Datas biográficas não confirmadas são sinalizadas sem suposição. A escolha é salva na conta e aparece nas conversas, à esquerda da saudação e do tipo de perfil no painel interno e, ao passar o mouse ou focar o botão Meu painel quando autenticado, no lugar do ícone de pessoa. Escolhas antigas permanecem legíveis sem alterar a estrutura do banco; retratos antigos não incluídos no novo catálogo recebem uma das novas imagens até que a pessoa escolha outra. Estudantes não têm essa escolha no MVP.
- Ao escrever uma mensagem, a equipe pode mencionar uma ou mais pessoas por `@nomeeultimosobrenome`, selecionadas no menu de sugestões com avatar junto ao cursor, ou usar `@todos` para incluir toda a equipe ativa. O botão de nova conversa exige ao menos duas outras pessoas distintas e cria um grupo; o menu não oferece novamente quem já foi escolhido. Para conversar com uma única pessoa, basta escolhê-la na lista. Na conversa individual já aberta, mencionar outras pessoas cria um grupo com elas. O servidor valida os participantes antes de gravar; cada membro do grupo acessa o histórico compartilhado. A conversa aberta mostra em tempo real quando outro participante está digitando, sem revelar o texto. O rascunho, com protocolo e destinatários escolhidos, permanece na sessão do navegador ao fechar a central por acidente e é apagado após o envio.
- Para vincular um protocolo à mensagem, a pessoa digita `#` seguido do código e seleciona o protocolo no menu junto ao cursor, como faz com `@` para pessoas. Cada sugestão apresenta código, título do trabalho, nome completo do solicitante e ação para abrir o atendimento. O protocolo selecionado aparece no texto; o envio aceita no máximo um protocolo selecionado por mensagem e o vínculo é conferido no servidor. Não há campo separado para protocolo.
- Os menus de `@` e `#` têm fundo e contraste próprios do design system mesmo quando exibidos fora da central; abrem abaixo ou acima do cursor conforme o espaço disponível na janela e se reposicionam ao rolar ou redimensionar.
- E-mail permanece como canal para eventos relevantes quando a pessoa destinatária estiver fora do sistema; autosave e eventos rotineiros não geram notificação.
- Cada aviso expõe somente o resumo operacional mínimo e fica protegido por RLS; não deve incluir CPF, documentos, comentários internos ou outros dados sensíveis além do necessário ao destinatário autorizado.
- Os avisos ficam disponíveis por 90 dias. Ao abrir a janela, todos os avisos não lidos são marcados automaticamente como lidos; a janela abre na aba Ativas para mantê-los visíveis. Abrir ou fechar um aviso o retira da lista ativa; há um X por aviso e a ação "Limpar tudo" para fechar os avisos ativos em lote. A lista rolável suaviza visualmente seus limites, evitando cartões cortados por uma borda reta. Os avisos fechados ficam em Arquivadas até o prazo de exclusão. Não há preferências individuais de tipos de aviso nesta etapa.
- A central carrega avisos anteriores automaticamente ao chegar ao fim da lista rolável, em todas as abas, sem botão de paginação. Avisos de protocolos prioritários mostram somente uma estrela discreta ao lado do número do protocolo, sem etiqueta de prioridade.
- A data de cada aviso aparece de forma relativa em português, como "5 minutos atrás", "ontem" ou "há 2 dias"; ao passar o mouse sobre ela ou focar o aviso pelo teclado, o texto troca por data e hora completas com transição suave de entrada e saída, sem tooltip nativo.
- Ao clicar em um aviso vinculado a protocolo, a equipe abre o protocolo na fila para assumir uma solicitação nova ou diretamente na etapa pertinente do atendimento para revisar correções, validar o Nada Consta ou concluir a liberação. Os controles de acesso existentes continuam valendo.
- Com o Pronto! visível, um aviso novo aparece por cerca de 15 segundos em uma janela flutuante com título e resumo; clicar nela abre o destino do aviso. Quando o sino está à vista, a janela se expande dele; com a página rolada, surge fixa no alto da tela e se expande de uma pílula alinhada à margem do sino. O botão mostra apenas o sino, com nome acessível. A janela flutuante acompanha a cor do sino nos estados normal e hover; a central se expande a partir da pílula do botão como uma única superfície arredondada, com abas em formato de pílula e respiro nas bordas. Rótulos e cartões usam tonalidades da paleta, sem uma camada de fundo envolvendo cada aba; texto, contornos e rolagem mantêm contraste. O aviso não substitui o histórico da central.
- Integração com notificações nativas do navegador/sistema e Web Push, inclusive com a aba fechada, fica fora do MVP e será avaliada em etapa futura. No MVP, a central e o som funcionam com o Pronto! aberto em uma aba e a sessão ativa; e-mail permanece como canal fora do sistema.

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
- No Supabase Auth, cadastro por e-mail e confirmação obrigatória estão habilitados; cadastros anônimos e vinculação manual de identidades estão desabilitados.
- Para desenvolvimento, a Site URL é `http://localhost:3000` e a lista de redirecionamentos permite `http://localhost:3000/**`. A URL pública de produção é `https://prontobib.vercel.app`, a ser adicionada aos redirecionamentos do Supabase sem remover a local.
- Storage somente para Nada Consta e arquivos leves permitidos; fontes personalizadas são selecionadas localmente.
- E-mail por SMTP institucional, se viável, ou serviço externo gratuito.
- PDF com `pdf-lib` ou equivalente no navegador; UI com Tailwind CSS e componentes leves.
- Identificadores técnicos (estados, enums, variáveis, classes, tabelas etc.) em inglês; textos ao usuário em português.
- Aplicar Clean Code e organização que facilite transição para STI/UFBA.

### 18.2. Produção institucional futura

VM Linux UFBA/STI, Docker/Docker Compose, Nginx, Let's Encrypt ou certificado institucional, PostgreSQL e disco institucional ou S3 compatível. Referência mínima: 2 vCPU, 2–4 GB RAM e 20–40 GB SSD.

## 19. Segurança e LGPD

- HTTPS obrigatório; Supabase Auth com hash seguro; cookies seguros quando aplicável; controle por perfil.
- A senha do Pronto! exige no mínimo 8 caracteres, ao menos uma letra maiúscula, um número e um caractere especial, tanto no cadastro quanto na redefinição. A interface mostra cada requisito durante a digitação e a aplicação os valida antes de enviar ao Supabase Auth. O mínimo de 8 caracteres também é configurado no Supabase Auth; as opções nativas de composição exigiriam ainda letra minúscula, requisito não aprovado. A alteração autenticada continua protegida pelo fluxo de confirmação por e-mail.
- O pedido de recuperação e o retorno do link usam o mesmo fluxo PKCE no servidor, para preservar o comprovante temporário na sessão entre as duas etapas. Links inválidos ou sessões ausentes levam à página de recuperação com orientação para solicitar novo link. As mensagens de autenticação distinguem credenciais inválidas, excesso de tentativas e indisponibilidade do serviço. Erros e confirmações usam os mesmos componentes visuais de feedback do design system.
- Falha temporária ao consultar o perfil autenticado não equivale a conta bloqueada/inativa e não encerra a sessão; o painel mostra uma orientação para tentar novamente. Somente bloqueio ou inativação confirmados encerram a sessão operacional.
- A recuperação de senha oferece autoatendimento por link enviado ao e-mail `@ufba.br` e assistência administrativa para casos excepcionais.
- O CPF é persistido normalizado com 11 dígitos e não pode se repetir. Não deve aparecer em URLs, logs ou e-mails; telas comuns exibem somente a forma mascarada. Bibliotecários Catalogadores e Administradores podem consultar o CPF completo no contexto autorizado do atendimento.
- ORM/prepared statements contra SQL injection; sanitização/escape contra XSS; proteção CSRF em rotas sensíveis quando aplicável.
- Validar uploads permitidos e registrar ações administrativas/operacionais relevantes.
- Coletar o mínimo, expurgar temporários e excluir Nada Consta 60 dias após encerramento.
- A política de privacidade aprovada (v1.0, atualizada em 21/09/2026) identifica a UFBA, por meio da BIB/FA, como controladora do serviço; a Biblioteca atende dúvidas operacionais em `bibarq@ufba.br`, e a Ouvidoria da UFBA atende direitos e privacidade em `ouvidoria@ufba.br`. A página institucional de LGPD da UFBA é indicada como referência atualizável. O tratamento fundamenta-se no cumprimento de obrigação legal ou regulatória. Conta, CPF, e-mail, solicitação, metadados, ficha, pendências e homologação integram o assentamento individual do aluno: enquanto houver vínculo e, no total, 100 anos, segundo os códigos 125.43 (graduação), 134.43 (pós-graduação stricto sensu) e 144.43 (pós-graduação lato sensu). O Nada Consta recebido pelo Pronto! é arquivo temporário de verificação, removido 60 dias após encerramento; seu registro institucional de longo prazo é mantido no Pergamum. Auditorias administrativas e operacionais permanecem 5 anos; logs brutos de acesso, sessão, aplicação, rede, banco e erros técnicos, 6 meses; dossiês de incidentes, 5 anos após encerramento; backups rotativos, 90 dias, salvo preservação necessária. Logs não devem duplicar conteúdo sensível. A aplicação técnica dos prazos deve respeitar a tabela de temporalidade e orientações arquivísticas da UFBA. A ciência da política v1.0 é obrigatória no cadastro e no primeiro acesso das contas existentes; o sistema registra perfil, versão, origem e data/hora, sem IP ou conteúdo adicional.
- A minuta v1.1, de 25/09/2026, acrescenta a data de nascimento entre os dados da conta, esclarece que somente o ano pode entrar na ficha mediante autorização opcional por solicitação e validação da biblioteca, e explicita sua guarda com a conta. O sistema exige ciência separada da v1.1 no cadastro e no próximo acesso de contas que só aceitaram a v1.0; os registros anteriores são preservados. A minuta ainda requer validação institucional antes da publicação.
- Na primeira visita, uma faixa informativa não bloqueante sobe da borda inferior da tela e informa que o Pronto! usa apenas cookies essenciais para a sessão, guarda preferências da interface no navegador e não usa cookies de publicidade. A pessoa pode continuar usando o site sem interagir. A faixa oferece "OK" para dispensá-la e "Saiba mais" para abrir a Política de privacidade; navegar para outra página também a dispensa. A ciência informativa fica registrada somente no navegador e não substitui a ciência institucional da política exigida para contas.
- Magic Link imprevisível, somente leitura, sem documentos sensíveis e inútil após conclusão integral e envio final.
- A política interna de segurança e operação está consolidada em `docs/politica-interna-seguranca-operacao.md`: acesso mínimo por perfil, limite e ciclo do Nada Consta, ações de auditoria, retenções, resposta a incidentes e confirmação obrigatória das configurações do ambiente de produção.

## 20. Design system e interface

- Identidade institucional da UFBA, com destaque à identidade visual atual da BIB/FA.
- O logotipo do Pronto! usa a marca fornecida pela Biblioteca FAUFBA nas versões preta e branca, conforme o fundo claro ou escuro. O favicon e o ícone de instalação exibem somente os quadrados na disposição original da marca, sem fundo; o favicon adota a cor adequada ao esquema claro ou escuro do navegador. No frontend, a marca completa e o pictograma da barra lateral ficam estáticos no estado normal. Ao passar o cursor ou focar o link pelo teclado, seus quadrados piscam alternadamente em todos os temas, substituindo o antigo movimento do logotipo. A preferência por movimento reduzido desativa a animação.
- Linguagem predominantemente monocromática, arquitetônica, geométrica e técnica, inspirada no logotipo da biblioteca.
- Violeta `#3C3873` como acento no tema claro e variantes mais claras no tema escuro para preservar contraste; grafite `#1E293B`, concreto/prata `#E2E8F0`/`#F4F6F9`, linha `#CBD5E1` e vermelho `#991B1B` na paleta sugerida.
- Interface: Inter ou Fira Sans; títulos: Cinzel ou Playfair, se adequado; técnica: JetBrains Mono ou Fira Code.
- Temas claro, escuro e conforme sistema; preservar contraste, legibilidade, responsividade e identidade.
- Cards de conteúdo atuais e futuros devem usar o raio padrão `--radius` do design system; novos cards devem adotar a classe `.card` ou uma classe de card coberta pela regra compartilhada.
- Controles internos de seleção devem ser acessíveis por teclado, com foco visível, navegação por setas, confirmação por Enter e fechamento por Escape; sua aparência deve permanecer coerente com o design system em vez de depender do menu nativo do sistema operacional.
- Atalhos globais de produtividade para a análise bibliotecária são evolução posterior: devem ser descobríveis, não conflitar com navegador ou campos de texto e nunca executar ações críticas sem confirmação explícita.
- Refinamento milimétrico da ficha e telas será feito depois.
- O cabeçalho autenticado identifica o primeiro nome da pessoa logada com a saudação `Olá, [primeiro nome]`, ao lado do perfil operacional e da ação de saída.
- Páginas públicas e autenticadas compartilham rodapé com versão, estágio Beta, Central de ajuda, créditos, ano de criação, autoria institucional, reconhecimento ao Codex e acesso ao repositório público do código.
- Todas as páginas do painel interno exibem, acima do rodapé e fora dele, uma citação curta da literatura brasileira por dia, centralizada com amplo respiro entre o conteúdo e o rodapé, com tipografia discreta, aspas ornamentais compactas e aparência de texto cunhado, sem cartão. A autoria aparece como “Nome em Título da obra (ano da obra)”, com o ano da edição citada quando se tratar de coletânea; o link não muda de aparência ao passar o mouse e o texto deve permanecer legível no tema escuro. O acervo local reúne 366 trechos literais conferidos em obras digitalizadas ou em excertos publicados por editoras e instituições, com autoria, obra e link para a fonte, incluindo os 18 autores adicionais aprovados pelo usuário. A concentração em Machado de Assis e Gonçalves Dias foi reduzida por seleção de trechos já conferidos e inclusão de trechos dos autores menos representados. A frase muda diariamente sem repetição por pelo menos um ano, inclusive em ano bissexto. A seleção usa a data de Brasília e funciona sem depender de consulta externa em cada acesso.
- Links possuem estados de foco e passagem do mouse coerentes com a paleta e a linguagem geométrica do sistema.
- Os títulos principais das telas do painel interno usam pictogramas do conjunto existente, com tamanho, cor e alinhamento constantes ao lado do nome da tela, inclusive em celular.
- Datas de protocolos no painel aparecem em forma relativa (por exemplo, minutos atrás, ontem ou há dois dias); ao passar o mouse ou focar a data pelo teclado, a data e hora completas substituem o texto com transição suave, como na central de avisos.
- A Administração organiza usuários, programas, biblioteca, atendimento, FAQ, indicadores, retenção e auditoria em abas horizontais responsivas.

### 20.1. Perguntas frequentes e ajuda

- FAQs, respostas rápidas e artigos completos são registros de uma única base de conhecimento. O Administrador os edita em cartões recolhidos, por meio de um editor visual, e configura tipo, categoria padronizada, público, ordem, publicação e destaque da FAQ na página inicial. Título, resumo e conteúdo completo podem ser editados separadamente em português, inglês, espanhol, alemão, francês e italiano. O editor admite títulos, listas, citações, links e imagens locais ou por URL HTTPS, com texto alternativo. O resumo alimenta as sugestões de busca; o conteúdo completo aparece ao abrir a resposta ou artigo. A data de publicação e de atualização é exibida quando registrada.
- A migração incorpora as FAQs já cadastradas e os artigos e respostas iniciais da Central. Alterações administrativas são validadas no banco, protegidas por RLS e registradas em auditoria. Conteúdo formatado é sanitizado antes de ser exibido.
- A Central pública de ajuda usa a URL canônica `/ajuda` e organiza Perguntas frequentes administráveis e Artigos de ajuda completos, cada artigo em página própria com introdução, seções, passos e artigos relacionados. A busca no servidor sugere resultados conforme a pessoa digita e também está disponível de forma compacta no formulário estudantil. URLs legadas de perguntas frequentes apenas redirecionam. No painel interno, um ícone discreto se expande ao passar o mouse e abre ajuda contextual à tela e ao perfil, com a mesma busca da Central. Respostas rápidas e FAQs são lidas nessa janela; artigos e a Central abrem em nova aba, com indicação visual. Contextos anteriores da mesma sessão podem ser reabertos. Para dúvidas operacionais sobre o Pronto!, divulga os contatos aprovados da BIB/FA: `bibarq@ufba.br` e telefone `(71) 3283-5888`.

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
- exportar/copiar MARC 21; CDU refinado/explicável; vocabulário e merge avançados;
- mapeamento completo do DSpace; Magic Link avançado; relatórios completos; layout milimétrico;
- gestão avançada de templates e estudo de SHA-256 client-side.

### 21.3. Pode ficar para Fase 3

- construtor no-code de campos, condicionais e renderização ISBD;
- infraestrutura UFBA; portal robusto da coordenação; módulo docente/pesquisador;
- login único, bases acadêmicas e sistemas internos, se viável; auditoria institucional avançada.

### 21.4. Possibilidades estratégicas a avaliar — sem aprovação de escopo

- Avaliar, com o SIBI/UFBA e as unidades envolvidas, se o Pronto! poderá evoluir para apoiar outros fluxos da produção acadêmica. A expansão dependerá de necessidades demonstradas no piloto, responsáveis institucionais, custos e integração viável; não altera o escopo do MVP nem substitui Pergamum, SIGAA ou RI/UFBA.
- Estudar o reaproveitamento seguro de metadados homologados em outros sistemas e padrões, além do MARC 21 já previsto, com mapeamento por destino, controle de proveniência e indicação do que foi informado pelo estudante, corrigido ou validado pelo bibliotecário. Nenhuma transferência automática ou escolha catalográfica é presumida.
- Avaliar integração com registros de autoridade e vocabulários controlados, validações automatizadas baseadas em regras explícitas e indicadores de qualidade dos metadados e do serviço. A decisão profissional permanece com o bibliotecário; fontes, permissões, manutenção e tratamento de dados exigem definição prévia.
- Planejar a governança de uma possível adoção mais ampla como software de código aberto: licença e direitos sobre o código, documentação, responsabilidades de manutenção, revisão de segurança, contribuição de outras bibliotecas e condições para operação institucional. A publicação do repositório, por si só, não resolve essas definições.
- Registrar o desenvolvimento conduzido por bibliotecários com apoio de ferramentas de *vibe coding* como experiência de apropriação tecnológica a ser avaliada institucionalmente. A IA auxilia a construção do software, sem se tornar requisito para seu funcionamento nem substituir homologação profissional, testes ou revisão técnica.
- Preparar, para eventual apresentação à Coordenação do SIBI/UFBA, uma narrativa visual do percurso completo do protocolo: painel do estudante, fila e análise bibliotecária, ficha homologada, autodepósito, administração e acompanhamento pela coordenação. Produzir capturas próprias com dados fictícios consistentes; as evidências atuais de desenvolvimento não equivalem a material institucional aprovado.

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

## 25. Encerramento e acesso da coordenação — decisão implementada

- O encerramento exige ficha homologada, Nada Consta aprovado, início registrado do autodepósito e URL permanente HTTPS verificada pelo bibliotecário no RI/UFBA.
- O encerramento registra a publicação, conclui o protocolo, enfileira as comunicações finais ao estudante e aos contatos ativos da coordenação e inicia a retenção de 60 dias do Nada Consta.
- O e-mail final à coordenação informa explicitamente que o Magic Link anterior deixou de ser válido. Ele não inclui botão de acesso ao painel, pois a coordenação não possui login; o endereço permanente da publicação permanece acessível.
- O Magic Link é configurável por programa, usa token imprevisível armazenado somente como hash e apresenta identificação básica do trabalho, status, SLA e marcos operacionais da timeline.
- A página da coordenação é somente leitura e não expõe CPF, documentos, arquivo do Nada Consta nem comentários internos.
- O link é inutilizado após a conclusão e a entrega das comunicações finais. Os textos atuais dos e-mails são provisórios até validação institucional.

## 26. Administração e operação — decisão implementada

- O administrador gerencia contas e perfis por operações transacionais auditadas; bloqueio e inativação retiram imediatamente a autorização operacional imposta por RLS.
- O provisionamento de equipe lista no painel somente contas institucionais confirmadas no Supabase e ainda sem perfil; o administrador seleciona pelo e-mail, sem copiar ou digitar UUID.
- Somente administradores provisionam novos perfis internos. A visão geral administrativa destaca contas institucionais confirmadas e ainda sem perfil, com resumo e provisionamento no próprio painel.
- Quando uma conta interna confirmada fica pendente, o sistema enfileira aviso para cada administrador ativo; no ambiente local, a entrega é processada pelo Mailpit. A entrega institucional depende da definição do SMTP.
- Toda conta ativa pode solicitar a alteração de senha dentro do sistema; o Pronto! envia um link de confirmação ao e-mail institucional antes da definição da nova senha.
- Cada alteração administrativa só recebe mensagem de sucesso após o Pronto! reler e confirmar no banco os campos persistidos; falhas de conferência ficam explícitas na tela.
- A Visão geral é a página inicial da equipe e o primeiro item do menu: catalogadores veem sua carga, fila, correções, aprovações e informes; administradores veem também contas pendentes, equipe ativa e atalhos de gestão.
- No painel interno de todos os perfis, o cabeçalho de cada tela apresenta um título principal conciso com pictograma contornado e fundo transparente; descrições repetidas do título ficam no conteúdo quando forem necessárias. Os breadcrumbs indicam o trajeto real a partir da Visão geral, incluindo a visão Meus atendimentos e o protocolo ao entrar em um atendimento ou na ficha. O título da aba reproduz esse trajeto. A fila apresenta orientador e nível diretamente no cartão, evolução horizontal com etapa atual destacada e ações secundárias de histórico e prioridade no menu Ações.
- Todas as telas do painel interno usam a mesma largura máxima de conteúdo e os mesmos recuos responsivos, independentemente do perfil e da função da página; cabeçalho, breadcrumbs e conteúdo principal alinham-se pela mesma coluna.
- A Visão geral de catalogadores e administradores inicia com um feed cronológico dos últimos marcos relevantes dos atendimentos, à esquerda dos indicadores operacionais. Os cartões mostram avatar da pessoa que agiu, ação, horário relativo, título e protocolo, além de link para o atendimento. Novas ações atualizam o feed em tempo real, com nova tentativa automática se a conexão falhar; itens antigos carregam automaticamente ao chegar ao fim da rolagem, sem botão. O feed usa somente eventos reais da auditoria, com seleção restrita de ações operacionais; não exibe valores corrigidos, conteúdo de mensagens, CPF, documentos ou metadados brutos do log. A leitura é permitida apenas à equipe ativa, mediante função de banco com checagem de perfil.
- A própria conta administrativa não pode remover seu perfil de administrador nem deixar de estar ativa por essa operação.
- Programas concentram SLA em dias úteis, ativação do guia do RI/UFBA, coordenação institucional e Magic Link; alterações preservam histórico de SLA e log administrativo.
- O mural usa os estados normal, recesso, paralisação/greve e outro, com período e ativação explícitos.
- O calendário operacional da Administração permite navegar por mês e ano, registra finais de semana e considera feriados e pontos facultativos federais como dias não úteis para o SLA. As datas federais são incorporadas a partir da portaria anual do MGI; ocorrências locais e dias sem funcionamento da BIB/FA são registrados manualmente pelo administrador. O painel do estudante apresenta somente os eventos ativos do mês corrente.
- No cálculo do SLA, feriados e pontos facultativos sem data de término ocupam somente a data registrada; recessos e paralisações sem término suspendem os dias úteis até que sejam encerrados.
- Os seis templates básicos de pendência podem ter rótulo, texto, ordem e ativação ajustados, sem criar um construtor avançado de templates.
- Indicadores simples apresentam volume por período, status, curso/programa e bibliotecário, com exportação local em CSV e JSON.
- O expurgo operacional lista somente Nada Consta com retenção vencida, remove o objeto privado e preserva o registro textual e o log da ação.
- A consulta administrativa aos logs exibe ações operacionais e administrativas já registradas; detalhes adicionais de cobertura continuam sujeitos à política de logs pendente.

## 27. Estabilização e lançamento do MVP

- A regressão automatizada combina testes unitários, pgTAP e Playwright. As sessões autenticadas de Estudante, Catalogador e Administrador são artefatos locais temporários, ignorados pelo Git e sem senhas versionadas.
- A matriz mínima inclui desktop claro/escuro, celular, teclado, acessibilidade automatizada, responsividade e latência simulada. Testes com leitor de tela, dispositivo institucional simples e participantes reais continuam assistidos.
- Selos ou afirmações de conformidade WCAG/eMAG no rodapé dependem de auditoria integral com evidência e validação assistida dos fluxos públicos e autenticados. A cobertura automatizada atual de páginas públicas e as validações assistidas pendentes não autorizam declarar conformidade nem exibir os selos.
- Alterações visuais acumuladas recebem validação consolidada antes do PR, após solicitação do usuário, executada pelo agente com aplicação em funcionamento e captura. Até lá, não executar testes; inspeções pontuais de código podem ser feitas somente quando necessárias à implementação.
- Atender à preferência permanente do usuário por economia máxima de tokens: usar somente contexto, leituras, ferramentas e verificações estritamente necessários; evitar repetir conteúdo, buscas/leituras sem mudança ou dúvida e análises paralelas por garantia. Fazer testes e validações consolidadas ao final, antes de abrir PR e somente quando o usuário solicitar. Essa economia não reduz a qualidade do trabalho.
- Quando o usuário solicitar PR, o agente executa e corrige autonomamente as verificações locais e regressão necessárias, sem transferir comandos, revisão de código ou diagnóstico ao usuário não-programador. Usa npm run verify para resumir test, typecheck, lint e build, preserva logs e reexecuta somente o afetado após correções. Mantém E2E e pgTAP do CI. Login, decisões institucionais, migrações remotas e ações destrutivas continuam sujeitos às autorizações aplicáveis.
- PDFs acadêmicos reais usados na homologação devem ser anonimizados e permanecer fora do repositório; o aceite inclui documentos longos, páginas rotacionadas e preservação integral das páginas originais.
- A revisão LGPD técnica confirma minimização, restrição por RLS, processamento local do trabalho e expurgo do Nada Consta. Aviso, canal do titular, base institucional e retenção residual dependem de validação institucional.
- A minuta v1.1 da Política de Privacidade requer validação institucional antes da publicação; a versão 1.0 aprovada e seus registros de ciência permanecem preservados.
- O lançamento usa Vercel e Supabase, mas nenhuma migração remota é aplicada sem revisão de impacto e confirmação explícita. O lançamento público depende também das URLs definitivas, SMTP e textos de e-mail aprovados.
- A validação com estudantes e bibliotecários produz evidências de tarefas e severidade sem registrar CPF, senha, arquivo acadêmico, token ou comentário interno.
