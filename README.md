
# 🏠 独居银发安全助手

> 守护每一位独居老人的安全与健康

## 🌟 项目背景

随着人口老龄化加剧，独居老人的安全问题日益凸显。据统计，我国60岁以上老年人口已超过2.8亿，其中独居老人超过1亿。跌倒、燃气泄漏、突发疾病等意外时有发生，传统的人工看护方式已难以满足需求。

**独居银发安全助手** 致力于利用物联网和人工智能技术，为独居老人提供24小时全方位的安全监护服务，让子女和家属能够随时了解老人的健康状况。

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                     客户端/前端                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────────────┐     │
│  │ 微信小程序 │  │ Web管理端 │  │ 短信通知  │  │ 微信公众号    │     │
│  └────┬────┘  └────┬────┘  └────┬────┘  └───────┬───────┘     │
└───────┼────────────┼────────────┼───────────────┼─────────────┘
        │            │            │               │
        ▼            ▼            ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     RESTful API                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────┐│
│  │ Devices │  │ Alerts  │  │Users   │  │ Reports │  │Stats  ││
│  │设备管理  │  │报警管理  │  │用户管理  │  │健康日报  │  │数据统计││
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └───────┘│
└───────┬────────────┬────────────┬───────────────┬─────────────┘
        │            │            │               │
        ▼            ▼            ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     核心服务层                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│
│  │   MQTT Service  │  │  Alarm Engine   │  │   Coze AI       ││
│  │   物联网数据接入  │  │   智能报警引擎   │  │   智能文案生成  ││
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘│
│           │                    │                    │          │
└───────────┼────────────────────┼────────────────────┼─────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     数据存储层                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   SQLite     │  │  JSON Files  │  │  Memory      │          │
│  │  开发阶段     │  │  历史数据     │  │  实时缓存     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## ✨ 功能特性

### 1. 多设备支持
- **毫米波雷达**：跌倒检测、心率监测、呼吸率监测
- **智能水表**：用水量统计、异常用水预警
- **智能电表**：用电量统计、峰谷分析、异常用电预警
- **燃气报警器**：浓度监测、泄漏报警、浓度曲线记录
- **SOS按钮**：紧急求助、电池电量监测

### 2. 智能报警规则引擎
| 报警类型 | 触发条件 | 报警级别 |
|---------|---------|---------|
| 跌倒检测 | 3秒内二次确认（模拟语音确认） | 紧急 |
| 用水异常 | 连续6小时无用水记录 | 预警 |
| 用电异常 | 连续6小时无用电记录 | 预警 |
| 燃气泄漏 | 浓度超过1000ppm或泄漏标志触发 | 紧急 |
| SOS求助 | 手动触发 | 特急 |

### 3. 智能通知系统
- **微信模板消息推送**：实时推送报警信息给家属
- **Coze AI个性化文案**：根据报警类型和老人情况生成温馨通知
- **健康日报生成**：AI分析老人活动规律，生成每日健康报告

### 4. 数据可视化
- 实时看板数据展示
- 周统计趋势分析（用水、用电、活动量）
- 设备24小时历史数据曲线
- 报警时间线

## 🛠️ 技术栈

| 分类 | 技术 | 版本 |
|-----|------|------|
| 语言 | TypeScript | ^5.4.5 |
| 框架 | Express | ^4.19.2 |
| 数据库 | SQLite | ^5.1.7 |
| MQTT | MQTT.js | ^5.5.0 |
| HTTP | Axios | ^1.6.8 |
| 环境 | Dotenv | ^16.4.5 |
| 构建 | ts-node-dev | ^2.0.0 |

## 🚀 快速开始

### 前置要求

- Node.js >= 20.0.0
- npm >= 10.0.0

### 安装步骤

```bash
# 克隆项目
git clone https://github.com/your-repo/elderly-care-backend.git
cd elderly-care-backend

# 安装依赖
npm install

# 启动开发服务
npm run dev

# 构建生产版本
npm run build

# 启动生产服务
npm start
```

### 使用 Docker

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 环境变量配置

复制 `.env.example` 为 `.env` 并配置：

```env
# 服务配置
PORT=3000

# MQTT配置
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_CLIENT_ID=elderly-care-server

# 微信配置
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
WECHAT_TEMPLATE_ID=your_template_id

# Coze AI配置
COZE_API_KEY=your_coze_api_key
COZE_BOT_ID=your_bot_id
```

## 🔌 API 文档

### 基础信息

- **服务地址**: `http://localhost:3000`
- **响应格式**: `{ code, data, message, timestamp }`

### 接口列表

| 接口 | 方法 | 路径 | 说明 |
|-----|------|-----|------|
| 健康检查 | GET | `/api/health` | 检查服务状态 |
| 设备列表 | GET | `/api/devices` | 获取所有设备 |
| 设备历史 | GET | `/api/devices/:id/history` | 获取设备24小时历史 |
| 报警历史 | GET | `/api/alerts` | 获取报警记录（支持level筛选） |
| 看板数据 | GET | `/api/dashboard` | 获取首页看板数据 |
| 周统计 | GET | `/api/stats/weekly` | 获取周统计数据 |
| 用户列表 | GET | `/api/users` | 获取用户列表 |
| 创建用户 | POST | `/api/users` | 创建新用户 |
| 用户详情 | GET | `/api/users/:id` | 获取用户详情 |
| 更新用户 | PUT | `/api/users/:id` | 更新用户信息 |
| 报警列表 | GET | `/api/alarms` | 获取报警列表 |
| 报警详情 | GET | `/api/alarms/:id` | 获取报警详情 |
| 更新报警状态 | PUT | `/api/alarms/:id/status` | 更新报警状态 |

### 接口示例

**GET /api/dashboard**

```json
{
  "code": 200,
  "data": {
    "elderly": {
      "status": "normal",
      "statusLabel": "正常",
      "lastActivityTime": 1780501234567,
      "heartRate": 72,
      "breathingRate": 16
    },
    "devices": {
      "total": 5,
      "online": 5,
      "offline": 0,
      "types": { "radar": 1, "water_meter": 1, "electric_meter": 1, "gas_sensor": 1, "sos_button": 1 }
    },
    "alerts": {
      "total": 5,
      "pending": 1,
      "today": 0,
      "levels": { "info": 0, "warning": 2, "critical": 2, "emergency": 1 }
    },
    "recentAlerts": [...],
    "todayOverview": {
      "waterUsage": 85.5,
      "electricUsage": 6.2,
      "activityLevel": 65,
      "heartRate": 72,
      "breathingRate": 16
    }
  },
  "message": "success",
  "timestamp": 1780501234567
}
```

**GET /api/stats/weekly**

```json
{
  "code": 200,
  "data": {
    "days": [
      { "date": "2026-06-03", "dayOfWeek": "周二", "waterUsage": 85.5, "electricUsage": 6.2, "activityLevel": 65, "alerts": 0 },
      ...
    ],
    "summary": {
      "totalWaterUsage": 520.5,
      "totalElectricUsage": 38.5,
      "avgActivityLevel": 62,
      "totalAlerts": 5
    },
    "unit": { "water": "升", "electric": "度", "activity": "%" }
  },
  "message": "success",
  "timestamp": 1780501234567
}
```

## 📁 项目结构

```
elderly-care-backend/
├── src/                          # 源代码目录
│   ├── controllers/              # 控制器层
│   │   ├── mockDataController.ts # 模拟数据控制器
│   │   ├── deviceController.ts   # 设备控制器
│   │   ├── alarmController.ts    # 报警控制器
│   │   ├── userController.ts     # 用户控制器
│   │   └── reportController.ts   # 日报控制器
│   ├── services/                 # 服务层
│   │   ├── mockDataService.ts    # 模拟数据服务
│   │   ├── mqttService.ts        # MQTT服务
│   │   ├── alarmEngine.ts        # 报警规则引擎
│   │   ├── wechatService.ts      # 微信服务
│   │   └── cozeService.ts        # Coze AI服务
│   ├── models/                   # 数据模型
│   │   ├── database.ts           # 数据库操作
│   │   ├── deviceModel.ts        # 设备模型
│   │   ├── alarmModel.ts         # 报警模型
│   │   ├── userModel.ts          # 用户模型
│   │   └── reportModel.ts        # 日报模型
│   ├── routes/                   # 路由配置
│   │   └── index.ts              # 路由入口
│   ├── types/                    # TypeScript类型
│   │   └── index.ts              # 类型定义
│   └── index.ts                  # 应用入口
├── mosquitto/                    # MQTT Broker配置
│   └── config/
│       └── mosquitto.conf
├── Dockerfile                    # Docker构建文件
├── docker-compose.yml            # Docker Compose配置
├── vercel.json                   # Vercel部署配置
├── package.json                  # 依赖配置
├── tsconfig.json                 # TypeScript配置
├── .env                          # 环境变量
└── README.md                     # 项目文档
```

## 🧪 测试

```bash
# 启动开发服务器
npm run dev

# 测试健康检查
curl http://localhost:3000/api/health

# 测试看板数据
curl http://localhost:3000/api/dashboard

# 测试设备列表
curl http://localhost:3000/api/devices

# 测试报警历史（按级别筛选）
curl "http://localhost:3000/api/alerts?level=critical"

# 测试设备历史
curl http://localhost:3000/api/devices/dev-radar-001/history

# 测试周统计
curl http://localhost:3000/api/stats/weekly
```

## 🚀 部署

### Vercel 部署

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 初始化
vercel init

# 部署
vercel --prod
```

### Docker 部署

```bash
# 构建镜像
docker build -t elderly-care-backend .

# 运行容器
docker run -p 3000:3000 elderly-care-backend
```

## 📊 演示数据

系统启动后会自动生成模拟数据，包括：

1. **5个设备**：毫米波雷达、智能水表、智能电表、燃气报警器、SOS按钮
2. **每10秒更新**：真实传感器数据模拟
3. **随机异常事件**：跌倒、水电异常、燃气泄漏、SOS触发

## 📝 未来规划

- [ ] 接入真实 IoT 设备
- [ ] 集成视频监控（AI行为识别）
- [ ] 健康数据分析与预测
- [ ] 语音通话功能
- [ ] 移动端App开发
- [ ] PostgreSQL 数据库迁移
- [ ] 用户权限管理

## 📄 License

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**守护老人安全，传递温暖关怀 ❤️**

*Made with love for our seniors*
