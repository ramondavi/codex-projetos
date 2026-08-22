# Instruções para agentes — Pronto!

Estas instruções valem para todo o repositório e devem ser seguidas no Codex Desktop, CLI, IDE ou Cloud.

## Fonte da verdade

1. Leia `docs/documento-mestre.md` antes de propor regras de negócio.
2. Consulte `docs/decisoes-pendentes.md`; nunca implemente uma opção ainda pendente como se estivesse aprovada.
3. Leia `docs/estado-atual.md` ao iniciar uma nova conversa ou incremento.
4. Em caso de ambiguidade, pergunte ao usuário em português antes de inferir.

## Segurança e banco

- Nunca leia, exiba, registre ou versione `.env`, `.env.local`, senhas, tokens, chaves ou connection strings.
- Use somente a chave pública/publishable do Supabase no navegador. Nunca use `service_role` em código cliente.
- Migrações incorporadas são imutáveis. Toda alteração de banco deve ser uma nova migração em `supabase/migrations`.
- Não aplique migrações no Supabase remoto sem explicar o impacto e obter confirmação explícita do usuário.
- Políticas de acesso devem ser impostas no banco com RLS, não apenas escondendo elementos da interface.
- Contas `blocked` ou `inactive` não podem conservar autorização operacional.

## Fluxo Git

- Antes de editar, confirme que a tarefa parte da `master` atualizada e que `git status` está limpo.
- Trabalhe em uma branch nova por incremento ou correção.
- Não force push, não reescreva a `master` e não apague branches sem solicitação.
- Faça um commit claro e abra um PR; não faça merge automaticamente.
- Antes do commit, revise `git diff` e confirme que nenhum segredo entrou no patch.

## Verificações obrigatórias

Execute antes de concluir uma alteração:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

- Para o build, use apenas valores públicos/fictícios quando o ambiente local ainda não estiver configurado.
- Se houver alteração visual perceptível, inicie a aplicação e registre uma captura de tela.
- Informe separadamente falhas do código e limitações do ambiente.

## Comunicação

- Explique procedimentos ao usuário como a uma pessoa não-programadora: passos numerados, nomes exatos dos botões e indicação clara do que não deve ser compartilhado.
- Responda em português, salvo solicitação diferente.
- Preserve os fluxos e decisões existentes; faça somente as alterações pedidas.
