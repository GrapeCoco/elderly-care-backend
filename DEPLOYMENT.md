# Vercel 部署指南

## ✅ 已完成的修改

项目已针对 Vercel 部署进行了优化：

1. **修改了 src/index.ts**
   - 添加了 `export default app;` 导出给 Vercel
   - `app.listen()` 仅在非生产环境执行
   - 支持 Vercel 无服务器环境

2. **更新了 vercel.json**
   - 配置了正确的路由规则
   - 使用 `@vercel/node` 构建

## 部署前提

确保你已经：
1. 注册了 [Vercel](https://vercel.com/) 账号
2. 项目代码已上传到 GitHub

## 快速部署

### 方式一：通过 Vercel Dashboard（推荐）

1. **访问 Vercel**
   - 登录：https://vercel.com/login

2. **导入项目**
   - 点击 "Add New..." -> "Project"
   - 选择你的 GitHub 仓库：`GrapeCoco/elderly-care-backend`
   - 点击 "Import"

3. **配置项目**
   - Framework Preset: Other
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **添加环境变量**
   在 "Environment Variables" 中添加：
   ```
   NODE_ENV=production
   ```

5. **部署**
   - 点击 "Deploy"
   - 等待部署完成

### 方式二：通过 Vercel CLI

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署（在项目根目录执行）
vercel

# 4. 部署到生产环境
vercel --prod
```

## 环境变量配置

在 Vercel 控制台设置以下环境变量：

| 变量名 | 说明 | 是否必需 |
|--------|------|---------|
| NODE_ENV | 环境模式 | 是（设为 production） |
| PORT | 服务端口 | 否（Vercel 自动设置） |
| MQTT_BROKER_URL | MQTT 代理地址 | 否 |
| WECHAT_APPID | 微信公众号 AppID | 否 |
| WECHAT_SECRET | 微信公众号密钥 | 否 |
| COZE_API_KEY | Coze API 密钥 | 否 |
| COZE_BOT_ID | Coze Bot ID | 否 |

## 验证部署

部署成功后，访问以下地址验证：

```
https://your-project.vercel.app/api/health
```

预期响应：
```json
{
  "code": 200,
  "data": null,
  "message": "服务运行正常",
  "timestamp": 1780551112255
}
```

## 可用的 API 接口

部署后可访问以下接口：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/devices` | GET | 设备列表 |
| `/api/alerts` | GET | 报警历史 |
| `/api/dashboard` | GET | 看板数据 |
| `/api/stats/weekly` | GET | 周统计 |
| `/api/devices/:id/history` | GET | 设备历史 |

## 注意事项

### 1. 无服务器环境限制

Vercel 是无服务器环境，有以下限制：
- **MQTT 连接**：不支持持久连接，建议使用 HTTP 轮询或 WebSocket
- **模拟数据服务**：不会自动运行，需要通过 API 手动触发
- **文件存储**：文件系统是临时的，建议使用云数据库

### 2. 冷启动

首次访问可能有冷启动延迟（通常 1-3 秒）。

### 3. 函数执行时间

免费版有 10 秒执行时间限制，Pro 版为 60 秒。

## 本地开发

```bash
# 安装依赖
npm install

# 开发模式（会启动模拟数据服务）
npm run dev

# 构建
npm run build

# 生产模式（不会启动模拟数据服务）
NODE_ENV=production npm start
```

## 故障排除

### 部署失败

1. 检查 Node.js 版本（Vercel 默认使用最新 LTS）
2. 检查 TypeScript 编译错误
3. 查看 Vercel 构建日志

### API 返回 404

1. 检查路由配置（vercel.json）
2. 确认 `export default app;` 存在
3. 检查 API 路径是否正确

### 环境变量未生效

1. 在 Vercel 控制台确认变量已添加
2. 重新部署使变量生效
3. 使用 `vercel env list` 检查

## 项目配置文件

### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ]
}
```

### src/index.ts 关键修改

```typescript
// 仅在非 Vercel 环境下启动服务器
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
  startServer();
}

// 导出 app 供 Vercel 使用
export default app;
```

## 成功部署示例

部署成功后，您的项目将可以通过以下 URL 访问：

```
https://elderly-care-backend.vercel.app
```

API 示例：
- 健康检查：https://elderly-care-backend.vercel.app/api/health
- 看板数据：https://elderly-care-backend.vercel.app/api/dashboard
- 设备列表：https://elderly-care-backend.vercel.app/api/devices

---

**部署完成后，请测试所有 API 接口确保正常工作！**
