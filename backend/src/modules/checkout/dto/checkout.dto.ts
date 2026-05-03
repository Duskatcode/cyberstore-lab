import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CheckoutDto {
  @IsOptional()
  @IsBoolean()
  paymentSuccess?: boolean;

  @IsOptional()
  @IsString()
  paymentReference?: string;
}
