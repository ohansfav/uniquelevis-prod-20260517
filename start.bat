@echo off
setlocal

set ROOT=%~dp0

echo Starting Unique Levi's locally...
echo Root: %ROOT%

if not exist "%ROOT%server\package.json" (
  echo [ERROR] server\package.json not found.
  pause
  exit /b 1
)

if not exist "%ROOT%client\package.json" (
  echo [ERROR] client\package.json not found.
  pause
  exit /b 1
)

start "Unique Levi's API" cmd /k "cd /d "%ROOT%server" && npm run dev"
start "Unique Levi's Web" cmd /k "cd /d "%ROOT%client" && npm run dev"

echo.
echo API: http://localhost:5000
echo Web: http://localhost:3000
echo.
echo Tip: close the two new terminal windows to stop the app.

endlocal
