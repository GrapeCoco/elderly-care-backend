
import { Router } from 'express';
import { DeviceController } from '../controllers/deviceController';
import { AlarmController } from '../controllers/alarmController';
import { UserController } from '../controllers/userController';
import { ReportController } from '../controllers/reportController';
import { MockDataController } from '../controllers/mockDataController';

const router = Router();

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    code: 200,
    data: null,
    message: '服务运行正常',
    timestamp: Date.now()
  });
});

// 设备列表
router.get('/devices', MockDataController.getDevices);

// 设备历史数据
router.get('/devices/:id/history', MockDataController.getDeviceHistory);

// 报警历史（支持按级别筛选）
router.get('/alerts', MockDataController.getAlerts);

// 看板数据
router.get('/dashboard', MockDataController.getDashboard);

// 周统计数据
router.get('/stats/weekly', MockDataController.getWeeklyStats);

// 用户路由
router.post('/users', UserController.create);
router.get('/users', UserController.getAll);
router.get('/users/:id', UserController.getById);
router.put('/users/:id', UserController.update);

// 设备路由（保留原有）
router.post('/devices', DeviceController.create);
router.get('/users/:userId/devices', DeviceController.getByUserId);
router.get('/devices/:id', DeviceController.getById);
router.get('/devices/:id/latest', DeviceController.getLatestData);

// 报警路由
router.get('/alarms', AlarmController.getList);
router.get('/alarms/:id', AlarmController.getById);
router.put('/alarms/:id/status', AlarmController.updateStatus);
router.get('/users/:userId/alarms', AlarmController.getByUserId);

// 日报路由
router.post('/reports', ReportController.upsert);
router.get('/users/:userId/reports', ReportController.getByUserId);
router.get('/users/:userId/reports/:date', ReportController.getByDate);
router.get('/users/:userId/reports-range', ReportController.getByDateRange);

export default router;
