import { IsIn, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWaTransactionDto {
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsIn(['masuk', 'keluar', 'saldo', 'laporan bulan ini', 'pengeluaran bulan ini'])
  @IsString()
  command?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  providerMessageId?: string;
}
