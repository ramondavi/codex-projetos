$ErrorActionPreference = "Stop"

function Require-Command {
  param([string]$Name, [string]$FriendlyName)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$FriendlyName não foi encontrado. Instale-o, feche e abra novamente o Codex Desktop e execute este script outra vez."
  }
}

Write-Host "Preparando o Pronto! para desenvolvimento local..." -ForegroundColor Cyan

Require-Command "git" "Git"
Require-Command "node" "Node.js 22"
Require-Command "npm" "npm"

$nodeMajor = [int]((node --version).TrimStart("v").Split(".")[0])
if ($nodeMajor -lt 22) {
  throw "É necessário Node.js 22 ou superior. A versão encontrada foi $(node --version)."
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repositoryRoot

if (-not (Test-Path ".git")) {
  throw "Esta pasta não parece ser o repositório clonado pelo GitHub Desktop."
}

if (-not (Test-Path ".env.local")) {
  Copy-Item ".env.example" ".env.local"
  Write-Host "Criado .env.local a partir do modelo. Preencha-o localmente; não envie seu conteúdo por chat." -ForegroundColor Yellow
} else {
  Write-Host ".env.local já existe e foi preservado." -ForegroundColor Green
}

Write-Host "Instalando dependências..." -ForegroundColor Cyan
npm install --no-audit --no-fund

Write-Host "Executando testes..." -ForegroundColor Cyan
npm test

Write-Host "Verificando tipos..." -ForegroundColor Cyan
npm run typecheck

Write-Host "Executando lint..." -ForegroundColor Cyan
npm run lint

Write-Host "Preparação concluída. O próximo passo é configurar .env.local sem compartilhar segredos." -ForegroundColor Green
git status --short --branch
