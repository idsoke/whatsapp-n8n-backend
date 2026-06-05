import { Module } from '@nestjs/common';
import { TransactionsModule } from '../transactions/transactions.module';
import { BendaharaController } from './bendahara.controller';

@Module({
  imports: [TransactionsModule],
  controllers: [BendaharaController],
})
export class BendaharaModule {}
