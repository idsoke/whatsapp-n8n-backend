import { IsOptional, IsString } from 'class-validator';

export class CreateWhatsappTransactionDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  providerMessageId?: string;
}
