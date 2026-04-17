@echo off
setlocal

cd /d "%~dp0"

if not defined BACKEND_URL set "BACKEND_URL=http://localhost:8080"
if not defined PORT set "PORT=3010"

if not exist ".\node\node.exe" (
  for /f "delims=" %%F in ('dir /b /a:-d /o:-d ".\node-v*-win-x64.zip" 2^>nul') do (
    set "NODE_ZIP=%%F"
    goto :extract_node
  )
)

:extract_node
if defined NODE_ZIP (
  echo Found portable Node ZIP: %NODE_ZIP%
  echo Extracting portable Node runtime...
  powershell -NoProfile -Command "Expand-Archive -Path '%cd%\%NODE_ZIP%' -DestinationPath '%cd%' -Force" >nul
  for /f "delims=" %%D in ('dir /b /ad ".\node-v*-win-x64" 2^>nul') do (
    if not exist ".\node\node.exe" (
      move ".\%%D" ".\node" >nul
    )
  )
)

if exist ".\node\node.exe" (
  set "NODE_EXE=.\node\node.exe"
) else (
  set "NODE_EXE=node"
)

echo Starting frontend...
echo BACKEND_URL=%BACKEND_URL%
echo PORT=%PORT%
echo.

"%NODE_EXE%" .\node_modules\@react-router\serve\bin.js .\build\server\index.js
set "EXIT_CODE=%ERRORLEVEL%"

if not "%EXIT_CODE%"=="0" (
  echo.
  echo Frontend exited with code %EXIT_CODE%.
  echo If you want zero-install runtime, put portable Node at .\node\node.exe
)

exit /b %EXIT_CODE%
