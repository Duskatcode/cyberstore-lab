import { IsOptional, IsString, MinLength } from 'class-validator';

export class ModerateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  comment?: string;
}
