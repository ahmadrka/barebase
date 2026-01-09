import { Injectable } from '@nestjs/common';
import { QueryProductDto } from '../dto/query-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

const productSelections = {
  productId: true,
  storeId: true,
  sku: true,
  plu: true,
  barcode: true,
  title: true,
  price: true,
  description: true,
  stock: true,
  categoryId: true,
  weightType: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: false,
};

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(storeId: number, query: QueryProductDto) {
    const { search, category } = query;
    return await this.prisma.product.findMany({
      where: {
        deletedAt: null,
        storeId,
        ...(search && { title: { contains: search, mode: 'insensitive' } }),
        ...(category && { categoryId: parseInt(category) }),
      },
      select: productSelections,
    });
  }

  async findOne(productId: string, storeId: number) {
    return await this.prisma.product.findUnique({
      where: {
        deletedAt: null,
        storeId_sku: { sku: productId, storeId },
      },
      select: productSelections,
    });
  }

  async findById(productId: number) {
    return await this.prisma.product.findFirst({
      where: {
        deletedAt: null,
        productId,
      },
      select: productSelections,
    });
  }

  async findLastOne(storeId: number) {
    return await this.prisma.product.findFirst({
      where: {
        deletedAt: null,
        storeId,
      },
      orderBy: { createdAt: 'desc' },
      select: productSelections,
    });
  }

  async createProduct(
    createDto: CreateProductDto,
    sku: string,
    storeId: number,
  ) {
    return await this.prisma.product.create({
      data: {
        storeId,
        sku: sku,
        ...createDto,
      },
      select: productSelections,
    });
  }

  async updateProduct(
    updateDto: UpdateProductDto,
    productId: number,
    storeId: number,
  ) {
    return await this.prisma.product.update({
      where: {
        deletedAt: null,
        productId,
        storeId,
      },
      data: {
        ...updateDto,
      },
      select: productSelections,
    });
  }

  async deleteProduct(productId: number, storeId: number) {
    return await this.prisma.product.update({
      where: {
        deletedAt: null,
        productId,
        storeId,
      },
      data: {
        deletedAt: new Date(),
      },
      select: productSelections,
    });
  }

  async getProductCount(storeId: number) {
    return await this.prisma.product.count({
      where: {
        deletedAt: null,
        storeId,
      },
    });
  }
}
