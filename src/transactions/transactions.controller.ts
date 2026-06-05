import { Body, Controller, Post } from '@nestjs/common';
import { CreateWaTransactionDto } from './dto/create-wa-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('wa')
  async createFromWhatsApp(@Body() payload: CreateWaTransactionDto) {
    return this.transactionsService.handleWhatsAppPayload(payload);
  }
}
