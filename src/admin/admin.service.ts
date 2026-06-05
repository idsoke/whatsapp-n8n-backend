import { Injectable } from '@nestjs/common';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';

interface SystemSettings {
  appName: string;
  whatsappProvider: string;
  whatsappWebhookEnabled: boolean;
  backendBaseUrl: string;
  adminContact: string;
  timezone: string;
  reportClosingDay: number;
  updatedAt: string;
}

@Injectable()
export class AdminService {
  private settings: SystemSettings = {
    appName: 'Kas Kelas WhatsApp Automation',
    whatsappProvider: 'whatsapp-cloud-api',
    whatsappWebhookEnabled: true,
    backendBaseUrl: 'http://localhost:3000',
    adminContact: 'admin@example.com',
    timezone: 'Asia/Jakarta',
    reportClosingDay: 31,
    updatedAt: new Date().toISOString(),
  };

  getSystemStatus() {
    return {
      success: true,
      service: this.settings.appName,
      environment: process.env.NODE_ENV || 'development',
      whatsappProvider: this.settings.whatsappProvider,
      whatsappWebhookEnabled: this.settings.whatsappWebhookEnabled,
      backendBaseUrl: this.settings.backendBaseUrl,
      serverTime: new Date().toISOString(),
    };
  }

  getSettings() {
    return this.settings;
  }

  updateSettings(payload: UpdateSystemSettingsDto) {
    this.settings = {
      ...this.settings,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'System settings updated',
      settings: this.settings,
    };
  }
}
