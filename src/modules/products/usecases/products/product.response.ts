import { Address } from '@libs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ProductEntity } from '@products/persistence/products/product.entity';
import { UserResponse } from '@users/usecases/users/user.response';
import { CategoryResponse } from '../categories/category.response';
import { ProductImageResponse } from './product-image.response';
export class ProductResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  categoryId: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  stock: number;
  @ApiProperty()
  price: number;
  @ApiProperty()
  address: Address;
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
  user?: UserResponse;
  category?: CategoryResponse;
  productImages?: ProductImageResponse[];
  static toResponse(entity: ProductEntity): ProductResponse {
    const response = new ProductResponse();
    response.id = entity.id;
    response.name = entity.name;
    response.description = entity.description;
    response.price = entity.price;
    response.stock = entity.stock;
    response.userId = entity.userId;
    response.categoryId = entity.categoryId;
    response.createdBy = entity.createdBy;
    response.updatedBy = entity.updatedBy;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    response.deletedAt = entity.deletedAt;
    response.deletedBy = entity.deletedBy;
    if (entity?.user) {
      response.user = UserResponse.toResponse(entity.user);
    }
    if (entity?.category) {
      response.category = CategoryResponse.toResponse(entity.category);
    }
    if (entity.productImages) {
      response.productImages = entity.productImages.map((productImage) =>
        ProductImageResponse.toResponse(productImage),
      );
    }
    return response;
  }
}
