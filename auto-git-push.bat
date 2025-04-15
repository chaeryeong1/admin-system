@echo off
echo GitHub 자동 푸시 스크립트 시작...
cd %~dp0

:loop
echo 변경사항 확인 중... %date% %time%
git add .
git commit -m "자동 커밋: %date% %time%"
git push origin main
timeout /t 300
goto loop 