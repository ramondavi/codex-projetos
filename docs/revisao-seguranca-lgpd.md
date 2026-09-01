# Revisão de segurança, permissões e LGPD

Revisão técnica do Incremento 13. Ela não substitui parecer jurídico ou validação institucional.

## Controles confirmados no código

- RLS está habilitado nas tabelas operacionais e as funções privilegiadas verificam conta ativa e papel.
- Contas bloqueadas e inativas não recebem papel operacional.
- Nada Consta usa bucket privado, limite de tamanho/MIME, hash, acesso por proprietário/equipe e expurgo após o prazo.
- A ficha e o trabalho são mesclados no navegador; o PDF acadêmico não é enviado ao Pronto!.
- Magic Link da coordenação é revogável, somente leitura e omite CPF, documentos e notas internas.
- Mudanças administrativas, ticket locking, validações e expurgo geram auditoria.
- Outbox usa idempotência e reclamação com `skip locked`; Mailpit está restrito ao desenvolvimento.
- A auditoria das dependências de produção foi zerada após atualização para Next.js 16.3.2 e Drizzle ORM 0.45.2; testes, tipos, lint, build e navegador foram repetidos depois da atualização. A auditoria completa mantém quatro alertas moderados na cadeia de desenvolvimento do `drizzle-kit`/`esbuild`; o servidor desse gerador não deve ser exposto à rede e ele não integra o artefato de produção.

## Riscos residuais antes do lançamento

1. **Bloqueador institucional:** aviso de privacidade, canal de direitos do titular e textos finais ainda não foram aprovados.
2. **Bloqueador operacional:** transporte SMTP de produção e domínio/remetente ainda não foram definidos.
3. **Alto:** testes com PDFs institucionais reais e validação assistida ainda precisam de execução humana.
4. **Médio:** a retenção de logs e metadados após expurgo precisa de prazo institucional explícito.
5. **Médio:** limites de autenticação, monitoração e resposta a incidentes devem ser confirmados no projeto hospedado.

## Critérios para aceite

- Nenhuma chave secreta em código cliente, histórico Git ou relatório.
- RLS e grants conferidos depois das migrações de produção.
- URLs de callback limitadas aos domínios usados.
- Primeiro Administrador provisionado pelo procedimento controlado; demais contas pela função administrativa.
- SMTP com TLS, remetente institucional e testes de entrega/repetição aprovados.
- Aviso de privacidade, canal do titular, retenções e responsáveis aprovados pela instituição.
