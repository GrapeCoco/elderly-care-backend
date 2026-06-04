
import axios from 'axios';
import { Alarm, User, Device } from '../types';
import { UserModel } from '../models/userModel';
import { DeviceModel } from '../models/deviceModel';

/**
 * 微信服务类
 */
export class WechatService {
  private appId: string;
  private appSecret: string;
  private templateId: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.appId = process.env.WECHAT_APPID || '';
    this.appSecret = process.env.WECHAT_SECRET || '';
    this.templateId = process.env.WECHAT_TEMPLATE_ID || '';
  }

  /**
   * 获取访问令牌
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const response = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
        params: {
          grant_type: 'client_credential',
          appid: this.appId,
          secret: this.appSecret
        }
      });

      this.accessToken = response.data.access_token as string;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in - 300) * 1000;
      return this.accessToken as string;
    } catch (error) {
      console.error('[WechatService] 获取access_token失败:', error);
      throw error;
    }
  }

  /**
   * 发送报警通知
   */
  async sendAlarmNotification(alarm: Alarm): Promise<void> {
    if (!this.appId || !this.appSecret || !this.templateId) {
      console.warn('[WechatService] 微信配置不完整，跳过发送通知');
      return;
    }

    try {
      // 获取设备信息
      const device = DeviceModel.getById(alarm.deviceId);
      if (!device) {
        console.warn('[WechatService] 设备不存在:', alarm.deviceId);
        return;
      }

      // 获取用户信息
      const user = UserModel.getById(device.userId);
      if (!user || !user.wechatOpenId) {
        console.warn('[WechatService] 用户不存在或未绑定微信:', device.userId);
        return;
      }

      const accessToken = await this.getAccessToken();
      const levelText = this.getAlarmLevelText(alarm.level);
      const typeText = this.getDeviceTypeText(alarm.type);
      const time = new Date(alarm.createdAt).toLocaleString('zh-CN');

      const data = {
        touser: user.wechatOpenId,
        template_id: this.templateId,
        data: {
          thing1: {
            value: user.name
          },
          thing2: {
            value: typeText
          },
          thing3: {
            value: levelText
          },
          date4: {
            value: time
          },
          thing5: {
            value: alarm.personalizedMessage || alarm.message
          }
        }
      };

      await axios.post(
        'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + accessToken,
        data
      );

      console.log('[WechatService] 微信通知发送成功');
    } catch (error) {
      console.error('[WechatService] 发送微信通知失败:', error);
      throw error;
    }
  }

  /**
   * 获取报警级别文本
   */
  private getAlarmLevelText(level: string): string {
    const levelMap: Record<string, string> = {
      'info': '提示',
      'warning': '预警',
      'critical': '紧急',
      'emergency': '特急'
    };
    return levelMap[level] || level;
  }

  /**
   * 获取设备类型文本
   */
  private getDeviceTypeText(type: string): string {
    const typeMap: Record<string, string> = {
      'radar': '毫米波雷达',
      'water_meter': '智能水表',
      'electric_meter': '智能电表',
      'gas_sensor': '燃气报警器',
      'sos_button': 'SOS按钮'
    };
    return typeMap[type] || type;
  }
}
