# Pronto!

**Assistente de Fichas Catalográficas e Autodepósito** da Biblioteca da Faculdade de Arquitetura — BIB/FA, vinculada ao SIBI/UFBA.

## Fundação implementada

- Next.js, React e TypeScript;
- tokens visuais para temas claro, escuro e preferência do sistema;
- páginas públicas, cadastro, login, recuperação de senha e painel inicial;
- modelos fundacionais com Drizzle para perfis, cursos, coordenações, mural, SLA e auditoria;
- configuração dos cinco cursos e programas iniciais;
- validação e mascaramento de CPF;
- matriz de permissões para estudante, catalogador e administrador;
- clientes Supabase separados para navegador e servidor.

Os formulários exibidos nesta etapa são a fundação visual. A integração efetiva com o Supabase Auth será concluída após a criação e configuração do projeto Supabase.

## Requisitos

- Node.js 22 ou superior;
- npm;
- projeto Supabase para autenticação e banco de dados.

## Configuração local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Verificações

```bash
npm test
npm run typecheck
npm run build
```

## Banco de dados

Preencha `DATABASE_URL` e execute:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

O PDF completo do trabalho acadêmico nunca será armazenado pelo Pronto!. O Supabase Storage será reservado ao Nada Consta temporário em incremento posterior.
