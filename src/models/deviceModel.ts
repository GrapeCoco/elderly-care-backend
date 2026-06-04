
import { db } from './database';
import { Device, DeviceData, DeviceType, PaginatedResult, PaginationParams } from '../types';

/**
 * 设备数据模型
 */
export class DeviceModel {
  /**
   * 创建设备
   */
  static create(device: Omit<Device, 'createdAt' | 'updatedAt'>): Device {
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO devices (id, type, name, location, user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(device.id, device.type, device.name, device.location, device.userId, now, now);
    return { ...device, createdAt: now, updatedAt: now };
  }

  /**
   * 根据ID获取设备
   */
  static getById(id: string): Device | null {
    const stmt = db.prepare('SELECT * FROM devices WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      type: row.type as DeviceType,
      name: row.name,
      location: row.location,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * 获取用户的所有设备
   */
  static getByUserId(userId: string): Device[] {
    const stmt = db.prepare('SELECT * FROM devices WHERE user_id = ?');
    const rows = stmt.all(userId) as any[];
    return rows.map(row => ({
      id: row.id,
      type: row.type as DeviceType,
      name: row.name,
      location: row.location,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  /**
   * 保存设备数据
   */
  static saveData(deviceId: string, type: DeviceType, data: DeviceData): void {
    const stmt = db.prepare(`
      INSERT INTO device_data (device_id, type, data, timestamp)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(deviceId, type, JSON.stringify(data), data.timestamp);
  }

  /**
   * 获取设备历史数据
   */
  static getHistoryData(
    deviceId: string,
    startTime: number,
    endTime: number,
    pagination: PaginationParams
  ): PaginatedResult<DeviceData> {
    const offset = (pagination.page - 1) * pagination.pageSize;
    
    const countStmt = db.prepare(`
      SELECT COUNT(*) as total FROM device_data
      WHERE device_id = ? AND timestamp >= ? AND timestamp <= ?
    `);
    const total = (countStmt.get(deviceId, startTime, endTime) as any).total;

    const dataStmt = db.prepare(`
      SELECT * FROM device_data
      WHERE device_id = ? AND timestamp >= ? AND timestamp <= ?
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `);
    const rows = dataStmt.all(deviceId, startTime, endTime, pagination.pageSize, offset) as any[];

    return {
      items: rows.map(row => JSON.parse(row.data)),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize)
    };
  }

  /**
   * 获取设备最新数据
   */
  static getLatestData(deviceId: string): DeviceData | null {
    const stmt = db.prepare(`
      SELECT * FROM device_data
      WHERE device_id = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `);
    const row = stmt.get(deviceId) as any;
    if (!row) return null;
    return JSON.parse(row.data);
  }

  /**
   * 获取指定时间段内的设备数据
   */
  static getDataByTimeRange(deviceId: string, startTime: number, endTime: number): DeviceData[] {
    const stmt = db.prepare(`
      SELECT * FROM device_data
      WHERE device_id = ? AND timestamp >= ? AND timestamp <= ?
      ORDER BY timestamp ASC
    `);
    const rows = stmt.all(deviceId, startTime, endTime) as any[];
    return rows.map(row => JSON.parse(row.data));
  }
}
