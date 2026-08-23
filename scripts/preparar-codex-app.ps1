$ErrorActionPreference = "Stop"

function Require-Command {
  param([string]$Name, [string]$FriendlyName)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$FriendlyName não foi encontrado. Pare e instale-o pelo site oficial antes de continuar."
  }
}

Write-Host "Preparando o Pronto! para o Codex App..." -ForegroundColor Cyan

Require-Command "git" "Git"
Require-Command "node" "Node.js 22"
Require-Command "npm" "npm"

$nodeVersion = (node --version).Trim()
$nodeMajor = [int]($nodeVersion.TrimStart("v").Split(".")[0])
if ($nodeMajor -lt 22) {
  throw "É necessário Node.js 22 ou superior. Versão encontrada: $nodeVersion."
}

foreach ($optionalCommand in @("docker", "gh")) {
  if (Get-Command $optionalCommand -ErrorAction SilentlyContinue) {
    Write-Host "Ferramenta disponível: $optionalCommand." -ForegroundColor Green
  } else {
    Write-Host "Ferramenta ainda não configurada: $optionalCommand. A preparação básica pode continuar." -ForegroundColor Yellow
  }
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repositoryRoot

if (-not (Test-Path ".git")) {
  throw "Esta pasta não parece ser o repositório clonado pelo GitHub."
}

$currentBranch = (git branch --show-current).Trim()
if ($currentBranch -ne "master") {
  throw "A preparação inicial deve partir da branch master. Branch atual: $currentBranch."
}

$pendingChanges = git status --porcelain
if ($pendingChanges) {
  throw "Existem alterações locais pendentes. Pare e revise-as antes da preparação."
}

Write-Host "Atualizando a master sem criar merge automático..." -ForegroundColor Cyan
git pull --ff-only

if (-not (Test-Path ".env.local")) {
  Copy-Item ".env.example" ".env.local"
  Write-Host ".env.local foi criado a partir do modelo. Preencha-o localmente e não compartilhe seu conteúdo." -ForegroundColor Yellow
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

Write-Host "Gerando build de produção..." -ForegroundColor Cyan
npm run build

Write-Host "Preparação concluída. Configure .env.local sem compartilhar segredos." -ForegroundColor Green
git status --short --branch
