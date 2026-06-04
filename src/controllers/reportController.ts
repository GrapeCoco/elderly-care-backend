
import { Request, Response } from 'express';
import { ReportModel } from '../models/reportModel';

/**
 * 日报控制器
 */
export class ReportController {
  /**
   * 创建或更新日报
   */
  static upsert(req: Request, res: Response) {
    try {
      const { userId, date, waterUsage, electricUsage, activityLevel, alarms } = req.body;

      if (!userId || !date) {
        return res.json({
          success: false,
          error: '缺少必要参数'
        });
      }

      const report = ReportModel.upsert({
        userId,
        date,
        waterUsage: waterUsage || 0,
        electricUsage: electricUsage || 0,
        activityLevel: activityLevel || 0,
        alarms: alarms || 0
      });

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('[ReportController] 保存日报失败:', error);
      res.json({
        success: false,
        error: '保存日报失败'
      });
    }
  }

  /**
   * 获取指定日期的日报
   */
  static getByDate(req: Request, res: Response) {
    try {
      const { userId, date } = req.params;
      const report = ReportModel.getByDate(userId, date);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('[ReportController] 获取日报失败:', error);
      res.json({
        success: false,
        error: '获取日报失败'
      });
    }
  }

  /**
   * 获取用户的日报列表
   */
  static getByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { page = 1, pageSize = 30 } = req.query;

      const result = ReportModel.getByUserId(
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
      console.error('[ReportController] 获取日报列表失败:', error);
      res.json({
        success: false,
        error: '获取日报列表失败'
      });
    }
  }

  /**
   * 获取日期范围内的日报
   */
  static getByDateRange(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.json({
          success: false,
          error: '缺少必要参数'
        });
      }

      const reports = ReportModel.getByDateRange(
        userId,
        startDate as string,
        endDate as string
      );

      res.json({
        success: true,
        data: reports
      });
    } catch (error) {
      console.error('[ReportController] 获取日报范围失败:', error);
      res.json({
        success: false,
        error: '获取日报范围失败'
      });
    }
  }
}
