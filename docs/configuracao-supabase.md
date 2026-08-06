# Configuração do Supabase

Este guia operacional complementa o Documento-Mestre. Nunca cole senhas, chaves secretas ou *connection strings* no repositório, em issues, PRs ou conversas.

## Configuração validada

- Plano Free, organização `BIB/FAUFBA`, projeto `Pronto!` e região `South America (São Paulo)` (`sa-east-1`).
- Postgres padrão, Data API habilitada, exposição automática de tabelas desabilitada e RLS automático habilitado.
- Cadastro por e-mail habilitado, confirmação de e-mail obrigatória, login anônimo e vinculação manual desabilitados.
- Site URL local `http://localhost:3000` e redirecionamento local `http://localhost:3000/**`.

## Variáveis locais

Copie `.env.example` para `.env.local` e preencha os valores diretamente no ambiente local. A chave *publishable* é usada pelo aplicativo; senhas e a conexão do banco permanecem somente no ambiente seguro.

## Migrações pelo SQL Editor

Em um projeto vazio, execute uma única vez e nesta ordem:

1. `supabase/migrations/202608060000_foundation.sql`;
2. `supabase/migrations/202608060001_auth_accounts.sql`.

No Dashboard, abra **SQL Editor**, crie uma nova consulta, cole todo o primeiro arquivo e execute. Somente depois de sucesso repita com o segundo arquivo. Não execute parcialmente, não altere o SQL durante a cópia e interrompa se houver erro.

## Primeira conta administrativa

O procedimento será realizado depois das migrações. A pessoa será convidada pelo Dashboard e seu perfil será provisionado separadamente como `administrator`, sem aceitar papel enviado pelo navegador e sem armazenar senha no repositório.
