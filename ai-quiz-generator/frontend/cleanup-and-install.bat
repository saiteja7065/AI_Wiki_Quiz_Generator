@echo off
echo ========================================
echo AI Quiz Generator - Frontend Setup
echo ========================================
echo.
echo This script will:
echo 1. Clean up node_modules
echo 2. Install dependencies
echo 3. Start the dev server
echo.
echo IMPORTANT: Close VS Code and all terminals before running this!
echo.
pause

echo.
echo Step 1: Cleaning up old files...
if exist node_modules (
    echo Removing node_modules folder...
    rmdir /s /q node_modules
    if errorlevel 1 (
        echo ERROR: Could not remove node_modules
        echo Please close all programs and try again
        pause
        exit /b 1
    )
    echo Done!
) else (
    echo No node_modules folder found, skipping...
)

if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
)

echo.
echo Step 2: Installing dependencies...
echo This may take a few minutes...
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: Installation failed!
    echo Try running this script again after:
    echo 1. Closing all programs
    echo 2. Restarting your computer
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation successful!
echo ========================================
echo.
echo Starting development server...
echo Press Ctrl+C to stop the server
echo.
call npm run dev
