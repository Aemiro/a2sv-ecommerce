import { ApiProperty } from '@nestjs/swagger';
import { FileDto } from '@libs/common';
import { ProductResponse } from './product.response';
import { ProductImageEntity } from '@products/persistence/products/product-image.entity';
export class ProductImageResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  productId: string;
  @ApiProperty()
  isPrimary?: boolean;
  @ApiProperty()
  altText?: string;
  @ApiProperty()
  file: FileDto;
  @ApiProperty()
  createdBy?: string;
  @ApiProperty()
  updatedBy?: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  deletedAt?: Date;
  @ApiProperty()
  deletedBy?: string;
  product?: ProductResponse;
  static toResponse(entity: ProductImageEntity): ProductImageResponse {
    const response = new ProductImageResponse();
    response.id = entity.id;
    response.productId = entity.productId;
    response.isPrimary = entity.isPrimary;
    response.altText = entity.altText;
    response.file = entity.file;
    response.createdBy = entity.createdBy;
    response.updatedBy = entity.updatedBy;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    response.deletedAt = entity.deletedAt;
    response.deletedBy = entity.deletedBy;
    if (entity.product) {
      response.product = ProductResponse.toResponse(entity.product);
    }
    return response;
  }
}
