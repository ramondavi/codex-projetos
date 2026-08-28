# Dados de demonstração no ambiente local

O comando abaixo carrega dados exclusivamente sintéticos no Supabase local. Ele não consulta nem altera o projeto remoto e preserva registros locais que não pertençam ao conjunto de demonstração.

```powershell
npm run db:mock
```

## Pré-requisitos

1. Docker Desktop aberto.
2. Supabase local ativo com `npx supabase start`.
3. Migrações locais atualizadas.

## Acessos

As senhas são geradas novamente a cada execução e nunca são exibidas pelo comando ou versionadas. Depois da carga, abra no seu próprio computador:

```text
.auth/mock-users.txt
```

Esse arquivo é ignorado pelo Git. Não o envie, não copie seu conteúdo para issues ou PRs e não use essas credenciais fora do ambiente local.

## Cenários disponíveis

- Administrador com usuários, programas, aviso de atendimento, estatísticas, logs e um Nada Consta com expurgo vencido.
- Dois bibliotecários, com solicitações atribuídas em diferentes etapas.
- Estudante com solicitação aguardando na fila.
- Estudante com solicitação em análise.
- Estudante com correções pendentes.
- Estudante com ficha homologada e aguardando Nada Consta.
- Estudante com Nada Consta aprovado e mesclagem liberada.
- Estudante com protocolo concluído e publicação registrada.
- Coordenação com Magic Link somente leitura, sem conta ou senha.

Os nomes, e-mails, CPFs, protocolos, trabalhos, documentos e endereços são sintéticos. O mock não envia e-mail e não inclui PDF acadêmico real.

## Repetição segura

O comando pode ser executado novamente. Ele atualiza apenas os registros identificados como demonstração e gera novas senhas e um novo Magic Link. As credenciais anteriores deixam de funcionar.
