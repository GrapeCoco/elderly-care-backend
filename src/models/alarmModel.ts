
import { db } from './database';
import { Alarm, AlarmLevel, AlarmStatus, DeviceType, PaginatedResult, PaginationParams } from '../types';

/**
 * 报警数据模型
 */
export class AlarmModel {
  /**
   * 创建报警记录
   */
  static create(alarm: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>): Alarm {
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO alarms (device_id, type, level, status, message, personalized_message, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      alarm.deviceId,
      alarm.type,
      alarm.level,
      alarm.status,
      alarm.message,
      alarm.personalizedMessage || null,
      now,
      now
    );
    return {
      ...alarm,
      id: result.lastInsertRowid as number,
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * 根据ID获取报警
   */
  static getById(id: number): Alarm | null {
    const stmt = db.prepare('SELECT * FROM alarms WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return this.mapRowToAlarm(row);
  }

  /**
   * 更新报警状态
   */
  static updateStatus(id: number, status: AlarmStatus): Alarm | null {
    const now = Date.now();
    const stmt = db.prepare(`
      UPDATE alarms SET status = ?, updated_at = ? WHERE id = ?
    `);
    const result = stmt.run(status, now, id);
    if (result.changes === 0) return null;
    return this.getById(id);
  }

  /**
   * 更新个性化消息
   */
  static updatePersonalizedMessage(id: number, message: string): Alarm | null {
    const now = Date.now();
    const stmt = db.prepare(`
      UPDATE alarms SET personalized_message = ?, updated_at = ? WHERE id = ?
    `);
    const result = stmt.run(message, now, id);
    if (result.changes === 0) return null;
    return this.getById(id);
  }

  /**
   * 获取报警列表（分页）
   */
  static getList(pagination: PaginationParams, filters?: {
    deviceId?: string;
    level?: AlarmLevel;
    status?: AlarmStatus;
  }): PaginatedResult<Alarm> {
    const offset = (pagination.page - 1) * pagination.pageSize;
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (filters?.deviceId) {
      whereClause += ' AND device_id = ?';
      params.push(filters.deviceId);
    }
    if (filters?.level) {
      whereClause += ' AND level = ?';
      params.push(filters.level);
    }
    if (filters?.status) {
      whereClause += ' AND status = ?';
      params.push(filters.status);
    }

    const countStmt = db.prepare('SELECT COUNT(*) as total FROM alarms ' + whereClause);
    const total = (countStmt.get(...params) as any).total;

    const dataStmt = db.prepare(`
      SELECT * FROM alarms ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);
    const rows = dataStmt.all(...params, pagination.pageSize, offset) as any[];

    return {
      items: rows.map(row => this.mapRowToAlarm(row)),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize)
    };
  }

  /**
   * 获取用户相关的报警
   */
  static getByUserId(userId: string, pagination: PaginationParams): PaginatedResult<Alarm> {
    const offset = (pagination.page - 1) * pagination.pageSize;
    
    const countStmt = db.prepare(`
      SELECT COUNT(*) as total FROM alarms a
      JOIN devices d ON a.device_id = d.id
      WHERE d.user_id = ?
    `);
    const total = (countStmt.get(userId) as any).total;

    const dataStmt = db.prepare(`
      SELECT a.* FROM alarms a
      JOIN devices d ON a.device_id = d.id
      WHERE d.user_id = ?
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `);
    const rows = dataStmt.all(userId, pagination.pageSize, offset) as any[];

    return {
      items: rows.map(row => this.mapRowToAlarm(row)),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize)
    };
  }

  /**
   * 将数据库行映射为Alarm对象
   */
  private static mapRowToAlarm(row: any): Alarm {
    return {
      id: row.id,
      deviceId: row.device_id,
      type: row.type as DeviceType,
      level: row.level as AlarmLevel,
      status: row.status as AlarmStatus,
      message: row.message,
      personalizedMessage: row.personalized_message,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
