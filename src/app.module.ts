import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { BendaharaModule } from './bendahara/bendahara.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, UsersModule, OrganizationsModule, TransactionsModule, AdminModule, BendaharaModule],
})
export class AppModule {}
