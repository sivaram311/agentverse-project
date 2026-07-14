param(
    [ValidateSet("dev", "preprod", "prod")]
    [string]$EnvName = "preprod"
)

$ErrorActionPreference = "Stop"
$appDirectory = Join-Path $PSScriptRoot "app"

# Side fleet agentverse-upgrade — must NOT use classic 3310/4310/5310 or v2 3311/4311/5311
if ($EnvName -eq "prod") {
    $env:AGENT_PORTAL_API_URL = "http://127.0.0.1:5080"
    $env:CSS_AUTH_URL = "http://127.0.0.1:5900"
    $env:NEXT_PUBLIC_CSS_ISSUER = "https://css.delena.buzz"
    $env:NEXT_PUBLIC_AV_ENV = "PROD"
    $env:PORT = "5312"
} elseif ($EnvName -eq "preprod") {
    $env:AGENT_PORTAL_API_URL = "http://127.0.0.1:4080"
    $env:CSS_AUTH_URL = "http://127.0.0.1:5900"
    $env:NEXT_PUBLIC_CSS_ISSUER = "https://css.delena.buzz"
    $env:NEXT_PUBLIC_AV_ENV = "PREPROD"
    $env:PORT = "4312"
} else {
    $env:AGENT_PORTAL_API_URL = "http://127.0.0.1:8080"
    $env:CSS_AUTH_URL = "http://127.0.0.1:9000"
    $env:NEXT_PUBLIC_CSS_ISSUER = "http://localhost:9000"
    $env:NEXT_PUBLIC_AV_ENV = "DEV"
    $env:PORT = "3312"
}

if (-not (Test-Path (Join-Path $appDirectory "package.json"))) {
    throw "AgentVerse app package was not found at $appDirectory"
}

Push-Location $appDirectory
try {
    & npx next start -H 0.0.0.0 -p $env:PORT
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
