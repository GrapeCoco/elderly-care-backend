
import { db } from './database';
import { User } from '../types';

/**
 * 用户数据模型
 */
export class UserModel {
  /**
   * 创建用户
   */
  static create(user: Omit<User, 'createdAt'>): User {
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO users (id, name, phone, wechat_open_id, emergency_contact, emergency_phone, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      user.id,
      user.name,
      user.phone,
      user.wechatOpenId || null,
      user.emergencyContact,
      user.emergencyPhone,
      now
    );
    return { ...user, createdAt: now };
  }

  /**
   * 根据ID获取用户
   */
  static getById(id: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      wechatOpenId: row.wechat_open_id,
      emergencyContact: row.emergency_contact,
      emergencyPhone: row.emergency_phone,
      createdAt: row.created_at
    };
  }

  /**
   * 根据微信OpenId获取用户
   */
  static getByWechatOpenId(openId: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE wechat_open_id = ?');
    const row = stmt.get(openId) as any;
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      wechatOpenId: row.wechat_open_id,
      emergencyContact: row.emergency_contact,
      emergencyPhone: row.emergency_phone,
      createdAt: row.created_at
    };
  }

  /**
   * 更新用户信息
   */
  static update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
    const setClauses: string[] = [];
    const params: any[] = [];

    if (updates.name !== undefined) {
      setClauses.push('name = ?');
      params.push(updates.name);
    }
    if (updates.phone !== undefined) {
      setClauses.push('phone = ?');
      params.push(updates.phone);
    }
    if (updates.wechatOpenId !== undefined) {
      setClauses.push('wechat_open_id = ?');
      params.push(updates.wechatOpenId);
    }
    if (updates.emergencyContact !== undefined) {
      setClauses.push('emergency_contact = ?');
      params.push(updates.emergencyContact);
    }
    if (updates.emergencyPhone !== undefined) {
      setClauses.push('emergency_phone = ?');
      params.push(updates.emergencyPhone);
    }

    if (setClauses.length === 0) return this.getById(id);

    params.push(id);
    const stmt = db.prepare('UPDATE users SET ' + setClauses.join(', ') + ' WHERE id = ?');
    const result = stmt.run(...params);
    if (result.changes === 0) return null;
    return this.getById(id);
  }

  /**
   * 获取所有用户
   */
  static getAll(): User[] {
    const stmt = db.prepare('SELECT * FROM users');
    const rows = stmt.all() as any[];
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      wechatOpenId: row.wechat_open_id,
      emergencyContact: row.emergency_contact,
      emergencyPhone: row.emergency_phone,
      createdAt: row.created_at
    }));
  }
}
