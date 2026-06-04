
import * as fs from 'fs';
import * as path from 'path';

/**
 * 简单的 JSON 文件数据库
 */
class JsonDatabase {
  private dataPath: string;
  private data: {
    users: any[];
    devices: any[];
    device_data: any[];
    alarms: any[];
    daily_reports: any[];
    counters: {
      device_data_id: number;
      alarms_id: number;
      daily_reports_id: number;
    };
  };

  constructor() {
    this.dataPath = path.join(process.cwd(), 'data.json');
    this.data = this.loadData();
  }

  /**
   * 加载数据
   */
  private loadData() {
    try {
      if (fs.existsSync(this.dataPath)) {
        const content = fs.readFileSync(this.dataPath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('[Database] 加载数据失败:', error);
    }
    
    // 初始化默认数据
    return {
      users: [],
      devices: [],
      device_data: [],
      alarms: [],
      daily_reports: [],
      counters: {
        device_data_id: 0,
        alarms_id: 0,
        daily_reports_id: 0
      }
    };
  }

  /**
   * 保存数据
   */
  saveData(): void {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('[Database] 保存数据失败:', error);
    }
  }

  /**
   * 准备语句 - 简化版本
   */
  prepare(sql: string): Statement {
    return new Statement(sql, this);
  }

  /**
   * 执行 SQL（仅支持简单操作）
   */
  exec(sql: string): void {
    // JSON 数据库不支持复杂 SQL，这里仅用于初始化表
    console.log('[Database] 初始化数据库表');
  }

  /**
   * 获取数据
   */
  getData() {
    return this.data;
  }

  /**
   * 关闭连接
   */
  close(): void {
    this.saveData();
  }
}

/**
 * 简化的语句执行器
 */
class Statement {
  private sql: string;
  private db: JsonDatabase;

  constructor(sql: string, db: JsonDatabase) {
    this.sql = sql.toLowerCase();
    this.db = db;
  }

  /**
   * 执行查询并返回结果
   */
  all(...params: any[]): any[] {
    const data = this.db.getData();
    
    // 解析简单 SQL
    if (this.sql.includes('from users')) {
      return this.filterData(data.users, params);
    }
    if (this.sql.includes('from devices')) {
      return this.filterData(data.devices, params);
    }
    if (this.sql.includes('from device_data')) {
      return this.filterData(data.device_data, params);
    }
    if (this.sql.includes('from alarms')) {
      return this.filterData(data.alarms, params);
    }
    if (this.sql.includes('from daily_reports')) {
      return this.filterData(data.daily_reports, params);
    }
    
    return [];
  }

  /**
   * 执行查询并返回单条记录
   */
  get(...params: any[]): any {
    const results = this.all(...params);
    return results[0] || null;
  }

  /**
   * 执行插入、更新、删除操作
   */
  run(...params: any[]): { changes: number; lastInsertRowid: number } {
    const data = this.db.getData();
    let changes = 0;
    let lastInsertRowid = 0;

    if (this.sql.includes('insert into users')) {
      const user = this.buildUser(params);
      data.users.push(user);
      lastInsertRowid = 1;
      changes = 1;
    } else if (this.sql.includes('insert into devices')) {
      const device = this.buildDevice(params);
      data.devices.push(device);
      lastInsertRowid = 1;
      changes = 1;
    } else if (this.sql.includes('insert into device_data')) {
      const deviceData = this.buildDeviceData(params);
      data.device_data.push(deviceData);
      data.counters.device_data_id++;
      lastInsertRowid = data.counters.device_data_id;
      changes = 1;
    } else if (this.sql.includes('insert into alarms')) {
      const alarm = this.buildAlarm(params);
      data.alarms.push(alarm);
      data.counters.alarms_id++;
      lastInsertRowid = data.counters.alarms_id;
      changes = 1;
    } else if (this.sql.includes('insert into daily_reports')) {
      const report = this.buildDailyReport(params);
      data.daily_reports.push(report);
      data.counters.daily_reports_id++;
      lastInsertRowid = data.counters.daily_reports_id;
      changes = 1;
    } else if (this.sql.includes('update users')) {
      changes = this.updateRecord(data.users, 'id', params);
    } else if (this.sql.includes('update daily_reports')) {
      changes = this.updateDailyReport(data, params);
    } else if (this.sql.includes('update alarms')) {
      changes = this.updateRecord(data.alarms, 'id', params);
    }

    this.db.saveData();
    return { changes, lastInsertRowid };
  }

  /**
   * 过滤数据
   */
  private filterData(records: any[], params: any[]): any[] {
    let result = [...records];
    const data = this.db.getData();

    // 处理 WHERE 条件
    if (this.sql.includes('where id = ?')) {
      result = result.filter((r: any) => r.id === params[0]);
    }
    if (this.sql.includes('where user_id = ?')) {
      result = result.filter((r: any) => r.user_id === params[0]);
    }
    if (this.sql.includes('where device_id = ?')) {
      result = result.filter((r: any) => r.device_id === params[0]);
    }
    if (this.sql.includes('where wechat_open_id = ?')) {
      result = result.filter((r: any) => r.wechat_open_id === params[0]);
    }
    if (this.sql.includes('where date = ?')) {
      result = result.filter((r: any) => r.date === params[0]);
    }

    // 处理 ORDER BY
    if (this.sql.includes('order by created_at desc')) {
      result.sort((a: any, b: any) => b.created_at - a.created_at);
    }
    if (this.sql.includes('order by date desc')) {
      result.sort((a: any, b: any) => b.date.localeCompare(a.date));
    }
    if (this.sql.includes('order by timestamp desc')) {
      result.sort((a: any, b: any) => b.timestamp - a.timestamp);
    }
    if (this.sql.includes('order by timestamp asc')) {
      result.sort((a: any, b: any) => a.timestamp - b.timestamp);
    }

    // 处理 LIMIT 和 OFFSET
    const limitMatch = this.sql.match(/limit\s+(\d+)/);
    const offsetMatch = this.sql.match(/offset\s+(\d+)/);
    
    if (limitMatch) {
      const limit = parseInt(limitMatch[1]);
      let offset = 0;
      if (offsetMatch) {
        offset = parseInt(offsetMatch[1]);
      }
      result = result.slice(offset, offset + limit);
    }

    // 处理 JOIN（简化处理）
    if (this.sql.includes('join devices')) {
      const deviceIds = result.map((r: any) => r.device_id);
      const devices = data.devices.filter((d: any) => deviceIds.includes(d.id));
      result = result.map((r: any) => {
        const device = devices.find((d: any) => d.id === r.device_id);
        return { ...r, user_id: device ? device.user_id : null };
      });
      
      // 过滤用户
      const userId = params[0];
      result = result.filter((r: any) => r.user_id === userId);
    }

    return result;
  }

  /**
   * 更新记录
   */
  private updateRecord(records: any[], idField: string, params: any[]): number {
    const id = params[params.length - 1];
    const index = records.findIndex(r => r[idField] === id);
    
    if (index !== -1) {
      const updates = this.parseSetClause();
      records[index] = { ...records[index], ...updates };
      return 1;
    }
    return 0;
  }

  /**
   * 更新日报
   */
  private updateDailyReport(data: any, params: any[]): number {
    const userId = params[params.length - 2];
    const date = params[params.length - 1];
    const index = data.daily_reports.findIndex((r: any) => r.user_id === userId && r.date === date);
    
    if (index !== -1) {
      data.daily_reports[index] = {
        ...data.daily_reports[index],
        water_usage: params[0],
        electric_usage: params[1],
        activity_level: params[2],
        alarms: params[3]
      };
      return 1;
    }
    return 0;
  }

  /**
   * 解析 SET 子句
   */
  private parseSetClause(): any {
    const updates: any = {};
    const setMatch = this.sql.match(/set\s+(.+?)\s+where/i);
    if (setMatch) {
      const sets = setMatch[1].split(',');
      sets.forEach((set: string) => {
        const [key, value] = set.split('=').map(s => s.trim());
        const fieldName = this.convertToCamelCase(key);
        updates[fieldName] = value.replace('?', '');
      });
    }
    return updates;
  }

  /**
   * 构建用户对象
   */
  private buildUser(params: any[]): any {
    return {
      id: params[0],
      name: params[1],
      phone: params[2],
      wechat_open_id: params[3],
      emergency_contact: params[4],
      emergency_phone: params[5],
      created_at: Date.now()
    };
  }

  /**
   *构建设备对象
   */
  private buildDevice(params: any[]): any {
    return {
      id: params[0],
      type: params[1],
      name: params[2],
      location: params[3],
      user_id: params[4],
      created_at: Date.now(),
      updated_at: Date.now()
    };
  }

  /**
   * 构建设备数据对象
   */
  private buildDeviceData(params: any[]): any {
    return {
      id: this.db.getData().counters.device_data_id + 1,
      device_id: params[0],
      type: params[1],
      data: params[2],
      timestamp: params[3]
    };
  }

  /**
   * 构建报警对象
   */
  private buildAlarm(params: any[]): any {
    return {
      id: this.db.getData().counters.alarms_id + 1,
      device_id: params[0],
      type: params[1],
      level: params[2],
      status: params[3],
      message: params[4],
      personalized_message: params[5],
      created_at: Date.now(),
      updated_at: Date.now()
    };
  }

  /**
   * 构建日报对象
   */
  private buildDailyReport(params: any[]): any {
    return {
      id: this.db.getData().counters.daily_reports_id + 1,
      user_id: params[0],
      date: params[1],
      water_usage: params[2],
      electric_usage: params[3],
      activity_level: params[4],
      alarms: params[5],
      created_at: Date.now()
    };
  }

  /**
   * 转换为驼峰命名
   */
  private convertToCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }
}

// 导出数据库实例
const dbManager = new JsonDatabase();
export const db = dbManager;
export { JsonDatabase, Statement };
