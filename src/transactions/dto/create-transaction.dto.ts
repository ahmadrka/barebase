import { PaymentMethod } from 'src/generated/prisma/enums';
import {
  IsEnum,
  IsNumber,
  IsPositive,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Product)
  products: Array<Product>;
}

class Product {
  @IsNumber()
  @IsPositive()
  productId: number;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  price: number;
}
