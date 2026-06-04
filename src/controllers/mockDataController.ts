
import { Request, Response } from 'express';
import { mockDataService } from '../services/mockDataService';

// 设备类型映射
const deviceTypeLabels: Record<string, string> = {
  'radar': '毫米波雷达',
  'water_meter': '智能水表',
  'electric_meter': '智能电表',
  'gas_sensor': '燃气报警器',
  'sos_button': 'SOS紧急按钮'
};

// 报警级别映射
const alertLevelLabels: Record<string, string> = {
  'info': '信息',
  'warning': '预警',
  'critical': '紧急',
  'emergency': '特急'
};

// 报警状态映射
const alertStatusLabels: Record<string, string> = {
  'pending': '待处理',
  'confirmed': '已确认',
  'resolved': '已解决',
  'ignored': '已忽略'
};

/**
 * 模拟数据控制器 - 数据可视化接口
 */
export class MockDataController {
  /**
   * 获取设备列表
   * @param req 请求对象
   * @param res 响应对象
   */
  static getDevices(req: Request, res: Response) {
    try {
      const devices = mockDataService.getDevices().map(device => ({
        ...device,
        typeLabel: deviceTypeLabels[device.type] || device.type,
        status: 'online',
        lastSeen: Date.now()
      }));

      res.json({
        code: 200,
        data: {
          items: devices,
          total: devices.length,
          page: 1,
          pageSize: devices.length
        },
        message: 'success',
        timestamp: Date.now()
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        message: '获取设备列表失败',
        timestamp: Date.now()
      });
    }
  }

  /**
   * 获取报警历史
   * @param req 请求对象
   * @param res 响应对象
   */
  static getAlerts(req: Request, res: Response) {
    try {
      const { level } = req.query;
      
      // 模拟报警数据
      const baseAlerts = [
        {
          id: 1,
          deviceId: 'dev-radar-001',
          type: 'radar',
          level: 'critical',
          status: 'resolved',
          message: '检测到老人跌倒，需要紧急救助！',
          personalizedMessage: '系统检测到老人可能跌倒，请家属立即前往查看或联系老人！',
          createdAt: Date.now() - 2 * 60 * 60 * 1000,
          updatedAt: Date.now() - 1 * 60 * 60 * 1000,
          location: '客厅',
          deviceName: '毫米波雷达'
        },
        {
          id: 2,
          deviceId: 'dev-water-001',
          type: 'water_meter',
          level: 'warning',
          status: 'pending',
          message: '连续6小时未检测到用水，请注意老人安全！',
          personalizedMessage: '系统6小时未监测到用水活动，建议确认老人是否安好。',
          createdAt: Date.now() - 6 * 60 * 60 * 1000,
          updatedAt: Date.now() - 6 * 60 * 60 * 1000,
          location: '卫生间',
          deviceName: '智能水表'
        },
        {
          id: 3,
          deviceId: 'dev-gas-001',
          type: 'gas_sensor',
          level: 'critical',
          status: 'resolved',
          message: '检测到燃气泄漏！浓度: 1200 ppm, 趋势: 快速上升',
          personalizedMessage: '检测到燃气浓度异常，已通知家属，请注意通风！',
          createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
          updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000,
          location: '厨房',
          deviceName: '燃气报警器'
        },
        {
          id: 4,
          deviceId: 'dev-sos-001',
          type: 'sos_button',
          level: 'emergency',
          status: 'confirmed',
          message: '老人按下了SOS紧急求助按钮！电池电量: 85%',
          personalizedMessage: '老人紧急求助！请家属立即联系或前往！',
          createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
          updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000,
          location: '卧室',
          deviceName: 'SOS紧急按钮'
        },
        {
          id: 5,
          deviceId: 'dev-electric-001',
          type: 'electric_meter',
          level: 'warning',
          status: 'resolved',
          message: '连续6小时未检测到用电，请注意老人安全！',
          personalizedMessage: '系统检测到长时间未用电，建议联系老人确认安全。',
          createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
          updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
          location: '配电箱',
          deviceName: '智能电表'
        }
      ];

      // 按级别筛选
      let alerts = baseAlerts;
      if (level) {
        alerts = alerts.filter(a => a.level === level);
      }

      // 添加标签
      alerts = alerts.map(alert => ({
        ...alert,
        levelLabel: alertLevelLabels[alert.level] || alert.level,
        statusLabel: alertStatusLabels[alert.status] || alert.status
      }));

      res.json({
        code: 200,
        data: {
          items: alerts,
          total: alerts.length,
          page: 1,
          pageSize: alerts.length
        },
        message: 'success',
        timestamp: Date.now()
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        message: '获取报警历史失败',
        timestamp: Date.now()
      });
    }
  }

  /**
   * 获取看板数据（图表格式）
   * @param req 请求对象
   * @param res 响应对象
   */
  static getDashboard(req: Request, res: Response) {
    try {
      const simulationState = mockDataService.getSimulationState();
      const devices = mockDataService.getDevices();

      // 统计在线设备数
      const onlineDevices = devices.length;

      // 报警统计
      const alerts = [
        { level: 'critical', count: 2 },
        { level: 'warning', count: 2 },
        { level: 'emergency', count: 1 },
        { level: 'info', count: 0 }
      ];
      const totalAlerts = alerts.reduce((sum, a) => sum + a.count, 0);
      const pendingAlerts = 1;
      const todayAlerts = 0;

      // 判断老人状态
      let elderlyStatus = 'normal';
      let elderlyStatusLabel = '正常';
      if (pendingAlerts > 0) {
        elderlyStatus = 'warning';
        elderlyStatusLabel = '需关注';
      }
      if (simulationState.isFalling || simulationState.gasLeak) {
        elderlyStatus = 'emergency';
        elderlyStatusLabel = '紧急';
      }

      // 设备统计
      const deviceStats = {
        total: devices.length,
        online: onlineDevices,
        offline: 0,
        types: {
          radar: devices.filter(d => d.type === 'radar').length,
          water_meter: devices.filter(d => d.type === 'water_meter').length,
          electric_meter: devices.filter(d => d.type === 'electric_meter').length,
          gas_sensor: devices.filter(d => d.type === 'gas_sensor').length,
          sos_button: devices.filter(d => d.type === 'sos_button').length
        }
      };

      // 报警统计
      const alertStats = {
        total: totalAlerts,
        pending: pendingAlerts,
        today: todayAlerts,
        levels: {
          info: alerts.find(a => a.level === 'info')?.count || 0,
          warning: alerts.find(a => a.level === 'warning')?.count || 0,
          critical: alerts.find(a => a.level === 'critical')?.count || 0,
          emergency: alerts.find(a => a.level === 'emergency')?.count || 0
        }
      };

      // 最近报警
      const recentAlerts = [
        {
          id: 1,
          level: 'critical',
          levelLabel: '紧急',
          message: '检测到老人跌倒，需要紧急救助！',
          createdAt: Date.now() - 2 * 60 * 60 * 1000,
          location: '客厅',
          deviceName: '毫米波雷达'
        },
        {
          id: 2,
          level: 'warning',
          levelLabel: '预警',
          message: '连续6小时未检测到用水，请注意老人安全！',
          createdAt: Date.now() - 6 * 60 * 60 * 1000,
          location: '卫生间',
          deviceName: '智能水表'
        },
        {
          id: 3,
          level: 'critical',
          levelLabel: '紧急',
          message: '检测到燃气泄漏！浓度: 1200 ppm',
          createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
          location: '厨房',
          deviceName: '燃气报警器'
        },
        {
          id: 4,
          level: 'emergency',
          levelLabel: '特急',
          message: '老人按下了SOS紧急求助按钮！',
          createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
          location: '卧室',
          deviceName: 'SOS紧急按钮'
        }
      ];

      // 今日数据概览
      const todayOverview = {
        waterUsage: parseFloat((80 + Math.random() * 20).toFixed(2)),
        electricUsage: parseFloat((5.5 + Math.random() * 2).toFixed(2)),
        activityLevel: simulationState.activityLevel,
        heartRate: Math.floor(65 + Math.random() * 25),
        breathingRate: Math.floor(14 + Math.random() * 6)
      };

      res.json({
        code: 200,
        data: {
          elderly: {
            status: elderlyStatus,
            statusLabel: elderlyStatusLabel,
            lastActivityTime: simulationState.lastActivityTime,
            heartRate: todayOverview.heartRate,
            breathingRate: todayOverview.breathingRate
          },
          devices: deviceStats,
          alerts: alertStats,
          recentAlerts,
          todayOverview
        },
        message: 'success',
        timestamp: Date.now()
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        message: '获取看板数据失败',
        timestamp: Date.now()
      });
    }
  }

  /**
   * 获取周统计数据（用水、用电、活动量趋势）
   * @param req 请求对象
   * @param res 响应对象
   */
  static getWeeklyStats(req: Request, res: Response) {
    try {
      const now = new Date();
      const days = [];
      
      // 生成最近7天的数据
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // 模拟数据
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        
        days.push({
          date: date.toISOString().split('T')[0],
          dayOfWeek: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()],
          waterUsage: parseFloat((isWeekend ? 60 + Math.random() * 30 : 80 + Math.random() * 40).toFixed(2)),
          electricUsage: parseFloat((isWeekend ? 6 + Math.random() * 3 : 5 + Math.random() * 2).toFixed(2)),
          activityLevel: Math.floor(isWeekend ? 60 + Math.random() * 30 : 50 + Math.random() * 25),
          alerts: Math.floor(Math.random() * 3)
        });
      }

      // 统计汇总
      const summary = {
        totalWaterUsage: parseFloat(days.reduce((sum, d) => sum + d.waterUsage, 0).toFixed(2)),
        totalElectricUsage: parseFloat(days.reduce((sum, d) => sum + d.electricUsage, 0).toFixed(2)),
        avgActivityLevel: Math.floor(days.reduce((sum, d) => sum + d.activityLevel, 0) / days.length),
        totalAlerts: days.reduce((sum, d) => sum + d.alerts, 0)
      };

      res.json({
        code: 200,
        data: {
          days,
          summary,
          unit: {
            water: '升',
            electric: '度',
            activity: '%'
          }
        },
        message: 'success',
        timestamp: Date.now()
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        message: '获取周统计数据失败',
        timestamp: Date.now()
      });
    }
  }

  /**
   * 获取设备24小时历史数据
   * @param req 请求对象
   * @param res 响应对象
   */
  static getDeviceHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // 获取模拟数据服务中的历史数据
      const history = mockDataService.getDeviceHistory(id, 24);
      
      // 如果没有数据，生成模拟历史数据
      if (history.length === 0) {
        const now = Date.now();
        const newHistory = [];
        
        for (let i = 23; i >= 0; i--) {
          const timestamp = now - i * 60 * 60 * 1000;
          const hour = new Date(timestamp).getHours();
          
          // 根据设备类型生成数据
          if (id.includes('water')) {
            // 水表数据
            const useWater = hour >= 6 && hour < 22 && Math.random() > 0.7;
            newHistory.push({
              deviceId: id,
              timestamp,
              flowRate: useWater ? parseFloat((Math.random() * 8 + 1).toFixed(2)) : 0,
              totalUsage: parseFloat((500 + Math.random() * 100).toFixed(2))
            });
          } else if (id.includes('electric')) {
            // 电表数据
            let power = 0.1;
            if (hour >= 6 && hour < 9) power = 0.3 + Math.random() * 0.4;
            else if (hour >= 9 && hour < 18) power = 0.4 + Math.random() * 0.5;
            else if (hour >= 18 && hour < 22) power = 0.6 + Math.random() * 0.8;
            else power = 0.05 + Math.random() * 0.15;
            
            newHistory.push({
              deviceId: id,
              timestamp,
              power: parseFloat(power.toFixed(3)),
              totalUsage: parseFloat((200 + Math.random() * 50).toFixed(4)),
              voltage: parseFloat((220 + (Math.random() - 0.5) * 8).toFixed(1)),
              current: parseFloat(((power * 1000) / 220).toFixed(2))
            });
          } else if (id.includes('radar')) {
            // 雷达数据
            newHistory.push({
              deviceId: id,
              timestamp,
              fallDetected: false,
              presence: Math.random() > 0.1,
              heartRate: Math.floor(60 + Math.random() * 30),
              breathingRate: Math.floor(12 + Math.random() * 6)
            });
          } else if (id.includes('gas')) {
            // 燃气传感器数据
            newHistory.push({
              deviceId: id,
              timestamp,
              concentration: parseFloat((Math.random() * 30).toFixed(1)),
              leakage: false
            });
          } else if (id.includes('sos')) {
            // SOS按钮数据
            newHistory.push({
              deviceId: id,
              timestamp,
              pressed: false,
              batteryLevel: Math.floor(80 + Math.random() * 20)
            });
          }
        }
        
        res.json({
          code: 200,
          data: {
            items: newHistory,
            total: newHistory.length,
            deviceId: id,
            unit: id.includes('water') ? '升' : id.includes('electric') ? 'kW' : '数值'
          },
          message: 'success',
          timestamp: Date.now()
        });
        return;
      }

      res.json({
        code: 200,
        data: {
          items: history,
          total: history.length,
          deviceId: id,
          unit: id.includes('water') ? '升' : id.includes('electric') ? 'kW' : '数值'
        },
        message: 'success',
        timestamp: Date.now()
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        message: '获取设备历史数据失败',
        timestamp: Date.now()
      });
    }
  }
}
