Write-Host "파일 변경 감지기 시작... 저장 즉시 GitHub에 자동 업로드됩니다."

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $PSScriptRoot
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# 무시할 파일/폴더 패턴
$ignorePatterns = @(
    "\.git",
    "node_modules"
)

$onChange = Register-ObjectEvent $watcher "Changed" -Action {
    $path = $Event.SourceEventArgs.FullPath
    $changetype = $Event.SourceEventArgs.ChangeType
    $name = $Event.SourceEventArgs.Name
    
    # 무시 패턴 확인
    foreach ($pattern in $ignorePatterns) {
        if ($path -match $pattern) {
            return
        }
    }
    
    Write-Host "파일이 변경되었습니다: $name"
    Set-Location $PSScriptRoot
    git add .
    git commit -m "자동 커밋: 파일 저장 감지 - $name ($(Get-Date))"
    git push origin main
    Write-Host "GitHub에 업로드 완료: $(Get-Date)"
}

Write-Host "감시 중... 종료하려면 Ctrl+C를 누르세요."
while ($true) { Start-Sleep -Seconds $true } 