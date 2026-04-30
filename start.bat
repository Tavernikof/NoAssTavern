@echo off

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js required
    echo Go to https://nodejs.org to install
    goto :error
)

for /f "tokens=1 delims=." %%v in ('node -v ^| findstr /R "[0-9]"') do set MAJOR=%%v
set MAJOR=%MAJOR:v=%

if %MAJOR% LSS 22 (
    echo Node.js version 22 or higher is required
    goto :error
)

call corepack enable
if errorlevel 1 goto :error
call yarn
if errorlevel 1 goto :error
call node scripts/build.js
if errorlevel 1 goto :error
call yarn start
if errorlevel 1 goto :error
exit /b 0

:error
echo.
echo An error occurred. Press any key to exit...
pause >nul
exit /b 1
