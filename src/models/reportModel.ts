
import { db } from './database';
import { DailyReport, PaginatedResult, PaginationParams } from '../types';

/**
 * 日报数据模型
 */
export class ReportModel {
  /**
   * 创建或更新日报
   */
  static upsert(report: Omit<DailyReport, 'id' | 'createdAt'>): DailyReport {
    const now = Date.now();
    
    const existing = this.getByDate(report.userId, report.date);
    if (existing) {
      const stmt = db.prepare(`
        UPDATE daily_reports
        SET water_usage = ?, electric_usage = ?, activity_level = ?, alarms = ?
        WHERE user_id = ? AND date = ?
      `);
      stmt.run(
        report.waterUsage,
        report.electricUsage,
        report.activityLevel,
        report.alarms,
        report.userId,
        report.date
      );
      return this.getByDate(report.userId, report.date)!;
    } else {
      const stmt = db.prepare(`
        INSERT INTO daily_reports (user_id, date, water_usage, electric_usage, activity_level, alarms, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        report.userId,
        report.date,
        report.waterUsage,
        report.electricUsage,
        report.activityLevel,
        report.alarms,
        now
      );
      return {
        ...report,
        id: result.lastInsertRowid as number,
        createdAt: now
      };
    }
  }

  /**
   * 根据日期获取日报
   */
  static getByDate(userId: string, date: string): DailyReport | null {
    const stmt = db.prepare('SELECT * FROM daily_reports WHERE user_id = ? AND date = ?');
    const row = stmt.get(userId, date) as any;
    if (!row) return null;
    return this.mapRowToReport(row);
  }

  /**
   * 获取用户的日报列表
   */
  static getByUserId(userId: string, pagination: PaginationParams): PaginatedResult<DailyReport> {
    const offset = (pagination.page - 1) * pagination.pageSize;
    
    const countStmt = db.prepare('SELECT COUNT(*) as total FROM daily_reports WHERE user_id = ?');
    const total = (countStmt.get(userId) as any).total;

    const dataStmt = db.prepare(`
      SELECT * FROM daily_reports
      WHERE user_id = ?
      ORDER BY date DESC
      LIMIT ? OFFSET ?
    `);
    const rows = dataStmt.all(userId, pagination.pageSize, offset) as any[];

    return {
      items: rows.map(row => this.mapRowToReport(row)),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize)
    };
  }

  /**
   * 获取日期范围内的日报
   */
  static getByDateRange(userId: string, startDate: string, endDate: string): DailyReport[] {
    const stmt = db.prepare(`
      SELECT * FROM daily_reports
      WHERE user_id = ? AND date >= ? AND date <= ?
      ORDER BY date ASC
    `);
    const rows = stmt.all(userId, startDate, endDate) as any[];
    return rows.map(row => this.mapRowToReport(row));
  }

  /**
   * 将数据库行映射为DailyReport对象
   */
  private static mapRowToReport(row: any): DailyReport {
    return {
      id: row.id,
      userId: row.user_id,
      date: row.date,
      waterUsage: row.water_usage,
      electricUsage: row.electric_usage,
      activityLevel: row.activity_level,
      alarms: row.alarms,
      createdAt: row.created_at
    };
  }
}
