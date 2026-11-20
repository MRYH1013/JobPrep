param([string]$SourceFolder = 'dist-v0.6')
$ErrorActionPreference = 'Stop'
$jobPrepWorkspace = [System.IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$jobPrepLatestDir = [System.IO.Path]::GetFullPath((Join-Path $jobPrepWorkspace ($SourceFolder + '\win-unpacked')))
if (-not $jobPrepLatestDir.StartsWith($jobPrepWorkspace + '\',[System.StringComparison]::OrdinalIgnoreCase)) { throw 'Source must stay within the workspace.' }
foreach ($jobPrepRequired in @('JobPrep.exe','resources\app.asar','version')) { if (-not (Test-Path -LiteralPath (Join-Path $jobPrepLatestDir $jobPrepRequired))) { throw "Missing build output: $jobPrepRequired" } }
$jobPrepTargets = @('dist','dist-v0.2','dist-v0.3','dist-v0.4','dist-v0.5') | ForEach-Object { Join-Path $jobPrepWorkspace ($_ + '\win-unpacked') }
$jobPrepAllowedApps = @($jobPrepTargets | ForEach-Object { Join-Path $_ 'JobPrep.exe' })
$jobPrepProcesses = @(Get-Process -Name JobPrep -ErrorAction SilentlyContinue | Where-Object { $_.Path -in $jobPrepAllowedApps })
$jobPrepProcesses | Where-Object { $_.MainWindowHandle -ne 0 } | ForEach-Object { [void]$_.CloseMainWindow() }
foreach ($jobPrepProcess in $jobPrepProcesses) { try { [void]$jobPrepProcess.WaitForExit(3000) } catch {} }
Get-Process -Name JobPrep -ErrorAction SilentlyContinue | Where-Object { $_.Path -in $jobPrepAllowedApps } | Stop-Process -Force
$jobPrepRuntime = (Get-Content -LiteralPath (Join-Path $jobPrepLatestDir 'version') -Raw).Trim()
foreach ($jobPrepTarget in $jobPrepTargets) {
 $jobPrepTarget = [System.IO.Path]::GetFullPath($jobPrepTarget)
 if (-not $jobPrepTarget.StartsWith($jobPrepWorkspace + '\',[System.StringComparison]::OrdinalIgnoreCase)) { throw 'Target must stay within the workspace.' }
 if (-not (Test-Path -LiteralPath $jobPrepTarget)) { continue }
 if ((Get-Content -LiteralPath (Join-Path $jobPrepTarget 'version') -Raw).Trim() -ne $jobPrepRuntime) { throw 'Runtime changed: replace the complete application distribution instead.' }
 foreach ($jobPrepRelative in @('JobPrep.exe','resources\app.asar')) {
  Copy-Item -LiteralPath (Join-Path $jobPrepLatestDir $jobPrepRelative) -Destination (Join-Path $jobPrepTarget $jobPrepRelative) -Force
  if ((Get-FileHash -LiteralPath (Join-Path $jobPrepLatestDir $jobPrepRelative)).Hash -ne (Get-FileHash -LiteralPath (Join-Path $jobPrepTarget $jobPrepRelative)).Hash) { throw 'Build synchronization hash mismatch.' }
 }
}
$jobPrepStableExe = Join-Path $jobPrepWorkspace 'dist\win-unpacked\JobPrep.exe'
$jobPrepShell = New-Object -ComObject WScript.Shell
$jobPrepShortcut = $jobPrepShell.CreateShortcut((Join-Path ([Environment]::GetFolderPath('Desktop')) 'JobPrep.lnk'))
$jobPrepShortcut.TargetPath = $jobPrepStableExe
$jobPrepShortcut.WorkingDirectory = Split-Path -LiteralPath $jobPrepStableExe
$jobPrepShortcut.IconLocation = "$jobPrepStableExe,0"
$jobPrepShortcut.Description = 'JobPrep - current local build'
$jobPrepShortcut.Save()
Write-Output 'Updated all legacy launch locations and the desktop shortcut.'
