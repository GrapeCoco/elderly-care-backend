
import axios from 'axios';
import { Alarm, User, Device } from '../types';
import { UserModel } from '../models/userModel';
import { DeviceModel } from '../models/deviceModel';

/**
 * Coze 智能体服务类
 * 
 * 功能：
 * 1. 生成个性化报警通知文案
 * 2. 生成健康日报（AI分析老人活动规律）
 */
export class CozeService {
  private apiKey: string;
  private botId: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.COZE_API_KEY || '';
    this.botId = process.env.COZE_BOT_ID || '';
    this.apiUrl = 'https://api.coze.cn/v3/chat';
  }

  /**
   * 生成个性化报警消息
   * @param alarm 报警对象
   * @returns 个性化通知文案
   */
  async generateAlarmMessage(alarm: Alarm): Promise<string> {
    if (!this.apiKey || !this.botId) {
      console.warn('[CozeService] Coze配置不完整，返回默认消息');
      return this.generateMockAlarmMessage(alarm);
    }

    try {
      const device = DeviceModel.getById(alarm.deviceId);
      const user = device ? UserModel.getById(device.userId) : null;

      const prompt = this.buildAlarmPrompt(alarm, device, user);

      const response = await axios.post(
        this.apiUrl,
        {
          bot_id: this.botId,
          user: 'elderly-care-system',
          query: prompt,
          stream: false
        },
        {
          headers: {
            'Authorization': 'Bearer ' + this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.messages) {
        const answerMessage = response.data.messages.find((m: any) => m.type === 'answer');
        if (answerMessage && answerMessage.content) {
          return answerMessage.content;
        }
      }

      return this.generateMockAlarmMessage(alarm);
    } catch (error) {
      console.error('[CozeService] 调用Coze API失败:', error);
      return this.generateMockAlarmMessage(alarm);
    }
  }

  /**
   * 生成健康日报（AI分析老人活动规律）
   * @param userId 用户ID
   * @param date 日期
   * @param data 设备数据汇总
   * @returns 健康日报文案
   */
  async generateHealthReport(
    userId: string,
    date: string,
    data: {
      waterUsage: number;
      electricUsage: number;
      activityLevel: number;
      avgHeartRate: number;
      avgBreathingRate: number;
      alerts: number;
      sleepHours: number;
    }
  ): Promise<string> {
    if (!this.apiKey || !this.botId) {
      console.warn('[CozeService] Coze配置不完整，返回模拟健康日报');
      return this.generateMockHealthReport(data);
    }

    try {
      const user = UserModel.getById(userId);
      const prompt = this.buildHealthReportPrompt(user, date, data);

      const response = await axios.post(
        this.apiUrl,
        {
          bot_id: this.botId,
          user: 'elderly-care-system',
          query: prompt,
          stream: false
        },
        {
          headers: {
            'Authorization': 'Bearer ' + this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.messages) {
        const answerMessage = response.data.messages.find((m: any) => m.type === 'answer');
        if (answerMessage && answerMessage.content) {
          return answerMessage.content;
        }
      }

      return this.generateMockHealthReport(data);
    } catch (error) {
      console.error('[CozeService] 调用Coze API生成健康日报失败:', error);
      return this.generateMockHealthReport(data);
    }
  }

  /**
   * 构建报警提示词
   */
  private buildAlarmPrompt(alarm: Alarm, device: Device | null, user: User | null): string {
    const levelText = this.getAlarmLevelText(alarm.level);
    const typeText = this.getDeviceTypeText(alarm.type);

    let prompt = '请生成一条温馨且专业的' + levelText + '通知文案，用于提醒老人家属。\n\n报警信息：\n- 报警类型：' + typeText + '\n- 报警级别：' + levelText + '\n- 报警内容：' + alarm.message;

    if (user) {
      prompt += '\n老人信息：\n- 姓名：' + user.name + '\n- 紧急联系人：' + user.emergencyContact;
    }

    if (device) {
      prompt += '\n设备信息：\n- 设备名称：' + device.name + '\n- 安装位置：' + device.location;
    }

    prompt += '\n\n要求：\n1. 语言简洁明了，不超过100字\n2. 语气要专业但不失温暖\n3. 给出简要的行动建议\n4. 避免使用过于技术性的术语\n\n请直接返回通知文案，不要添加任何其他说明。';

    return prompt;
  }

  /**
   * 构建健康日报提示词
   */
  private buildHealthReportPrompt(
    user: User | null,
    date: string,
    data: {
      waterUsage: number;
      electricUsage: number;
      activityLevel: number;
      avgHeartRate: number;
      avgBreathingRate: number;
      alerts: number;
      sleepHours: number;
    }
  ): string {
    let prompt = '请为老人生成一份健康日报，分析今日活动规律。\n\n';

    if (user) {
      prompt += '老人信息：\n- 姓名：' + user.name + '\n';
    }

    prompt += '日期：' + date + '\n\n';

    prompt += '今日数据：\n';
    prompt += '- 用水量：' + data.waterUsage + ' 升\n';
    prompt += '- 用电量：' + data.electricUsage + ' 度\n';
    prompt += '- 活动量：' + data.activityLevel + '%\n';
    prompt += '- 平均心率：' + data.avgHeartRate + ' bpm\n';
    prompt += '- 平均呼吸率：' + data.avgBreathingRate + ' 次/分钟\n';
    prompt += '- 报警次数：' + data.alerts + ' 次\n';
    prompt += '- 睡眠时长：' + data.sleepHours + ' 小时\n\n';

    prompt += '要求：\n';
    prompt += '1. 语言温暖亲切，适合发给家属查看\n';
    prompt += '2. 分析老人的活动规律和健康状况\n';
    prompt += '3. 如果有异常情况请特别指出\n';
    prompt += '4. 给出简单的健康建议\n';
    prompt += '5. 不超过200字\n\n';
    prompt += '请直接返回日报内容，不要添加任何其他说明。';

    return prompt;
  }

  /**
   * 生成模拟报警消息（当Coze不可用时）
   */
  private generateMockAlarmMessage(alarm: Alarm): string {
    const levelText = this.getAlarmLevelText(alarm.level);
    const typeText = this.getDeviceTypeText(alarm.type);

    const messages: Record<string, (alarm: Alarm) => string> = {
      'radar': () => `【${levelText}】系统检测到老人可能跌倒，请家属立即前往查看或联系老人确认安全！`,
      'water_meter': () => `【${levelText}】${typeText}：系统检测到长时间未用水，建议联系老人确认安好。`,
      'electric_meter': () => `【${levelText}】${typeText}：系统检测到长时间未用电，请注意老人安全。`,
      'gas_sensor': () => `【${levelText}】${typeText}：检测到燃气浓度异常！请立即检查并通风！`,
      'sos_button': () => `【${levelText}】老人按下了紧急求助按钮！请立即联系或前往！`
    };

    return messages[alarm.type]?.(alarm) || alarm.message;
  }

  /**
   * 生成模拟健康日报（当Coze不可用时）
   */
  private generateMockHealthReport(data: {
    waterUsage: number;
    electricUsage: number;
    activityLevel: number;
    avgHeartRate: number;
    avgBreathingRate: number;
    alerts: number;
    sleepHours: number;
  }): string {
    const parts: string[] = [];
    
    if (data.waterUsage >= 80) {
      parts.push('今日饮水量充足');
    } else {
      parts.push('今日饮水量偏少，建议适当补充水分');
    }

    if (data.activityLevel >= 60) {
      parts.push('活动量良好');
    } else if (data.activityLevel >= 40) {
      parts.push('活动量适中');
    } else {
      parts.push('活动量偏少，建议适当活动');
    }

    if (data.avgHeartRate >= 60 && data.avgHeartRate <= 90) {
      parts.push('心率正常');
    } else {
      parts.push('心率略有异常，建议关注');
    }

    if (data.sleepHours >= 7) {
      parts.push('睡眠充足');
    } else {
      parts.push('睡眠时长偏少');
    }

    if (data.alerts === 0) {
      parts.push('今日无报警，整体状况良好');
    } else {
      parts.push(`今日有${data.alerts}次报警记录，请关注`);
    }

    return parts.join('，') + '。如有异常请及时联系老人。';
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
      'radar': '毫米波雷达（跌倒检测）',
      'water_meter': '智能水表',
      'electric_meter': '智能电表',
      'gas_sensor': '燃气报警器',
      'sos_button': 'SOS紧急求助按钮'
    };
    return typeMap[type] || type;
  }
}
