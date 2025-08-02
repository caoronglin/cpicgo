@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

:: 自动部署脚本 - Cloudflare Workers 图床 (Windows版)
:: 使用方法: deploy.bat [环境]

set "ENVIRONMENT=%~1"
if "%ENVIRONMENT%"=="" set "ENVIRONMENT=production"
set "WORKER_NAME=Cpicgo"
set "BUCKET_NAME=cpicgo-bucket"

:: 颜色定义
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

:: 打印函数
echo %BLUE%[INFO]%NC% 检查依赖...

:: 检查wrangler
wrangler --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%[ERROR]%NC% wrangler 未安装，请先安装: npm install -g wrangler
    pause
    exit /b 1
)

:: 检查配置文件
echo %BLUE%[INFO]%NC% 检查配置文件...
if not exist "wrangler.jsonc" (
    echo %RED%[ERROR]%NC% wrangler.jsonc 文件不存在
    pause
    exit /b 1
)

:: 设置默认值
echo %BLUE%[INFO]%NC% 设置环境变量...
if "%API_TOKEN%"=="" set "API_TOKEN=tk_7x8z9a2b3c4d5e6f"
if "%USERNAME%"=="" set "USERNAME=admin"
if "%PASSWORD%"=="" set "PASSWORD=123456"

:: 检查文件完整性
echo %BLUE%[INFO]%NC% 检查文件完整性...
set "FILES=src\index.js wrangler.jsonc package.json"
for %%f in (%FILES%) do (
    if not exist "%%f" (
        echo %RED%[ERROR]%NC% 缺少文件: %%f
        pause
        exit /b 1
    )
)

:: 安装依赖
echo %BLUE%[INFO]%NC% 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo %YELLOW%[WARNING]%NC% 依赖安装可能失败，继续部署...
)

:: 部署到Cloudflare Workers
echo %BLUE%[INFO]%NC% 部署到 Cloudflare Workers...
call wrangler deploy --env %ENVIRONMENT%
if %errorlevel% neq 0 (
    echo %RED%[ERROR]%NC% 部署失败
    pause
    exit /b 1
)

:: 设置环境变量
echo %BLUE%[INFO]%NC% 设置环境变量...
echo %API_TOKEN% | wrangler secret put API_TOKEN --env %ENVIRONMENT% >nul 2>&1
echo %USERNAME% | wrangler secret put USERNAME --env %ENVIRONMENT% >nul 2>&1
echo %PASSWORD% | wrangler secret put PASSWORD --env %ENVIRONMENT% >nul 2>&1

:: 获取部署URL
echo %BLUE%[INFO]%NC% 获取部署信息...
for /f "tokens=*" %%i in ('wrangler tail --format pretty 2^>nul ^| findstr /r "https://.*\.workers\.dev"') do (
    set "DEPLOYMENT_URL=%%i"
    goto :found_url
)

:found_url
echo.
echo %GREEN%[SUCCESS]%NC% 部署完成！
echo.
echo 部署信息:
echo 环境: %ENVIRONMENT%
echo Worker名称: %WORKER_NAME%
echo API Token: %API_TOKEN%
echo 用户名: %USERNAME%
echo 密码: %PASSWORD%
echo.
echo 访问地址:
echo - 前端界面: %DEPLOYMENT_URL%/new
echo - API文档: %DEPLOYMENT_URL%/API.md
echo.
echo 使用说明:
echo 1. 访问前端界面上传图片
echo 2. 使用API Token: %API_TOKEN%
echo 3. 或使用用户名密码: %USERNAME% / %PASSWORD%
echo.

:: 保存部署信息
echo 部署时间: %date% %time% > deployment-info.txt
echo 环境: %ENVIRONMENT% >> deployment-info.txt
echo Worker名称: %WORKER_NAME% >> deployment-info.txt
echo API Token: %API_TOKEN% >> deployment-info.txt
echo 用户名: %USERNAME% >> deployment-info.txt
echo 部署URL: %DEPLOYMENT_URL% >> deployment-info.txt

echo %GREEN%[SUCCESS]%NC% 部署信息已保存到 deployment-info.txt
echo.
pause