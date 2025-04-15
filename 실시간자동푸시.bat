@echo off
echo 실시간 GitHub 자동 푸시를 시작합니다. 파일을 저장하면 즉시 GitHub에 올라갑니다.
powershell -ExecutionPolicy Bypass -File "%~dp0auto-push-realtime.ps1"
pause 