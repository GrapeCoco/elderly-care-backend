
import { AlarmModel } from '../models/alarmModel';
import { DeviceModel } from '../models/deviceModel';
import {
  DeviceData,
  DeviceType,
  AlarmLevel,
  AlarmStatus,
  RadarData,
  GasSensorData,
  SOSButtonData,
  WaterMeterData,
  ElectricMeterData
} from '../types';
import { WechatService } from './wechatService';
import { CozeService } from './cozeService';

/**
 * 报警规则引擎
 * 
 * 功能：
 * 1. 跌倒检测：3秒二次确认机制（语音确认）
 * 2. 水电异常：连续6小时无数据才预警（避免误报）
 * 3. 燃气泄漏：立即报警，同时记录浓度变化曲线
 * 4. SOS按钮：最高优先级报警
 */
export class AlarmEngine {
  private fallDetectionTimers: Map<string, NodeJS.Timeout> = new Map();
  private utilityCheckTimers: Map<string, NodeJS.Timeout> = new Map();
  private gasConcentrationHistory: Map<string, { timestamp: number; concentration: number }[]> = new Map();
  private wechatService: WechatService;
  private cozeService: CozeService;

  constructor() {
    this.wechatService = new WechatService();
    this.cozeService = new CozeService();
  }

  /**
   * 处理设备数据
   * @param data 设备数据
   * @param type 设备类型
   */
  processData(data: DeviceData, type: DeviceType): void {
    switch (type) {
      case DeviceType.RADAR:
        this.handleRadarData(data as RadarData);
        break;
      case DeviceType.WATER_METER:
        this.handleWaterMeterData(data as WaterMeterData);
        break;
      case DeviceType.ELECTRIC_METER:
        this.handleElectricMeterData(data as ElectricMeterData);
        break;
      case DeviceType.GAS_SENSOR:
        this.handleGasSensorData(data as GasSensorData);
        break;
      case DeviceType.SOS_BUTTON:
        this.handleSOSButtonData(data as SOSButtonData);
        break;
    }
  }

  /**
   * 处理毫米波雷达数据
   * 跌倒检测：3秒二次确认机制
   */
  private handleRadarData(data: RadarData): void {
    if (data.fallDetected) {
      // 3秒内二次确认机制
      if (this.fallDetectionTimers.has(data.deviceId)) {
        // 二次确认，触发报警
        this.triggerAlarm(
          data.deviceId,
          DeviceType.RADAR,
          AlarmLevel.CRITICAL,
          `检测到老人跌倒！心率: ${data.heartRate}bpm, 呼吸率: ${data.breathingRate}次/分`
        );
        this.clearFallTimer(data.deviceId);
      } else {
        // 第一次检测，设置定时器（模拟语音确认等待）
        console.log(`[AlarmEngine] 第一次检测到跌倒，等待二次确认...`);
        const timer = setTimeout(() => {
          this.fallDetectionTimers.delete(data.deviceId);
          console.log(`[AlarmEngine] 跌倒检测超时，已清除`);
        }, 3000);
        this.fallDetectionTimers.set(data.deviceId, timer);
      }
    } else {
      // 如果跌倒检测恢复，清除定时器
      this.clearFallTimer(data.deviceId);
    }
  }

  /**
   * 清除跌倒检测定时器
   */
  private clearFallTimer(deviceId: string): void {
    const timer = this.fallDetectionTimers.get(deviceId);
    if (timer) {
      clearTimeout(timer);
      this.fallDetectionTimers.delete(deviceId);
    }
  }

  /**
   * 处理水表数据
   * 水电异常：连续6小时无数据才预警
   */
  private handleWaterMeterData(data: WaterMeterData): void {
    // 如果有用水量，重置检测
    if (data.flowRate > 0) {
      this.resetUtilityCheck(data.deviceId, 'water');
      return;
    }

    // 检查是否需要设置6小时检测定时器
    const timerKey = `water_${data.deviceId}`;
    if (!this.utilityCheckTimers.has(timerKey)) {
      console.log(`[AlarmEngine] 开始监测用水量，6小时无用水将触发预警`);
      const timer = setTimeout(() => {
        this.triggerAlarm(
          data.deviceId,
          DeviceType.WATER_METER,
          AlarmLevel.WARNING,
          '连续6小时未检测到用水，请注意老人安全！'
        );
        this.utilityCheckTimers.delete(timerKey);
      }, 6 * 60 * 60 * 1000); // 6小时
      this.utilityCheckTimers.set(timerKey, timer);
    }
  }

  /**
   * 处理电表数据
   * 用电异常：连续6小时无数据才预警
   */
  private handleElectricMeterData(data: ElectricMeterData): void {
    // 如果有用电量（超过阈值），重置检测
    if (data.power > 0.1) {
      this.resetUtilityCheck(data.deviceId, 'electric');
      return;
    }

    // 检查是否需要设置6小时检测定时器
    const timerKey = `electric_${data.deviceId}`;
    if (!this.utilityCheckTimers.has(timerKey)) {
      console.log(`[AlarmEngine] 开始监测用电量，6小时无用电将触发预警`);
      const timer = setTimeout(() => {
        this.triggerAlarm(
          data.deviceId,
          DeviceType.ELECTRIC_METER,
          AlarmLevel.WARNING,
          '连续6小时未检测到用电，请注意老人安全！'
        );
        this.utilityCheckTimers.delete(timerKey);
      }, 6 * 60 * 60 * 1000); // 6小时
      this.utilityCheckTimers.set(timerKey, timer);
    }
  }

  /**
   * 重置水电检测定时器
   */
  private resetUtilityCheck(deviceId: string, type: 'water' | 'electric'): void {
    const timerKey = `${type}_${deviceId}`;
    const timer = this.utilityCheckTimers.get(timerKey);
    if (timer) {
      clearTimeout(timer);
      this.utilityCheckTimers.delete(timerKey);
      console.log(`[AlarmEngine] ${type === 'water' ? '用水' : '用电'}检测已重置`);
    }
  }

  /**
   * 处理燃气传感器数据
   * 燃气泄漏：立即报警，记录浓度变化曲线
   */
  private handleGasSensorData(data: GasSensorData): void {
    // 记录浓度变化曲线
    this.recordGasConcentration(data.deviceId, data.timestamp, data.concentration);

    // 燃气泄漏检测（浓度超过1000 ppm或泄漏标志为true）
    if (data.leakage || data.concentration > 1000) {
      const history = this.gasConcentrationHistory.get(data.deviceId) || [];
      const trend = this.analyzeGasTrend(history);
      
      this.triggerAlarm(
        data.deviceId,
        DeviceType.GAS_SENSOR,
        AlarmLevel.CRITICAL,
        `检测到燃气泄漏！浓度: ${data.concentration.toFixed(1)} ppm, 趋势: ${trend}`
      );
    }
  }

  /**
   * 记录燃气浓度数据
   */
  private recordGasConcentration(deviceId: string, timestamp: number, concentration: number): void {
    const history = this.gasConcentrationHistory.get(deviceId) || [];
    history.push({ timestamp, concentration });
    
    // 保留最近100条记录
    if (history.length > 100) {
      history.shift();
    }
    this.gasConcentrationHistory.set(deviceId, history);
  }

  /**
   * 分析燃气浓度趋势
   */
  private analyzeGasTrend(history: { timestamp: number; concentration: number }[]): string {
    if (history.length < 2) return '稳定';
    
    const recent = history.slice(-5);
    const first = recent[0].concentration;
    const last = recent[recent.length - 1].concentration;
    const change = last - first;

    if (change > 50) return '快速上升';
    if (change > 10) return '缓慢上升';
    if (change < -10) return '下降';
    return '稳定';
  }

  /**
   * 处理SOS按钮数据
   * SOS按钮：最高优先级报警
   */
  private handleSOSButtonData(data: SOSButtonData): void {
    if (data.pressed) {
      this.triggerAlarm(
        data.deviceId,
        DeviceType.SOS_BUTTON,
        AlarmLevel.EMERGENCY,
        `老人按下了SOS紧急求助按钮！电池电量: ${data.batteryLevel}%`
      );
    }
  }

  /**
   * 触发报警
   * @param deviceId 设备ID
   * @param type 设备类型
   * @param level 报警级别
   * @param message 报警消息
   */
  private async triggerAlarm(
    deviceId: string,
    type: DeviceType,
    level: AlarmLevel,
    message: string
  ): Promise<void> {
    console.log(`[AlarmEngine] 触发报警 [${level}]: ${message}`);

    // 保存报警记录
    const alarm = AlarmModel.create({
      deviceId,
      type,
      level,
      status: AlarmStatus.PENDING,
      message
    });

    // 调用Coze生成个性化消息
    try {
      const personalizedMessage = await this.cozeService.generateAlarmMessage(alarm);
      AlarmModel.updatePersonalizedMessage(alarm.id, personalizedMessage);
      alarm.personalizedMessage = personalizedMessage;
    } catch (error) {
      console.error('[AlarmEngine] 生成个性化消息失败:', error);
    }

    // 发送微信通知
    try {
      await this.wechatService.sendAlarmNotification(alarm);
    } catch (error) {
      console.error('[AlarmEngine] 发送微信通知失败:', error);
    }
  }

  /**
   * 获取燃气浓度历史数据
   */
  getGasConcentrationHistory(deviceId: string): { timestamp: number; concentration: number }[] {
    return this.gasConcentrationHistory.get(deviceId) || [];
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.fallDetectionTimers.forEach(timer => clearTimeout(timer));
    this.utilityCheckTimers.forEach(timer => clearTimeout(timer));
    this.fallDetectionTimers.clear();
    this.utilityCheckTimers.clear();
  }
}
