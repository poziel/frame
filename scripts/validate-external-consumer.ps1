param(
    [switch]$Browser,
    [switch]$Native,
    [string]$Python = "python"
)
$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path $PSScriptRoot -Parent
$fixturePath = Join-Path $repositoryRoot "tests/fixtures/external-consumer"
$artifactPath = Join-Path $repositoryRoot ".tmp"
$consumerPath = Join-Path ([IO.Path]::GetTempPath()) ("frame-external-consumer-" + [guid]::NewGuid().ToString("N"))

function Assert-Exit([string]$Step) {
    if ($LASTEXITCODE -ne 0) { throw "$Step failed (exit $LASTEXITCODE)." }
}

Push-Location $repositoryRoot
try {
    New-Item -ItemType Directory -Force $artifactPath | Out-Null
    bun run build:library
    Assert-Exit "Core library build"
    $packOutput = npm pack ./packages/core --pack-destination $artifactPath --json | Out-String
    Assert-Exit "Core archive creation"
    $archive = @($packOutput | ConvertFrom-Json)[0]
    if (@($archive.files | Where-Object { $_.path -match '(^src/|^node_modules/|^apps/)' }).Count) {
        throw "Source, dependency, or application files leaked into the archive."
    }
    New-Item -ItemType Directory $consumerPath | Out-Null
    Copy-Item -Path (Join-Path $fixturePath "*") -Destination $consumerPath -Recurse
    Copy-Item -LiteralPath (Join-Path $artifactPath $archive.filename) -Destination (Join-Path $consumerPath "frame-core.tgz")
    $consumerPath | Set-Content (Join-Path $artifactPath "external-consumer-path.txt")

    Push-Location $consumerPath
    try {
        bun add ./frame-core.tgz
        Assert-Exit "External dependency installation"
        bun run build
        Assert-Exit "External strict typecheck and production build"
        $installedPackage = Get-Item "node_modules/@frame/core"
        if ($installedPackage.LinkType) { throw "Consumer package must be extracted, not linked to the workspace." }
        $manifest = Get-Content "package.json" -Raw | ConvertFrom-Json
        if ($manifest.dependencies.'@frame/core' -notmatch 'frame-core\.tgz$') {
            throw "Consumer does not depend on the package archive."
        }
    } finally { Pop-Location }

    if ($Browser) {
        & $Python (Join-Path $repositoryRoot "tests/external-consumer-browser.py") --consumer $consumerPath --output $artifactPath
        Assert-Exit "Browser integration"
    }

    if ($Native) {
        if (-not $IsWindows) { throw "The native smoke test currently supports Windows only." }
        $previousTarget = $env:CARGO_TARGET_DIR
        $previousResult = $env:FRAME_CONSUMER_RESULT
        try {
            $env:CARGO_TARGET_DIR = Join-Path $repositoryRoot "packages/docs/src-tauri/target"
            cargo build --manifest-path (Join-Path $consumerPath "src-tauri/Cargo.toml") --features tauri/custom-protocol
            Assert-Exit "Independent native host build"
            $env:FRAME_CONSUMER_RESULT = Join-Path $consumerPath "native-result.json"
            $process = Start-Process -FilePath (Join-Path $env:CARGO_TARGET_DIR "debug/frame-external-consumer.exe") -WindowStyle Hidden -PassThru
            try {
                if (-not $process.WaitForExit(30000)) { throw "Native smoke test timed out after 30 seconds." }
                if (-not (Test-Path -LiteralPath $env:FRAME_CONSUMER_RESULT)) { throw "Native host exited without a report." }
                $result = Get-Content -LiteralPath $env:FRAME_CONSUMER_RESULT -Raw | ConvertFrom-Json
                Copy-Item -LiteralPath $env:FRAME_CONSUMER_RESULT -Destination (Join-Path $artifactPath "external-consumer-native.json")
                if (-not $result.ok) { throw "Native smoke test failed: $($result.error)" }
                $result | ConvertTo-Json -Depth 5
            } finally {
                if (-not $process.HasExited) { $process.Kill() }
                $process.Dispose()
            }
        } finally {
            $env:CARGO_TARGET_DIR = $previousTarget
            $env:FRAME_CONSUMER_RESULT = $previousResult
        }
    }
    Write-Host "External consumer validation passed. Consumer retained at: $consumerPath"
} finally { Pop-Location }
