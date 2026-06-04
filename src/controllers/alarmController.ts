
import { Request, Response } from 'express';
import { AlarmModel } from '../models/alarmModel';
import { AlarmStatus, AlarmLevel } from '../types';

/**
 * 报警控制器
 */
export class AlarmController {
  /**
   * 获取报警详情
   */
  static getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const alarm = AlarmModel.getById(parseInt(id));

      if (!alarm) {
        return res.json({
          success: false,
          error: '报警记录不存在'
        });
      }

      res.json({
        success: true,
        data: alarm
      });
    } catch (error) {
      console.error('[AlarmController] 获取报警详情失败:', error);
      res.json({
        success: false,
        error: '获取报警详情失败'
      });
    }
  }

  /**
   * 更新报警状态
   */
  static updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.json({
          success: false,
          error: '缺少必要参数'
        });
      }

      const alarm = AlarmModel.updateStatus(parseInt(id), status as AlarmStatus);

      if (!alarm) {
        return res.json({
          success: false,
          error: '报警记录不存在'
        });
      }

      res.json({
        success: true,
        data: alarm
      });
    } catch (error) {
      console.error('[AlarmController] 更新报警状态失败:', error);
      res.json({
        success: false,
        error: '更新报警状态失败'
      });
    }
  }

  /**
   * 获取报警列表
   */
  static getList(req: Request, res: Response) {
    try {
      const { page = 1, pageSize = 20, deviceId, level, status } = req.query;

      const result = AlarmModel.getList(
        {
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string)
        },
        {
          deviceId: deviceId as string,
          level: level as AlarmLevel,
          status: status as AlarmStatus
        }
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('[AlarmController] 获取报警列表失败:', error);
      res.json({
        success: false,
        error: '获取报警列表失败'
      });
    }
  }

  /**
   * 获取用户的报警记录
   */
  static getByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { page = 1, pageSize = 20 } = req.query;

      const result = AlarmModel.getByUserId(
        userId,
        {
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string)
        }
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('[AlarmController] 获取用户报警记录失败:', error);
      res.json({
        success: false,
        error: '获取用户报警记录失败'
      });
    }
  }
}
