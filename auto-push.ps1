# 자동 GitHub 푸시 스크립트
$lastCommitTime = Get-Date
$interval = 300  # 5분마다 확인

function Check-AndPush {
    $changes = git status --porcelain
    if ($changes) {
        Write-Host "변경사항이 감지되었습니다. 커밋 및 푸시를 진행합니다..."
        git add .
        git commit -m "자동 커밋: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        git push origin main
        $script:lastCommitTime = Get-Date
        Write-Host "푸시 완료: $(Get-Date)"
    }
}

Write-Host "자동 GitHub 푸시 스크립트가 실행 중입니다. Ctrl+C로 종료할 수 있습니다."
while ($true) {
    Check-AndPush
    Start-Sleep -Seconds $interval
} 