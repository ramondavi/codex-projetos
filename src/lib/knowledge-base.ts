export type KnowledgeKind = "Dúvida rápida" | "Pergunta frequente" | "Artigo de ajuda";
export type KnowledgeItem = { id: string; slug?: string; kind: KnowledgeKind; category: string; title: string; summary: string; body?: string[] };

export const quickDoubts: KnowledgeItem[] = [
  { id: "doubt-work-upload", kind: "Dúvida rápida", category: "Solicitação", title: "Preciso enviar o PDF do trabalho?", summary: "Não. Informe um link público para o trabalho final; o PDF completo não é enviado ao Pronto!." },
  { id: "doubt-card-download", kind: "Dúvida rápida", category: "Ficha", title: "Quando a ficha fica disponível?", summary: "Após a homologação pela biblioteca e a aprovação do Nada Consta." },
];

export const helpArticles: KnowledgeItem[] = [
  { id: "article-prepare", slug: "preparar-solicitacao", kind: "Artigo de ajuda", category: "Solicitação", title: "Como preparar sua solicitação", summary: "Confira o que separar antes de iniciar o formulário.", body: ["Use a versão final do trabalho, já defendida ou aprovada pela banca. Quando aplicável, ela deve incluir a folha de aprovação assinada ou digitalizada.", "Hospede o arquivo em um serviço de nuvem e confirme que o link funciona para qualquer pessoa. Google Drive, OneDrive e serviços equivalentes podem ser usados.", "No formulário, transcreva os dados conforme aparecem no trabalho. O rascunho é salvo automaticamente para você continuar depois."] },
  { id: "article-corrections", slug: "corrigir-solicitacao", kind: "Artigo de ajuda", category: "Análise", title: "Como responder a uma correção da biblioteca", summary: "Entenda o que acontece quando a solicitação volta para você.", body: ["Entre no painel e abra sua solicitação. A mensagem da biblioteca informa os campos e as justificativas da correção.", "Somente os campos devolvidos ficam disponíveis para alteração. Os demais permanecem bloqueados para preservar a revisão já realizada.", "Após corrigir, envie novamente pelo próprio painel. A biblioteca retoma a análise e o histórico da rodada permanece registrado."] },
  { id: "article-deposit", slug: "concluir-autodeposito", kind: "Artigo de ajuda", category: "Autodepósito", title: "Como concluir o autodepósito", summary: "Veja o que fazer depois da liberação da ficha.", body: ["A liberação ocorre quando a ficha foi homologada e o Nada Consta aprovado. A partir daí, use o guia apresentado no painel.", "O Pronto! reaproveita os metadados para ajudar no preenchimento, mas o depósito e a escolha da licença são feitos por você no RI/UFBA.", "Depois de publicar, informe a URL permanente ou Handle à biblioteca para a conferência e o encerramento do protocolo."] },
];

export function normalizeKnowledge(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
