@echo off

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js required
    echo Go to https://nodejs.org to install
    exit /b 1
)

for /f "tokens=1 delims=." %%v in ('node -v ^| findstr /R "[0-9]"') do set MAJOR=%%v
set MAJOR=%MAJOR:v=%

if %MAJOR% LSS 20 (
    echo Node.js version 20 or higher is required
    exit /b 1
)

call corepack enable
if errorlevel 1 exit /b %errorlevel%
call yarn
if errorlevel 1 exit /b %errorlevel%
call node scripts/build.js
if errorlevel 1 exit /b %errorlevel%
yarn start