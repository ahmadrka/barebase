import { PaymentMethod } from 'src/generated/prisma/enums';

export class CreateTransactionDto {
  storeId: number;
  memberId: number;
  method: PaymentMethod;
  createdAt: string;
  products: [
    {
      productId: number;
      amount: number;
      price: number;
    },
    {
      productId: number;
      amount: number;
      price: number;
    },
    {
      productId: number;
      amount: number;
      price: number;
    },
  ];
}
