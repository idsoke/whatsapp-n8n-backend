import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

export class UpdateSystemSettingsDto {
  @IsOptional()
  @IsString()
  appName?: string;

  @IsOptional()
  @IsIn(['whatsapp-cloud-api', 'twilio', 'wablas', 'fonnte', 'other'])
  whatsappProvider?: string;

  @IsOptional()
  @IsBoolean()
  whatsappWebhookEnabled?: boolean;

  @IsOptional()
  @IsUrl({ require_tld: false })
  backendBaseUrl?: string;

  @IsOptional()
  @IsString()
  adminContact?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  reportClosingDay?: number;
}
