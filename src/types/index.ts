
/**
 * 设备类型枚举
 */
export enum DeviceType {
  RADAR = 'radar',
  WATER_METER = 'water_meter',
  ELECTRIC_METER = 'electric_meter',
  GAS_SENSOR = 'gas_sensor',
  SOS_BUTTON = 'sos_button'
}

/**
 * 报警级别枚举
 */
export enum AlarmLevel {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

/**
 * 报警状态枚举
 */
export enum AlarmStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  RESOLVED = 'resolved',
  IGNORED = 'ignored'
}

/**
 * 毫米波雷达数据
 */
export interface RadarData {
  deviceId: string;
  timestamp: number;
  fallDetected: boolean;
  presence: boolean;
  heartRate?: number;
  breathingRate?: number;
}

/**
 * 智能水表数据
 */
export interface WaterMeterData {
  deviceId: string;
  timestamp: number;
  flowRate: number;
  totalUsage: number;
}

/**
 * 智能电表数据
 */
export interface ElectricMeterData {
  deviceId: string;
  timestamp: number;
  power: number;
  totalUsage: number;
  voltage: number;
  current: number;
}

/**
 * 燃气报警器数据
 */
export interface GasSensorData {
  deviceId: string;
  timestamp: number;
  concentration: number;
  leakage: boolean;
}

/**
 * SOS按钮数据
 */
export interface SOSButtonData {
  deviceId: string;
  timestamp: number;
  pressed: boolean;
  batteryLevel?: number;
}

/**
 * 设备数据联合类型
 */
export type DeviceData = RadarData | WaterMeterData | ElectricMeterData | GasSensorData | SOSButtonData;

/**
 * 设备信息
 */
export interface Device {
  id: string;
  type: DeviceType;
  name: string;
  location: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * 报警记录
 */
export interface Alarm {
  id: number;
  deviceId: string;
  type: DeviceType;
  level: AlarmLevel;
  status: AlarmStatus;
  message: string;
  personalizedMessage?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * 用户信息
 */
export interface User {
  id: string;
  name: string;
  phone: string;
  wechatOpenId?: string;
  emergencyContact: string;
  emergencyPhone: string;
  createdAt: number;
}

/**
 * 健康日报
 */
export interface DailyReport {
  id: number;
  userId: string;
  date: string;
  waterUsage: number;
  electricUsage: number;
  activityLevel: number;
  alarms: number;
  createdAt: number;
}

/**
 * MQTT 消息结构
 */
export interface MqttMessage {
  topic: string;
  payload: string;
}

/**
 * 报警规则配置
 */
export interface AlarmRule {
  type: DeviceType;
  level: AlarmLevel;
  condition: (data: DeviceData, history?: DeviceData[]) => boolean;
  description: string;
}

/**
 * API 响应结构
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * 分页查询参数
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * 分页查询结果
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
