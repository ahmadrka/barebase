import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TransactionsRepository } from './repositories/transactions.repository';
import { CartItemsRepository } from './repositories/cart-items.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StoreRepository } from 'src/stores/stores.repository';
import { MemberRepository } from 'src/members/members.repository';
import { ProductRepository } from 'src/products/repositories/products.repository';

@Module({
  imports: [PrismaModule],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    TransactionsRepository,
    CartItemsRepository,
    StoreRepository,
    MemberRepository,
    ProductRepository,
  ],
})
export class TransactionsModule {}
