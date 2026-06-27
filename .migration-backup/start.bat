@echo off
setlocal

set ROOT=%~dp0

echo.
echo  ==============================================
echo   Unique Levi's  --  DEV MODE
echo  ==============================================
echo.

:: ── Sanity checks ──────────────────────────────
if not exist "%ROOT%server\package.json" (
  echo [ERROR] server\package.json not found. Are you in the right folder?
  pause
  exit /b 1
)
if not exist "%ROOT%client\package.json" (
  echo [ERROR] client\package.json not found. Are you in the right folder?
  pause
  exit /b 1
)

:: ── Install dependencies if node_modules missing ─
if not exist "%ROOT%server\node_modules" (
  echo [INFO] server node_modules not found. Installing...
  cd /d "%ROOT%server"
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed for server.
    pause
    exit /b 1
  )
)

if not exist "%ROOT%client\node_modules" (
  echo [INFO] client node_modules not found. Installing...
  cd /d "%ROOT%client"
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed for client.
    pause
    exit /b 1
  )
)

:: ── Free ports 5000 and 3000 if already occupied ─
echo [INFO] Clearing ports 5000 and 3000 if in use...
for /f "tokens=5" %%p in ('netstat -aon 2^>nul ^| findstr ":5000 "') do (
  taskkill /f /pid %%p >nul 2>&1
)
for /f "tokens=5" %%p in ('netstat -aon 2^>nul ^| findstr ":3000 "') do (
  taskkill /f /pid %%p >nul 2>&1
)

:: ── Launch servers ──────────────────────────────
echo.
echo [INFO] Starting backend (port 5000)...
start "Unique Levi's API [dev]" cmd /k "cd /d "%ROOT%server" && npm run dev"

echo [INFO] Starting frontend (port 3000)...
start "Unique Levi's Web [dev]" cmd /k "cd /d "%ROOT%client" && npm run dev"

echo.
echo  Ready:
echo    API  ^>  http://localhost:5000
echo    Web  ^>  http://localhost:3000
echo.
echo  Tip: close the two spawned windows to stop both servers.
echo.

endlocal
