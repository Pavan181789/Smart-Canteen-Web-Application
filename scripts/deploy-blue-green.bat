@echo off
REM Blue-Green Deployment Script for Firebase Hosting (Windows)
REM Usage: deploy-blue-green.bat [blue|green|promote]

setlocal enabledelayedexpansion

REM Configuration
set PROJECT_ID=kisan-ai-18179
set PREVIEW_CHANNEL=green-preview
set PRODUCTION_CHANNEL=live

REM Colors for output (Windows 10+)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Logging function
:log
echo %GREEN%[%date% %time%] %~1%NC%
goto :eof

:error
echo %RED%[ERROR] %~1%NC%
exit /b 1

:warning
echo %YELLOW%[WARNING] %~1%NC%
goto :eof

:info
echo %BLUE%[INFO] %~1%NC%
goto :eof

REM Check if Firebase CLI is installed
:check_firebase_cli
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    call :error "Firebase CLI is not installed. Please install it with: npm install -g firebase-tools"
    exit /b 1
)
goto :eof

REM Build the application
:build_app
call :log "Building the application..."
npm run build
if %errorlevel% neq 0 (
    call :error "Build failed"
    exit /b 1
)
call :log "Build completed successfully"
goto :eof

REM Deploy to Blue (Production)
:deploy_blue
call :log "Deploying to Blue (Production) environment..."

REM Set environment variables for deployment
set DEPLOYMENT_ENVIRONMENT=blue
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set DEPLOYMENT_TIMESTAMP=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%T%dt:~8,2%:%dt:~10,2%:%dt:~12,2%Z

REM Deploy to production
firebase hosting:channel:deploy %PRODUCTION_CHANNEL% --project %PROJECT_ID% --only hosting --message "Blue deployment: %DEPLOYMENT_TIMESTAMP%"

if %errorlevel% equ 0 (
    call :log "✅ Blue deployment completed successfully"
    call :info "Production URL: https://%PROJECT_ID%.web.app"
) else (
    call :error "Blue deployment failed"
    exit /b 1
)
goto :eof

REM Deploy to Green (Preview Channel)
:deploy_green
call :log "Deploying to Green (Preview) environment..."

REM Set environment variables for deployment
set DEPLOYMENT_ENVIRONMENT=green
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set DEPLOYMENT_TIMESTAMP=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%T%dt:~8,2%:%dt:~10,2%:%dt:~12,2%Z

REM Deploy to preview channel
firebase hosting:channel:deploy %PREVIEW_CHANNEL% --project %PROJECT_ID% --only hosting --message "Green deployment: %DEPLOYMENT_TIMESTAMP%"

if %errorlevel% equ 0 (
    call :log "✅ Green deployment completed successfully"
    call :info "Preview URL: https://%PROJECT_ID%--%PREVIEW_CHANNEL%.web.app"
    call :info "Or use: firebase hosting:channel:open %PREVIEW_CHANNEL%"
) else (
    call :error "Green deployment failed"
    exit /b 1
)
goto :eof

REM Promote Green to Blue (Production)
:promote_green_to_blue
call :log "Promoting Green environment to Blue (Production)..."
call :warning "This will replace the current production deployment!"

set /p confirm="Are you sure you want to continue? (y/N): "
if /i "%confirm%" neq "y" (
    call :warning "Promotion cancelled"
    goto :eof
)

REM Promote preview channel to production
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set PROMOTE_TIMESTAMP=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%T%dt:~8,2%:%dt:~10,2%:%dt:~12,2%Z

firebase hosting:channel:promote %PREVIEW_CHANNEL% --project %PROJECT_ID% --message "Promote green to production: %PROMOTE_TIMESTAMP%"

if %errorlevel% equ 0 (
    call :log "✅ Promotion completed successfully"
    call :info "Green environment is now live in production"
) else (
    call :error "Promotion failed"
    exit /b 1
)
goto :eof

REM List active channels
:list_channels
call :log "Listing active deployment channels..."
firebase hosting:channels:list --project %PROJECT_ID%
goto :eof

REM Delete preview channel
:delete_green
call :log "Deleting Green (Preview) environment..."
call :warning "This will remove the preview channel and its deployment"

set /p confirm="Are you sure you want to continue? (y/N): "
if /i "%confirm%" neq "y" (
    call :warning "Deletion cancelled"
    goto :eof
)

firebase hosting:channel:delete %PREVIEW_CHANNEL% --project %PROJECT_ID%

if %errorlevel% equ 0 (
    call :log "✅ Preview channel deleted successfully"
) else (
    call :error "Failed to delete preview channel"
    exit /b 1
)
goto :eof

REM Open preview channel in browser
:open_preview
call :log "Opening Green environment in browser..."
firebase hosting:channel:open %PREVIEW_CHANNEL% --project %PROJECT_ID%
goto :eof

REM Show help
:show_help
echo Blue-Green Deployment Script for Firebase Hosting
echo.
echo Usage: %~nx0 [COMMAND]
echo.
echo Commands:
echo   blue      Deploy to Blue (Production) environment
echo   green     Deploy to Green (Preview) environment
echo   promote   Promote Green to Blue (Production)
echo   list      List active deployment channels
echo   delete    Delete Green (Preview) environment
echo   open      Open Green environment in browser
echo   help      Show this help message
echo.
echo Examples:
echo   %~nx0 blue                    # Deploy to production
echo   %~nx0 green                   # Deploy to preview
echo   %~nx0 promote                 # Promote preview to production
goto :eof

REM Main script logic
:main
call :check_firebase_cli

if "%1"=="blue" (
    call :build_app
    call :deploy_blue
) else if "%1"=="green" (
    call :build_app
    call :deploy_green
) else if "%1"=="promote" (
    call :promote_green_to_blue
) else if "%1"=="list" (
    call :list_channels
) else if "%1"=="delete" (
    call :delete_green
) else if "%1"=="open" (
    call :open_preview
) else if "%1"=="help" (
    call :show_help
) else (
    call :show_help
)

goto :eof

REM Run main function with all arguments
call :main %*
