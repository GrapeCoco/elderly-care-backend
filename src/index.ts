
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import router from './routes';
import { mqttService } from './services/mqttService';
import { mockDataService } from './services/mockDataService';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  const startTime = Date.now();
  const { method, path } = req;
  
  // 记录请求信息
  console.log(`[${new Date().toISOString()}] ${method} ${path}`);
  
  // 在响应结束时记录日志
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    console.log(`[${new Date().toISOString()}] ${method} ${path} ${statusCode} ${duration}ms`);
  });
  
  next();
});

// 路由
app.use('/api', router);

// 统一错误处理中间件
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Error]', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || '服务器内部错误';
  
  res.status(statusCode).json({
    code: statusCode,
    data: null,
    message,
    timestamp: Date.now()
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    data: null,
    message: '接口不存在',
    timestamp: Date.now()
  });
});

// 全局未捕获异常处理
process.on('uncaughtException', (error) => {
  console.error('[Process] 未捕获的异常:', error);
  console.log('[Process] 服务将继续运行');
});

// 全局未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.warn('[Process] 未处理的 Promise 拒绝:', reason);
  console.log('[Process] 服务将继续运行');
});

/**
 * 启动服务（仅在非 Vercel 环境下执行）
 */
async function startServer() {
  try {
    // 启动 Express 服务
    const server = app.listen(PORT, () => {
      console.log('========================================');
      console.log('  独居银发安全助手 - 服务已启动');
      console.log('========================================');
      console.log(`  端口: ${PORT}`);
      console.log(`  健康检查: http://localhost:${PORT}/api/health`);
      console.log(`  看板数据: http://localhost:${PORT}/api/dashboard`);
      console.log('========================================');
    });

    // 防止服务器退出
    server.on('error', (error) => {
      console.error('[Server] 服务器错误:', error);
    });

    // 启动模拟数据服务
    mockDataService.start();

    // 连接 MQTT（如果失败不影响主服务）
    try {
      console.log('[MQTT] 正在尝试连接 MQTT Broker...');
      mqttService.connect();
    } catch (mqttError) {
      console.warn('[MQTT] MQTT 连接初始化失败:', mqttError);
      console.log('[MQTT] MQTT 功能暂时不可用，但服务将继续运行');
    }

    // 优雅退出
    const gracefulShutdown = (signal: string) => {
      console.log('\n' + signal + ' 信号收到，正在优雅关闭服务...');
      try {
        mockDataService.stop();
        mqttService.disconnect();
      } catch (e) {
        // 忽略断开连接时的错误
      }
      server.close(() => {
        console.log('服务已关闭');
        process.exit(0);
      });
      
      // 5秒后强制退出
      setTimeout(() => {
        console.error('强制关闭服务');
        process.exit(1);
      }, 5000);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    
  } catch (error) {
    console.error('服务启动失败:', error);
    process.exit(1);
  }
}

// 仅在非 Vercel 环境下启动服务器
// Vercel 会自动处理服务器启动，我们只需要导出 app
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
  startServer();
}

// 导出 app 供 Vercel 使用
export default app;
