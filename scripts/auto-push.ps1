<#
.SYNOPSIS
    Real-time auto-push watcher for the "bookie" repo.

.DESCRIPTION
    Polls the git working tree on a short interval. When it detects changes
    and they have settled (no further changes for the debounce window), it
    stages, commits with a timestamped message, and pushes to origin/main.

    Polling is used instead of FileSystemWatcher events because it avoids
    PowerShell runspace-scope pitfalls and is rock-solid across editors that
    write via temp-file swaps. Effective latency is DebounceMs + one poll.

    Safe to Ctrl+C at any time; a final flush pushes whatever is pending.

.USAGE
    pwsh -File scripts/auto-push.ps1
    pwsh -File scripts/auto-push.ps1 -DebounceMs 3000 -Branch main
#>

param(
    [string]$Branch     = "main",
    [string]$Remote     = "origin",
    [int]$PollMs        = 1000,    # how often to check for changes
    [int]$DebounceMs    = 2500,    # require this much quiet before pushing
    [int]$MaxWaitMs     = 15000    # force a push after this long even if edits keep coming
)

$ErrorActionPreference = "Continue"

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
Write-Log "Poll ${PollMs}ms | Debounce ${DebounceMs}ms | Ctrl+C to stop." "DarkGray"

function Get-DirtyCount {
    $status = git status --porcelain 2>$null
    if ([string]::IsNullOrWhiteSpace($status)) { return 0 }
    return ($status -split "`n" | Where-Object { $_ }).Count
}

function Invoke-Push {
    $changed = Get-DirtyCount
    if ($changed -eq 0) { return }

    git add -A 2>$null | Out-Null
    $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -q -m "auto: sync $changed change(s) @ $stamp" 2>$null
    if ($LASTEXITCODE -ne 0) { return }   # nothing actually staged

    Write-Log "Committed $changed change(s). Pushing..." "Yellow"
    $out = git push $Remote $Branch 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Pushed to $Remote/$Branch OK." "Green"
    } else {
        Write-Log "Push FAILED (will retry next cycle): $out" "Red"
    }
}

# --- Polling debounce loop ---
$prevDirty   = -1          # dirty count seen on the previous poll
$quietMs     = 0           # how long the dirty count has been stable and > 0
$accumMs     = 0           # how long we've had pending changes total

try {
    while ($true) {
        Start-Sleep -Milliseconds $PollMs
        $dirty = Get-DirtyCount

        if ($dirty -eq 0) {
            $prevDirty = 0; $quietMs = 0; $accumMs = 0
            continue
        }

        $accumMs += $PollMs

        if ($dirty -eq $prevDirty) {
            $quietMs += $PollMs        # count unchanged -> things are settling
        } else {
            $quietMs = 0               # still actively editing -> reset quiet timer
        }
        $prevDirty = $dirty

        if ($quietMs -ge $DebounceMs -or $accumMs -ge $MaxWaitMs) {
            Invoke-Push
            $prevDirty = -1; $quietMs = 0; $accumMs = 0
        }
    }
}
finally {
    Write-Log "Stopping - flushing final changes..." "Cyan"
    Invoke-Push
    Write-Log "Watcher stopped." "Cyan"
}
