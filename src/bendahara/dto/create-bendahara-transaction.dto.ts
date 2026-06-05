import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { TransactionType } from '../../transactions/transactions.service';

export class CreateBendaharaTransactionDto {
  @IsString()
  phoneNumber: string;

  @IsIn(['masuk', 'keluar'])
  type: TransactionType;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
