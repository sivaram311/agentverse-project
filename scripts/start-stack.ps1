#Requires -Version 5.1
<#
.SYNOPSIS
  Start AgentVerse UI (:3310) with bundled agent-portal API (:8080) + CSS (:9000) if needed.
#>
param(
  [switch]$SkipCss,
  [switch]$SkipPortal,
  [switch]$UiOnly
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Portal = Join-Path $Root "services\agent-portal"
$Css = Join-Path $Root "services\centralized-security-system"
$LogDir = Join-Path $Root "logs"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Test-Port([int]$Port) {
  return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Start-JavaJar([string]$Jar, [string[]]$JavaArgs, [string]$OutLog, [string]$Name) {
  if (-not (Test-Path $Jar)) { throw "Missing JAR for ${Name}: $Jar" }
  Write-Host "Starting $Name → $Jar"
  $argList = @("-jar", $Jar) + $JavaArgs
  Start-Process -FilePath "java" -ArgumentList $argList -WorkingDirectory (Split-Path $Jar) `
    -RedirectStandardOutput $OutLog -RedirectStandardError ($OutLog -replace "\.log$", ".err.log") `
    -WindowStyle Hidden | Out-Null
}

Write-Host "=== AgentVerse stack ==="
Write-Host "Root: $Root"

if (-not $UiOnly) {
  if (-not $SkipCss -and -not (Test-Port 9000)) {
    $cssJar = Get-ChildItem (Join-Path $Css "target") -Filter "*.jar" -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -notmatch "sources|javadoc|original" } |
      Sort-Object LastWriteTime -Descending |
      Select-Object -First 1
    if (-not $cssJar) {
      Write-Host "CSS JAR not found — building…"
      Push-Location $Css
      if (Test-Path ".\mvnw.cmd") { .\mvnw.cmd -q -DskipTests package } else { mvn -q -DskipTests package }
      Pop-Location
      $cssJar = Get-ChildItem (Join-Path $Css "target") -Filter "*.jar" |
        Where-Object { $_.Name -notmatch "sources|javadoc|original" } |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
    }
    if ($cssJar) {
      $env:CSS_CORS_ORIGINS = "*"
      Start-JavaJar $cssJar.FullName @() (Join-Path $LogDir "css.log") "CSS :9000"
      Start-Sleep -Seconds 4
    } else {
      Write-Warning "CSS not started (no JAR). Login may fail until :9000 is up."
    }
  } else {
    Write-Host "CSS :9000 already listening (or skipped)."
  }

  if (-not $SkipPortal -and -not (Test-Port 8080)) {
    $portalJar = Get-ChildItem (Join-Path $Portal "backend\target") -Filter "*.jar" -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -notmatch "sources|javadoc|original" } |
      Sort-Object LastWriteTime -Descending |
      Select-Object -First 1
    if (-not $portalJar) {
      Write-Host "Portal JAR not found — building backend…"
      Push-Location (Join-Path $Portal "backend")
      if (Test-Path ".\mvnw.cmd") { .\mvnw.cmd -q -DskipTests package } else { mvn -q -DskipTests package }
      Pop-Location
      $portalJar = Get-ChildItem (Join-Path $Portal "backend\target") -Filter "*.jar" |
        Where-Object { $_.Name -notmatch "sources|javadoc|original" } |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
    }
    if ($portalJar) {
      # CORS disabled (allow any origin) for public-IP / LAN access
      $env:APP_CORS_ORIGINS = "*"
      $env:CSS_CORS_ORIGINS = "*"
      Start-JavaJar $portalJar.FullName @() (Join-Path $LogDir "agent-portal.log") "agent-portal :8080"
      Start-Sleep -Seconds 6
    } else {
      throw "agent-portal backend JAR missing under services/agent-portal/backend/target"
    }
  } else {
    Write-Host "Portal :8080 already listening (or skipped)."
  }
}

# Ensure CSS also allows any origin when we start it
if (-not $UiOnly -and -not $SkipCss) {
  $env:CSS_CORS_ORIGINS = "*"
}

Set-Location $Root
if (-not (Test-Path (Join-Path $Root "node_modules"))) {
  npm install
}

$pub = $null
try {
  $pub = (Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and $_.InterfaceAlias -notmatch 'vEthernet|Loopback|WSL' } |
    Select-Object -First 1 -ExpandProperty IPAddress)
} catch { }

Write-Host "Starting AgentVerse UI on 0.0.0.0:3310 (CORS open)"
if ($pub) {
  Write-Host "Public / LAN URL: http://${pub}:3310/"
}
Write-Host "Local URL:         http://127.0.0.1:3310/"
npm run dev
