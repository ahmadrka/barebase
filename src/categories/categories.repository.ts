import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const categorySelections = {
  categoryId: true,
  storeId: true,
  name: true,
};

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(storeId: number, query: QueryCategoryDto) {
    const { search } = query;
    return this.prisma.category.findMany({
      where: {
        storeId,
        ...(search && {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }),
      },
      select: categorySelections,
    });
  }

  findOne(categoryId: number, storeId: number) {
    return this.prisma.category.findFirst({
      where: {
        categoryId,
        storeId,
      },
      select: categorySelections,
    });
  }

  createCategory(storeId: number, createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        storeId,
      },
      select: categorySelections,
    });
  }

  updateCategory(
    categoryId: number,
    storeId: number,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.prisma.category.update({
      where: {
        categoryId,
        storeId,
      },
      data: updateCategoryDto,
      select: categorySelections,
    });
  }

  deleteCategory(categoryId: number, storeId: number) {
    return this.prisma.category.delete({
      where: {
        categoryId,
        storeId,
      },
      select: {},
    });
  }

  getCategoryCount(storeId: number) {
    return this.prisma.category.count({
      where: {
        storeId,
      },
    });
  }
}
