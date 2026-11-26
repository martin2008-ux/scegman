# Recompila la web SCEGMAN, sincroniza assets a Android y genera el APK
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
try {
  npm.cmd run build
  $dest = Join-Path $PSScriptRoot "app\src\main\assets\www"
  if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
  New-Item -ItemType Directory -Force -Path $dest | Out-Null
  Copy-Item -Recurse -Force (Join-Path $root "dist\*") $dest
} finally {
  Pop-Location
}

Push-Location $PSScriptRoot
try {
  .\gradlew.bat assembleDebug
  Copy-Item -Force "app\build\outputs\apk\debug\app-debug.apk" "SCEGMAN-v1.0.apk"
  Write-Host "APK listo en: $(Join-Path $PSScriptRoot 'SCEGMAN-v1.0.apk')"
} finally {
  Pop-Location
}
