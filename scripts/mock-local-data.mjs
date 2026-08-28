import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatePath = path.join(projectRoot, "supabase", "mock-data.sql.template");
const privateDirectory = path.join(projectRoot, ".auth");
const credentialsPath = path.join(privateDirectory, "mock-users.txt");
const container = "supabase_db_codex-projetos";
const authContainer = "supabase_auth_codex-projetos";

function password() {
  return `${randomBytes(12).toString("base64url")}aA1!`;
}

function cpf(base) {
  const digits = base.split("").map(Number);
  for (let size = 9; size <= 10; size += 1) {
    const total = digits.slice(0, size).reduce((sum, digit, index) => sum + digit * (size + 1 - index), 0);
    const result = (total * 10) % 11;
    digits.push(result === 10 ? 0 : result);
  }
  return digits.join("");
}

function sqlLiteral(value) {
  return value.replaceAll("'", "''");
}

const accounts = [
  ["ADMIN_PASSWORD", "Administrador", "demo.admin@ufba.br", "Painel administrativo"],
  ["CATALOGER_ONE_PASSWORD", "Bibliotecária", "demo.bibliotecaria@ufba.br", "Fila e atendimentos em andamento"],
  ["CATALOGER_TWO_PASSWORD", "Bibliotecário", "demo.catalogador@ufba.br", "Homologação e Nada Consta"],
  ["STUDENT_QUEUE_PASSWORD", "Estudante", "demo.estudante.fila@ufba.br", "Solicitação aguardando na fila"],
  ["STUDENT_REVIEW_PASSWORD", "Estudante", "demo.estudante.analise@ufba.br", "Solicitação em análise"],
  ["STUDENT_ISSUES_PASSWORD", "Estudante", "demo.estudante.pendencia@ufba.br", "Correções solicitadas"],
  ["STUDENT_CARD_PASSWORD", "Estudante", "demo.estudante.ficha@ufba.br", "Ficha homologada; enviar Nada Consta"],
  ["STUDENT_RELEASE_PASSWORD", "Estudante", "demo.estudante.liberacao@ufba.br", "Nada Consta aprovado e mesclagem liberada"],
  ["STUDENT_COMPLETE_PASSWORD", "Estudante", "demo.estudante.concluido@ufba.br", "Protocolo concluído"],
];

const values = Object.fromEntries(accounts.map(([key]) => [key, password()]));
const cpfBases = ["100000001", "100000002", "100000003", "100000004", "100000005", "100000006"];
cpfBases.forEach((base, index) => { values[`STUDENT_${index + 1}_CPF`] = cpf(base); });
const coordinationToken = randomBytes(32).toString("hex");
values.COORDINATION_TOKEN_HASH = createHash("sha256").update(coordinationToken).digest("hex");

let sql = await readFile(templatePath, "utf8");
sql = sql.replaceAll(`'{\'"\'"\'provider\'"\'"\':\'"\'"\'email\'"\'"\',\'"\'"\'providers\'"\'"\':[\'"\'"\'email\'"\'"\']}'`, `'${JSON.stringify({ provider: "email", providers: ["email"] })}'`);
for (const fullName of ["Marina Costa Demo", "Helena Almeida Demo", "Rafael Santos Demo", "Ana Lima Demo", "Bruno Rocha Demo", "Carla Nascimento Demo", "Diego Oliveira Demo", "Elisa Ferreira Demo", "Felipe Barbosa Demo"]) {
  sql = sql.replaceAll(`'{\'"\'"\'full_name\'"\'"\':\'"\'"\'${fullName}\'"\'"\'}'`, `'${JSON.stringify({ full_name: fullName })}'`);
}
for (const [key, value] of Object.entries(values)) {
  sql = sql.replaceAll(`{{${key}}}`, sqlLiteral(value));
}

const inspect = spawnSync("docker", ["inspect", container], { encoding: "utf8", windowsHide: true });
if (inspect.status !== 0) {
  throw new Error("O Supabase local não está ativo. Execute `npx supabase start` e tente novamente.");
}

const execution = spawnSync("docker", ["exec", "-i", container, "psql", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres"], {
  cwd: projectRoot,
  input: sql,
  encoding: "utf8",
  maxBuffer: 10 * 1024 * 1024,
  windowsHide: true,
});
if (execution.status !== 0) {
  process.stderr.write(execution.stderr || "Falha ao carregar os dados locais de demonstração.\n");
  process.exit(execution.status ?? 1);
}

for (const [key, , email] of accounts) {
  const authentication = spawnSync("docker", [
    "exec", authContainer, "wget", "-qO-",
    "--header", "Content-Type: application/json",
    "--post-data", JSON.stringify({ email, password: values[key] }),
    "http://127.0.0.1:9999/token?grant_type=password",
  ], { encoding: "utf8", maxBuffer: 1024 * 1024, windowsHide: true });

  if (authentication.status !== 0) {
    throw new Error(`O Supabase Auth local recusou a conta sintética ${email}.`);
  }
}

await mkdir(privateDirectory, { recursive: true });
const lines = [
  "PRONTO! — ACESSOS SINTÉTICOS LOCAIS",
  "Este arquivo é privado, ignorado pelo Git e recriado a cada execução.",
  "",
  ...accounts.flatMap(([key, role, email, scenario]) => [
    `${role} — ${scenario}`,
    `E-mail: ${email}`,
    `Senha: ${values[key]}`,
    "",
  ]),
  "Coordenação — acompanhamento somente leitura, sem login",
  `Link: http://127.0.0.1:3100/coordenacao/${coordinationToken}`,
  "",
];
await writeFile(credentialsPath, lines.join("\n"), { encoding: "utf8", mode: 0o600 });

process.stdout.write("Dados sintéticos locais carregados com sucesso.\n");
process.stdout.write(`Abra localmente o arquivo privado: ${credentialsPath}\n`);
process.stdout.write("Nenhuma credencial foi exibida ou versionada.\n");
