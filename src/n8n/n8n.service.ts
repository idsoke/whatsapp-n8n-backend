import { Injectable, Logger } from '@nestjs/common';

interface TransactionNotificationPayload {
  transactionId: string;
  treasurerWhatsappNumber: string;
  organizationName: string;
  type: 'Income' | 'Expense';
  amount: number;
  description: string;
  currentBalance: number;
  message: string;
}

@Injectable()
export class N8nService {
  private readonly logger = new Logger(N8nService.name);

  async sendTransactionNotification(payload: TransactionNotificationPayload) {
    const webhookUrl = process.env.N8N_TRANSACTION_NOTIFICATION_WEBHOOK_URL;
    if (!webhookUrl) {
      this.logger.warn('N8N_TRANSACTION_NOTIFICATION_WEBHOOK_URL is not configured. Notification skipped.');
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-backend-webhook-secret': process.env.N8N_OUTBOUND_SECRET || '',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        this.logger.warn(`n8n notification webhook returned HTTP ${response.status}.`);
      }
    } catch (error) {
      this.logger.error('Failed to send transaction notification to n8n.', error as Error);
    }
  }
}
