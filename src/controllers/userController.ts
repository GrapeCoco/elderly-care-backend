
import { Request, Response } from 'express';
import { UserModel } from '../models/userModel';

/**
 * 用户控制器
 */
export class UserController {
  /**
   * 创建用户
   */
  static create(req: Request, res: Response) {
    try {
      const { id, name, phone, wechatOpenId, emergencyContact, emergencyPhone } = req.body;

      if (!id || !name || !phone || !emergencyContact || !emergencyPhone) {
        return res.json({
          success: false,
          error: '缺少必要参数'
        });
      }

      const user = UserModel.create({
        id,
        name,
        phone,
        wechatOpenId,
        emergencyContact,
        emergencyPhone
      });

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('[UserController] 创建用户失败:', error);
      res.json({
        success: false,
        error: '创建用户失败'
      });
    }
  }

  /**
   * 获取用户信息
   */
  static getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = UserModel.getById(id);

      if (!user) {
        return res.json({
          success: false,
          error: '用户不存在'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('[UserController] 获取用户信息失败:', error);
      res.json({
        success: false,
        error: '获取用户信息失败'
      });
    }
  }

  /**
   * 更新用户信息
   */
  static update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const user = UserModel.update(id, updates);

      if (!user) {
        return res.json({
          success: false,
          error: '用户不存在'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('[UserController] 更新用户信息失败:', error);
      res.json({
        success: false,
        error: '更新用户信息失败'
      });
    }
  }

  /**
   * 获取所有用户
   */
  static getAll(req: Request, res: Response) {
    try {
      const users = UserModel.getAll();

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('[UserController] 获取用户列表失败:', error);
      res.json({
        success: false,
        error: '获取用户列表失败'
      });
    }
  }
}
