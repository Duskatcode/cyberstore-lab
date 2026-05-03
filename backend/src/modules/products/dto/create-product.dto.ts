import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ProductType } from '../../../generated/prisma/enums';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(2)
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ProductType)
  type!: ProductType;

  @IsString()
  categoryId!: string;

  @IsInt()
  @Min(0)
  priceCents!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsInt()
  @Min(0)
  stock!: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
