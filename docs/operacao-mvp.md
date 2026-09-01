# Operação do MVP

Este runbook descreve a operação inicial do Pronto! sem registrar credenciais. Decisões institucionais ainda abertas continuam em `docs/decisoes-pendentes.md`.

## Verificação diária

1. Acesse a página inicial e confirme o aviso vigente da biblioteca.
2. Entre como Administrador e confira contas bloqueadas/inativas, fila de expurgo e logs recentes.
3. Entre como Catalogador e verifique a fila, os prazos e tickets atribuídos.
4. Confirme o canal de envio de e-mails do ambiente. O botão de Mailpit é exclusivo do desenvolvimento; produção depende do SMTP institucional ainda pendente.
5. Não copie CPF, Nada Consta, links mágicos ou conteúdo de trabalho para chamados, planilhas ou mensagens externas.

## Incidentes

- **Login indisponível:** verifique o estado do Auth no painel do Supabase e a URL pública configurada na Vercel. Não compartilhe chaves.
- **Usuário sem acesso:** confirme `status` e `role`. Contas `blocked` e `inactive` devem permanecer sem autorização.
- **Ticket disputado:** não edite diretamente o banco. Use reatribuição administrativa e consulte o log.
- **E-mail pendente:** preserve a linha na outbox e registre o erro técnico sem o corpo da mensagem. Não marque como entregue manualmente.
- **PDF inválido:** peça ao estudante para repetir a geração no próprio navegador com o mesmo trabalho homologado. O arquivo não deve ser enviado ao servidor do Pronto!.
- **Expurgo parcial:** se o Storage foi removido e a confirmação falhou, interrompa novas tentativas e faça conciliação pelo identificador do documento no painel, sem restaurar o arquivo.

## Retenção e LGPD

- O Nada Consta fica em bucket privado e tem expurgo programado 60 dias após o encerramento.
- O expurgo remove o objeto e preserva metadados mínimos e log de auditoria.
- CPF é dado cadastral restrito; coordenações recebem somente a visão de acompanhamento sem CPF, documento ou comentário interno.
- Solicitações de titular, correção ou incidente devem seguir o canal institucional definido pela UFBA. O aviso de privacidade e esse canal ainda exigem validação institucional antes do lançamento público.

## Liberação e retorno

Antes de liberar uma versão, execute `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:e2e:public`, `npx supabase db lint --local --level error` e `npx supabase test db --local`. Registre commit, data e responsável na evidência de lançamento.

Se houver falha crítica após a publicação, reverta a implantação da Vercel para o artefato anterior. Migrações são imutáveis: correções de banco devem ser feitas por nova migração, nunca por reversão destrutiva.

## Implantação inicial

1. Crie os ambientes Preview e Production na Vercel, preservando o framework Next.js.
2. Cadastre somente a URL do Supabase e a chave pública/publishable como variáveis do navegador. Cadastre segredos apenas nos cofres dos provedores e nunca em variáveis `NEXT_PUBLIC_*`.
3. No Supabase hospedado, ajuste Site URL e Redirect URLs para os domínios efetivos.
4. Revise o impacto e obtenha confirmação explícita antes de aplicar as migrações remotas pendentes.
5. Execute as migrações em ordem, valide RLS, Storage privado, funções e pgTAP; então provisione a primeira conta administrativa pelo procedimento controlado.
6. Faça smoke test dos três perfis e só depois promova a implantação.

O lançamento público permanece bloqueado enquanto estiverem pendentes o aviso de privacidade, o canal de direitos do titular, o SMTP institucional, os textos finais de e-mail e as URLs definitivas.
