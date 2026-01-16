import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { TransactionsRepository } from './repositories/transactions.repository';
import { CartItemsRepository } from './repositories/cart-items.repository';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly cartItemsRepository: CartItemsRepository,
  ) {}

  findAll(query: QueryTransactionDto, storeId: number, userId: number) {
    return this.transactionsRepository.findAll(query, storeId);
  }

  findOne(id: number, storeId: number, userId: number) {
    return this.transactionsRepository.findOne(id, storeId);
  }

  createTransaction(
    createTransactionDto: CreateTransactionDto,
    storeId: number,
    userId: number,
  ) {
    return this.transactionsRepository.createTransaction(
      createTransactionDto,
      storeId,
    );
  }

  updateTransaction(
    id: number,
    updateTransactionDto: UpdateTransactionDto,
    storeId: number,
    userId: number,
  ) {
    return this.transactionsRepository.updateTransaction(
      id,
      updateTransactionDto,
      storeId,
    );
  }
}
