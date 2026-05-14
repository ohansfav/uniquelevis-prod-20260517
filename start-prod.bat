@echo off
setlocal

set ROOT=%~dp0

echo.
echo  ==============================================
echo   Unique Levi's  --  PRODUCTION MODE
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
  call npm install --omit=dev
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

:: ── Build backend ───────────────────────────────
echo.
echo [1/2] Building backend...
cd /d "%ROOT%server"
call npm run build
if errorlevel 1 (
  echo [ERROR] Backend build failed. Fix TypeScript errors and try again.
  pause
  exit /b 1
)
echo [OK]  Backend built.

:: ── Build frontend ──────────────────────────────
echo.
echo [2/2] Building frontend (clearing stale cache first)...
cd /d "%ROOT%client"
if exist ".next" (
  rmdir /s /q ".next" 2>nul
  echo [INFO] Removed old .next folder to free disk space.
)
call npm run build
if errorlevel 1 (
  echo [ERROR] Frontend build failed. Fix TypeScript/Next.js errors and try again.
  pause
  exit /b 1
)
echo [OK]  Frontend built.

:: ── Free ports 5000 and 3000 if already occupied ─
echo.
echo [INFO] Clearing ports 5000 and 3000 if in use...
for /f "tokens=5" %%p in ('netstat -aon 2^>nul ^| findstr ":5000 "') do (
  taskkill /f /pid %%p >nul 2>&1
)
for /f "tokens=5" %%p in ('netstat -aon 2^>nul ^| findstr ":3000 "') do (
  taskkill /f /pid %%p >nul 2>&1
)

:: ── Launch production servers ───────────────────
echo [INFO] Starting API server (port 5000)...
start "Unique Levi's API [prod]" cmd /k "cd /d "%ROOT%server" && set NODE_ENV=production && npm run start"

echo [INFO] Starting web server (port 3000)...
start "Unique Levi's Web [prod]" cmd /k "cd /d "%ROOT%client" && set NODE_ENV=production && npm run start"

echo.
echo  Ready:
echo    API  ^>  http://localhost:5000
echo    Web  ^>  http://localhost:3000
echo.
echo  ngrok:  ngrok http 3000
echo  Tip: close the two spawned windows to stop both servers.
echo.

endlocal
