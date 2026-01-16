import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductRepository } from './repositories/products.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { MemberRepository } from 'src/members/members.repository';
import { ProductFallbackController } from './product-fallback.controller';
import { ProductImageRepository } from './repositories/product-images.repository';
import { CategoriesRepository } from 'src/categories/categories.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController, ProductFallbackController],
  providers: [
    ProductsService,
    ProductRepository,
    ProductImageRepository,
    MemberRepository,
    PrismaService,
    CategoriesRepository,
  ],
})
export class ProductsModule {}
