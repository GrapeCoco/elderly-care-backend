
# 独居银发安全助手 - Git 部署脚本
# 使用前请确保已安装 Git
# 保存为: deploy-to-github.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  独居银发安全助手 - Git 部署脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 检查 Git 是否安装
Write-Host "[1/6] 检查 Git 是否安装..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git 已安装: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git 未安装！" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先安装 Git:" -ForegroundColor Yellow
    Write-Host "下载地址: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host "安装后请重新运行此脚本" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}
Write-Host ""

# 2. 初始化 Git 仓库
Write-Host "[2/6] 初始化 Git 仓库..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✅ Git 仓库初始化完成" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Git 仓库已存在" -ForegroundColor Gray
}
Write-Host ""

# 3. 添加所有文件
Write-Host "[3/6] 添加文件到暂存区..." -ForegroundColor Yellow
git add .
Write-Host "✅ 文件添加完成" -ForegroundColor Green
Write-Host ""

# 4. 提交变更
Write-Host "[4/6] 提交代码..." -ForegroundColor Yellow
git commit -m "feat: 独居银发安全助手 - 比赛级项目"
Write-Host "✅ 提交完成" -ForegroundColor Green
Write-Host ""

# 5. 配置远程仓库
Write-Host "[5/6] 配置远程仓库..." -ForegroundColor Yellow
$remoteCheck = git remote
if ($remoteCheck -contains "origin") {
    Write-Host "ℹ️  远程仓库 origin 已存在，更新 URL" -ForegroundColor Gray
    git remote set-url origin "https://github.com/GrapeCoco/elderly-care-backend.git"
} else {
    git remote add origin "https://github.com/GrapeCoco/elderly-care-backend.git"
    Write-Host "✅ 远程仓库配置完成" -ForegroundColor Green
}
Write-Host ""

# 6. 切换分支和推送
Write-Host "[6/6] 推送代码到 GitHub..." -ForegroundColor Yellow
git branch -M main
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  准备推送到 GitHub!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  重要说明:" -ForegroundColor Yellow
Write-Host " 1. 系统会提示输入用户名和密码/令牌" -ForegroundColor White
Write-Host " 2. 用户名: GrapeCoco" -ForegroundColor White
Write-Host " 3. 密码/令牌: 使用您的 Personal Access Token (PAT)" -ForegroundColor White
Write-Host " 4. 如果没有 PAT，请访问: https://github.com/settings/tokens/new" -ForegroundColor White
Write-Host ""
Write-Host "按回车键开始推送 (Ctrl+C 取消)" -ForegroundColor Yellow
$null = Read-Host

# 执行推送
Write-Host "正在推送..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ 部署成功!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "访问您的仓库:" -ForegroundColor White
    Write-Host "https://github.com/GrapeCoco/elderly-care-backend" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ❌ 推送失败" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的原因:" -ForegroundColor Yellow
    Write-Host " 1. 认证失败 - 请检查用户名和 PAT" -ForegroundColor White
    Write-Host " 2. 仓库不存在 - 请先在 GitHub 创建仓库" -ForegroundColor White
    Write-Host " 3. 网络连接问题" -ForegroundColor White
    Write-Host ""
}

Read-Host "按回车键退出"
