@echo off
chcp 65001 >nul
echo [TEST] ASCII line ok
echo [TEST] 中文输出测试：一键启动 / 容器 / 前端页面
cd /d "%~dp0"
echo [TEST] cwd = %CD%
echo [TEST] script dir = %~dp0
