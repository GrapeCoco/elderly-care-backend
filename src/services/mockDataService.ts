
/**
 * 模拟数据服务 - 独居银发安全助手
 * 
 * 功能：
 * 1. 每10秒自动生成真实传感器数据
 * 2. 模拟正常活动、跌倒、水电异常、燃气泄漏、SOS触发等场景
 * 3. 数据具有真实性：用水量波动、用电量峰谷、雷达移动轨迹
 */

import { DeviceModel } from '../models/deviceModel';
import { AlarmEngine } from './alarmEngine';
import { DeviceType, DeviceData, RadarData, WaterMeterData, ElectricMeterData, GasSensorData, SOSButtonData } from '../types';

/**
 * 模拟数据服务类
 */
export class MockDataService {
  private intervalId: NodeJS.Timeout | null = null;
  private deviceDataStore: Map<string, DeviceData[]> = new Map();
  
  // 模拟状态
  private simulationState = {
    isFalling: false,
    fallStartTime: 0,
    noWaterUsage: false,
    noWaterStartTime: 0,
    noElectricUsage: false,
    noElectricStartTime: 0,
    gasLeak: false,
    gasLeakStartTime: 0,
    gasConcentration: 0,
    sosPressed: false,
    lastActivityTime: Date.now(),
    activityLevel: 50 // 0-100
  };

  // 设备基础信息
  private devices = [
    { id: 'dev-radar-001', type: DeviceType.RADAR, name: '毫米波雷达', location: '客厅' },
    { id: 'dev-water-001', type: DeviceType.WATER_METER, name: '智能水表', location: '卫生间' },
    { id: 'dev-electric-001', type: DeviceType.ELECTRIC_METER, name: '智能电表', location: '配电箱' },
    { id: 'dev-gas-001', type: DeviceType.GAS_SENSOR, name: '燃气报警器', location: '厨房' },
    { id: 'dev-sos-001', type: DeviceType.SOS_BUTTON, name: 'SOS按钮', location: '卧室' }
  ];

  // 时间模式（影响用电量）
  private getTimePattern(): 'morning' | 'day' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 9) return 'morning';
    if (hour >= 9 && hour < 18) return 'day';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * 启动模拟服务
   */
  start(): void {
    console.log('[MockDataService] 启动模拟数据服务...');
    
    // 初始化设备数据存储
    this.devices.forEach(dev => {
      this.deviceDataStore.set(dev.id, []);
    });

    // 每10秒生成一次数据
    this.intervalId = setInterval(() => {
      this.generateAllDeviceData();
    }, 10000);

    // 立即生成一次初始数据
    this.generateAllDeviceData();

    // 随机触发异常场景
    this.scheduleRandomEvents();
  }

  /**
   * 停止模拟服务
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[MockDataService] 停止模拟数据服务');
    }
  }

  /**
   * 生成所有设备数据
   */
  private generateAllDeviceData(): void {
    const now = Date.now();

    // 生成雷达数据
    const radarData = this.generateRadarData(now);
    this.saveDeviceData('dev-radar-001', DeviceType.RADAR, radarData);

    // 生成水表数据
    const waterData = this.generateWaterMeterData(now);
    this.saveDeviceData('dev-water-001', DeviceType.WATER_METER, waterData);

    // 生成电表数据
    const electricData = this.generateElectricMeterData(now);
    this.saveDeviceData('dev-electric-001', DeviceType.ELECTRIC_METER, electricData);

    // 生成燃气传感器数据
    const gasData = this.generateGasSensorData(now);
    this.saveDeviceData('dev-gas-001', DeviceType.GAS_SENSOR, gasData);

    // 生成SOS按钮数据
    const sosData = this.generateSOSButtonData(now);
    this.saveDeviceData('dev-sos-001', DeviceType.SOS_BUTTON, sosData);

    console.log(`[MockDataService] 已生成 ${now} 的设备数据`);
  }

  /**
   * 生成雷达数据（跌倒检测、人员存在、心率、呼吸率）
   */
  private generateRadarData(timestamp: number): RadarData {
    // 模拟跌倒检测
    let fallDetected = this.simulationState.isFalling;
    
    // 跌倒持续3秒后恢复
    if (this.simulationState.isFalling && Date.now() - this.simulationState.fallStartTime > 3000) {
      this.simulationState.isFalling = false;
      fallDetected = false;
    }

    // 模拟人员存在（随机95%概率存在）
    const presence = Math.random() > 0.05;

    // 模拟心率（60-100）
    const heartRate = Math.floor(60 + Math.random() * 40);
    
    // 模拟呼吸率（12-20）
    const breathingRate = Math.floor(12 + Math.random() * 8);

    // 更新活动时间
    if (presence && Math.random() > 0.3) {
      this.simulationState.lastActivityTime = timestamp;
      this.simulationState.activityLevel = Math.min(100, this.simulationState.activityLevel + 2);
    } else {
      this.simulationState.activityLevel = Math.max(0, this.simulationState.activityLevel - 1);
    }

    return {
      deviceId: 'dev-radar-001',
      timestamp,
      fallDetected,
      presence,
      heartRate,
      breathingRate
    };
  }

  /**
   * 生成水表数据（用水量有波动）
   */
  private generateWaterMeterData(timestamp: number): WaterMeterData {
    // 获取之前的数据
    const history = this.deviceDataStore.get('dev-water-001') || [];
    const lastData = history[history.length - 1] as WaterMeterData;
    const lastUsage = lastData ? lastData.totalUsage : 0;

    // 模拟用水量（根据时间和随机因素）
    let flowRate = 0;
    const timePattern = this.getTimePattern();
    
    // 用水概率：早晨和晚上较高
    const useWaterProbability = timePattern === 'morning' ? 0.3 : 
                                 timePattern === 'evening' ? 0.25 : 
                                 timePattern === 'day' ? 0.1 : 0.02;

    // 如果处于无水使用状态，则不生成用水
    if (!this.simulationState.noWaterUsage && Math.random() < useWaterProbability) {
      // 模拟单次用水量（1-10升）
      flowRate = parseFloat((Math.random() * 9 + 1).toFixed(2));
    }

    const totalUsage = parseFloat((lastUsage + flowRate).toFixed(2));

    return {
      deviceId: 'dev-water-001',
      timestamp,
      flowRate,
      totalUsage
    };
  }

  /**
   * 生成电表数据（用电量有峰谷）
   */
  private generateElectricMeterData(timestamp: number): ElectricMeterData {
    // 获取之前的数据
    const history = this.deviceDataStore.get('dev-electric-001') || [];
    const lastData = history[history.length - 1] as ElectricMeterData;
    const lastUsage = lastData ? lastData.totalUsage : 0;

    // 根据时间模式生成用电量（峰谷差异）
    const timePattern = this.getTimePattern();
    let basePower = 0;

    switch (timePattern) {
      case 'morning':
        basePower = 0.3 + Math.random() * 0.5; // 早晨中等用电
        break;
      case 'day':
        basePower = 0.5 + Math.random() * 0.8; // 白天较高用电
        break;
      case 'evening':
        basePower = 0.8 + Math.random() * 1.2; // 晚上高峰用电
        break;
      case 'night':
        basePower = 0.1 + Math.random() * 0.3; // 夜间最低用电
        break;
    }

    // 如果处于无电使用状态，降低用电量
    if (this.simulationState.noElectricUsage) {
      basePower *= 0.1;
    }

    const power = parseFloat(basePower.toFixed(3));
    const totalUsage = parseFloat((lastUsage + power * (10 / 3600)).toFixed(4)); // 10秒用电量

    // 模拟电压和电流
    const voltage = parseFloat((220 + (Math.random() - 0.5) * 10).toFixed(1));
    const current = parseFloat((power / voltage * 1000).toFixed(2));

    return {
      deviceId: 'dev-electric-001',
      timestamp,
      power,
      totalUsage,
      voltage,
      current
    };
  }

  /**
   * 生成燃气传感器数据（浓度变化曲线）
   */
  private generateGasSensorData(timestamp: number): GasSensorData {
    let concentration = this.simulationState.gasConcentration;
    let leakage = this.simulationState.gasLeak;

    // 如果正在泄漏，浓度持续上升
    if (this.simulationState.gasLeak) {
      concentration += Math.random() * 50 + 20; // 每次增加20-70 ppm
      concentration = Math.min(concentration, 2000); // 最大2000 ppm
    } else {
      // 正常状态下有少量波动（0-50 ppm）
      concentration = parseFloat((Math.random() * 20).toFixed(1));
    }

    // 泄漏超过60秒后自动停止（模拟关闭阀门）
    if (this.simulationState.gasLeak && Date.now() - this.simulationState.gasLeakStartTime > 60000) {
      this.simulationState.gasLeak = false;
      leakage = false;
      concentration = 0;
    }

    this.simulationState.gasConcentration = concentration;

    return {
      deviceId: 'dev-gas-001',
      timestamp,
      concentration: parseFloat(concentration.toFixed(1)),
      leakage
    };
  }

  /**
   * 生成SOS按钮数据
   */
  private generateSOSButtonData(timestamp: number): SOSButtonData {
    const pressed = this.simulationState.sosPressed;
    
    // SOS触发后保持2秒
    if (this.simulationState.sosPressed && Date.now() - this.simulationState.fallStartTime > 2000) {
      this.simulationState.sosPressed = false;
    }

    // 模拟电池电量（80-100%）
    const batteryLevel = Math.floor(80 + Math.random() * 20);

    return {
      deviceId: 'dev-sos-001',
      timestamp,
      pressed,
      batteryLevel
    };
  }

  /**
   * 保存设备数据
   */
  private saveDeviceData(deviceId: string, type: DeviceType, data: DeviceData): void {
    // 保存到内存存储
    const history = this.deviceDataStore.get(deviceId) || [];
    history.push(data);
    
    // 保留最近100条记录
    if (history.length > 100) {
      history.shift();
    }
    this.deviceDataStore.set(deviceId, history);

    // 保存到数据库
    DeviceModel.saveData(deviceId, type, data);

    // 通过报警引擎处理数据
    const alarmEngine = new AlarmEngine();
    alarmEngine.processData(data, type);
  }

  /**
   * 随机调度异常事件
   */
  private scheduleRandomEvents(): void {
    // 随机跌倒事件（每5-15分钟可能发生）
    const scheduleFall = () => {
      const delay = (5 + Math.random() * 10) * 60 * 1000;
      setTimeout(() => {
        if (Math.random() > 0.7) { // 30%概率触发跌倒
          this.triggerFall();
        }
        scheduleFall();
      }, delay);
    };
    scheduleFall();

    // 随机水电异常事件（每20-40分钟可能触发）
    const scheduleUtilityAbnormal = () => {
      const delay = (20 + Math.random() * 20) * 60 * 1000;
      setTimeout(() => {
        if (Math.random() > 0.8) { // 20%概率触发异常
          if (Math.random() > 0.5) {
            this.triggerNoWaterUsage();
          } else {
            this.triggerNoElectricUsage();
          }
        }
        scheduleUtilityAbnormal();
      }, delay);
    };
    scheduleUtilityAbnormal();

    // 随机燃气泄漏事件（每30-60分钟可能发生）
    const scheduleGasLeak = () => {
      const delay = (30 + Math.random() * 30) * 60 * 1000;
      setTimeout(() => {
        if (Math.random() > 0.85) { // 15%概率触发泄漏
          this.triggerGasLeak();
        }
        scheduleGasLeak();
      }, delay);
    };
    scheduleGasLeak();

    // 随机SOS触发（每15-30分钟可能发生）
    const scheduleSOS = () => {
      const delay = (15 + Math.random() * 15) * 60 * 1000;
      setTimeout(() => {
        if (Math.random() > 0.85) { // 15%概率触发SOS
          this.triggerSOS();
        }
        scheduleSOS();
      }, delay);
    };
    scheduleSOS();
  }

  /**
   * 触发跌倒事件
   */
  public triggerFall(): void {
    console.log('[MockDataService] 触发跌倒事件！');
    this.simulationState.isFalling = true;
    this.simulationState.fallStartTime = Date.now();
  }

  /**
   * 触发24小时无用水事件
   */
  public triggerNoWaterUsage(): void {
    console.log('[MockDataService] 触发无用水事件！');
    this.simulationState.noWaterUsage = true;
    this.simulationState.noWaterStartTime = Date.now();
    
    // 6小时后恢复
    setTimeout(() => {
      this.simulationState.noWaterUsage = false;
      console.log('[MockDataService] 恢复正常用水');
    }, 6 * 60 * 60 * 1000);
  }

  /**
   * 触发6小时无用电事件
   */
  public triggerNoElectricUsage(): void {
    console.log('[MockDataService] 触发无用电事件！');
    this.simulationState.noElectricUsage = true;
    this.simulationState.noElectricStartTime = Date.now();
    
    // 6小时后恢复
    setTimeout(() => {
      this.simulationState.noElectricUsage = false;
      console.log('[MockDataService] 恢复正常用电');
    }, 6 * 60 * 60 * 1000);
  }

  /**
   * 触发燃气泄漏事件
   */
  public triggerGasLeak(): void {
    console.log('[MockDataService] 触发燃气泄漏事件！');
    this.simulationState.gasLeak = true;
    this.simulationState.gasLeakStartTime = Date.now();
    this.simulationState.gasConcentration = 0;
  }

  /**
   * 触发SOS事件
   */
  public triggerSOS(): void {
    console.log('[MockDataService] 触发SOS紧急事件！');
    this.simulationState.sosPressed = true;
    this.simulationState.fallStartTime = Date.now();
  }

  /**
   * 获取设备历史数据
   */
  public getDeviceHistory(deviceId: string, limit: number = 24): DeviceData[] {
    const history = this.deviceDataStore.get(deviceId) || [];
    return history.slice(-limit);
  }

  /**
   * 获取当前模拟状态
   */
  public getSimulationState() {
    return { ...this.simulationState };
  }

  /**
   * 获取所有设备信息
   */
  public getDevices() {
    return this.devices;
  }
}

// 导出单例
export const mockDataService = new MockDataService();
