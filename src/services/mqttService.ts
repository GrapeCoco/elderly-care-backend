
import mqtt from 'mqtt';
import { DeviceModel } from '../models/deviceModel';
import {
  DeviceData,
  DeviceType,
  RadarData,
  WaterMeterData,
  ElectricMeterData,
  GasSensorData,
  SOSButtonData
} from '../types';
import { AlarmEngine } from './alarmEngine';

/**
 * MQTT 服务类
 */
class MqttService {
  private client: mqtt.MqttClient | null = null;
  private brokerUrl: string;
  private clientId: string;
  private alarmEngine: AlarmEngine;

  constructor() {
    this.brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
    this.clientId = process.env.MQTT_CLIENT_ID || 'elderly-care-server';
    this.alarmEngine = new AlarmEngine();
  }

  /**
   * 连接 MQTT 代理
   */
  connect(): void {
    try {
      this.client = mqtt.connect(this.brokerUrl, {
        clientId: this.clientId + '_' + Date.now(),
        clean: true,
        reconnectPeriod: 0  // 禁用自动重连，避免持续重试
      });

      this.client.on('connect', () => {
        console.log('[MQTT] 已连接到代理');
        this.subscribeToTopics();
      });

      this.client.on('message', (topic, message) => {
        this.handleMessage(topic, message);
      });

      this.client.on('error', (error) => {
        const errorCode = (error as any).code || '未知错误';
        console.warn('[MQTT] 连接错误（这通常是正常的，如果 MQTT broker 未运行）:', errorCode);
      });

      this.client.on('close', () => {
        console.log('[MQTT] 连接已关闭');
      });

      this.client.on('offline', () => {
        console.log('[MQTT] MQTT 客户端已离线');
      });
    } catch (error) {
      console.error('[MQTT] 初始化 MQTT 客户端失败:', error);
      console.log('[MQTT] MQTT 功能暂时不可用，服务将继续运行');
    }
  }

  /**
   * 订阅主题
   */
  private subscribeToTopics(): void {
    if (!this.client) return;
    
    const topics = [
      'device/radar/+/data',
      'device/water_meter/+/data',
      'device/electric_meter/+/data',
      'device/gas_sensor/+/data',
      'device/sos_button/+/data'
    ];

    this.client.subscribe(topics, (err) => {
      if (err) {
        console.error('[MQTT] 订阅失败:', err);
      } else {
        console.log('[MQTT] 已订阅主题:', topics);
      }
    });
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(topic: string, message: Buffer): void {
    try {
      const payload = JSON.parse(message.toString());
      const deviceData = this.parseDeviceData(topic, payload);

      if (deviceData) {
        const deviceType = this.getDeviceTypeFromTopic(topic);
        DeviceModel.saveData(deviceData.deviceId, deviceType, deviceData);
        this.alarmEngine.processData(deviceData, deviceType);
      }
    } catch (error) {
      console.error('[MQTT] 处理消息失败:', error);
    }
  }

  /**
   * 从主题解析设备类型
   */
  private getDeviceTypeFromTopic(topic: string): DeviceType {
    const parts = topic.split('/');
    const typeStr = parts[1];
    switch (typeStr) {
      case 'radar': return DeviceType.RADAR;
      case 'water_meter': return DeviceType.WATER_METER;
      case 'electric_meter': return DeviceType.ELECTRIC_METER;
      case 'gas_sensor': return DeviceType.GAS_SENSOR;
      case 'sos_button': return DeviceType.SOS_BUTTON;
      default: throw new Error('未知设备类型: ' + typeStr);
    }
  }

  /**
   * 解析设备数据
   */
  private parseDeviceData(topic: string, payload: any): DeviceData | null {
    const parts = topic.split('/');
    const deviceId = parts[2];
    const deviceType = parts[1];

    const baseData = {
      deviceId,
      timestamp: payload.timestamp || Date.now()
    };

    switch (deviceType) {
      case 'radar':
        return {
          ...baseData,
          fallDetected: payload.fall_detected || false,
          presence: payload.presence || false,
          heartRate: payload.heart_rate,
          breathingRate: payload.breathing_rate
        } as RadarData;

      case 'water_meter':
        return {
          ...baseData,
          flowRate: payload.flow_rate || 0,
          totalUsage: payload.total_usage || 0
        } as WaterMeterData;

      case 'electric_meter':
        return {
          ...baseData,
          power: payload.power || 0,
          totalUsage: payload.total_usage || 0,
          voltage: payload.voltage || 0,
          current: payload.current || 0
        } as ElectricMeterData;

      case 'gas_sensor':
        return {
          ...baseData,
          concentration: payload.concentration || 0,
          leakage: payload.leakage || false
        } as GasSensorData;

      case 'sos_button':
        return {
          ...baseData,
          pressed: payload.pressed || false,
          batteryLevel: payload.battery_level
        } as SOSButtonData;

      default:
        console.warn('[MQTT] 未知设备类型:', deviceType);
        return null;
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }
}

export const mqttService = new MqttService();
