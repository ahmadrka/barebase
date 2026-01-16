import {
  IsDecimal,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ProductStatus, WeightType } from 'src/generated/prisma/enums';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsDecimal()
  price: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNumber()
  stock: number;

  @IsOptional()
  @IsString()
  plu: string;

  @IsOptional()
  @IsString()
  barcode: string;

  @IsOptional()
  @IsNumber()
  categoryId: number;

  @IsString()
  @IsEnum(WeightType)
  weightType: WeightType;

  @IsString()
  @IsEnum(ProductStatus)
  status: ProductStatus;
}
