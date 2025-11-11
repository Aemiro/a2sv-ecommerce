import { CurrentUserDto } from '@libs/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ArchiveProductCommand,
  CreateProductCommand,
  UpdateProductCommand,
} from './product.commands';
import { ProductRepository } from '@products/persistence/products/product.repository';
import { ProductResponse } from './product.response';
import {
  CreateProductImageCommand,
  UpdateProductImageCommand,
  RemoveProductImageCommand,
} from './product-image.command';
@Injectable()
export class ProductCommand {
  constructor(private readonly productRepository: ProductRepository) {}
  async createProduct(command: CreateProductCommand): Promise<ProductResponse> {
    const productDomain = CreateProductCommand.toEntity(command);
    productDomain.createdBy = command.currentUser.id;
    productDomain.updatedBy = command.currentUser.id;

    const product = await this.productRepository.insert(productDomain);
    const result = await this.productRepository.save(product);
    return ProductResponse.toResponse(result);
  }
  async updateProduct(command: UpdateProductCommand): Promise<ProductResponse> {
    const productDomain = await this.productRepository.getById(command.id);
    if (!productDomain) {
      throw new NotFoundException(`product not found with id ${command.id}`);
    }
    productDomain.description =
      command?.description ?? productDomain.description;
    productDomain.name = command.name ?? productDomain.name;
    productDomain.categoryId = command.categoryId ?? productDomain.categoryId;
    productDomain.stock = command.stock ?? productDomain.stock;
    productDomain.price = command.price ?? productDomain.price;
    productDomain.updatedBy = command?.currentUser?.id;
    const product = await this.productRepository.save(productDomain);
    return ProductResponse.toResponse(product);
  }
  async archiveProduct(
    command: ArchiveProductCommand,
  ): Promise<ProductResponse> {
    const productDomain = await this.productRepository.getById(command.id);
    if (!productDomain) {
      throw new NotFoundException(`product not found with id ${command.id}`);
    }
    productDomain.deletedAt = new Date();
    productDomain.deletedBy = command.currentUser.id;
    const result = await this.productRepository.save(productDomain);

    return ProductResponse.toResponse(result);
  }
  async restoreProduct(
    id: string,
    currentUser: CurrentUserDto,
  ): Promise<ProductResponse> {
    const productDomain = await this.productRepository.getById(id, [], true);
    if (!productDomain) {
      throw new NotFoundException(`product not found with id ${id}`);
    }
    await this.productRepository.restore(id);
    productDomain.deletedAt = undefined;
    return ProductResponse.toResponse(productDomain);
  }
  async deleteProduct(
    id: string,
    currentUser: CurrentUserDto,
  ): Promise<boolean> {
    const productDomain = await this.productRepository.getById(id, [], true);
    if (!productDomain) {
      throw new NotFoundException(`Product not found with id ${id}`);
    }
    const result = await this.productRepository.delete(id);
    return result;
  }
  // productImages
  async addProductImage(payload: CreateProductImageCommand) {
    const product = await this.productRepository.getById(
      payload.productId,
      ['productImages'],
      true,
    );
    if (!product) throw new NotFoundException('Product not found');
    const productImageEntity = CreateProductImageCommand.toEntity(payload);
    product.addProductImage(productImageEntity);
    const updatedProduct = await this.productRepository.save(product);
    return ProductResponse.toResponse(updatedProduct);
  }
  async updateProductImage(payload: UpdateProductImageCommand) {
    const product = await this.productRepository.getById(
      payload.productId,
      ['productImages'],
      true,
    );
    if (!product) throw new NotFoundException('Product not found');
    let productImage = product.productImages.find(
      (productImage) => productImage.id === payload.id,
    );
    if (!productImage) throw new NotFoundException('Role not found');
    productImage = { ...productImage, ...payload };
    productImage.updatedBy = payload?.currentUser?.id;
    product.updateProductImage(productImage);
    const updatedProduct = await this.productRepository.save(product);
    return ProductResponse.toResponse(updatedProduct);
  }
  async removeProductImage(payload: RemoveProductImageCommand) {
    const product = await this.productRepository.getById(
      payload.productId,
      ['productImages'],
      true,
    );
    if (!product) throw new NotFoundException('Product not found');
    const productImage = product.productImages.find(
      (productImage) => productImage.id === payload.id,
    );
    if (!productImage) throw new NotFoundException('Image not found');
    product.removeProductImage(productImage.id);
    const result = await this.productRepository.save(product);
    return ProductResponse.toResponse(result);
  }
}
