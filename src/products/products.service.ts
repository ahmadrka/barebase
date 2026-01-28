import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { ProductRepository } from './repositories/products.repository';
import { MemberRepository } from 'src/members/members.repository';
import { ErrorCode } from 'src/helper/enum/error-code';
import {
  createThumbnail,
  deleteFile,
  FolderType,
  uploadToCloudinary,
} from 'src/helper/function/cloudinary-file';
import { MemoryStorageFile } from 'nest-file-fastify';
import { ProductImageRepository } from './repositories/product-images.repository';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { CategoriesRepository } from 'src/categories/categories.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly memberRepo: MemberRepository,
    private readonly productImageRepo: ProductImageRepository,
    private readonly categoryRepo: CategoriesRepository,
  ) {}

  async findAll(storeId: number, query: QueryProductDto, userId: number) {
    const member = await this.memberRepo.findOne(storeId, userId);
    if (!member) {
      throw new UnauthorizedException({
        message: 'You are not a member of this store',
        errorCode: ErrorCode.FORBIDDEN_RESOURCE,
        statusCode: HttpStatus.FORBIDDEN,
      });
    }
    return this.productRepo.findAll(storeId, query);
  }

  async findOne(productId: string, storeId: number, userId: number) {
    const member = await this.memberRepo.findOne(storeId, userId);
    if (!member) {
      throw new UnauthorizedException({
        message: 'You are not a member of this store',
        errorCode: ErrorCode.FORBIDDEN_RESOURCE,
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    const product = await this.productRepo.findOne(productId, storeId);
    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        errorCode: ErrorCode.PRODUCT_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return product;
  }

  // Get product fallback productId
  async findFallback(productId: number) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        errorCode: ErrorCode.PRODUCT_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return product;
  }

  async createProduct(
    createDto: CreateProductDto,
    storeId: number,
    userId: number,
  ) {
    const member = await this.memberRepo.findOne(storeId, userId);
    if (!member) {
      throw new UnauthorizedException({
        message: 'You are not a member of this store',
        errorCode: ErrorCode.FORBIDDEN_RESOURCE,
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    let finalPlu: string;

    const product = await this.productRepo.findLastOne(storeId);
    if (product && product.sku) {
      const lastNumber = parseInt(product.sku, 10);
      finalPlu = (lastNumber + 1).toString(); //.padStart(2, '0');
    } else {
      finalPlu = '1';
    }

    const category = await this.categoryRepo.findOne(
      createDto.categoryId,
      storeId,
    );
    if (!category) {
      throw new NotFoundException({
        message: 'Category not found',
        errorCode: ErrorCode.CATEGORY_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return this.productRepo.createProduct(createDto, finalPlu, storeId);
  }

  async updateProduct(
    updateDto: UpdateProductDto,
    productId: string,
    storeId: number,
    userId: number,
  ) {
    const member = await this.memberRepo.findOne(storeId, userId);
    if (!member) {
      throw new UnauthorizedException({
        message: 'You are not a member of this store',
        errorCode: ErrorCode.FORBIDDEN_RESOURCE,
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    const product = await this.productRepo.findOne(productId, storeId);
    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        errorCode: ErrorCode.PRODUCT_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return this.productRepo.updateProduct(
      updateDto,
      +product.productId,
      storeId,
    );
  }

  async deleteProduct(productId: string, storeId: number, userId: number) {
    const member = await this.memberRepo.findOne(storeId, userId);
    if (!member) {
      throw new UnauthorizedException({
        message: 'You are not a member of this store',
        errorCode: ErrorCode.FORBIDDEN_RESOURCE,
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    const product = await this.productRepo.findOne(productId, storeId);
    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        errorCode: ErrorCode.PRODUCT_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return this.productRepo.deleteProduct(+product.productId, storeId);
  }

  // Upload product image
  async uploadImage(
    productId: string,
    storeId: number,
    userId: number,
    file: MemoryStorageFile,
  ) {
    const member = await this.memberRepo.findOne(storeId, userId);
    if (!member) {
      throw new UnauthorizedException({
        message: 'You are not a member of this store',
        errorCode: ErrorCode.FORBIDDEN_RESOURCE,
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    const product = await this.productRepo.findOne(productId, storeId);
    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        errorCode: ErrorCode.PRODUCT_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    // Handle upload to cloudinary
    const uploadResult = await uploadToCloudinary(file, FolderType.PRODUCTS);

    const thumbnailUrl = await createThumbnail(uploadResult.public_id);

    const imageData = await this.productImageRepo.createProductImage(
      product.productId,
      uploadResult.public_id,
      0,
      thumbnailUrl,
      uploadResult.url,
    );

    return {
      success: true,
      message: 'Image uploaded successfully',
      data: imageData,
    };
  }

  async updateImage(
    imageId: number,
    productId: string,
    storeId: number,
    userId: number,
    updateDto: UpdateProductImageDto,
  ) {
    const member = await this.memberRepo.findOne(storeId, userId);
    if (!member) {
      throw new UnauthorizedException({
        message: 'You are not a member of this store',
        errorCode: ErrorCode.FORBIDDEN_RESOURCE,
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    const product = await this.productRepo.findOne(productId, storeId);
    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        errorCode: ErrorCode.PRODUCT_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const image = await this.productImageRepo.findProductImage(
      imageId,
      product.productId,
    );
    if (!image) {
      throw new NotFoundException({
        message: 'Image not found',
        errorCode: ErrorCode.IMAGE_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return this.productImageRepo.updateProductImage(image.imageId, updateDto);
  }

  async deleteImage(
    imageId: number,
    productId: string,
    storeId: number,
    userId: number,
  ) {
    const member = await this.memberRepo.findOne(storeId, userId);
    if (!member) {
      throw new UnauthorizedException({
        message: 'You are not a member of this store',
        errorCode: ErrorCode.FORBIDDEN_RESOURCE,
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    const product = await this.productRepo.findOne(productId, storeId);
    if (!product) {
      throw new NotFoundException({
        message: 'Product not found',
        errorCode: ErrorCode.PRODUCT_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const image = await this.productImageRepo.findProductImage(
      imageId,
      product.productId,
    );
    if (!image) {
      throw new NotFoundException({
        message: 'Image not found',
        errorCode: ErrorCode.IMAGE_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    await deleteFile(image.publicId);
    await this.productImageRepo.deleteProductImage(image.imageId);

    return {
      success: true,
      message: 'Image deleted successfully',
    };
  }
}
