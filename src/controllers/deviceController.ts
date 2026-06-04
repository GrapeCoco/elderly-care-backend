
import { Request, Response } from 'express';
import { DeviceModel } from '../models/deviceModel';
import { DeviceType } from '../types';

/**
 * 设备控制器
 */
export class DeviceController {
  /**
   * 创建设备
   */
  static create(req: Request, res: Response) {
    try {
      const { id, type, name, location, userId } = req.body;

      if (!id || !type || !name || !location || !userId) {
        return res.json({
          success: false,
          error: '缺少必要参数'
        });
      }

      const device = DeviceModel.create({
        id,
        type: type as DeviceType,
        name,
        location,
        userId
      });

      res.json({
        success: true,
        data: device
      });
    } catch (error) {
      console.error('[DeviceController] 创建设备失败:', error);
      res.json({
        success: false,
        error: '创建设备失败'
      });
    }
  }

  /**
   * 获取设备信息
   */
  static getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const device = DeviceModel.getById(id);

      if (!device) {
        return res.json({
          success: false,
          error: '设备不存在'
        });
      }

      res.json({
        success: true,
        data: device
      });
    } catch (error) {
      console.error('[DeviceController] 获取设备失败:', error);
      res.json({
        success: false,
        error: '获取设备失败'
      });
    }
  }

  /**
   * 获取用户的设备列表
   */
  static getByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const devices = DeviceModel.getByUserId(userId);

      res.json({
        success: true,
        data: devices
      });
    } catch (error) {
      console.error('[DeviceController] 获取设备列表失败:', error);
      res.json({
        success: false,
        error: '获取设备列表失败'
      });
    }
  }

  /**
   * 获取设备历史数据
   */
  static getHistoryData(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { startTime, endTime, page = 1, pageSize = 20 } = req.query;

      const start = startTime ? parseInt(startTime as string) : Date.now() - 7 * 24 * 60 * 60 * 1000;
      const end = endTime ? parseInt(endTime as string) : Date.now();

      const result = DeviceModel.getHistoryData(
        id,
        start,
        end,
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
      console.error('[DeviceController] 获取设备历史数据失败:', error);
      res.json({
        success: false,
        error: '获取设备历史数据失败'
      });
    }
  }

  /**
   * 获取设备最新数据
   */
  static getLatestData(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = DeviceModel.getLatestData(id);

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('[DeviceController] 获取设备最新数据失败:', error);
      res.json({
        success: false,
        error: '获取设备最新数据失败'
      });
    }
  }
}
