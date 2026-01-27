import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipe,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, UploadedFile } from 'nest-file-fastify';
import type { MemoryStorageFile } from 'nest-file-fastify';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { QueryProductDto } from './dto/query-product.dto';
import { GetUser } from 'src/helper/decorator/user.decorator';
import { CustomFileValidator } from 'src/helper/validator/file-validator';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@UseGuards(JwtAuthGuard)
@Controller('stores/:storeId/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @SkipThrottle()
  @Get()
  findAll(
    @Query() query: QueryProductDto,
    @Param('storeId') storeId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.productsService.findAll(+storeId, query, +userId);
  }

  @SkipThrottle()
  @Get(':productId')
  findOne(
    @Param('productId') productId: string,
    @Param('storeId') storeId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.productsService.findOne(productId, +storeId, +userId);
  }

  @Post()
  createProduct(
    @Body() createDto: CreateProductDto,
    @Param('storeId') storeId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.productsService.createProduct(createDto, +storeId, +userId);
  }

  @Patch(':productId')
  updateProduct(
    @Body() updateDto: UpdateProductDto,
    @Param('productId') productId: string,
    @Param('storeId') storeId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.productsService.updateProduct(
      updateDto,
      productId,
      +storeId,
      +userId,
    );
  }

  @Delete(':productId')
  deleteProduct(
    @Param('productId') productId: string,
    @Param('storeId') storeId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.productsService.deleteProduct(productId, +storeId, +userId);
  }

  // Upload product image
  @Post(':productId/images')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @Param('productId') productId: string,
    @Param('storeId') storeId: string,
    @GetUser('userId') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new CustomFileValidator(),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
        ],
      }),
    )
    file: MemoryStorageFile,
  ) {
    return this.productsService.uploadImage(productId, +storeId, +userId, file);
  }

  @Patch(':productId/images/:imageId')
  updateImage(
    @Param('productId') productId: string,
    @Param('storeId') storeId: string,
    @GetUser('userId') userId: string,
    @Param('imageId') imageId: string,
    @Body() updateDto: UpdateProductImageDto,
  ) {
    return this.productsService.updateImage(
      +imageId,
      productId,
      +storeId,
      +userId,
      updateDto,
    );
  }

  @Delete(':productId/images/:imageId')
  deleteImage(
    @Param('productId') productId: string,
    @Param('storeId') storeId: string,
    @GetUser('userId') userId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.productsService.deleteImage(
      +imageId,
      productId,
      +storeId,
      +userId,
    );
  }
}
