import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { BendaharaModule } from './bendahara/bendahara.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [TransactionsModule, AdminModule, BendaharaModule],
})
export class AppModule {}
