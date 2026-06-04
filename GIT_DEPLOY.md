
# 独居银发安全助手 - Git 部署指南

## 前置条件

1. **安装 Git**
   - 访问：https://git-scm.com/download/win
   - 下载并安装 Git for Windows
   - 安装后重启终端

2. **验证安装**
   ```powershell
   git --version
   ```

## 快速部署

### 方式一：使用 PowerShell 命令（推荐）

在项目目录 `C:\Users\Grape\Desktop\1` 中打开 PowerShell，执行以下命令：

```powershell
# 1. 初始化 Git 仓库
git init

# 2. 添加所有文件（注意 .gitignore 会自动排除不需要的文件）
git add .

# 3. 提交变更
git commit -m "feat: 独居银发安全助手 - 比赛级项目"

# 4. 添加远程仓库
git remote add origin https://github.com/GrapeCoco/elderly-care-backend.git

# 5. 切换到 main 分支
git branch -M main

# 6. 推送到 GitHub（首次推送）
# 系统会提示输入 GitHub 用户名和 Personal Access Token (PAT)
# 用户名: GrapeCoco
# 密码/令牌: (使用您提供的 PAT，建议在安全的输入框中输入)
git push -u origin main
```

### 方式二：使用 GitHub Desktop（更简单）

1. 下载并安装 GitHub Desktop：https://desktop.github.com/
2. 打开 GitHub Desktop
3. 点击 "File" -> "Add Local Repository"
4. 选择 `C:\Users\Grape\Desktop\1` 目录
5. 点击 "Publish repository" 按钮
6. 选择您的 GitHub 账号，填写仓库信息
7. 点击 "Publish"

### 方式三：使用 Git 凭据安全存储

为了安全存储您的 GitHub Personal Access Token，建议使用：

```powershell
# 配置 Git 凭据存储
git config --global credential.helper wincred

# 然后执行推送命令，首次输入后会自动保存
git push -u origin main
```

## 使用 Personal Access Token (PAT) 的注意事项

⚠️ **重要**：不要将 PAT 硬编码或记录在任何地方！

推荐使用安全的认证方式：

### 方法 1：使用 HTTPS + PAT（推荐）

```powershell
# 使用这种格式可以一次性认证，但不推荐直接在命令行写 token
# 更安全的是在推送时手动输入
git push -u origin main

# 当提示输入密码时，粘贴您的 PAT（ghp_...）
```

### 方法 2：使用 SSH 密钥（更安全）

1. 生成 SSH 密钥：
   ```powershell
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. 在 GitHub 添加公钥：
   - 访问：https://github.com/settings/keys
   - 添加您的 SSH 公钥

3. 修改远程仓库 URL：
   ```powershell
   git remote set-url origin git@github.com:GrapeCoco/elderly-care-backend.git
   ```

## 完整项目文件列表

已包含的文件：
```
elderly-care-backend/
├── src/                    # 源代码
├── mosquitto/              # MQTT Broker 配置
├── .gitignore             # Git 忽略文件
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── .env                   # 环境变量
├── Dockerfile             # Docker 配置
├── docker-compose.yml     # Docker Compose 配置
├── vercel.json            # Vercel 部署配置
├── DEPLOYMENT.md          # 部署指南
└── README.md              # 项目文档
```

## 后续更新

在项目开发过程中，如果需要再次推送：

```powershell
# 1. 查看变更
git status

# 2. 添加变更
git add .

# 3. 提交
git commit -m "描述您的变更"

# 4. 推送
git push
```

## 常见问题

### Q: Git 命令不工作？
A: 请确保先安装 Git，并重启终端。

### Q: 推送时提示认证失败？
A: 请确保使用正确的 Personal Access Token 且具有仓库权限。

### Q: 如何获取 PAT？
A: 访问：https://github.com/settings/tokens/new

### Q: 仓库已经存在？
A: 如果提示仓库已存在，可能需要先强制推送（谨慎使用）：
```powershell
git push -u origin main --force
```

## 项目状态

✅ 项目代码已准备好
✅ .gitignore 文件已创建
✅ 远程仓库配置已准备
✅ 部署文档已完成
