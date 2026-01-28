import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryTransactionDto } from '../dto/query-transaction.dto';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: QueryTransactionDto, storeId: number) {
    return this.prisma.transaction.findMany({
      where: {
        storeId,
      },
    });
  }

  findOne(id: number, storeId: number) {
    return this.prisma.transaction.findUnique({
      where: {
        id,
        storeId,
      },
    });
  }

  createTransaction(
    createTransactionDto: CreateTransactionDto,
    storeId: number,
    memberId: number,
  ) {
    return this.prisma.transaction.create({
      data: {
        method: createTransactionDto.method,
        storeId,
        memberId,
        items: {
          create: createTransactionDto.products.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  }

  updateTransaction(
    id: number,
    updateTransactionDto: UpdateTransactionDto,
    storeId: number,
  ) {
    return this.prisma.transaction.update({
      where: {
        id,
        storeId,
      },
      data: updateTransactionDto,
    });
  }
}
