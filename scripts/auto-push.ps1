<#
.SYNOPSIS
    Real-time auto-push watcher for the "bookie" repo.

.DESCRIPTION
    Watches the repository for file changes and, after a short quiet period
    (debounce), automatically stages, commits, and pushes to origin/main.

    Designed to run continuously in a dedicated terminal. Safe to Ctrl+C at
    any time; a final flush pushes whatever is pending.

.USAGE
    pwsh -File scripts/auto-push.ps1
    # optional overrides:
    pwsh -File scripts/auto-push.ps1 -DebounceMs 3000 -Branch main
#>

param(
    [string]$Branch = "main",
    [int]$DebounceMs = 2500,          # quiet period after last change before pushing
    [int]$MaxWaitMs = 15000,          # force a push even if edits keep streaming in
    [string]$Remote = "origin"
)

$ErrorActionPreference = "Stop"

# --- Locate repo root (parent of this script's folder) ---
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

if (-not (Test-Path (Join-Path $RepoRoot ".git"))) {
    Write-Host "ERROR: $RepoRoot is not a git repository." -ForegroundColor Red
    exit 1
}

function Write-Log($msg, $color = "Gray") {
    $ts = Get-Date -Format "HH:mm:ss"
    Write-Host "[$ts] $msg" -ForegroundColor $color
}

Write-Log "Auto-push watching '$RepoRoot' -> $Remote/$Branch" "Cyan"
Write-Log "Debounce ${DebounceMs}ms  |  Press Ctrl+C to stop." "DarkGray"

# --- Commit + push, only if there is something to push ---
function Invoke-Push {
    # Anything to commit?
    $status = git status --porcelain
    if ([string]::IsNullOrWhiteSpace($status)) {
        return  # working tree clean, nothing new
    }

    $changed = ($status -split "`n" | Where-Object { $_ }).Count
    git add -A 2>$null | Out-Null

    $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $msg = "auto: sync $changed change(s) @ $stamp"

    # Commit; if nothing actually staged (e.g. ignored-only), bail quietly.
    git commit -q -m $msg 2>$null
    if ($LASTEXITCODE -ne 0) { return }

    Write-Log "Committed $changed change(s). Pushing..." "Yellow"
    git push $Remote $Branch 2>&1 | ForEach-Object { Write-Log "  $_" "DarkGray" }

    if ($LASTEXITCODE -eq 0) {
        Write-Log "Pushed to $Remote/$Branch OK." "Green"
    } else {
        Write-Log "Push FAILED (will retry on next change). Check network/auth." "Red"
    }
}

# --- FileSystemWatcher setup ---
$fsw = New-Object System.IO.FileSystemWatcher
$fsw.Path = $RepoRoot
$fsw.IncludeSubdirectories = $true
$fsw.EnableRaisingEvents = $true
$fsw.NotifyFilter = [System.IO.NotifyFilters]::FileName -bor `
                    [System.IO.NotifyFilters]::DirectoryName -bor `
                    [System.IO.NotifyFilters]::LastWrite -bor `
                    [System.IO.NotifyFilters]::Size

# Shared state for debounce (script scope so events can see it)
$script:LastChange = $null
$script:FirstChange = $null

# Paths we never care about (avoid feedback loops from .git internals)
$ignore = '[\\/](\.git|node_modules|dist|dist-ssr)[\\/]'

$onChange = {
    $full = $Event.SourceEventArgs.FullPath
    if ($full -match $using:ignore) { return }
    $now = Get-Date
    $script:LastChange = $now
    if (-not $script:FirstChange) { $script:FirstChange = $now }
}

$handlers = @()
foreach ($evt in 'Changed','Created','Deleted','Renamed') {
    $handlers += Register-ObjectEvent -InputObject $fsw -EventName $evt -Action $onChange
}

# --- Main loop: poll debounce state and push when quiet ---
try {
    while ($true) {
        Start-Sleep -Milliseconds 400

        if ($script:LastChange) {
            $sinceLast  = ((Get-Date) - $script:LastChange).TotalMilliseconds
            $sinceFirst = ((Get-Date) - $script:FirstChange).TotalMilliseconds

            # Push when things have been quiet for DebounceMs,
            # OR we've been accumulating for longer than MaxWaitMs.
            if ($sinceLast -ge $DebounceMs -or $sinceFirst -ge $MaxWaitMs) {
                $script:LastChange = $null
                $script:FirstChange = $null
                try { Invoke-Push } catch { Write-Log "Push error: $_" "Red" }
            }
        }
    }
}
finally {
    Write-Log "Stopping watcher, flushing final changes..." "Cyan"
    $handlers | ForEach-Object { Unregister-Event -SourceIdentifier $_.Name -ErrorAction SilentlyContinue }
    $fsw.EnableRaisingEvents = $false
    $fsw.Dispose()
    try { Invoke-Push } catch { Write-Log "Final push error: $_" "Red" }
    Write-Log "Watcher stopped." "Cyan"
}
