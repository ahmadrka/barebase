import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { TransactionsRepository } from './repositories/transactions.repository';
import { CartItemsRepository } from './repositories/cart-items.repository';
import { StoreRepository } from 'src/stores/stores.repository';
import { MemberRepository } from 'src/members/members.repository';
import { ErrorCode } from 'src/helper/enum/error-code';
import { ProductRepository } from 'src/products/repositories/products.repository';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly storesRepository: StoreRepository,
    private readonly memberRepo: MemberRepository,
    private readonly productRepo: ProductRepository,
    private readonly cartItemsRepository: CartItemsRepository,
  ) {}

  findAll(query: QueryTransactionDto, storeId: number, userId: number) {
    return this.transactionsRepository.findAll(query, storeId);
  }

  findOne(id: number, storeId: number, userId: number) {
    return this.transactionsRepository.findOne(id, storeId);
  }

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
    storeId: number,
    memberId: number,
  ) {
    const member = await this.memberRepo.findOne(storeId, memberId);
    if (!member) {
      throw new UnauthorizedException({
        message: 'You are not a member of this store',
        errorCode: ErrorCode.FORBIDDEN_RESOURCE,
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    const productIds = createTransactionDto.products.map((p) => p.productId);

    const products = await this.productRepo.findMany(storeId, productIds);

    if (products.length !== productIds.length) {
      throw new NotFoundException({
        message: 'One or more products not found in this store',
        errorCode: ErrorCode.PRODUCT_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const mappedProducts = createTransactionDto.products.map((itemDto) => {
      const dbProduct = products.find(
        (p) => p.productId === itemDto.productId,
      )!;
      return {
        productId: itemDto.productId,
        quantity: itemDto.quantity,
        price: Number(dbProduct.price),
      };
    });

    return this.transactionsRepository.createTransaction(
      { ...createTransactionDto, products: mappedProducts },
      storeId,
      member.memberId,
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
