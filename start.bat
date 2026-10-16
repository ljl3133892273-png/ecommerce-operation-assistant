@echo off
setlocal EnableDelayedExpansion
title 电商运营助手 - 一键启动

rem ============================================================
rem  ecommerce-operation-assistant  Docker 全栈一键启动
rem
rem  [1] 自动启动全部 Docker 容器:
rem        数据层  mysql / redis / agent-checkpoints
rem        后端    api(6005) / worker
rem        前端    web
rem  [2] 等待前后端真正就绪 (HTTP 探活, 不是只看端口)
rem  [3] 自动打开前端页面
rem
rem  用法:  双击直接运行
rem         start.bat --build   强制重建镜像后启动
rem         start.bat --check   只做环境自检，不启动容器
rem  编码:  GBK(cp936) + CRLF，请勿另存为 UTF-8
rem ============================================================

cd /d "%~dp0"
set "ROOT=%CD%"

rem ---------------- 读取 .env 端口（读不到则用默认值） ----------------
set "API_PORT=6005"
set "WEB_PORT=6006"
if exist ".env" (
  for /f "tokens=2 delims==" %%a in ('findstr /B "API_PORT=" .env') do set "API_PORT=%%a"
  for /f "tokens=2 delims==" %%a in ('findstr /B "WEB_PORT=" .env') do set "WEB_PORT=%%a"
)
set "FRONTEND_URL=http://localhost:%WEB_PORT%"
set "API_DOCS=http://localhost:%API_PORT%/docs"
set "HEALTH_URL=http://127.0.0.1:%API_PORT%/health"

echo ============================================================
echo   电商运营助手 · 一键启动
echo ------------------------------------------------------------
echo   项目目录 : %ROOT%
echo   前端页面 : %FRONTEND_URL%
echo   接口文档 : %API_DOCS%
echo ============================================================
echo.

rem ================= [1/5] Docker 环境检查 =================
where docker >nul 2>&1
if errorlevel 1 goto err_no_docker

set "DC="
docker compose version >nul 2>&1
if not errorlevel 1 set "DC=docker compose"
if not defined DC (
  docker-compose version >nul 2>&1
  if not errorlevel 1 set "DC=docker-compose"
)
if not defined DC goto err_no_compose

docker info >nul 2>&1
if not errorlevel 1 goto engine_ok
echo [提示] Docker 引擎未运行，正在尝试启动 Docker Desktop ...
if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
if exist "%ProgramFiles(x86)%\Docker\Docker\Docker Desktop.exe" start "" "%ProgramFiles(x86)%\Docker\Docker\Docker Desktop.exe"
call :wait_engine 180
if errorlevel 1 goto err_no_engine
echo [完成] Docker 引擎已就绪
:engine_ok

rem ================= [2/5] .env 检查 =================
if not exist ".env" goto err_no_env
findstr /B /C:"MYSQL_ROOT_PASSWORD=" ".env" >nul || goto err_env_bad
findstr /B /C:"REDIS_PASSWORD=" ".env" >nul || goto err_env_bad
findstr /B /C:"AGENT_POSTGRES_PASSWORD=" ".env" >nul || goto err_env_bad

rem ================= 决定是否需要构建镜像 =================
set "DO_BUILD=0"
if /i "%~1"=="--build" set "DO_BUILD=1"
if /i "%~1"=="-b" set "DO_BUILD=1"
for %%i in (api worker web) do (
  docker image inspect ecommerce-operation-assistant-%%i:latest >nul 2>&1
  if errorlevel 1 set "DO_BUILD=1"
)

if /i "%~1"=="--check" goto check_only

rem ================= [3/5] 构建 + 启动全部容器 =================
echo.
if "%DO_BUILD%"=="1" (
  echo [3/5] 构建镜像（首次启动或 --build 时执行，可能需要数分钟）...
  %DC% build
  if errorlevel 1 goto err_build
) else (
  echo [3/5] 镜像已存在，跳过构建（需要重建请运行: start.bat --build）
)
echo.
echo        启动全部容器:
echo          数据层  mysql / redis / agent-checkpoints
echo          后  端  api / worker
echo          前  端  web
%DC% up -d --wait --wait-timeout 420
if errorlevel 1 goto err_up

rem ================= [4/5] 等待前后端真正就绪 =================
echo.
echo [4/5] 等待前后端就绪（HTTP 探活）...
call :wait_http "http://127.0.0.1:%API_PORT%/health" %API_PORT% 240 "后端 API"
call :wait_http "http://127.0.0.1:%WEB_PORT%/" %WEB_PORT% 180 "前端 Web"

rem ================= [5/5] 容器状态 + 打开前端页面 =================
echo.
echo [5/5] 容器状态:
%DC% ps
echo.
echo        打开前端页面: %FRONTEND_URL%
start "" "%FRONTEND_URL%"

echo.
echo ============================================================
echo   启动完成
echo ------------------------------------------------------------
echo   前端页面 : %FRONTEND_URL%
echo   接口文档 : %API_DOCS%
echo   健康检查 : %HEALTH_URL%
echo   登录账号 : owner@example.com
echo.
echo   停止服务 : %DC% down
echo   查看日志 : %DC% logs -f web
echo   重建镜像 : start.bat --build
echo ============================================================
echo.
pause
exit /b 0

rem ================= 自检模式 =================
:check_only
echo [自检] 端口解析结果
echo   API_PORT = %API_PORT%
echo   WEB_PORT = %WEB_PORT%
echo [自检] 镜像状态
for %%i in (api worker web) do (
  docker image inspect ecommerce-operation-assistant-%%i:latest >nul 2>&1
  if errorlevel 1 (echo   缺失: ecommerce-operation-assistant-%%i:latest) else (echo   就绪: ecommerce-operation-assistant-%%i:latest)
)
echo [自检] 环境检查通过，未启动任何容器。
pause
exit /b 0

rem ================= 错误分支 =================
:err_no_docker
echo [错误] 未找到 docker 命令，请先安装并启动 Docker Desktop。
goto :fail

:err_no_compose
echo [错误] 未找到 docker compose，请升级 Docker Desktop 后重试。
goto :fail

:err_no_engine
echo [错误] Docker 引擎启动超时，请手动打开 Docker Desktop 后重试。
goto :fail

:err_no_env
echo [错误] 未找到 .env 文件。请先复制 .env.example 为 .env 并填写密码。
goto :fail

:err_env_bad
echo [错误] .env 缺少必要变量: MYSQL_ROOT_PASSWORD / REDIS_PASSWORD / AGENT_POSTGRES_PASSWORD
goto :fail

:err_build
echo [错误] 镜像构建失败，请查看上方输出。
goto :fail

:err_up
echo [错误] 容器启动失败，请运行 docker compose logs 查看详情。
goto :fail

:fail
echo.
echo 启动中断，请按上方提示处理后重试。
pause
exit /b 1

rem ================= 子程序 =================

:wait_engine
rem %1 = 超时秒数（每 2 秒探测一次）
for /L %%i in (2,2,%1) do (
  docker info >nul 2>&1
  if not errorlevel 1 exit /b 0
  ping -n 3 127.0.0.1 >nul
)
exit /b 1

:http_ok
rem %1 = URL；能拿到任意 HTTP 响应则 HTTPOK=1
set "HTTPOK=0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "try{$r=[System.Net.HttpWebRequest]::Create('%~1');$r.Proxy=$null;$r.AllowAutoRedirect=$false;$r.Timeout=5000;$r.Method='GET';$p=$r.GetResponse();$p.Close();exit 0}catch{exit 1}"
if not errorlevel 1 set "HTTPOK=1"
exit /b 0

:wait_http
rem %1 = URL  %2 = 端口  %3 = 超时秒数  %4 = 显示名称
call :http_ok %1
if "!HTTPOK!"=="1" goto :wh_ready
echo    [等待] %~4 启动中 (端口 %~2)，最长 %~3 秒 ...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$u='%~1';$e=(Get-Date).AddSeconds(%~3);while((Get-Date) -lt $e){try{$r=[System.Net.HttpWebRequest]::Create($u);$r.Proxy=$null;$r.AllowAutoRedirect=$false;$r.Timeout=5000;$r.Method='GET';$p=$r.GetResponse();$p.Close();exit 0}catch{};Start-Sleep -Seconds 2};exit 1"
if errorlevel 1 goto :wh_fail
:wh_ready
echo    [就绪] %~4 : %~1
exit /b 0
:wh_fail
echo    [警告] %~4 (端口 %~2) 在 %~3 秒内未响应，请查看 docker compose logs
exit /b 1
