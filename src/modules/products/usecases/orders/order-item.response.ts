import { ApiProperty } from '@nestjs/swagger';
import { OrderResponse } from './order.response';
import { ProductResponse } from '../products/product.response';
import { OrderItemEntity } from '@products/persistence/orders/order-item.entity';
export class OrderItemResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  orderId: string;
  @ApiProperty()
  productId: string;
  @ApiProperty()
  price: number;
  @ApiProperty()
  quantity: number;
  @ApiProperty()
  remark: string;
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
  order?: OrderResponse;

  static toResponse(entity: OrderItemEntity): OrderItemResponse {
    const response = new OrderItemResponse();
    response.id = entity.id;
    response.productId = entity.productId;
    response.orderId = entity.orderId;
    response.price = entity.price;
    response.quantity = entity.quantity;
    response.remark = entity.remark;
    response.createdBy = entity.createdBy;
    response.updatedBy = entity.updatedBy;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    response.deletedAt = entity.deletedAt;
    response.deletedBy = entity.deletedBy;
    if (entity.order) {
      response.order = OrderResponse.toResponse(entity.order);
    }
    if (entity.product) {
      response.product = ProductResponse.toResponse(entity.product);
    }
    return response;
  }
}
