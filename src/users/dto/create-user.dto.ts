import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  whatsappNumber: string;

  @IsOptional()
  @IsBoolean()
  isWhatsappVerified?: boolean;
}
