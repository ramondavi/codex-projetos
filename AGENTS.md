# Pronto! — agentes

## Contexto e economia
- Inicie por docs/estado-atual.md e docs/decisoes-pendentes.md uma vez por tarefa; não releia conteúdo disponível e inalterado.
- Antes de propor/alterar regras, leia as seções pertinentes de docs/documento-mestre.md, fonte da verdade, incluindo premissas, escopo e cautelas. Nunca implemente pendências como aprovadas. Atualize o mestre para decisões novas; pergunte em português sobre ambiguidades de negócio.
- Localize referências em docs/mapa-projeto.md. Histórico e guias de configuração somente por necessidade.
- Use rg --files e rg -n em caminhos específicos; leia trechos relevantes completos e amplie conforme dependências. Evite despejar arquivos grandes, gerados, tabelas, lockfiles ou logs.
- Agrupe leituras independentes. Não repita buscas, testes ou capturas sem mudança, falha ou dúvida concreta; não delegue por garantia.
- Responda em português simples e conciso: resultado, verificações e bloqueios. Faça o trabalho seguro autorizado; intervenção humana indispensável: uma instrução por vez, com botão exato, sem pedir segredos.
- Preserve fluxos e escopo. Nunca economize removendo segurança, testes, tipos, legibilidade ou evidências necessárias.

## Segurança
- Nunca leia, exiba, registre ou versione .env, .env.local, senhas, tokens, chaves ou connection strings.
- No navegador, somente chave pública/publishable Supabase; nunca service_role.
- Autorização no banco por RLS; contas blocked/inactive perdem acesso operacional.
- Migrações incorporadas são imutáveis; alterações em nova migração em supabase/migrations.
- Migração remota exige explicação do impacto e confirmação explícita.

## Git e validação
- No App, use a raiz do clone GitHub com .git, nunca ZIP/cópia Cloud. Antes de editar: árvore limpa, master atualizada e branch nova.
- Revise diff/segredos antes do commit; faça commit claro e PR. Sem merge automático, force push, reescrita da master ou exclusão de branches não solicitada.
- Durante o trabalho, testes direcionados. Antes de concluir: npm test, npm run typecheck, npm run lint e npm run build, uma vez; repita somente o afetado por novas mudanças/falhas. Preserve os checks do CI.
- Build sem configuração local: valores públicos/fictícios. Resuma saídas; diferencie falhas de código de limitações do ambiente.
- Mudança visual: aplicação em execução e captura consolidada antes do PR; siga as aprovações da seção 27 do mestre. Não reabra autorização já concedida.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
