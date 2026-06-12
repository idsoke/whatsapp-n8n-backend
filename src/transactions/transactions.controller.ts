import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { N8nApiKeyGuard } from '../common/guards/n8n-api-key.guard';
import { CreateWaTransactionDto } from './dto/create-wa-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('wa')
  @UseGuards(N8nApiKeyGuard)
  async createFromWhatsApp(@Body() payload: CreateWaTransactionDto) {
    return this.transactionsService.handleWhatsAppPayload(payload);
  }
}
