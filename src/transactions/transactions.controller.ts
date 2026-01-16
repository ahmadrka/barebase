import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { GetUser } from 'src/helper/decorator/user.decorator';

@Controller('stores/:storeId/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(
    @Query() query: QueryTransactionDto,
    @Param('storeId') storeId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.transactionsService.findAll(query, +storeId, +userId);
  }

  @Get(':transactionId')
  findOne(
    @Param('transactionId') transactionId: string,
    @Param('storeId') storeId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.transactionsService.findOne(+transactionId, +storeId, +userId);
  }

  @Post()
  createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @Param('storeId') storeId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.transactionsService.createTransaction(
      createTransactionDto,
      +storeId,
      +userId,
    );
  }

  @Patch(':transactionId')
  updateTransaction(
    @Param('transactionId') transactionId: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Param('storeId') storeId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.transactionsService.updateTransaction(
      +transactionId,
      updateTransactionDto,
      +storeId,
      +userId,
    );
  }
}
